import { Category } from "@/payload-types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {CustomCategory} from "@/app/(app)/(home)/types";

interface SubcategoryMenuProps {
  category: CustomCategory;
  isOpen: boolean;
  position: { top: number; left: number };
}

const SubcategoryMenu = ({
  category,
  isOpen,
  position,
}: SubcategoryMenuProps) => {
  if (!isOpen || !category.subcategories || category.subcategories.length === 0)
    return null;

  const backgroundColor = category.colour || "#f5f5f5";

  return (
    <div
      className={"fixed z-10"}
      style={{ top: position.top, left: position.left }}
    >
      {/*Invisible bridge to maintain hover*/}
      <div className={"h-3 w-60"} />
      <div
        style={{ backgroundColor }}
        className={
          "w-60 text-black rounded-xl bg-white shadow-md border border-gray-200 p-3  transition-all duration-200 ease-in-out overflow-hidden"
        }
      >
        <div>
          {category.subcategories?.map((subcategory: Category) => (
            <Link
              href={`/${category.slug}/${subcategory.slug}`}
              key={subcategory.slug}
              className={cn(
                "w-full text-left p-3 hover:text-white flex justify-between items-center underline font-medium rounded-xl subcategory-link",
              )}
            >
              {subcategory.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
export default SubcategoryMenu;
