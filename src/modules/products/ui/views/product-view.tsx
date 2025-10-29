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
        <div className="relative aspect-4/3 sm:aspect-[3.5] border-b">
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
        <div className={"grid grid-cols-1 lg:grid-cols-3"}>
          <div className="col-span-2">
            <div className="p-6 flex items-center justify-between">
              <h1 className={"text-4xl font-medium"}>{data.name}</h1>
              <p>
                {data.quantity.amount} {data.quantity.unit}
              </p>
            </div>
            <div className={"border-y flex"}>
              <div
                className={
                  "px-6 py-4 border-r flex items-center justify-center"
                }
              >
                <div
                  className={"px-2 py-1 border border-black w-fit bg-green-600"}
                >
                  {
                    <p className={"text-base font-medium text-white"}>
                      ₹{data.price}
                    </p>
                  }
                </div>
              </div>

              <div
                className={
                  "px-6 py-4 flex items-center justify-center lg:border-r"
                }
              >
                <Link
                  href={generateTenantURL(subdomain)}
                  className={"flex items-center gap-2"}
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
                  <p className={"text-base underline font-medium"}>
                    {data.tenant.name}
                  </p>
                </Link>
              </div>

              <div
                className={
                  "hidden lg:flex px-6 py-4 items-center justify-center "
                }
              >
                <div className={"flex items-center gap-2"}>
                  <StarRating
                    rating={data.reviewRating}
                    iconClassName={"size-4"}
                  />
                  <p className={"text-base font-medium"}>
                    {data.reviewCount} ratings
                  </p>
                </div>
              </div>
            </div>

            <div
              className={
                "block lg:hidden px-6 py-4 items-center justify-center border-b"
              }
            >
              <div className={"flex items-center gap-2"}>
                <StarRating
                  rating={data.reviewRating}
                  iconClassName={"size-4"}
                />
                <p className={"text-base font-medium"}>
                  {data.reviewCount} ratings
                </p>
              </div>
            </div>

            <div className={"p-6"}>
              {data.description ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <RichText data={data.description as any} />
              ) : (
                <p className={"text-muted-foreground italic font-medium"}>
                  No description available
                </p>
              )}
            </div>
          </div>
          <div className={"col-span-1 lg:border-l border-black"}>
            <div className={"border-black  h-full"}>
              <div className={"flex flex-col gap-4 p-6 border-b border-black"}>
                <div className={"flex flex-row items-center gap-2 "}>
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
                <p className={"text-center font-medium"}>
                  {data.refundPolicy === "no-refunds"
                    ? "No refunds"
                    : `${data.refundPolicy} money back guarantee`}
                </p>
              </div>
              <div className={"p-6"}>
                <div className={"flex items-center justify-between"}>
                  <h3 className={"text-xl font-medium"}>Ratings</h3>
                  <div className={"flex items-center gap-x-1 font-medium"}>
                    <StarIcon className={"size-4 fill-black"} />
                    <p>({data.reviewRating})</p>
                    <p className={"text-base"}>{data.reviewCount} ratings</p>
                  </div>
                </div>
                <div className={"grid grid-cols-[auto_1fr_auto] gap-3 mt-4"}>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <Fragment key={star}>
                      <div className={"font-medium"}>
                        {star} {star === 1 ? "star" : "stars"}
                      </div>
                      <Progress
                        value={data.ratingDistribution[star]}
                        className={"h-[1lh]"}
                      />
                      <div className={"font-medium"}>
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
    </div>
  );
};

export default ProductView;

export const ProductViewSkeleton = () => {
  return (
    <div className="px-4 lg:px-12 py-10">
      <div className="border border-black rounded-sm overflow-hidden bg-white">
        {/* Image skeleton */}
        <div className="relative aspect-4/3 sm:aspect-[3.5] border-b bg-neutral-200 animate-pulse" />

        <div className={"grid grid-cols-1 lg:grid-cols-3"}>
          <div className="col-span-2">
            {/* Title and quantity */}
            <div className="p-6 flex items-center justify-between">
              <div className="h-12 bg-neutral-200 rounded animate-pulse w-4/5" />
              <div className="h-7 bg-neutral-200 rounded animate-pulse w-24" />
            </div>

            {/* Price, tenant, ratings row */}
            <div className={"border-y flex"}>
              <div
                className={
                  "px-6 py-4 border-r flex items-center justify-center"
                }
              >
                <div
                  className={
                    "px-2 py-1 border border-black w-fit bg-neutral-200 animate-pulse"
                  }
                >
                  <div className="h-5 bg-neutral-300 rounded w-20" />
                </div>
              </div>

              <div
                className={
                  "px-6 py-4 flex items-center justify-center lg:border-r"
                }
              >
                <div className={"flex items-center gap-2"}>
                  <div
                    className={
                      "size-6 bg-neutral-200 rounded-full animate-pulse"
                    }
                  />
                  <div className="h-5 bg-neutral-200 rounded animate-pulse w-28" />
                </div>
              </div>

              <div
                className={
                  "hidden lg:flex px-6 py-4 items-center justify-center"
                }
              >
                <div className={"flex items-center gap-2"}>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="size-5 bg-neutral-200 rounded animate-pulse"
                      />
                    ))}
                  </div>
                  <div className="h-5 bg-neutral-200 rounded animate-pulse w-24" />
                </div>
              </div>
            </div>

            {/* Mobile ratings */}
            <div
              className={
                "block lg:hidden px-6 py-4 items-center justify-center border-b"
              }
            >
              <div className={"flex items-center gap-2"}>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="size-5 bg-neutral-200 rounded animate-pulse"
                    />
                  ))}
                </div>
                <div className="h-5 bg-neutral-200 rounded animate-pulse w-24" />
              </div>
            </div>

            {/* Description */}
            <div className={"p-6"}>
              <div className="space-y-3">
                <div className="h-5 bg-neutral-200 rounded animate-pulse w-full" />
                <div className="h-5 bg-neutral-200 rounded animate-pulse w-5/6" />
                <div className="h-5 bg-neutral-200 rounded animate-pulse w-4/6" />
                <div className="h-5 bg-neutral-200 rounded animate-pulse w-3/5" />
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className={"col-span-1 lg:border-l border-black"}>
            <div className={"border-black h-full"}>
              {/* Action buttons */}
              <div className={"flex flex-col gap-4 p-6 border-b border-black"}>
                <div className={"flex flex-row items-center gap-2"}>
                  <div className="h-12 bg-neutral-200 rounded animate-pulse flex-1" />
                  <div className="h-12 bg-neutral-200 rounded animate-pulse w-14" />
                </div>
                <div className="h-5 bg-neutral-200 rounded animate-pulse w-4/5 mx-auto" />
              </div>

              {/* Ratings section */}
              <div className={"p-6"}>
                <div className={"flex items-center justify-between mb-4"}>
                  <div className="h-6 bg-neutral-200 rounded animate-pulse w-16" />
                  <div className={"flex items-center gap-x-1"}>
                    <div className="size-4 bg-neutral-200 rounded animate-pulse" />
                    <div className="h-4 bg-neutral-200 rounded animate-pulse w-8" />
                    <div className="h-4 bg-neutral-200 rounded animate-pulse w-20" />
                  </div>
                </div>

                {/* Rating distribution */}
                <div className={"grid grid-cols-[auto_1fr_auto] gap-3 mt-4"}>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3">
                      <div className="h-4 bg-neutral-200 rounded animate-pulse w-12" />
                      <div className="h-2 bg-neutral-200 rounded animate-pulse flex-1" />
                      <div className="h-4 bg-neutral-200 rounded animate-pulse w-8" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
