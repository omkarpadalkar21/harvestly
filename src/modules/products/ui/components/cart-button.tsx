"use client";

import { cn } from "@/lib/utils";
import { useCart } from "@/modules/checkout/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "./quantity-selector";
import { useState } from "react";

interface Props {
  tenantSlug: string;
  productId: string;
}

export const CartButton = ({ tenantSlug, productId }: Props) => {
  const cart = useCart(tenantSlug);
  const isInCart = cart.isProductInCart(productId);
  const cartQuantity = cart.getProductQuantity(productId);
  const [quantity, setQuantity] = useState(cartQuantity || 1);

  const handleAddToCart = () => {
    if (!isInCart) {
      cart.addProduct(productId, quantity);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    if (isInCart) {
      cart.updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveFromCart = () => {
    cart.removeProduct(productId);
    setQuantity(1);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {!isInCart ? (
        <div className="flex items-center gap-2">
          <QuantitySelector
            productId={productId}
            tenantSlug={tenantSlug}
            onQuantityChange={handleQuantityChange}
            initialQuantity={quantity}
          />
          <Button
            variant="secondary"
            className="flex-1 py-3 bg-green-600"
            onClick={handleAddToCart}
          >
            Add to cart
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-4 py-2 bg-green-50 border border-green-600 rounded-sm">
            <span className="font-medium text-green-700">In Cart</span>
            <span className="text-sm text-green-600">{cartQuantity} item{cartQuantity !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <QuantitySelector
              productId={productId}
              tenantSlug={tenantSlug}
              onQuantityChange={handleQuantityChange}
              initialQuantity={cartQuantity}
            />
            <Button
              variant="outline"
              onClick={handleRemoveFromCart}
              className="flex-1 border-black hover:bg-red-50"
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
