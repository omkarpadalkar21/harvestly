import { isSuperAdmin, isSellerOrSuperAdmin } from "@/lib/access";
import type { CollectionConfig } from "payload";

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    useAsTitle: "name",
  },
  access: {
    create: ({ req }) => isSuperAdmin(req.user),
    read: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
    admin: ({ req }) => isSellerOrSuperAdmin(req.user),
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false,
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      hasMany: false,
    },
    {
      name: "stripeCheckoutSessionId",
      type: "text",
      required: true,
      admin: {
        description: "Stripe checkout session associated with the order",
      },
    },
    {
      name: "stripeAccountId",
      type: "text",
      admin: {
        description: "Stripe account associated with the order",
      },
    },
    {
      name: "cartSessionId",
      type: "text",
      index: true,
      admin: {
        description: "Groups all order items from the same checkout session.",
      },
    },
    {
      name: "quantity",
      type: "number",
      defaultValue: 1,
      min: 1,
      admin: { description: "Quantity of the product purchased in this order line." },
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
      name: "deliveryAddress",
      type: "group",
      label: "Delivery Address",
      fields: [
        { name: "fullName", type: "text", required: true },
        { name: "phone", type: "text", required: true },
        { name: "addressLine1", type: "text", required: true },
        { name: "addressLine2", type: "text" },
        { name: "city", type: "text", required: true },
        { name: "state", type: "text", required: true },
        { name: "pincode", type: "text", required: true },
      ],
    },
  ],
};
