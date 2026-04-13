"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useProductFilters } from "@/modules/hooks/use-product-filters";
import {
  ProductCard,
  ProductCardSkeleton,
} from "@/modules/products/ui/components/product-card";
import { DEFAULT_LIMIT } from "@/constants";
import { Button } from "@/components/ui/button";
import { InboxIcon } from "lucide-react";
import { useLocationStore } from "@/modules/home/store/use-location-store";
import { OutOfRangeBanner } from "@/modules/home/ui/components/out-of-range-banner";

interface Props {
  category?: string;
  subcategory?: string;
  tenantSubdomain?: string;
}

export const LocationAwareProductList = ({
  category,
  subcategory,
  tenantSubdomain,
}: Props) => {
  const [filters] = useProductFilters();
  const trpc = useTRPC();

  const location = useLocationStore((s) => s.location);
  /**
   * FIX (Bug 2): Gate on _hasHydrated so we never send stale coordinates.
   *
   * Before localStorage is read (first render, SSR, Zustand not yet hydrated),
   * _hasHydrated is false and we pass `undefined` for both coords.
   *
   * After Zustand reads localStorage, _hasHydrated flips to true and we pass
   * the real coordinates (or undefined if the user has no stored location).
   *
   * FIX (Bug 1): Use `undefined` instead of `null` so the initial query key
   * { customerLat: undefined, customerLng: undefined } matches the server-side
   * prefetch (which also omits these params → tRPC serialises them as
   * `undefined`). Passing `null` produces a DIFFERENT query key, causing a
   * cache miss on every first render and triggering an extra network round-trip.
   */
  const _hasHydrated = useLocationStore((s) => s._hasHydrated);
  const customerLat = _hasHydrated ? (location?.lat ?? undefined) : undefined;
  const customerLng = _hasHydrated ? (location?.lng ?? undefined) : undefined;

  /**
   * FIX (Bug 1 + queryFn pattern): Use the correct two-argument form of
   * infiniteQueryOptions so tRPC can wire the pageParam → cursor correctly.
   * The previous code spread queryOptions and re-declared queryFn inline,
   * which bypassed tRPC's internal cursor injection and required an unsafe
   * `as unknown` cast. The second-argument pattern mirrors what product-list.tsx
   * already does and is the officially supported tRPC approach.
   */
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      trpc.products.getMany.infiniteQueryOptions(
        {
          search: filters.search,
          sort: filters.sort,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          tags: filters.tags,
          category,
          subcategory,
          tenantSubdomain,
          limit: DEFAULT_LIMIT,
          customerLat, // undefined until Zustand hydrates (Bug 1 + 2 fix)
          customerLng, // undefined until Zustand hydrates (Bug 1 + 2 fix)
        },
        {
          /**
           * Use the server's hasNextPage flag (Bug 3 fix propagated here).
           * The server now correctly sets hasNextPage = true when either the
           * current geo-filtered batch has overflow OR Payload itself has more
           * pages. We rely on that flag here instead of re-computing on the
           * client.
           */
          getNextPageParam: (lastPage) => {
            return lastPage.hasNextPage
              ? (lastPage.nextPage ?? undefined)
              : undefined;
          },
        },
      ),
    );

  // Total product count across all loaded pages
  const totalProductCount = data.pages.flatMap((p) => p.docs).length;

  if (data.pages?.[0]?.docs.length === 0) {
    // Show geo banner first when customer has coords — gives a more specific msg
    if (customerLat != null && customerLng != null) {
      return <OutOfRangeBanner productCount={0} />;
    }
    return (
      <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
        <InboxIcon />
        <p className="text-base font-medium">No products found!</p>
      </div>
    );
  }

  return (
    <>
      <OutOfRangeBanner productCount={totalProductCount} />
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3 md:gap-4">
        {data.pages
          .flatMap((page) => page.docs)
          .map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              imageUrl={product.image?.url}
              tenantSubdomain={product.tenant.subdomain}
              tenantImageUrl={product.tenant.image?.url}
              reviewRating={product.reviewRating}
              reviewCount={product.reviewCount}
              price={product.price}
              quantity={product.quantity}
              stock={product.stock}
            />
          ))}
      </div>

      <div className="flex justify-center pt-8">
        {hasNextPage && (
          <Button
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            className="font-medium disabled:opacity-50 text-base bg-white"
            variant="secondary"
          >
            Load more
          </Button>
        )}
      </div>
    </>
  );
};

export const LocationAwareProductListLoading = () => (
  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3 md:gap-4">
    {Array.from({ length: DEFAULT_LIMIT }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);
