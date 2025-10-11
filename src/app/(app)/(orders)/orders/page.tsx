import React from "react";
import OrdersView from "@/modules/orders/ui/views/orders-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { DEFAULT_LIMIT } from "@/constants";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

const Page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.orders.getMany.infiniteQueryOptions({
      limit: DEFAULT_LIMIT,
    }),
  );


  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrdersView />
    </HydrationBoundary>
  );
};
export default Page;
