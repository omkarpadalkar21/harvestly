import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { Media, Tenant } from "@/payload-types";
import { DEFAULT_LIMIT } from "@/constants";
import { TRPCError } from "@trpc/server";

// Shape of a grouped "order session" returned to the client
export type OrderSession = {
  cartSessionId: string;
  createdAt: string;
  status: string;
  deliveryAddress: Record<string, string> | null;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string | null;
    tenantSubdomain: string;
    tenantName: string;
    tenantImageUrl: string | null;
    reviewRating: number;
    reviewCount: number;
    orderLineId: string; // individual order doc id (for review / status per line)
    lineStatus: string;
  }>;
  totalItems: number;
  totalPrice: number;
};

export const ordersRouter = createTRPCRouter({
  /** Legacy: used by the product detail page to verify purchase + get status */
  getOne: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const ordersData = await ctx.db.find({
        collection: "orders",
        limit: 1,
        pagination: false,
        where: {
          and: [
            { product: { equals: input.productId } },
            { user: { equals: ctx.session.user.id } },
          ],
        },
      });

      const order = ordersData.docs[0];
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      const product = await ctx.db.findByID({
        collection: "products",
        id: input.productId,
      });

      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      return {
        ...product,
        orderStatus: order.status ?? "pending",
        orderId: order.id,
        deliveryAddress: order.deliveryAddress,
      };
    }),

  /** Grouped order sessions for the customer orders page */
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
      })
    )
    .query(async ({ ctx, input }) => {
      // Fetch all order line-items for this user, newest first
      const ordersData = await ctx.db.find({
        collection: "orders",
        depth: 0,
        page: input.cursor,
        limit: input.limit * 6, // over-fetch since multiple lines map to one session
        sort: "-createdAt",
        where: { user: { equals: ctx.session.user.id } },
      });

      // ── Group line-items by cartSessionId ──────────────────────────────────
      const sessionMap = new Map<
        string,
        {
          cartSessionId: string;
          createdAt: string;
          deliveryAddress: Record<string, string> | null;
          lines: typeof ordersData.docs;
        }
      >();

      for (const order of ordersData.docs) {
        const key = order.cartSessionId ?? order.stripeCheckoutSessionId ?? order.id;
        if (!sessionMap.has(key)) {
          sessionMap.set(key, {
            cartSessionId: key,
            createdAt: order.createdAt,
            deliveryAddress: (order.deliveryAddress as Record<string, string>) ?? null,
            lines: [],
          });
        }
        sessionMap.get(key)!.lines.push(order);
      }

      // Collect all unique product IDs across all sessions
      const allProductIds = [
        ...new Set(
          ordersData.docs
            .map((o) =>
              typeof o.product === "string" ? o.product : o.product?.id
            )
            .filter((id): id is string => Boolean(id))
        ),
      ];

      // Bulk-fetch products
      const productsData =
        allProductIds.length > 0
          ? await ctx.db.find({
              collection: "products",
              depth: 1,
              pagination: false,
              where: { id: { in: allProductIds } },
            })
          : { docs: [] };

      const productMap = new Map(productsData.docs.map((p) => [p.id, p]));

      // Bulk-fetch reviews per product
      const reviewMap = new Map<string, { rating: number; count: number }>();
      await Promise.all(
        allProductIds.map(async (pid) => {
          const rv = await ctx.db.find({
            collection: "reviews",
            pagination: false,
            depth: 0,
            where: { product: { equals: pid } },
          });
          reviewMap.set(pid, {
            count: rv.totalDocs,
            rating:
              rv.totalDocs > 0
                ? rv.docs.reduce((a, r) => a + r.rating, 0) / rv.totalDocs
                : 0,
          });
        })
      );

      // ── Build session objects ──────────────────────────────────────────────
      const sessions: OrderSession[] = [];

      for (const [, session] of sessionMap) {
        const items: OrderSession["items"] = [];
        let totalPrice = 0;

        // Derive "session status" = lowest priority status among all lines
        // (pending < confirmed < processing < dispatched < delivered; cancelled/refunded override)
        const statusPriority: Record<string, number> = {
          cancelled: 0,
          refunded: 1,
          pending: 2,
          confirmed: 3,
          processing: 4,
          dispatched: 5,
          delivered: 6,
        };
        let sessionStatus = "delivered";
        for (const line of session.lines) {
          const ls = line.status ?? "pending";
          if ((statusPriority[ls] ?? 2) < (statusPriority[sessionStatus] ?? 6)) {
            sessionStatus = ls;
          }
        }

        for (const line of session.lines) {
          const productId =
            typeof line.product === "string" ? line.product : line.product?.id;
          if (!productId) continue;

          const product = productMap.get(productId);
          if (!product) continue;

          const tenant = product.tenant as Tenant & { image: Media | null };
          const image = product.image as Media | null;
          const qty = line.quantity ?? 1;
          const lineTotal = product.price * qty;
          totalPrice += lineTotal;

          const rv = reviewMap.get(productId) ?? { count: 0, rating: 0 };

          items.push({
            productId,
            name: product.name,
            price: product.price,
            quantity: qty,
            image: image?.url ?? null,
            tenantSubdomain: tenant.subdomain,
            tenantName: tenant.name,
            tenantImageUrl:
              typeof tenant.image === "object" ? tenant.image?.url ?? null : null,
            reviewRating: rv.rating,
            reviewCount: rv.count,
            orderLineId: line.id,
            lineStatus: line.status ?? "pending",
          });
        }

        sessions.push({
          cartSessionId: session.cartSessionId,
          createdAt: session.createdAt,
          status: sessionStatus,
          deliveryAddress: session.deliveryAddress,
          items,
          totalItems: items.reduce((a, i) => a + i.quantity, 0),
          totalPrice,
        });
      }

      // Sort newest-first and paginate at the session level
      sessions.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const paginated = sessions.slice(0, input.limit);
      const hasNextPage = sessions.length > input.limit;

      return {
        docs: paginated,
        totalDocs: sessions.length,
        hasNextPage,
        nextPage: hasNextPage ? input.cursor + 1 : null,
      };
    }),
  requestRefund: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      reason: z.string().min(5),
    }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.findByID({
        collection: "orders",
        id: input.orderId,
        depth: 0,
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      if (order.user !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your order" });
      }

      // Ensure no pending refund requests for this order
      const existing = await ctx.db.find({
        collection: "refund-requests",
        where: { order: { equals: order.id } },
      });

      if (existing.totalDocs > 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Refund already requested" });
      }

      return ctx.db.create({
        collection: "refund-requests",
        data: {
          order: order.id,
          user: ctx.session.user.id,
          reason: input.reason,
          status: "pending",
        },
      });
    }),
});
