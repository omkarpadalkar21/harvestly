"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/modules/checkout/hooks/use-cart";
import { useState } from "react";
import { QuantitySelector } from "./quantity-selector";

interface Props {
  tenantSlug: string;
  productId: string;
  stock?: number | null;
}

export const CartButton = ({ tenantSlug, productId, stock }: Props) => {
  const cart = useCart(tenantSlug);
  const isInCart = cart.isProductInCart(productId);
  const cartQuantity = cart.getProductQuantity(productId);
  const [quantity, setQuantity] = useState(cartQuantity || 1);

  const isOutOfStock = typeof stock === "number" && stock === 0;

  const handleAddToCart = () => {
    if (!isInCart && !isOutOfStock) {
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

  if (isOutOfStock) {
    return (
      <Button
        variant="outline"
        disabled
        className="flex-1 py-3 border-black cursor-not-allowed text-muted-foreground"
      >
        Out of Stock
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <QuantitySelector
        onQuantityChange={handleQuantityChange}
        initialQuantity={isInCart ? cartQuantity : quantity}
        max={typeof stock === "number" ? stock : undefined}
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
