import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { Where } from "payload";

export const productsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        category: z.string().nullable().optional(),
        subcategory: z.string().nullable().optional(),
        minPrice: z.string().nullable().optional(),
        maxPrice: z.string().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Where = {};

      if (input.minPrice) {
        where.price = { greater_than_equal: input.minPrice };
      }

      if (input.maxPrice) {
        where.price = { less_than_equal: input.maxPrice };
      }

      if (input.subcategory) {
        // First get the subcategory ID
        const subcategoryData = await ctx.db.find({
          collection: "categories",
          where: {
            slug: {
              equals: input.subcategory,
            },
          },
          limit: 1,
        });

        if (subcategoryData.docs.length > 0) {
          where["subcategory"] = {
            equals: subcategoryData.docs[0].id,
          };
        }
      } else if (input.category) {
        // First get the category ID
        const categoryData = await ctx.db.find({
          collection: "categories",
          where: {
            slug: {
              equals: input.category,
            },
          },
          limit: 1,
        });

        if (categoryData.docs.length > 0) {
          where["category"] = {
            equals: categoryData.docs[0].id,
          };
        }
      }

      const data = await ctx.db.find({
        collection: "products",
        depth: 1,
        where,
      });

      return data;
    }),
});
