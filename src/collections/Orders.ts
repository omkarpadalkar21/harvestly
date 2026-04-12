import { isSuperAdmin, isSellerOrSuperAdmin } from "@/lib/access";
import type { CollectionConfig } from "payload";
import {
  sendOrderStatusUpdateToCustomer,
  sendOrderAcceptedToCustomer,
} from "@/lib/email";

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "status", "createdAt", "estimatedDeliveryDate"],
    hidden: ({ user }) => !isSellerOrSuperAdmin(user),
    components: {
      edit: {
        // @ts-expect-error Payload v3 component registration
        beforeFields: ["@/components/admin/order-actions#OrderActionsPanel"],
      },
    },
  },
  access: {
    create: ({ req }) => isSuperAdmin(req.user),
    read: ({ req }) => {
      if (isSuperAdmin(req.user)) return true;
      if (!req.user) return false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tenantIds = (req.user.tenants ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((t: any) =>
          typeof t.tenant === "string" ? t.tenant : t.tenant?.id,
        )
        .filter(Boolean);
      if (tenantIds.length === 0) return false;
      return { "product.tenant": { in: tenantIds } };
    },
    update: ({ req }) => {
      if (isSuperAdmin(req.user)) return true;
      if (!req.user) return false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tenantIds = (req.user.tenants ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((t: any) =>
          typeof t.tenant === "string" ? t.tenant : t.tenant?.id,
        )
        .filter(Boolean);
      if (tenantIds.length === 0) return false;
      return { "product.tenant": { in: tenantIds } };
    },
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req, operation }) => {
        if (operation !== "update") return;
        if (doc.status === previousDoc?.status) return;
        try {
          const user = await req.payload.findByID({
            collection: "users",
            id: typeof doc.user === "string" ? doc.user : doc.user?.id,
            depth: 0,
          });
          if (!user?.email) return;
          if (doc.status === "confirmed") {
            const etaDate = doc.estimatedDeliveryDate
              ? new Date(doc.estimatedDeliveryDate)
              : null;
            const etaFormatted = etaDate
              ? etaDate.toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "To be confirmed";
            sendOrderAcceptedToCustomer(doc, user.email, etaFormatted).catch(
              console.error,
            );
          } else {
            sendOrderStatusUpdateToCustomer(doc, user.email, doc.status).catch(
              console.error,
            );
          }
        } catch (e) {
          console.error("afterChange email hook error:", e);
        }
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      access: { read: () => true, update: ({ req }) => isSuperAdmin(req.user) },
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false,
      access: { read: () => true, update: ({ req }) => isSuperAdmin(req.user) },
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      hasMany: false,
      access: { read: () => true, update: ({ req }) => isSuperAdmin(req.user) },
    },
    {
      name: "stripeCheckoutSessionId",
      type: "text",
      required: true,
      admin: {
        description: "Stripe checkout session associated with the order",
      },
      access: { read: () => true, update: ({ req }) => isSuperAdmin(req.user) },
    },
    {
      name: "stripeAccountId",
      type: "text",
      admin: {
        description: "Stripe account associated with the order",
      },
      access: { read: () => true, update: ({ req }) => isSuperAdmin(req.user) },
    },
    {
      name: "cartSessionId",
      type: "text",
      index: true,
      admin: {
        description: "Groups all order items from the same checkout session.",
      },
      access: { read: () => true, update: ({ req }) => isSuperAdmin(req.user) },
    },
    {
      name: "quantity",
      type: "number",
      defaultValue: 1,
      min: 1,
      admin: {
        description: "Quantity of the product purchased in this order line.",
      },
      access: { read: () => true, update: ({ req }) => isSuperAdmin(req.user) },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Processing", value: "processing" },
        { label: "Dispatched", value: "dispatched" },
        { label: "Delivered", value: "delivered" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Refunded", value: "refunded" },
      ],
      access: {
        update: ({ req }) => isSellerOrSuperAdmin(req.user),
      },
    },
    {
      name: "estimatedDeliveryDate",
      type: "date",
      label: "Estimated Delivery Date",
      admin: {
        description:
          "Auto-calculated when the seller accepts the order. Can be manually adjusted.",
        readOnly: false,
      },
    },
    {
      name: "acceptedAt",
      type: "date",
      label: "Accepted At",
      admin: {
        readOnly: true,
        description: "Timestamp auto-set when seller accepts the order.",
      },
    },
    {
      name: "cancelReason",
      type: "textarea",
      label: "Cancellation Reason",
      admin: {
        description:
          "Required when cancelling an order. Visible to the customer in the app.",
        condition: (data) => data?.status === "cancelled",
      },
    },
  ],
};
