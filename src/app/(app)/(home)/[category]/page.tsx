import type { SearchParams } from "nuqs/server";
import React, { Suspense } from "react";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  ProductList,
  ProductListLoading,
} from "@/modules/products/ui/components/product-list";
import ProductFilters from "@/modules/products/ui/components/product-filters";
import productFilters from "@/modules/products/ui/components/product-filters";
import { loadProductFilters } from "@/modules/hooks/use-product-filters";

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<SearchParams>;
}

const Page = async ({ params, searchParams }: Props) => {
  const { category } = await params;
  const filters = await loadProductFilters(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.products.getMany.queryOptions({
      category,
      ...filters,
    }),
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className={"px-4 lg:px-12 py-8 flex flex-col gap-4"}>
        <div
          className={
            "grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-y-6 gap-x-12"
          }
        >
          <div className={"lg:col-span-2 xl:col-span-2"}>
            <div className={"border-1 border-black p-2 bg-white"}>
              <ProductFilters />
            </div>
          </div>
          <div className={"lg:col-span-4 xl:col-span-6"}>
            <Suspense fallback={<ProductListLoading />}>
              <ProductList category={category} />
            </Suspense>
          </div>
        </div>
      </div>
    </HydrationBoundary>
  );
};
export default Page;
