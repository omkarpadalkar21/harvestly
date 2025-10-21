import { isSuperAdmin } from "@/lib/access";
import { Tenant } from "@/payload-types";
import type { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    group: "Content",
  },
  access: {
    create: ({ req }) => {
      if (isSuperAdmin(req.user)) return true;

      const tenant = req.user?.tenants?.[0].tenant as Tenant;

      return true;
      // return Boolean(tenant?.stripeDetailsSubmitted);
    },
  },
  fields: [
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      required: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      // TODO: Change to richtext
      type: "text",
    },
    {
      name: "price",
      type: "number",
      admin: { description: "Price in ₹" },
      required: true,
    },
    {
      name: "quantity",
      type: "group",
      label: "Quantity",
      fields: [
        {
          name: "amount",
          type: "number",
          required: true,
          admin: {
            description: "Enter the quantity amount (e.g., 1, 500, etc.)",
          },
        },
        {
          name: "unit",
          type: "select",
          required: true,
          options: [
            { label: "Kilogram (kg)", value: "kg" },
            { label: "Gram (g)", value: "g" },
            { label: "Litre (l)", value: "l" },
            { label: "Millilitre (ml)", value: "ml" },
            { label: "Piece (pc)", value: "pc" },
            { label: "Pack", value: "pack" },
            { label: "Other", value: "other" },
          ],
        },
      ],
      required: true,
      admin: { description: "Specify the quantity and unit for this product" },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
      hasMany: false,
      filterOptions: {
        parent: {
          exists: false,
        },
      },
    },
    {
      name: "subcategory",
      type: "relationship",
      relationTo: "categories",
      hasMany: false,
      admin: {
        description:
          "Select a subcategory (only shown when category is selected)",
      },
      filterOptions: ({ data }) => {
        if (data?.category) {
          return {
            parent: {
              equals: data.category,
            },
          };
        }
        return false;
      },
      validate: (value, { data }) => {
        // Allow null/undefined values
        if (value === null || value === undefined) {
          return true;
        }
        // If a value is provided, ensure it's a valid string
        if (typeof value === "string" && value.length > 0) {
          return true;
        }
        return "Subcategory must be a valid selection";
      },
    },
    {
      name: "tags",
      type: "relationship",
      relationTo: "tags",
      hasMany: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "perishability",
      type: "select",
      label: "Perishability Type",
      options: [
        { label: "Highly Perishable (3-4 days)", value: "high" },
        { label: "Moderately Perishable (1-2 weeks)", value: "medium" },
        { label: "Low Perishable (1-6 months)", value: "low" },
        { label: "Non-Perishable (6+ months)", value: "none" },
      ],
      required: true,
    },
    {
      name: "refundPolicy",
      type: "select",
      options: ["30-day", "14-day", "7-day", "3-day", "1-day", "no-refunds"],
    },
    // { name: "content", type: "textarea", admin: {} },
  ],

  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data) {
          if (!data.refundPolicy) {
            switch (data.perishability) {
              case "high":
                data.refundPolicy = "1-day";
                break;
              case "medium":
                data.refundPolicy = "3-day";
                break;
              case "low":
                data.refundPolicy = "7-day";
                break;
              case "none":
                data.refundPolicy = "30-day";
                break;
              default:
                data.refundPolicy = "no-refunds";
            }
          }
        }
        return data;
      },
    ],
    beforeChange: [
      ({ data, originalDoc }) => {
        // Clear subcategory if category has changed and we have an existing document
        if (originalDoc?.id && data?.category !== originalDoc?.category) {
          data.subcategory = null;
        }
        return data;
      },
    ],
    afterRead: [
      ({ doc }) => {
        return doc;
      },
    ],
  },
};
