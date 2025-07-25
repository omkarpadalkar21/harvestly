"use client";
import { Category } from "@/payload-types";
import CategoryDropDown from "./CategoryDropDown";
import { CustomCategory } from "@/app/(app)/(home)/types";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ListFilterIcon } from "lucide-react";
import CategoriesSidebar from "@/app/(app)/(home)/search-filters/CategoriesSidebar";

interface CategoriesProps {
  data: CustomCategory[];
}

const Categories = ({ data }: CategoriesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const viewAllRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(data.length);
  const [isAnyHovered, setIsAnyHovered] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeCategory = "all";

  const activeCategoryIndex = data.findIndex((c) => c.slug === activeCategory);
  const isActiveCategoryHidden =
    activeCategoryIndex >= visibleCount && activeCategoryIndex != -1;

  useEffect(() => {
    const calculateVisible = () => {
      if (!containerRef.current || !measureRef.current || !viewAllRef.current)
        return;

      const containerWidth = containerRef.current.offsetWidth;
      const viewAllWidth = viewAllRef.current.offsetWidth;
      const availableWidth = containerWidth - viewAllWidth;

      const items = Array.from(measureRef.current.children);
      let totalWidth = 0;
      let visible = 0;

      for (const item of items) {
        const width = item.getBoundingClientRect().width;

        if (totalWidth + width > availableWidth) break;
        totalWidth += width;
        visible++;
      }

      setVisibleCount(visible);
    };

    const resizeObserver = new ResizeObserver(calculateVisible);
    resizeObserver.observe(containerRef.current!);

    return () => resizeObserver.disconnect();
  }, [data.length]);
  return (
    <div className={"relative h-full"}>
      <CategoriesSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} data={data} />
      
      {/*Hidden div to measure all items*/}
      <div
        ref={measureRef}
        className={"absolute opacity-0 pointer-events-none flex"}
        style={{ position: "fixed", top: -9999, left: -9999 }}
      >
        {data.map((category) => (
          <div key={category.id}>
            <CategoryDropDown
              category={category}
              isActive={activeCategory === category.slug}
              isNavigationHovered={false}
            />
          </div>
        ))}
      </div>

      {/*Visible items*/}
      <div
        ref={containerRef}
        className={"flex flex-nowrap items-center justify-evenly"}
        onMouseEnter={() => setIsAnyHovered(true)}
        onMouseLeave={() => setIsAnyHovered(false)}
      >
        {data.slice(0, visibleCount).map((category) => (
          <div key={category.id}>
            <CategoryDropDown
              category={category}
              isActive={activeCategory === category.slug}
              isNavigationHovered={isAnyHovered}
            />
          </div>
        ))}

        <div ref={viewAllRef} className={"shrink-0 md:hidden"}>
          <Button
            variant={"secondary"}
            className={cn(
              "h-11 px-4 rounded-full transition-all duration-200",
              isActiveCategoryHidden && !isAnyHovered && "bg-secondary/80"
            )}

            onClick={()=>setIsSidebarOpen(true)}
          >
            View All <ListFilterIcon className={"ml-2"} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Categories;
