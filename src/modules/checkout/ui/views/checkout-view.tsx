"use client";

import { generateTenantURL } from "@/lib/utils";
import { useCart } from "@/modules/checkout/hooks/use-cart";
import { useCheckoutStates } from "@/modules/checkout/hooks/use-checkout-states";
import CheckoutItem from "@/modules/checkout/ui/components/checkout-item";
import CheckoutSidebar from "@/modules/checkout/ui/components/checkout-sidebar";
import DeliveryAddressForm from "@/modules/checkout/ui/components/delivery-address-form";
import { DeliveryAddress } from "@/modules/checkout/schemas";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InboxIcon, LoaderIcon, ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CheckoutViewProps {
  tenantSubdomain: string;
}

const CheckoutView = ({ tenantSubdomain }: CheckoutViewProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [states, setStates] = useCheckoutStates();
  const { productIds, cartItems, removeProduct, clearCart } =
    useCart(tenantSubdomain);
  const trpc = useTRPC();

  // Step 1 = collect address, Step 2 = show cart + pay
  const [step, setStep] = useState<1 | 2>(1);
  const [deliveryAddress, setDeliveryAddress] =
    useState<DeliveryAddress | null>(null);

  const quantities = cartItems.reduce((acc, item) => {
    acc[item.id] = item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const { data, error, isLoading } = useQuery(
    trpc.checkout.getProducts.queryOptions({
      ids: productIds,
      quantities,
    })
  );

  const purchase = useMutation(
    trpc.checkout.purchase.mutationOptions({
      onMutate: () => {
        setStates({ success: false, cancel: false });
      },
      onSuccess: (result) => {
        window.location.href = result.url;
      },
      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED") {
          router.push("/sign-in");
        }
        toast.error(error.message);
      },
    })
  );

  useEffect(() => {
    if (states.success) {
      clearCart();
      queryClient.invalidateQueries(trpc.orders.getMany.infiniteQueryFilter());
      setStates({ success: false, cancel: false });
      setTimeout(() => {
        router.push("/orders");
        toast.success("Order placed successfully");
      }, 1000);
    }
  }, [
    states.success,
    clearCart,
    router,
    setStates,
    queryClient,
    trpc.orders.getMany,
  ]);

  //clears cart if a product is removed by the tenant
  useEffect(() => {
    if (error?.data?.code === "NOT_FOUND") {
      clearCart();
      toast.warning("Invalid products found, cart cleared");
    }
  }, [error, clearCart]);

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

  const handleAddressConfirm = (address: DeliveryAddress) => {
    setDeliveryAddress(address);
    setStep(2);
  };

  const handlePurchase = () => {
    if (!deliveryAddress) return;
    purchase.mutate({
      tenantSubdomain,
      productIds,
      quantities,
      deliveryAddress,
    });
  };

  return (
    <div className={"lg:pt-16 pt-4 px-4 lg:px-12"}>
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`flex items-center gap-1.5 text-sm font-medium ${step === 1 ? "text-black" : "text-neutral-400"}`}
        >
          <span
            className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 1
                ? "bg-black text-white"
                : "bg-green-600 text-white"
            }`}
          >
            {step === 1 ? "1" : "✓"}
          </span>
          Delivery Address
        </div>
        <div className="flex-1 h-px bg-neutral-200" />
        <div
          className={`flex items-center gap-1.5 text-sm font-medium ${step === 2 ? "text-black" : "text-neutral-400"}`}
        >
          <span
            className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 2 ? "bg-black text-white" : "bg-neutral-200 text-neutral-500"
            }`}
          >
            2
          </span>
          Review & Pay
        </div>
      </div>

      {step === 1 && (
        <div className="max-w-2xl mx-auto">
          <DeliveryAddressForm onSubmit={handleAddressConfirm} />
        </div>
      )}

      {step === 2 && (
        <div className={"grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16"}>
          <div className={"lg:col-span-4"}>
            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(1)}
              className="mb-4 flex items-center gap-1 text-sm font-medium px-0 hover:bg-transparent"
            >
              <ArrowLeftIcon className="size-4" />
              Edit delivery address
            </Button>

            {/* Delivery address summary */}
            {deliveryAddress && (
              <div className="border border-black rounded-md p-4 bg-[#f9f9f9] mb-4 text-sm leading-relaxed">
                <p className="font-semibold mb-1">Delivering to:</p>
                <p>{deliveryAddress.fullName} · {deliveryAddress.phone}</p>
                <p>
                  {deliveryAddress.addressLine1}
                  {deliveryAddress.addressLine2
                    ? `, ${deliveryAddress.addressLine2}`
                    : ""}
                </p>
                <p>
                  {deliveryAddress.city}, {deliveryAddress.state} –{" "}
                  {deliveryAddress.pincode}
                </p>
              </div>
            )}

            <div
              className={
                "border rounded-md border-black overflow-hidden bg-white"
              }
            >
              {data?.docs.map((product, index) => {
                const cartItem = cartItems.find((item) => item.id === product.id);
                const quantity = cartItem?.quantity || 1;
                return (
                  <CheckoutItem
                    key={product.id}
                    isLast={index === data.docs.length - 1}
                    imageUrl={product.image?.url}
                    name={product.name}
                    productUrl={`${generateTenantURL(tenantSubdomain)}/products/${product.id}`}
                    tenantUrl={generateTenantURL(tenantSubdomain)}
                    tenantName={product.tenant.name}
                    price={product.price}
                    quantity={quantity}
                    onRemove={() => removeProduct(product.id)}
                  />
                );
              })}
            </div>
          </div>
          <div className={"lg:col-span-3"}>
            <CheckoutSidebar
              total={data?.totalPrice || 0}
              onPurchase={handlePurchase}
              isCanceled={states.cancel}
              disabled={purchase.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default CheckoutView;
