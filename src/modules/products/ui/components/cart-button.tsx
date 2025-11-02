"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/modules/checkout/hooks/use-cart";
import { useState } from "react";
import { QuantitySelector } from "./quantity-selector";

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
    <div className="flex items-center gap-2 w-full">
      <QuantitySelector
        onQuantityChange={handleQuantityChange}
        initialQuantity={isInCart ? cartQuantity : quantity}
      />
      {!isInCart ? (
        <Button
          variant="secondary"
          className="flex-1 py-3 bg-green-600"
          onClick={handleAddToCart}
        >
          Add to cart
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={handleRemoveFromCart}
          className="flex-1 border-black hover:bg-red-50"
        >
          Remove from cart
        </Button>
      )}
    </div>
  );
};
