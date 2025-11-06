import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { Media, Tenant } from "@/payload-types";
import { DEFAULT_LIMIT } from "@/constants";
import { TRPCError } from "@trpc/server";

export const ordersRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const ordersData = await ctx.db.find({
        collection: "orders",
        limit: 1,
        pagination: false,
        where: {
          and: [
            {
              product: {
                equals: input.productId,
              },
            },
            {
              user: {
                equals: ctx.session.user.id,
              },
            },
          ],
        },
      });

      const order = ordersData.docs[0];

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      // const productIds = ordersData.docs.map((order) => order.product);

      const product = await ctx.db.findByID({
        collection: "products",
        id: input.productId,
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return product;
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
      })
    )
    .query(async ({ ctx, input }) => {
      const ordersData = await ctx.db.find({
        collection: "orders",
        depth: 0,
        page: input.cursor,
        limit: input.limit,
        sort: "-createdAt",
        where: {
          user: {
            equals: ctx.session.user.id,
          },
        },
      });

      const orderedProductIds = ordersData.docs
        .map((order) =>
          typeof order.product === "string" ? order.product : order.product?.id,
        )
        .filter((id): id is string => typeof id === "string");

      // Deduplicate while preserving order (latest-first)
      const seen = new Set<string>();
      const uniqueOrderedIds = orderedProductIds.filter((id) => {
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      const productsData = await ctx.db.find({
        collection: "products",
        pagination: false,
        where: {
          id: {
            in: uniqueOrderedIds,
          },
        },
      });
      const productsById = new Map(productsData.docs.map((doc) => [doc.id, doc]));
      const orderedProducts = uniqueOrderedIds
        .map((id) => productsById.get(id))
        .filter((p): p is typeof productsData.docs[number] => Boolean(p));

      const dataWithSummarizedReviews = await Promise.all(
        orderedProducts.map(async (doc) => {
          const reviewsData = await ctx.db.find({
            collection: "reviews",
            pagination: false,
            where: {
              product: {
                equals: doc.id,
              },
            },
          });

          return {
            ...doc,
            reviewCount: reviewsData.totalDocs,
            reviewRating:
              reviewsData.docs.length === 0
                ? 0
                : reviewsData.docs.reduce(
                    (acc, review) => acc + review.rating,
                    0
                  ) / reviewsData.totalDocs,
          };
        })
      );

      return {
        ...productsData,
        docs: dataWithSummarizedReviews.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
