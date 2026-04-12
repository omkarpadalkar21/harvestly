import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import type { Sort, Where } from "payload";
import { sortValues } from "@/modules/products/search-params";
import type { Media, Tenant } from "@/payload-types";
import { DEFAULT_LIMIT } from "@/constants";
import { TRPCError } from "@trpc/server";
import { haversineKm } from "@/lib/geo";

export const productsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { headers: getHeaders } = await import("next/headers");
      const headers = await getHeaders();
      const session = await ctx.db.auth({ headers });

      const product = await ctx.db.findByID({
        collection: "products",
        id: input.id,
        depth: 1,
      });

      if (!product || product.isArchived) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      let isPurchased = false;
      if (session.user) {
        const ordersData = await ctx.db.find({
          collection: "orders",
          pagination: false,
          limit: 1,
          depth: 0,
          where: {
            and: [
              { product: { equals: input.id } },
              { user: { equals: session.user.id } },
            ],
          },
        });
        isPurchased = !!ordersData.docs[0];
      }

      const reviews = await ctx.db.find({
        collection: "reviews",
        pagination: false,
        depth: 0,
        where: { product: { equals: input.id } },
      });

      const reviewRating =
        reviews.docs.length > 0
          ? reviews.docs.reduce((acc, review) => acc + review.rating, 0) /
            reviews.totalDocs
          : 0;

      const ratingDistribution: Record<number, number> = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };
      if (reviews.totalDocs > 0) {
        reviews.docs.forEach((review) => {
          const rating = review.rating;
          if (rating >= 1 && rating <= 5) {
            ratingDistribution[rating] = (ratingDistribution[rating] ?? 0) + 1;
          }
        });
        Object.keys(ratingDistribution).forEach((key) => {
          const rating = Number(key);
          const count = ratingDistribution[rating] ?? 0;
          ratingDistribution[rating] = Math.round(
            (count / reviews.totalDocs) * 100,
          );
        });
      }

      return {
        ...product,
        isPurchased,
        image: product.image as Media | null,
        tenant: product.tenant as Tenant & { image: Media | null },
        reviewRating,
        reviewCount: reviews.totalDocs,
        ratingDistribution,
      };
    }),

  getMany: baseProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
        category: z.string().nullable().optional(),
        subcategory: z.string().nullable().optional(),
        search: z.string().nullable().optional(),
        minPrice: z.string().nullable().optional(),
        maxPrice: z.string().nullable().optional(),
        tags: z.array(z.string()).nullable().optional(),
        sort: z.enum(sortValues).nullable().optional(),
        tenantSubdomain: z.string().nullable().optional(),
        inStockOnly: z.boolean().optional().default(false),
        customerLat: z.number().nullable().optional(),
        customerLng: z.number().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Where = { isArchived: { not_equals: true } };
      let sort: Sort = "-createdAt";

      if (input.sort === "freshness") sort = "-createdAt";
      if (input.sort === "price-asc") sort = "price";
      if (input.sort === "price-desc") sort = "-price";

      if (input.minPrice)
        where["price"] = { greater_than_equal: input.minPrice };
      if (input.maxPrice)
        where["price"] = { ...where["price"], less_than_equal: input.maxPrice };

      if (input.tenantSubdomain) {
        (where as Record<string, unknown>)["tenant.subdomain"] = {
          equals: input.tenantSubdomain,
        };
      } else {
        where["isPrivate"] = { not_equals: true };
      }

      if (input.inStockOnly) where["stock"] = { greater_than: 0 };

      if (input.subcategory) {
        const subcategoryData = await ctx.db.find({
          collection: "categories",
          depth: 0,
          where: { slug: { equals: input.subcategory } },
          limit: 1,
        });
        if (subcategoryData.docs.length > 0) {
          where["subcategory"] = { equals: subcategoryData.docs[0].id };
        }
      } else if (input.category) {
        const categoryData = await ctx.db.find({
          collection: "categories",
          depth: 0,
          where: { slug: { equals: input.category } },
          limit: 1,
        });
        if (categoryData.docs.length > 0) {
          const parentCategory = categoryData.docs[0];
          const subcategoryIds =
            (
              parentCategory.subcategories as
                | { docs?: { id: string }[] }
                | undefined
            )?.docs?.map((s) => s.id) ?? [];
          where["category"] = subcategoryIds.length
            ? { in: [parentCategory.id, ...subcategoryIds] }
            : { equals: parentCategory.id };
        }
      }

      if (input.search) where["name"] = { like: input.search };
      if (input.tags?.length) where["tags"] = { in: input.tags };

      const hasGeo =
        typeof input.customerLat === "number" &&
        typeof input.customerLng === "number";

      // Over-fetch to compensate for JS geo-filtering reducing result count.
      const GEO_FETCH_MULTIPLIER = 3;
      const fetchLimit =
        hasGeo && !input.tenantSubdomain
          ? input.limit * GEO_FETCH_MULTIPLIER
          : input.limit;

      const data = await ctx.db.find({
        collection: "products",
        depth: 2,
        page: input.cursor,
        limit: fetchLimit,
        sort,
        where,
      });

      const dataWithSummarizedReviews = await Promise.all(
        data.docs.map(async (doc) => {
          const reviews = await ctx.db.find({
            collection: "reviews",
            pagination: false,
            depth: 0,
            where: { product: { equals: doc.id } },
          });
          const reviewRating =
            reviews.docs.length > 0
              ? reviews.docs.reduce((acc, r) => acc + r.rating, 0) /
                reviews.totalDocs
              : 0;
          return { ...doc, reviewRating, reviewCount: reviews.totalDocs };
        }),
      );

      let orderedDocs = [...dataWithSummarizedReviews];
      if (input.sort === "rating") {
        orderedDocs = [...dataWithSummarizedReviews].sort((a, b) => {
          if (b.reviewRating !== a.reviewRating)
            return b.reviewRating - a.reviewRating;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      } else if (input.sort === "popularity") {
        orderedDocs = [...dataWithSummarizedReviews].sort((a, b) => {
          if (b.reviewCount !== a.reviewCount)
            return b.reviewCount - a.reviewCount;
          if (b.reviewRating !== a.reviewRating)
            return b.reviewRating - a.reviewRating;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }

      // ── GEO-FILTER ──────────────────────────────────────────────────────────
      let geoDocs = orderedDocs;
      if (hasGeo && !input.tenantSubdomain) {
        geoDocs = orderedDocs.filter((doc) => {
          const tenant = doc.tenant as Tenant & {
            location?: {
              lat?: number | null;
              lng?: number | null;
              serviceRadiusKm?: number | null;
            };
          };
          const loc = tenant?.location;

          // null/undefined coords → seller not yet geocoded → SHOW them.
          // Never hide a seller just because geocoding hasn't run yet.
          if (loc?.lat == null || loc?.lng == null) return true;

          const radius = loc.serviceRadiusKm ?? 50;
          return (
            haversineKm(
              loc.lat,
              loc.lng,
              input.customerLat!,
              input.customerLng!,
            ) <= radius
          );
        });

        // Trim back to the requested page size after geo-filtering.
        geoDocs = geoDocs.slice(0, input.limit);
      }

      const outOfRange =
        hasGeo &&
        !input.tenantSubdomain &&
        geoDocs.length === 0 &&
        orderedDocs.length > 0;

      // ── PAGINATION CURSOR ────────────────────────────────────────────────────
      // tRPC's infiniteQueryOptions picks up `nextPage` from the return value
      // automatically as the next cursor — no client-side getNextPageParam needed.
      // Gate on Payload's hasNextPage (real DB cursor), NOT geoDocs.length,
      // because a geo-filtered page can return 0 docs while more DB pages exist.
      const hasNextPage = data.hasNextPage;
      const nextPage = hasNextPage ? input.cursor + 1 : null;

      return {
        docs: geoDocs.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
        hasNextPage,
        nextPage,
        totalDocs: data.totalDocs,
        limit: input.limit,
        outOfRange,
      };
    }),
});
