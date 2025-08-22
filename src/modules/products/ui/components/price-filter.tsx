"use client";
import { ChangeEvent } from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PriceFilterProps {
  minPrice?: string | null;
  maxPrice?: string | null;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

export const formatAsCurrency = (value: string) => {
  const numericValue = value.replace(/[^0-9]/g, "");

  const parts = numericValue.split(".");
  const formatedValue =
    parts[0] + (parts.length > 1 ? "." + parts[1]?.slice(0, 2) : "");

  if (!formatedValue) {
    return "";
  }

  const numberValue = parseFloat(formatedValue);
  if (isNaN(numberValue)) return "";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numberValue);
};

const PriceFilter = ({
  minPrice,
  maxPrice,
  onMaxPriceChange,
  onMinPriceChange,
}: PriceFilterProps) => {
  const handleMinPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    onMinPriceChange(numericValue);
  };

  const handleMaxPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    onMaxPriceChange(numericValue);
  };
  return (
    <div className={"flex flex-col gap-2"}>
      <div className={"flex flex-col gap-2"}>
        <Label className={"font-medium text-base"}>Minimum Price</Label>
        <Input
          type={"text"}
          placeholder={"₹0"}
          value={minPrice ? formatAsCurrency(minPrice) : ""}
          onChange={handleMinPriceChange}
        />
      </div>
      <div className={"flex flex-col gap-2"}>
        <Label className={"font-medium text-base"}>Maximum Price</Label>
        <Input
          type={"text"}
          placeholder={"∞"}
          value={maxPrice ? formatAsCurrency(maxPrice) : ""}
          onChange={handleMaxPriceChange}
        />
      </div>
    </div>
  );
};
export default PriceFilter;
