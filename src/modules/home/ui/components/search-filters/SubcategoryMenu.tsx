import { cn } from "@/lib/utils";
import { CatgegoriesGetManyOutput } from "@/modules/categories/types";
import { Category } from "@/payload-types";
import Link from "next/link";

interface SubcategoryMenuProps {
  category: CatgegoriesGetManyOutput[1];
  isOpen: boolean;
  onSubcategoryClick?: () => void;
}

const SubcategoryMenu = ({
  category,
  isOpen,

  onSubcategoryClick,
}: SubcategoryMenuProps) => {
  const subs = Array.isArray(category.subcategories)
    ? (category.subcategories as Category[])
    : ((category.subcategories?.docs as Category[]) ?? []);

  if (!isOpen || subs.length === 0) return null;

  const backgroundColor = category.colour || "#f5f5f5";

  return (
    <div className={"absolute z-10"} style={{ top: "100%", left: 0 }}>
      {/*Invisible bridge to maintain hover*/}
      <div className={"h-3 w-60"} />
      <div
        style={{ backgroundColor }}
        className={
          "w-60 text-black rounded-xl bg-white shadow-md border border-gray-200 p-3  transition-all duration-200 ease-in-out overflow-hidden"
        }
      >
        <div>
          {subs.map((subcategory: Category) => (
            <Link
              href={`/${category.slug}/${subcategory.slug}`}
              key={subcategory.slug}
              className={cn(
                "w-full text-left p-3 hover:text-white flex justify-between items-center font-medium rounded-xl subcategory-link",
              )}
              onClick={onSubcategoryClick}
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
