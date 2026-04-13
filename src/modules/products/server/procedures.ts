import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import type { Sort, Where } from "payload";
import { sortValues } from "@/modules/products/search-params";
import type { Media, Tenant } from "@/payload-types";
import { DEFAULT_LIMIT } from "@/constants";
import { TRPCError } from "@trpc/server";
import { sellerHasValidCoords, sellerServesLocation } from "@/lib/geo";

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

      // Fetch 3× the page size so geo-filtering still leaves enough results.
      const GEO_FETCH_MULTIPLIER = 3;
      const fetchLimit = input.limit * GEO_FETCH_MULTIPLIER;

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

      // ── GEO-FILTER ────────────────────────────────────────────────────────
      // Apply BEFORE slicing to page size.
      const customerLat = input.customerLat ?? null;
      const customerLng = input.customerLng ?? null;
      // If customer has no location set, show ALL products (no filtering)
      const customerHasLocation = customerLat != null && customerLng != null;

      let geoDebugCount = 0; // limit debug output to first 3 products

      const geoFiltered = orderedDocs.filter((product) => {
        // No customer location → show everything
        if (!customerHasLocation) return true;

        const tenant = product.tenant as Tenant | null;

        // parseFloat coercion: Payload may serialise number fields as strings
        // when depth > 0 and certain transforms are applied. isNaN("28.6") is
        // false in JS/TS, but the TypeScript type won't catch a string at runtime.
        const rawLat = tenant?.location?.lat;
        const rawLng = tenant?.location?.lng;
        const sellerLat =
          rawLat != null ? parseFloat(String(rawLat)) : null;
        const sellerLng =
          rawLng != null ? parseFloat(String(rawLng)) : null;
        const serviceRadiusKm =
          (tenant?.location?.serviceRadiusKm as number | undefined) ?? 50;

        // ── DEBUG LOG (first 3 products) ──────────────────────────────────
        if (geoDebugCount < 3) {
          console.log(
            `[geo-filter debug] product=${product.id} tenant=${tenant?.id ?? 'none'} ` +
            `rawLat=${rawLat} rawLng=${rawLng} ` +
            `sellerLat=${sellerLat} sellerLng=${sellerLng} ` +
            `serviceRadiusKm=${serviceRadiusKm} ` +
            `customerLat=${customerLat} customerLng=${customerLng}`,
          );
          geoDebugCount++;
        }

        // Use sellerHasValidCoords — do NOT use !sellerLat / !sellerLng.
        // lat=0 / lng=0 are valid real coordinates (Gulf of Guinea) and
        // falsy-zero would incorrectly treat them as "not set".
        if (!sellerHasValidCoords(sellerLat, sellerLng)) {
          // Seller has not set their location yet → hide from geo-filtered results
          return false;
        }

        // Both seller and customer have valid coordinates → Haversine check
        return sellerServesLocation(
          sellerLat!,
          sellerLng!,
          serviceRadiusKm,
          customerLat,
          customerLng,
        );
      });

      // ── PAGINATION ────────────────────────────────────────────────────────
      const paginated = geoFiltered.slice(0, input.limit);

      /**
       * FIX (Bug 3): The previous code only set hasNextPage = true when the
       * current geo-filtered batch had MORE than `limit` items:
       *
       *   hasNextPage = geoFiltered.length > input.limit   ← WRONG
       *
       * This prematurely terminated pagination whenever geo-filtering reduced
       * the current batch below `limit`, even if Payload had more pages of
       * products that might contain in-range sellers.
       *
       * Correct logic: there are more results if EITHER:
       *   (a) the current geo-filtered batch overflowed the page limit, OR
       *   (b) Payload itself has more pages to fetch (data.hasNextPage)
       *
       * Case (b) is the critical fix — without it, "Load more" disappears the
       * moment geo-filtering trims a batch below the display limit, leaving
       * in-range sellers stranded on Payload's later pages invisible to users.
       */
      const hasNextPage =
        geoFiltered.length > input.limit || data.hasNextPage === true;
      const nextPage = hasNextPage ? input.cursor + 1 : null;

      return {
        docs: paginated.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
        hasNextPage,
        nextPage,
        totalDocs: geoFiltered.length,
        limit: input.limit,
      };
    }),
});
