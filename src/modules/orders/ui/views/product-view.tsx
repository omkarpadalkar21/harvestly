"use client";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ReviewSiderbar } from "@/modules/orders/ui/components/review-siderbar";

interface Props {
  productId: string;
}

const ProductView = ({ productId }: Props) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.orders.getOne.queryOptions({
      productId,
    }),
  );
  return (
    <div className={"min-h-screen bg-white"}>
      <nav className={"p-4 bg-[#f4f4f4] w-full border-b border-black"}>
        <Link prefetch href="/orders" className={"flex items-center gap-2"}>
          <ArrowLeftIcon className={"size-4"} />
          <span className={"text font-medium"}>Back to Orders</span>
        </Link>
      </nav>
      <header className={"bg-[#f4f4f4] py-8 border-b border-black"}>
        <div className={"max-w-(--breakpoint-xl) mx-auto px-4 lg:px-12"}>
          <h1 className={"text-[40px] font-medium"}>{data.name}</h1>
        </div>
      </header>
      <section
        className={"max-w-(--breakpoint-xl) mx-auto px-4 lg:px-12 py-10"}
      >
        <div className={"grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16"}>
          <div className={"lg:col-span-2"}>
            <div className={"p-4 bg-white rounded-md border border-black gap-4"}>
              <ReviewSiderbar productId={productId}/>
            </div>
          </div>
          <div className={"lg:col-span-5"}>
            <p className={"font-medium italic text-muted-foreground"}>No special content</p>
          </div>
        </div>
      </section>
    </div>
  );
};
export default ProductView;
