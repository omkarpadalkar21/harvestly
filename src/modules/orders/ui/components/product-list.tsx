"use client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import {
  OrderSessionCard,
  OrderSessionCardSkeleton,
} from "@/modules/orders/ui/components/order-session-card";
import { DEFAULT_LIMIT } from "@/constants";
import { Button } from "@/components/ui/button";
import { InboxIcon } from "lucide-react";

export const ProductList = () => {
  const trpc = useTRPC();
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      trpc.orders.getMany.infiniteQueryOptions(
        { limit: DEFAULT_LIMIT },
        {
          getNextPageParam: (lastPage) =>
            lastPage.hasNextPage ? lastPage.nextPage : undefined,
        }
      )
    );

  const allSessions = data.pages.flatMap((page) => page.docs);

  if (allSessions.length === 0) {
    return (
      <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
        <InboxIcon />
        <p className="text-base font-medium">No orders yet!</p>
        <p className="text-sm text-muted-foreground">
          Your completed orders will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {allSessions.map((session) => (
          <OrderSessionCard key={session.cartSessionId} session={session} />
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
            Load more orders
          </Button>
        )}
      </div>
    </>
  );
};

export const ProductListLoading = () => {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <OrderSessionCardSkeleton key={index} />
      ))}
    </div>
  );
};
