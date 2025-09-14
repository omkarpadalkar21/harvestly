"use client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { generateTenantURL } from "@/lib/utils";
import StarRating from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { LinkIcon, StarIcon } from "lucide-react";
import { Fragment } from "react";
import { Progress } from "@/components/ui/progress";
import dynamic from "next/dynamic";

// import CartButton from "@/modules/products/ui/components/cart-button";
const CartButton = dynamic(
  () => import("../components/cart-button").then((mod) => mod.CartButton),
  { ssr: false,
  loading:()=><Button disabled className={"flex-1 bg-green-600"}>Add to cart</Button>},
);
interface ProductViewProps {
  productId: string;
  subdomain: string;
}

const ProductView = ({ productId, subdomain }: ProductViewProps) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.products.getOne.queryOptions({ id: productId }),
  );
  return (
    <div className="px-4 lg:px-12 py-10">
      <div className="border border-black rounded-sm overflow-hidden bg-white">
        <div className="relative aspect-[3.9] border-b">
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
                      className={"rounded-full border shrink-0 size-[20px]"}
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
                <div className={"flex items-center gap-1"}>
                  <StarRating rating={4} iconClassName={"size-4"} />
                </div>
              </div>
            </div>

            <div
              className={
                "block lg:hidden px-6 py-4 items-center justify-center border-b"
              }
            >
              <div className={"flex items-center gap-1"}>
                <StarRating rating={4} iconClassName={"size-4"} />
                <p className={"text-base font-medium"}>{5} ratings</p>
              </div>
            </div>

            <div className={"p-6"}>
              {data.description ? (
                <p>{data.description}</p>
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
                    onClick={() => {}}
                    disabled={false}
                    className="px-4 py-3"
                  >
                    <LinkIcon />
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
                    <p>({5})</p>
                    <p className={"text-base"}>{5} ratings</p>
                  </div>
                </div>
                <div className={"grid grid-cols-[auto_1fr_auto] gap-3 mt-4"}>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <Fragment key={star}>
                      <div className={"font-medium"}>
                        {star} {star === 1 ? "star" : "stars"}
                      </div>
                      <Progress value={50} className={"h-[1lh]"} />
                      <div className={"font-medium"}>{0}%</div>
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

