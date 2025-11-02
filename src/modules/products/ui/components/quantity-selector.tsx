"use client";

import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

interface QuantitySelectorProps {
  productId: string;
  tenantSlug: string;
  onQuantityChange: (quantity: number) => void;
  initialQuantity?: number;
}

export const QuantitySelector = ({
  productId,
  tenantSlug,
  onQuantityChange,
  initialQuantity = 1,
}: QuantitySelectorProps) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    }
  };

  const handleIncrease = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onQuantityChange(newQuantity);
  };

  return (
    <div className="flex items-center border border-black rounded-sm overflow-hidden bg-white shrink-0">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDecrease}
        className="h-full rounded-none border-r hover:bg-gray-100 px-3"
        disabled={quantity <= 1}
      >
        <MinusIcon className="size-4" />
      </Button>
      <span className="w-10 text-center font-medium text-base tabular-nums">{quantity}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleIncrease}
        className="h-full rounded-none border-l hover:bg-gray-100 px-3"
      >
        <PlusIcon className="size-4" />
      </Button>
    </div>
  );
};
