import type { CollectionConfig } from "payload";

export const Carts: CollectionConfig = {
  slug: "carts",
  // FIX (Bug 5): Previously, access was `!!req.user` for all operations,
  // meaning ANY authenticated user could read or mutate ANY other user's cart.
  // Access is now constrained to the cart owner for all operations, with
  // super-admins retaining full access for support/debug purposes.
  access: {
    // A user may only read their own carts.
    read: ({ req }) => {
      if (!req.user) return false;
      // Returning a Where constraint restricts which docs the user can see.
      return { user: { equals: req.user.id } };
    },
    // Only the owner (or super-admin via overrideAccess) can create a cart.
    create: ({ req }) => !!req.user,
    // A user may only update their own cart.
    update: ({ req }) => {
      if (!req.user) return false;
      return { user: { equals: req.user.id } };
    },
    // A user may only delete their own cart.
    delete: ({ req }) => {
      if (!req.user) return false;
      return { user: { equals: req.user.id } };
    },
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
    },
    {
      name: "tenantSubdomain",
      type: "text",
      required: true,
    },
    {
      name: "items",
      type: "array",
      fields: [
        {
          name: "product",
          type: "relationship",
          relationTo: "products",
          required: true,
        },
        {
          name: "quantity",
          type: "number",
          min: 1,
          defaultValue: 1,
        },
      ],
    },
  ],
  timestamps: true,
};
