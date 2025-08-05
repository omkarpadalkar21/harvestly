import { Category } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const categoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.find({
      collection: "categories",
      where: { parent: { exists: false } },
      depth: 1, // Populate subcategories, subcateogies.[0] will be a type of category
      pagination: false,
      sort: "desc",
    });

    const formattedData = data.docs.map((doc) => ({
      ...doc,
      subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
        ...(doc as Category), // Because of "depth 1", we are confident that the "doc" will be a type of category
      })),
    }));
    return formattedData;
  }),
});
