import { Category } from "@/payload-types";
import { cachedCategoryProcedure } from "@/trpc/init";
import { createTRPCRouter } from "@/trpc/init";
import z from "zod";

export const categoriesRouter = createTRPCRouter({
  getMany: cachedCategoryProcedure
    .input(
      z.object({}).optional() // Add optional empty input schema
    )
    .query(async ({ ctx }) => {
      const data = await ctx.db.find({
        collection: "categories",
        where: {
          parent: { exists: false }, // Only get root categories
        },
        depth: 1, // Populate subcategories
        pagination: false,
        sort: "createdAt",
      });

      const formattedData = data.docs.map((doc) => ({
        ...doc,
        subcategories: doc.subcategories?.docs ?? [],
      })) as Category[];

      return formattedData;
    }),
});
