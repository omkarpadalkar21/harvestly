import React from "react";
import { redirect } from "next/navigation";
import OrdersView from "@/modules/orders/ui/views/orders-view";
import { caller, getQueryClient, trpc } from "@/trpc/server";
import { DEFAULT_LIMIT } from "@/constants";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export const dynamic = "force-dynamic";

const Page = async () => {
  const session = await caller.auth.session();

  if (!session.user || !session.user.roles?.includes("customer")) {
    redirect("/sign-in");
  }

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
