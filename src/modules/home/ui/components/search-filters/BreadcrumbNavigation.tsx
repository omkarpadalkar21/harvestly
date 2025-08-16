import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { act } from "react";

interface Props {
  activeCategory?: string | null;
  activeCategoryName?: string | null;
  activeSubcategoryName?: string | null;
}

const BreadcrumbNavigation = ({
  activeCategory,
  activeSubcategoryName,
  activeCategoryName,
}: Props) => {
  if (!activeCategoryName || activeCategory === "all") return null;
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          {activeSubcategoryName ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild className={"text-lg font-medium underline text-primary"}>
                  <Link href={`/${activeCategory}`}>{activeCategoryName}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className={"text-primary font-medium text-lg"}>/</BreadcrumbSeparator>
              <BreadcrumbItem >
                <BreadcrumbPage className={"text-lg font-medium"}>
                  {activeSubcategoryName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : (
              <BreadcrumbItem >
                <BreadcrumbPage className={"text-lg font-medium"}>
                  {activeCategoryName}
                </BreadcrumbPage>
              </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
export default BreadcrumbNavigation;
