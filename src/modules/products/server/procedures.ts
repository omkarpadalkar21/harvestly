import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { Sort, Where } from "payload";
import { sortValues } from "@/modules/products/search-params";
import { Media, Tenant } from "@/payload-types";
import { DEFAULT_LIMIT } from "@/constants";
import { headers as getHeaders } from "next/headers";

export const productsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const headers = await getHeaders();
      const session = await ctx.db.auth({ headers });
      const product = await ctx.db.findByID({
        collection: "products",
        id: input.id,
      });

      let isPurchased = false;

      if (session.user) {
        const ordersData = await ctx.db.find({
          collection: "orders",
          pagination: false,
          limit: 1,
          where: {
            and: [
              {
                product: {
                  equals: input.id,
                },
              },
              {
                user: {
                  equals: session.user.id,
                },
              },
            ],
          },
        });

        isPurchased = !!ordersData.docs[0];
      }

      return {
        ...product,
        isPurchased,
        image: product.image as Media | null,
        tenant: product.tenant as Tenant & { image: Media | null },
      };
    }),
  getMany: baseProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
        category: z.string().nullable().optional(),
        subcategory: z.string().nullable().optional(),
        minPrice: z.string().nullable().optional(),
        maxPrice: z.string().nullable().optional(),
        tags: z.array(z.string()).nullable().optional(),
        sort: z.enum(sortValues).nullable().optional(),
        tenantSubdomain: z.string().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Where = {};
      let sort: Sort = "-createdAt";

      if (input.sort === "popularity") {
        sort = "name";
      }

      if (input.sort === "freshness") {
        sort = "-createdAt";
      }

      if (input.sort === "price-asc") {
        sort = "-createdAt";
      }

      if (input.sort === "price-desc") {
        sort = "-createdAt";
      }

      if (input.sort === "rating") {
        sort = "+createdAt";
      }

      if (input.minPrice) {
        where.price = { greater_than_equal: input.minPrice };
      }

      if (input.maxPrice) {
        where.price = { less_than_equal: input.maxPrice };
      }

      if (input.tenantSubdomain) {
        where["tenant.subdomain"] = {
          equals: input.tenantSubdomain,
        };
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

      if (input.tags && input.tags.length > 0) {
        where["tags.name"] = {
          in: input.tags,
        };
      }

      const data = await ctx.db.find({
        collection: "products",
        depth: 2,
        where,
        sort,
        page: input.cursor,
        limit: input.limit,
      });

      return {
        ...data,
        docs: data.docs.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
