import ProductSort from "@/modules/products/ui/components/product-sort";
import ProductFilters from "@/modules/products/ui/components/product-filters";
import { Suspense } from "react";
import {
  ProductList,
  ProductListLoading,
} from "@/modules/products/ui/components/product-list";

interface Props {
  category?: string;
  subcategory?: string;
  tenantSubdomain?: string;
}

const ProductListView = ({ category, subcategory, tenantSubdomain }: Props) => {
  return (
    <div className={"px-4 lg:px-12 py-8 flex flex-col gap-4"}>
      <div
        className={
          "flex flex-col lg:flex-row lg:items-center gap-y-2 lg:gap-y-0 justify-between"
        }
      >
        <p className={"text-2xl font-me"}>Curated for you</p>
        <ProductSort />
      </div>
      <div
        className={
          "grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-y-6 gap-x-12"
        }
      >
        <div className={"lg:col-span-2 xl:col-span-2"}>
          <div
            className={
              "border-1 border-black p-2 bg-white rounded-lg overflow-hidden"
            }
          >
            <ProductFilters />
          </div>
        </div>
        <div className={"lg:col-span-4 xl:col-span-6"}>
          <Suspense fallback={<ProductListLoading />}>
            <ProductList
              category={category}
              subcategory={subcategory}
              tenantSubdomain={tenantSubdomain}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};
export default ProductListView;
