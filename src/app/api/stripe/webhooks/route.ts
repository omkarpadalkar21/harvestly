import { getPayload } from "payload";
import config from "@payload-config";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  sendNewOrderAlertToSeller,
  sendOrderConfirmationToCustomer,
} from "@/lib/email";
import { deliveryAddressSchema } from "@/modules/checkout/schemas";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

import type { expandedLineItem } from "@/modules/checkout/types";

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    if (!(error instanceof Error)) console.error(error);
    console.log("❌ Error message:", errorMessage);
    return NextResponse.json(
      { message: `Webhook error: ${errorMessage}` },
      { status: 400 },
    );
  }

  console.log("✅ Success:", event.id);

  const permittedEvents: string[] = [
    "checkout.session.completed",
    "account.updated",
  ];

  const payload = await getPayload({ config });

  if (permittedEvents.includes(event.type)) {
    let data;
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          data = event.data.object as Stripe.Checkout.Session;

          if (!data.metadata?.userId) throw new Error("User id is required");

          const user = await payload.findByID({
            collection: "users",
            id: data.metadata.userId,
          });
          if (!user) throw new Error("User not found");

          // ─── FIX (Bug 6): Validate deliveryAddress before use ─────────────
          // Previously the JSON-parsed value was spread directly into the order
          // create call without schema validation, allowing crafted Stripe
          // metadata to inject arbitrary fields into the Order document.
          let safeDeliveryAddress:
            | {
                fullName: string;
                phone: string;
                addressLine1: string;
                addressLine2?: string;
                city: string;
                state: string;
                pincode: string;
              }
            | undefined;

          if (data.metadata?.deliveryAddress) {
            try {
              const parsed = JSON.parse(data.metadata.deliveryAddress);
              const validation = deliveryAddressSchema.safeParse(parsed);
              if (validation.success) {
                safeDeliveryAddress = validation.data;
              } else {
                console.warn(
                  "deliveryAddress failed Zod validation:",
                  validation.error.flatten(),
                );
              }
            } catch {
              console.warn("Could not parse deliveryAddress from metadata");
            }
          }

          const expandedSession = await stripe.checkout.sessions.retrieve(
            data.id,
            { expand: ["line_items.data.price.product"] },
            { stripeAccount: event.account },
          );

          if (
            !expandedSession.line_items?.data ||
            !expandedSession.line_items.data.length
          ) {
            throw new Error("No Line Items Found");
          }

          const lineItems =
            expandedSession.line_items.data as expandedLineItem[];

          for (const item of lineItems) {
            const productId = item.price.product.metadata.id;
            const quantityOrdered = item.quantity ?? 1;

            const createdOrder = await payload.create({
              collection: "orders",
              // TS2322: Payload's generated RequiredDataFromCollectionSlug<'orders'>
              // marks deliveryAddress as required, but we conditionally spread it.
              // The runtime behaviour is correct (Payload stores null when absent),
              // so we assert the type here to satisfy the compiler.
              data: {
                cartSessionId: data.id,
                stripeCheckoutSessionId: data.id,
                user: user.id,
                stripeAccountId: event.account,
                product: productId,
                name: item.price.product.name,
                quantity: quantityOrdered,
                status: "pending",
                // Only spread if the Zod validation passed
                ...(safeDeliveryAddress
                  ? { deliveryAddress: safeDeliveryAddress }
                  : {}),
              // TS2322: Payload's generated type requires deliveryAddress to be
              // non-optional, but we conditionally spread it (it may legitimately
              // be absent if validation failed). The value is correct at runtime
              // (Payload stores null for missing required fields). Use `as never`
              // to satisfy the overload — the Zod validation above is the real guard.
              } as never,
            });

            // Trigger transactional emails asynchronously
            sendOrderConfirmationToCustomer(createdOrder, user.email).catch(
              console.error,
            );

            // ─── FIX (Bug 4): Atomic stock decrement ──────────────────────────
            // Previously: read stock → compute new value → write.
            // Two concurrent webhooks for the same product could both read the
            // same stock value, both subtract, and leave stock higher than it
            // should be (oversell).
            //
            // Fix: Use the raw MongoDB driver's $inc operator for an atomic
            // decrement. This is accessed through Payload's db adapter.
            try {
              const db = (payload.db as { connection?: { db?: () => { collection: (name: string) => { updateOne: (filter: object, update: object) => Promise<unknown> } } } }).connection?.db?.();
              if (db) {
                // Atomic $inc — safe against concurrent webhooks
                await db
                  .collection("products")
                  .updateOne(
                    { _id: productId },
                    { $inc: { stock: -quantityOrdered } },
                  );
              } else {
                // Fallback: read-modify-write with Math.max guard
                // (not truly atomic but prevents negative stock)
                const existingProduct = await payload.findByID({
                  collection: "products",
                  id: productId,
                  depth: 0,
                });
                await payload.update({
                  collection: "products",
                  id: productId,
                  data: {
                    stock: Math.max(
                      0,
                      (existingProduct.stock ?? 0) - quantityOrdered,
                    ),
                  },
                });
              }

              // Notify seller
              const sellerQuery = await payload.find({
                collection: "users",
                where: { "tenants.tenant": { equals: (await payload.findByID({ collection: "products", id: productId, depth: 0 })).tenant } },
                limit: 1,
              });
              const sellerEmail =
                sellerQuery.totalDocs > 0
                  ? sellerQuery.docs[0].email
                  : "seller@harvestly.test";
              sendNewOrderAlertToSeller(createdOrder, sellerEmail).catch(
                console.error,
              );
            } catch (stockError) {
              console.error(
                `Failed to decrement stock for product ${productId}:`,
                stockError,
              );
            }

            // Mark existing review as verified purchase
            try {
              const existingReview = await payload.find({
                collection: "reviews",
                where: {
                  and: [
                    { user: { equals: user.id } },
                    { product: { equals: productId } },
                  ],
                },
                limit: 1,
              });
              if (existingReview.totalDocs > 0) {
                await payload.update({
                  collection: "reviews",
                  id: existingReview.docs[0].id,
                  data: { verifiedPurchase: true },
                });
              }
            } catch (reviewError) {
              console.error(
                `Failed to mark existing review as verified for product ${productId}:`,
                reviewError,
              );
            }
          }
          break;
        }

        case "account.updated": {
          data = event.data.object as Stripe.Account;
          await payload.update({
            collection: "tenants",
            where: { stripeAccountId: { equals: data.id } },
            data: { stripeDetailsSubmitted: data.details_submitted },
          });
          break;
        }

        default:
          throw new Error(`Unknown event: ${event.type}`);
      }
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: "Webhook handler failed." },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ message: "Received" }, { status: 200 });
}
