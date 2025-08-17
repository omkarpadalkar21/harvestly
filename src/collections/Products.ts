import type { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
  slug: "products",
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "text",
    },
    {
      name: "price",
      type: "number",
      admin: { description: "Price in ₹" },
      required: true,
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
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
        condition: (data) => data?.category,
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
        // Clear subcategory if category has changed
        if (data?.category !== originalDoc?.category) {
          data.subcategory = null;
        }
        return data;
      },
    ],
  },
};
