"use client";

import { useTRPC } from "@/trpc/client";
import {
  useSuspenseInfiniteQuery,
  type QueryFunction,
} from "@tanstack/react-query";
import { useProductFilters } from "@/modules/hooks/use-product-filters";
import {
  ProductCard,
  ProductCardSkeleton,
} from "@/modules/products/ui/components/product-card";
import { DEFAULT_LIMIT } from "@/constants";
import { Button } from "@/components/ui/button";
import { InboxIcon } from "lucide-react";

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
  });

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery({
      ...queryOptions,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryFn: queryOptions.queryFn as unknown as QueryFunction<any, any, number | null>,
      getNextPageParam: (lastPage) => {
        const page = lastPage as { hasNextPage?: boolean; nextPage?: number | null };
        return page.hasNextPage ? page.nextPage : undefined;
      },
    });

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
