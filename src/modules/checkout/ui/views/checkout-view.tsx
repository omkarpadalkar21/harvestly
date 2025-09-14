"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/modules/checkout/hooks/use-cart";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { generateTenantURL } from "@/lib/utils";
import CheckoutItem from "@/modules/checkout/ui/components/checkout-item";
import CheckoutSidebar from "@/modules/checkout/ui/components/checkout-sidebar";
import { InboxIcon, LoaderIcon } from "lucide-react";

interface CheckoutViewProps {
  tenantSubdomain: string;
}

const CheckoutView = ({ tenantSubdomain }: CheckoutViewProps) => {
  const { productIds, clearAllCarts, removeProduct } = useCart(tenantSubdomain);
  const trpc = useTRPC();
  const { data, error, isLoading } = useQuery(
    trpc.checkout.getProducts.queryOptions({
      ids: productIds,
    }),
  );

  //clears cart if a product is removed by the tenant
  useEffect(() => {
    if (error?.data?.code === "NOT_FOUND") {
      clearAllCarts();
      toast.warning("Invalid products found, cart cleared");
    }
  }, [error, clearAllCarts]);

  if (isLoading) {
    return (
      <div className={"lg:pt-16 pt-4 px-4 lg:px-12"}>
        <div
          className={
            "border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg"
          }
        >
          <LoaderIcon className={"text-muted-foreground animate-spin"} />
        </div>
      </div>
    );
  }

  if (data?.totalDocs === 0) {
    return (
      <div className={"lg:pt-16 pt-4 px-4 lg:px-12"}>
        <div
          className={
            "border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg"
          }
        >
          <InboxIcon />
          <p className={"text-base font-medium"}>No products found!</p>
        </div>
      </div>
    );
  }
  return (
    <div className={"lg:pt-16 pt-4 px-4 lg:px-12"}>
      <div className={"grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16"}>
        <div className={"lg:col-span-4"}>
          <div
            className={
              "border rounded-md border-black overflow-hidden bg-white"
            }
          >
            {data?.docs.map((product, index) => (
              <CheckoutItem
                key={product.id}
                isLast={index === data.docs.length - 1}
                imageUrl={product.image?.url}
                name={product.name}
                productUrl={`${generateTenantURL(tenantSubdomain)}/products/${product.id}`}
                tenantUrl={generateTenantURL(tenantSubdomain)}
                tenantName={product.tenant.name}
                price={product.price}
                onRemove={() => removeProduct(product.id)}
              />
            ))}
          </div>
        </div>
        <div className={"lg:col-span-3"}>
          <CheckoutSidebar
            total={data?.totalPrice || 0}
            onCheckout={() => {}}
            isCanceled={false}
            isPending={false}
          />
        </div>
      </div>
    </div>
  );
};
export default CheckoutView;
