import { isSuperAdmin, isSellerOrSuperAdmin } from "@/lib/access";
import type { CollectionConfig } from "payload";

export const Reviews: CollectionConfig = {
  slug: "reviews",
  admin: {
    useAsTitle: "description",
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
      name: "description",
      type: "textarea",
      required: true,
    },
    {
      name: "rating",
      type: "number",
      required: true,
      min: 1,
      max: 5,
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      hasMany: false,
      required: true,
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      hasMany: false,
      required: true,
    },
    {
      name: "verifiedPurchase",
      type: "checkbox",
      defaultValue: false,
      access: { update: ({ req }) => isSuperAdmin(req.user) },
      admin: { description: "Auto-set to true if buyer has a completed order for this product." },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === "create" && data) {
          const existing = await req.payload.find({
            collection: "reviews",
            where: {
              and: [
                { user: { equals: data.user } },
                { product: { equals: data.product } },
              ],
            },
            limit: 1,
          });
          if (existing.totalDocs > 0) {
            throw new Error("You have already reviewed this product.");
          }
        }
        return data;
      },
    ],
  },
};
