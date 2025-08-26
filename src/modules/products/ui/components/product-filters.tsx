"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import PriceFilter from "@/modules/products/ui/components/price-filter";
import { useProductFilters } from "@/modules/hooks/use-product-filters";
import TagsFilter from "@/modules/products/ui/components/tags-filter";

interface ProductFiltersProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

const ProductFilter = ({ title, className, children }: ProductFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const Icon = isOpen ? ChevronDownIcon : ChevronRightIcon;

  return (
    <div className={cn("p-4  flex flex-col gap-2", className)}>
      <div
        onClick={() => setIsOpen((current) => !current)}
        className={"flex items-center justify-between cursor-pointer"}
      >
        <p className={"font-medium"}>{title}</p>
        <Icon className={"size-5"} />
      </div>
      {isOpen && children}
    </div>
  );
};

const ProductFilters = () => {
  const [filters, setFilters] = useProductFilters();

  const hasAnyFilters = Object.entries(filters).some(([, value]) => {
    if (typeof value === "string") {
      return value !== "";
    }

    return value !== null;
  });

  const onClear = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
    });
  };

  const onChange = (key: keyof typeof filters, value: unknown) => {
    setFilters({ ...filters, [key]: value });
  };



  return (
    <div className={"rounded-md bg-white"}>
      <div
        className={
          "p-4 border-black border-b flex items-center justify-between"
        }
      >
        <p className={"font-medium"}>Filters</p>
        {hasAnyFilters && (
          <button
            className={"underline cursor-pointer"}
            onClick={() => onClear()}
            type={"button"}
          >
            Clear
          </button>
        )}
      </div>
      <ProductFilter title={"Price"}>
        <PriceFilter
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onMinPriceChange={(value) => {
            onChange("minPrice", value);
          }}
          onMaxPriceChange={(value) => {
            onChange("maxPrice", value);
          }}
        />
      </ProductFilter>
      <ProductFilter title={"Tags"}>
        <TagsFilter
          value={filters.tags}
          onChange={(value) => onChange("tags", value)}
        />
      </ProductFilter>
    </div>
  );
};
export default ProductFilters;
