import React, { Suspense } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import {
  ProductList,
  ProductListLoading,
} from "@/modules/orders/ui/components/product-list";

const OrdersView = () => {
  return (
    <div className={"min-h-screen bg-white"}>
      <nav className={"p-4 bg-[#f4f4f4] w-full border-b border-black"}>
        <Link prefetch href="/" className={"flex items-center gap-2"}>
          <ArrowLeftIcon className={"size-4"} />
          <span className={"text font-medium"}>Continue Shopping</span>
        </Link>
      </nav>
      <header className={"bg-[#f4f4f4] py-8 border-b border-black"}>
        <div
          className={
            "max-w-(--breakpoint-xl) mx-auto px-4 lg:px-12 flex flex-col gap-y-4"
          }
        >
          <h1 className={"text-[40px] font-medium"}>Orders</h1>
          <p className={"font-medium"}>Your purchases and reviews</p>
        </div>
      </header>
      <section
        className={"max-w-(--breakpoint-xl) mx-auto px-4 lg:px-12 py-10"}
      >
        <Suspense fallback={<ProductListLoading />}>
          <ProductList />
        </Suspense>
      </section>
    </div>
  );
};
export default OrdersView;
