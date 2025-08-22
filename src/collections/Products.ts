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
          console.log("Clearing subcategory because category changed");
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
