"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ReviewSiderbar } from "@/modules/orders/ui/components/review-siderbar";
import { Suspense } from "react";
import { ReviewFormSkeleton } from "../components/review-form";
import {
  StatusBadge,
  StatusTimeline,
} from "@/modules/orders/ui/components/status-badge";
import { MapPinIcon } from "lucide-react";

interface Props {
  productId: string;
}

const ProductView = ({ productId }: Props) => {
  const trpc = useTRPC();
  const { data, refetch } = useSuspenseQuery(
    trpc.orders.getOne.queryOptions({
      productId,
    })
  );

  const reqRefund = useMutation(
    trpc.orders.requestRefund.mutationOptions({
      onSuccess: () => {
        toast.success("Refund request submitted successfully");
        refetch();
      },
      onError: (err) => {
        toast.error(err.message);
      }
    })
  );

  const addr = data.deliveryAddress as
    | {
        fullName?: string;
        phone?: string;
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        state?: string;
        pincode?: string;
      }
    | undefined;

  return (
    <div className={"min-h-screen bg-white"}>
      <nav className={"p-4 bg-[#f4f4f4] w-full border-b border-black"}>
        <Link prefetch href="/orders" className={"flex items-center gap-2"}>
          <ArrowLeftIcon className={"size-4"} />
          <span className={"text font-medium"}>Back to Orders</span>
        </Link>
      </nav>
      <header className={"bg-[#f4f4f4] py-8 border-b border-black"}>
        <div className={"max-w-(--breakpoint-xl) mx-auto px-4 lg:px-12 flex items-center gap-4"}>
          <h1 className={"text-[40px] font-medium"}>{data.name}</h1>
          {data.orderStatus && (
            <StatusBadge status={data.orderStatus} className="text-sm px-3 py-1" />
          )}
        </div>
      </header>
      <section
        className={"max-w-(--breakpoint-xl) mx-auto px-4 lg:px-12 py-10"}
      >
        <div className={"grid grid-cols-1 lg:grid-cols-7 gap-8"}>
          {/* Left col — review sidebar */}
          <div className={"lg:col-span-2 flex flex-col gap-6"}>
            <div
              className={"p-4 bg-white rounded-md border border-black gap-4"}
            >
              <Suspense fallback={<ReviewFormSkeleton />}>
                <ReviewSiderbar productId={productId} />
              </Suspense>
            </div>
          </div>

          {/* Right col — order status timeline + delivery address */}
          <div className={"lg:col-span-5 flex flex-col gap-6"}>
            {/* Product image summary */}
            {data.image && (
              <div className="border border-black rounded-md overflow-hidden flex items-center gap-4 p-4 bg-white">
                <div className="relative size-20 shrink-0">
                  <Image
                    src={
                      typeof data.image === "object" && data.image.url
                        ? data.image.url
                        : "/placeholder.png"
                    }
                    alt={data.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div>
                  <p className="font-medium text-base">{data.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.quantity?.amount} {data.quantity?.unit}
                  </p>
                </div>
              </div>
            )}

            {/* Status timeline */}
            <div className="border border-black rounded-md p-5 bg-white">
              <h2 className="font-semibold text-base mb-4">Order Status</h2>
              <StatusTimeline currentStatus={data.orderStatus ?? "pending"} />
            </div>

            {/* Delivery address */}
            {addr?.fullName && (
              <div className="border border-black rounded-md p-5 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <MapPinIcon className="size-4 shrink-0" />
                  <h2 className="font-semibold text-base">Delivery Address</h2>
                </div>
                <div className="text-sm leading-relaxed text-neutral-700">
                  <p className="font-medium text-black">
                    {addr.fullName}
                    {addr.phone ? ` · ${addr.phone}` : ""}
                  </p>
                  <p>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p>
                    {addr.city && `${addr.city}, `}
                    {addr.state}
                    {addr.pincode ? ` – ${addr.pincode}` : ""}
                  </p>
                </div>
              </div>
            )}

            {/* Refund Action */}
            <div className="border border-black rounded-md p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div>
                 <h2 className="font-semibold text-base mb-1">Having issues?</h2>
                 <p className="text-sm text-neutral-600">You can request a refund if your product is damaged or not delivered.</p>
               </div>
               <button 
                  disabled={data.orderStatus === "refunded" || reqRefund.isPending || data.orderStatus === "cancelled"}
                  className="bg-black shrink-0 text-white px-5 py-2.5 rounded font-medium text-sm hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                  onClick={() => {
                     const reason = prompt("Please provide a reason for your refund request:");
                     if (reason && reason.trim().length >= 5) {
                        reqRefund.mutate({ orderId: data.id, reason: reason.trim() });
                     } else if (reason !== null) {
                        toast.error("Reason must be at least 5 characters long");
                     }
                  }}
               >
                 {data.orderStatus === "refunded" ? "Refunded" : reqRefund.isPending ? "Submitting..." : "Request Refund"}
               </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default ProductView;
