"use client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Categories from "./Categories";
import SearchInput from "./SearchInput";
import { useParams } from "next/navigation";
import { DEFAULT_BG_COLOR } from "@/modules/home/constants";
import BreadcrumbNavigation from "@/modules/home/ui/components/search-filters/BreadcrumbNavigation";

export const SearchFilters = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.categories.getMany.queryOptions());

  const params = useParams();
  const categoryParam = params.category as string | undefined;
  const activeCategory = categoryParam || "all";
  const activeCategoryData = data.find(
    (category) => category.slug === activeCategory
  );
  const activeCategoryColour = activeCategoryData?.colour || "#FFF";
  const activeCategoryName = activeCategoryData?.name || null;

  const activeSubcategory = params.subcategory as string | undefined;
  const activeSubcategoryName =
    activeCategoryData?.subcategories?.find(
      (subcategory) => subcategory.slug === activeSubcategory
    )?.name || null;

  return (
    <div
      className="px-4 lg:px-12 py-8 border-b border-black flex flex-col gap-4 w-full"
      style={{ backgroundColor: activeCategoryColour }}
    >
      <SearchInput />
      <div className={"hidden lg:block"}>
        <Categories data={data} />
      </div>
      <BreadcrumbNavigation
        activeCategory={activeCategory}
        activeCategoryName={activeCategoryName}
        activeSubcategoryName={activeSubcategoryName}
      />
    </div>
  );
};

export const SearchFiltersLoading = () => {
  return (
    <div
      className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full"
      // style={{ backgroundColor: "#f5f5f5" }}
    >
      <SearchInput disabled />
      <div className={"hidden lg:block"}>
        <div className="h-11" />
      </div>
    </div>
  );
};
