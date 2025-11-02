"use client";
import StarRating from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { generateTenantURL } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckIcon, LinkIcon, StarIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";

// import CartButton from "@/modules/products/ui/components/cart-button";
const CartButton = dynamic(
  () => import("../components/cart-button").then((mod) => mod.CartButton),
  {
    ssr: false,
    loading: () => (
      <Button disabled className={"flex-1 bg-green-600"}>
        Add to cart
      </Button>
    ),
  }
);

interface ProductViewProps {
  productId: string;
  subdomain: string;
}

const ProductView = ({ productId, subdomain }: ProductViewProps) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.products.getOne.queryOptions({ id: productId })
  );
  return (
    <div className="px-4 lg:px-12 py-10">
      <div className="border border-black rounded-sm overflow-hidden bg-white">
        <div className={"grid grid-cols-1 lg:grid-cols-[2fr_3fr]"}>
          {/* Left side - Image */}
          <div className="relative aspect-square lg:aspect-auto lg:min-h-[600px] border-b lg:border-b-0 lg:border-r border-black">
            {hasMounted && data.isPurchased && (
              <div
                className={
                  "pointer-events-none absolute top-2 left-2 z-50 bg-white text-black text-base font-semibold px-2 py-1 rounded-sm shadow border border-black"
                }
              >
                😊 Previously Bought!
              </div>
            )}
            <Image
              src={data.image?.url || "/placeholder.png"}
              alt={data.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Right side - Content */}
          <div className="flex flex-col">
            <div className="p-6">
              <h1 className={"text-2xl lg:text-3xl font-medium mb-2"}>
                {data.name}
              </h1>
            </div>
            <div className={"border-y px-6 py-3"}>
              <Link
                href={generateTenantURL(subdomain)}
                className={
                  "flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline w-fit"
                }
              >
                {data.tenant?.image?.url && (
                  <Image
                    src={data.tenant.image.url}
                    alt={data.tenant.name}
                    width={20}
                    height={20}
                    className={"rounded-full border shrink-0 size-5"}
                  />
                )}
                <p className={"text-sm font-medium"}>
                  Visit the {data.tenant.name} Store
                </p>
              </Link>
            </div>

            <div className={"px-6 py-4 border-b"}>
              <div className={"flex items-center gap-2 mb-1"}>
                <p className={"text-base font-medium"}>{data.reviewRating}</p>
                <StarRating
                  rating={data.reviewRating}
                  iconClassName={"size-4"}
                />
                <p
                  className={
                    "text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                  }
                >
                  {data.reviewCount} ratings
                </p>
              </div>
            </div>

            <div
              className={
                "px-6 flex justify-between py-4 border-b bg-neutral-50"
              }
            >
              <div className={"flex items-baseline gap-2"}>
                <p className={"text-3xl font-medium text-red-700"}>
                  ₹{data.price}
                </p>
                <p className={"text-sm text-neutral-600"}>
                  {data.quantity.amount} {data.quantity.unit}
                </p>
              </div>
              <p className={"text-sm mt-2 font-medium"}>
                {data.refundPolicy === "no-refunds"
                  ? "No refunds"
                  : `${data.refundPolicy} money back guarantee`}
              </p>
            </div>

            <div className={"px-6 py-4 border-b"}>
              <div className={"flex flex-col sm:flex-row gap-3"}>
                <CartButton tenantSlug={subdomain} productId={productId} />
                <Button
                  variant={"secondary"}
                  onClick={() => {
                    setIsCopied(true);
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("URL Copied to clipboard!");

                    setTimeout(() => {
                      setIsCopied(false);
                    }, 2000);
                  }}
                  disabled={isCopied}
                  className="px-4 py-3"
                >
                  {isCopied ? <CheckIcon /> : <LinkIcon />}
                </Button>
              </div>
            </div>

            <div className={"p-6 border-b"}>
              <h2 className={"text-xl font-semibold mb-3"}>About this item</h2>
              {data.description ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <RichText data={data.description as any} />
              ) : (
                <p className={"text-muted-foreground italic font-medium"}>
                  No description available
                </p>
              )}
            </div>

            <div className={"p-6"}>
              <div className={"flex items-center justify-between mb-4"}>
                <h3 className={"text-xl font-semibold"}>Customer ratings</h3>
                <div className={"flex items-center gap-x-1 font-medium"}>
                  <StarIcon className={"size-4 fill-black"} />
                  <p>({data.reviewRating})</p>
                  <p className={"text-sm"}>{data.reviewCount} ratings</p>
                </div>
              </div>
              <div className={"grid grid-cols-[auto_1fr_auto] gap-3"}>
                {[5, 4, 3, 2, 1].map((star) => (
                  <Fragment key={star}>
                    <div className={"font-medium text-sm"}>
                      {star} {star === 1 ? "star" : "stars"}
                    </div>
                    <Progress
                      value={data.ratingDistribution[star]}
                      className={"h-[1lh]"}
                    />
                    <div className={"font-medium text-sm"}>
                      {data.ratingDistribution[star]}%
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;

export const ProductViewSkeleton = () => {
  return (
    <div className="px-4 lg:px-12 py-10">
      <div className="border border-black rounded-sm overflow-hidden bg-white">
        <div className={"grid grid-cols-1 lg:grid-cols-[2fr_3fr]"}>
          {/* Left side - Image skeleton */}
          <div className="relative aspect-square lg:aspect-auto lg:min-h-[600px] border-b lg:border-b-0 lg:border-r border-black bg-neutral-200 animate-pulse" />

          {/* Right side - Content skeleton */}
          <div className="flex flex-col">
            {/* Title */}
            <div className="p-6">
              <div className="h-8 bg-neutral-200 rounded animate-pulse w-4/5" />
            </div>

            {/* Tenant link */}
            <div className={"border-y px-6 py-3"}>
              <div className={"flex items-center gap-2"}>
                <div className="size-5 bg-neutral-200 rounded-full animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded animate-pulse w-32" />
              </div>
            </div>

            {/* Ratings */}
            <div className={"px-6 py-4 border-b"}>
              <div className={"flex items-center gap-2"}>
                <div className="h-5 bg-neutral-200 rounded animate-pulse w-8" />
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="size-4 bg-neutral-200 rounded animate-pulse"
                    />
                  ))}
                </div>
                <div className="h-4 bg-neutral-200 rounded animate-pulse w-20" />
              </div>
            </div>

            {/* Price section */}
            <div className={"px-6 flex justify-between py-4 border-b bg-neutral-50"}>
              <div className={"flex items-baseline gap-2"}>
                <div className="h-10 bg-neutral-200 rounded animate-pulse w-32" />
                <div className="h-5 bg-neutral-200 rounded animate-pulse w-20" />
              </div>
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-40 self-start" />
            </div>

            {/* Action buttons */}
            <div className={"px-6 py-4 border-b"}>
              <div className={"flex flex-col sm:flex-row gap-3"}>
                <div className="h-12 bg-neutral-200 rounded animate-pulse flex-1" />
                <div className="h-12 bg-neutral-200 rounded animate-pulse w-full sm:w-14" />
              </div>
            </div>

            {/* Description */}
            <div className={"p-6 border-b"}>
              <div className="h-6 bg-neutral-200 rounded animate-pulse w-32 mb-3" />
              <div className="space-y-3">
                <div className="h-4 bg-neutral-200 rounded animate-pulse w-full" />
                <div className="h-4 bg-neutral-200 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-neutral-200 rounded animate-pulse w-4/6" />
                <div className="h-4 bg-neutral-200 rounded animate-pulse w-3/5" />
              </div>
            </div>

            {/* Ratings section */}
            <div className={"p-6"}>
              <div className={"flex items-center justify-between mb-4"}>
                <div className="h-6 bg-neutral-200 rounded animate-pulse w-32" />
                <div className={"flex items-center gap-x-1"}>
                  <div className="size-4 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-4 bg-neutral-200 rounded animate-pulse w-8" />
                  <div className="h-4 bg-neutral-200 rounded animate-pulse w-20" />
                </div>
              </div>
              <div className={"grid grid-cols-[auto_1fr_auto] gap-3"}>
                {[5, 4, 3, 2, 1].map((star) => (
                  <Fragment key={star}>
                    <div className="h-4 bg-neutral-200 rounded animate-pulse w-12" />
                    <div className="h-2 bg-neutral-200 rounded animate-pulse flex-1" />
                    <div className="h-4 bg-neutral-200 rounded animate-pulse w-8" />
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
