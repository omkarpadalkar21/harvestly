"use client";

import { useProductFilters } from "@/modules/hooks/use-product-filters";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ProductSort = () => {
  const [filters, setFilters] = useProductFilters();
  return (
    <div className={"flex items-center gap-2"}>
      <Button
        size={"sm"}
        className={cn(
          "rounded-full bg-white hover:bg-white ",
          filters.sort !== "popularity" &&
            "bg-transparent  border-transparent hover:border-border hover:bg-transparent",
        )}
        variant={"secondary"}
        onClick={() => setFilters({ sort: "popularity" })}
      >
        Popularity
      </Button>
      <Button
        size={"sm"}
        className={cn(
          "rounded-full bg-white hover:bg-white",
          filters.sort !== "freshness" &&
            "bg-transparent border-transparent hover:border-border hover:bg-transparent",
        )}
        variant={"secondary"}
        onClick={() => setFilters({ sort: "freshness" })}
      >
        Freshness
      </Button>
      <Button
        size={"sm"}
        className={cn(
          "rounded-full bg-white hover:bg-white",
          filters.sort !== "price-asc" &&
            "bg-transparent border-transparent hover:border-border hover:bg-transparent",
        )}
        variant={"secondary"}
        onClick={() => setFilters({ sort: "price-asc" })}
      >
        Price: Low to High
      </Button>
      <Button
        size={"sm"}
        className={cn(
          "rounded-full bg-white hover:bg-white",
          filters.sort !== "price-desc" &&
            "bg-transparent border-transparent hover:border-border hover:bg-transparent",
        )}
        variant={"secondary"}
        onClick={() => setFilters({ sort: "price-desc" })}
      >
        Price: High to Low
      </Button>
      <Button
        size={"sm"}
        className={cn(
          "rounded-full bg-white hover:bg-white",
          filters.sort !== "rating" &&
            "bg-transparent border-transparent hover:border-border hover:bg-transparent",
        )}
        variant={"secondary"}
        onClick={() => setFilters({ sort: "rating" })}
      >
        Customer Rating
      </Button>
    </div>
  );
};
export default ProductSort;
