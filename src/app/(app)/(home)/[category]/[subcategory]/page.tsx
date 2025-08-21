import React, { Suspense } from "react";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  ProductList,
  ProductListLoading,
} from "@/modules/products/ui/components/product-list";

interface Props {
  params: Promise<{ subcategory: string }>;
}

const Page = async ({ params }: Props) => {
  const { subcategory } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.products.getMany.queryOptions({
      subcategory: subcategory,
    }),
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductListLoading />}>
        <ProductList subcategory={subcategory} />
      </Suspense>
    </HydrationBoundary>
  );
};
export default Page;
