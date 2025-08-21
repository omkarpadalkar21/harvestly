"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  return (
    <div className={"rounded-md bg-white"}>
      <div className={"p-4 border-black border-b flex items-center justify-between"}>
        <p className={"font-mediumP"}>Filters</p>
        <button
          className={"underline"}
          onClick={() => console.log("")}
          type={"button"}
        >
          Clear
        </button>
      </div>
      <ProductFilter title={"Price"}>
        <p>Price Filter</p>
      </ProductFilter>
    </div>
  );
};
export default ProductFilters;
