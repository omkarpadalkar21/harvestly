"use client";

import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/modules/orders/ui/components/status-badge";
import { MapPinIcon, PackageIcon, StarIcon } from "lucide-react";
import type { OrderSession } from "@/modules/orders/server/procedures";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface OrderSessionCardProps {
  session: OrderSession;
}

export const OrderSessionCard = ({ session }: OrderSessionCardProps) => {
  const formattedDate = formatDate(session.createdAt);

  return (
    <div className="border border-black rounded-lg bg-white overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#f4f4f4] border-b border-black gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <PackageIcon className="size-4 shrink-0 text-neutral-500" />
          <span className="text-xs font-mono text-neutral-500 truncate max-w-[180px] sm:max-w-xs">
            #{session.cartSessionId.slice(-12).toUpperCase()}
          </span>
            · {formattedDate}
        </div>
        <StatusBadge status={session.status} />
      </div>

      {/* Line Items */}
      <div className="divide-y divide-neutral-100">
        {session.items.map((item) => (
          <Link
            key={item.orderLineId}
            prefetch
            href={`/orders/${item.productId}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
          >
            {/* Product image */}
            <div className="relative size-14 sm:size-16 shrink-0 rounded overflow-hidden border border-neutral-200">
              <Image
                src={item.image || "/placeholder.png"}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">{item.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {item.tenantImageUrl && (
                  <Image
                    src={item.tenantImageUrl}
                    alt={item.tenantName}
                    width={12}
                    height={12}
                    className="rounded-full border shrink-0"
                  />
                )}
                <p className="text-xs text-neutral-500 truncate">
                  {item.tenantName}
                </p>
              </div>
              {item.reviewCount > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <StarIcon className="size-3 fill-black" />
                  <span className="text-xs font-medium">
                    {item.reviewRating.toFixed(1)} ({item.reviewCount})
                  </span>
                </div>
              )}
            </div>

            {/* Qty + price */}
            <div className="flex flex-col items-end shrink-0 gap-0.5">
              <p className="text-sm font-semibold">₹{item.price * item.quantity}</p>
              <p className="text-xs text-neutral-500">
                ₹{item.price} × {item.quantity}
              </p>
              {item.lineStatus !== session.status && (
                <StatusBadge status={item.lineStatus} className="mt-1 text-[10px]" />
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-black bg-neutral-50 gap-2 flex-wrap">
        {/* Delivery address snippet */}
        {session.deliveryAddress?.city ? (
          <div className="flex items-center gap-1 text-xs text-neutral-500 min-w-0">
            <MapPinIcon className="size-3 shrink-0" />
            <span className="truncate">
              {session.deliveryAddress.city},{" "}
              {session.deliveryAddress.state} –{" "}
              {session.deliveryAddress.pincode}
            </span>
          </div>
        ) : (
          <div />
        )}

        {/* Total */}
        <div className="text-sm font-semibold whitespace-nowrap">
          Total: ₹{session.totalPrice.toLocaleString("en-IN")}
          <span className="text-xs font-normal text-neutral-500 ml-1">
            ({session.totalItems} item{session.totalItems !== 1 ? "s" : ""})
          </span>
        </div>
      </div>
    </div>
  );
};

export const OrderSessionCardSkeleton = () => (
  <div className="border border-black rounded-lg bg-white overflow-hidden animate-pulse">
    <div className="h-11 bg-neutral-200 border-b border-black" />
    <div className="divide-y divide-neutral-100">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="size-14 bg-neutral-200 rounded shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-neutral-200 rounded w-3/4" />
            <div className="h-3 bg-neutral-200 rounded w-1/3" />
          </div>
          <div className="space-y-1 items-end flex flex-col">
            <div className="h-4 bg-neutral-200 rounded w-16" />
            <div className="h-3 bg-neutral-200 rounded w-12" />
          </div>
        </div>
      ))}
    </div>
    <div className="h-11 bg-neutral-100 border-t border-black" />
  </div>
);
