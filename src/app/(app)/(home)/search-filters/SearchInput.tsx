"use client";

import CategoriesSidebar from "@/app/(app)/(home)/search-filters/CategoriesSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListFilterIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

interface Props {
  disabled?: boolean;
}

const SearchInput = ({ disabled }: Props) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="flex items-center gap-2 w-full">
      <CategoriesSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
        <Input
          className="pl-8"
          placeholder="Search Products"
          disabled={disabled}
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
    </div>
  );
};

export default SearchInput;
