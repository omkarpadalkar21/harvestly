"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { CatgegoriesGetManyOutput } from "@/modules/categories/types";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CategoriesSidebar = ({ open, onOpenChange }: Props) => {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.categories.getMany.queryOptions());
  const router = useRouter();

  const [parentCategories, setParentCategories] =
    useState<CatgegoriesGetManyOutput | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    CatgegoriesGetManyOutput[1] | null
  >(null);

  const currentCategories = parentCategories ?? data ?? [];

  const handleOpenChange = (open: boolean) => {
    setSelectedCategory(null);
    setParentCategories(null);
    onOpenChange(open);
  };

  //If we have parent categories, show those, otherwise show root categories
  const handleCategoryClick = (category: CatgegoriesGetManyOutput[1]) => {
    if (category.subcategories && category.subcategories.length > 0) {
      setParentCategories(category.subcategories as CatgegoriesGetManyOutput);
      setSelectedCategory(category);
    } else {
      //This is a leaf category, no subcategories
      if (parentCategories && selectedCategory) {
        router.push(`/${selectedCategory.slug}/${category.slug}`);
      } else {
        //This is a main category, navigate to /category
        router.push(`/${category.slug}`);
      }

      handleOpenChange(false);
    }
  };

  const backgroundColor = selectedCategory?.colour || "white";

  const handleBackClick = () => {
    setSelectedCategory(null);
    setParentCategories(null);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side={"left"}
        className={"p-0 transition-colors"}
        style={{ backgroundColor }}
      >
        <SheetHeader className={"p-4 border-b"}>
          <SheetTitle>Categories</SheetTitle>
        </SheetHeader>
        <ScrollArea className={"flex flex-col overflow-y-auto h-full pb-2"}>
          {parentCategories && (
            <button
              onClick={handleBackClick}
              className={
                "w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium cursor-pointer"
              }
            >
              <ChevronLeft className={"size-4 mr-2"} />
              Back
            </button>
          )}
          {currentCategories.map((category) => (
            <button
              key={category.slug}
              className={
                "w-full text-left p-4 hover:bg-black hover:text-white flex justify-between items-center text-base font-medium cursor-pointer"
              }
              onClick={() => handleCategoryClick(category)}
            >
              {category.name}
              {category.subcategories && category.subcategories.length > 0 && (
                <ChevronRightIcon className={"size-4"} />
              )}
            </button>
          ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
export default CategoriesSidebar;
