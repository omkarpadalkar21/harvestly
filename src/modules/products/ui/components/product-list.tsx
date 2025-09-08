"use client";
import {useTRPC} from "@/trpc/client";
import {useSuspenseInfiniteQuery} from "@tanstack/react-query";
import React from "react";
import {useProductFilters} from "@/modules/hooks/use-product-filters";
import {ProductCard, ProductCardSkeleton,} from "@/modules/products/ui/components/product-card";
import {DEFAULT_LIMIT} from "@/constants";
import {Button} from "@/components/ui/button";
import {InboxIcon} from "lucide-react";

interface Props {
  category?: string;
  subcategory?: string;
  tenantSubdomain?: string;
}

export const ProductList = ({
  category,
  subcategory,
  tenantSubdomain,
}: Props) => {
  const [filters] = useProductFilters();
  const trpc = useTRPC();
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      trpc.products.getMany.infiniteQueryOptions(
        {
          ...filters,
          category,
          subcategory,
          tenantSubdomain,
          limit: DEFAULT_LIMIT,
        },
        {
          getNextPageParam: (lastPage) => {
            return lastPage.docs.length > 0 ? lastPage.nextPage : undefined;
          },
        }
      )
    );

  if (data.pages?.[0]?.docs.length === 0) {
    return (
      <div
        className={
          "border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg"
        }
      >
        <InboxIcon />
        <p className={"text-base font-medium"}>No products found!</p>
      </div>
    );
  }
  return (
    <>
      <div
        className={
          "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
        }
      >
        {data?.pages
          .flatMap((page) => page.docs)
          .map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              imageUrl={product.image?.url}
              tenantSubdomain={product.tenant.subdomain}
              tenantImageUrl={product.tenant.image?.url}
              reviewRating={3}
              reviewCount={5}
              price={product.price}
              quantity={product.quantity}
            />
          ))}
      </div>
      <div className={"flex justify-center pt-8"}>
        {hasNextPage && (
          <Button
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            className={"font-medium disabled:opacity-50 text-base bg-white"}
            variant={"secondary"}
          >
            Load more
          </Button>
        )}
      </div>
    </>
  );
};

export const ProductListLoading = () => {
  return (
    <div
      className={
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
      }
    >
      {Array.from({ length: DEFAULT_LIMIT }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};
