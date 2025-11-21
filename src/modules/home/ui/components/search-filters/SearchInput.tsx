"use client";

import CategoriesSidebar from "@/modules/home/ui/components/search-filters/CategoriesSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListFilterIcon, SearchIcon, ShoppingCartIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useProductFilters } from "@/modules/hooks/use-product-filters";
import { useCartStore } from "@/modules/checkout/store/use-cart-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  disabled?: boolean;
}

const SearchInput = ({ disabled }: Props) => {
  const [filters, setFilters] = useProductFilters();
  const [searchValue, setSearchValue] = useState(filters.search);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const trpc = useTRPC();
  const session = useQuery(trpc.auth.session.queryOptions());

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters({ search: searchValue });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchValue, setFilters]);
  return (
    <div className="flex items-center gap-2 w-full">
      <CategoriesSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
        <Input
          className="pl-8 border-black bg-white"
          placeholder="Search Products"
          disabled={disabled}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>

      <Button
        variant={"secondary"}
        className={"size-12 shrink-0 flex lg:hidden"}
        onClick={() => {
          setIsSidebarOpen(true);
        }}
      >
        <ListFilterIcon />
      </Button>
      {session.data?.user && (
        <CartButton />
      )}
    </div>
  );
};

const CartButton = () => {
  const tenantCarts = useCartStore((state) => state.tenantCarts);
  const activeTenants = Object.entries(tenantCarts).filter(
    ([_, cart]) => cart.productIds.length > 0
  );

  if (activeTenants.length === 0) {
    return (
      <Button variant={"secondary"} disabled>
        <ShoppingCartIcon />
        Cart
      </Button>
    );
  }

  if (activeTenants.length === 1) {
    const [slug] = activeTenants[0];
    return (
      <Button asChild>
        <Link prefetch href={`/tenants/${slug}/checkout`}>
          <ShoppingCartIcon />
          Cart
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <ShoppingCartIcon />
          Cart
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {activeTenants.map(([slug]) => (
          <DropdownMenuItem key={slug} asChild>
            <Link href={`/tenants/${slug}/checkout`} className="w-full cursor-pointer">
              Checkout {slug}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SearchInput;
