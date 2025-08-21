import React, { Suspense } from "react";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  ProductList,
  ProductListLoading,
} from "@/modules/products/ui/components/product-list";

interface Props {
  params: Promise<{ category: string }>;
}

const Page = async ({ params }: Props) => {
  const { category } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.products.getMany.queryOptions({
      category,
    }),
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductListLoading />}>
        <ProductList category={category} />
      </Suspense>
    </HydrationBoundary>
  );
};
export default Page;
