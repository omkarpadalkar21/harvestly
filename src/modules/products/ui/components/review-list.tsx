"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheckIcon } from "lucide-react";
import React from "react";
import StarRating from "@/components/star-rating";

interface ProductReviewListProps {
  productId: string;
}

export const ProductReviewList = ({ productId }: ProductReviewListProps) => {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.reviews.getProductReviews.queryOptions({ productId })
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 mt-6">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse bg-neutral-100 h-24 rounded" />
        ))}
      </div>
    );
  }

  if (!data?.docs || data.docs.length === 0) {
    return <p className="text-neutral-500 mt-4">No reviews yet.</p>;
  }

  return (
    <div className="flex flex-col gap-6 mt-6">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {data.docs.map((review: any) => (
        <div key={review.id} className="border-b pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="size-8 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-neutral-600">
              {review.user?.username?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-medium text-sm">{review.user?.username || "Anonymous"}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <StarRating rating={review.rating} iconClassName="size-3" />
                {review.verifiedPurchase && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                    <BadgeCheckIcon className="size-3" />
                    Verified Purchase
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-sm text-neutral-700 whitespace-pre-wrap">{review.description}</p>
        </div>
      ))}
    </div>
  );
};
