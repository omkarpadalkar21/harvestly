"use client";

import { useState, useEffect } from "react";
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
import { LocationPrompt } from "@/modules/home/ui/components/location-prompt";
import { LocationBar } from "@/modules/home/ui/components/location-bar";
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
  const { location, hasPrompted, setHasPrompted } = useLocationStore();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!hasPrompted && !tenantSubdomain) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
        setHasPrompted();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hasPrompted, tenantSubdomain, setHasPrompted]);

  const queryOptions = trpc.products.getMany.infiniteQueryOptions({
    search: filters.search,
    sort: filters.sort,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    tags: filters.tags,
    category,
    subcategory,
    tenantSubdomain,
    limit: DEFAULT_LIMIT,
    customerLat: location?.lat ?? null,
    customerLng: location?.lng ?? null,
  });

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery({
      ...queryOptions,
      getNextPageParam: (lastPage) =>
        lastPage.hasNextPage ? lastPage.nextPage : undefined,
    });

  const firstPage = data.pages[0];
  const isOutOfRange =
    (firstPage as { outOfRange?: boolean })?.outOfRange === true;

  if (isOutOfRange) {
    return (
      <>
        {showPrompt && <LocationPrompt onClose={() => setShowPrompt(false)} />}
        <OutOfRangeBanner onChangeLocation={() => setShowPrompt(true)} />
      </>
    );
  }

  if (data.pages?.[0]?.docs.length === 0) {
    return (
      <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
        <InboxIcon />
        <p className="text-base font-medium">No products found!</p>
      </div>
    );
  }

  return (
    <>
      {showPrompt && <LocationPrompt onClose={() => setShowPrompt(false)} />}

      {location && !tenantSubdomain && (
        <div className="mb-3 flex items-center justify-between">
          <LocationBar onRequestChange={() => setShowPrompt(true)} />
          <span className="text-xs text-neutral-400">
            Showing sellers near you
          </span>
        </div>
      )}

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
