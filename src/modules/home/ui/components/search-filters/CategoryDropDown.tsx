"use client";
import SubcategoryMenu from "@/modules/home/ui/components/search-filters/SubcategoryMenu";
import {useDropdownPosition} from "@/modules/home/ui/components/search-filters/use-dropdown-position";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {CatgegoriesGetManyOutput} from "@/modules/categories/types";
import Link from "next/link";
import {useRef, useState} from "react";

interface Props {
  category: CatgegoriesGetManyOutput[1];
  isActive?: boolean;
  isNavigationHovered?: boolean;
}

const CategoryDropDown = ({ category, isActive }: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { getDropdownPosition } = useDropdownPosition(dropdownRef);
  const dropdownPositon = getDropdownPosition();

  const onMouseEnter = () => {
    setIsHovered(true);
    if (category.subcategories) {
      setIsOpen(true);
    }
  };

  const onMouseLeave = () => {
    setIsHovered(false);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (category.subcategories?.length) {
      setIsOpen(!isOpen);
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setIsHovered(false);
  };

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={toggleDropdown}
    >
      <div className="relative">
        <Button
          variant={"secondary"}
          className={cn(
            "h-11 px-4 rounded-full transition-all duration-200 border",
            isActive && !(isOpen || isHovered) && "bg-secondary/80",
            (isOpen || isHovered || isActive) &&
              "bg-secondary/80 border-black",
          )}
        >
          <Link href={`/${category.slug}`}>{category.name}</Link>
        </Button>
        {category.subcategories?.length > 0 && (
          <div
            className={cn(
              "opacity-0 absolute -bottom-3 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[10px] border-l-transparent border-r-transparent border-b-black/80 left-1/2 -translate-x-1/2 transition-opacity duration-200",
              (isOpen || isHovered) && "opacity-100",
            )}
          />
        )}
      </div>
      <SubcategoryMenu
        category={category}
        isOpen={isOpen}
        position={dropdownPositon}
        onSubcategoryClick={closeDropdown}
      />
    </div>
  );
};

export default CategoryDropDown;
