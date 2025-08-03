"use client"

import {Input} from "@/components/ui/input";
import {ListFilterIcon, SearchIcon} from "lucide-react";
import {CustomCategory} from "@/app/(app)/(home)/types";
import CategoriesSidebar from "@/app/(app)/(home)/search-filters/CategoriesSidebar";
import {useState} from "react";
import {Button} from "@/components/ui/button";

interface Props {
    disabled?: boolean;
    data: CustomCategory[];
}


const SearchInput = ({disabled, data}: Props) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
        <div className="flex items-center gap-2 w-full">
            <CategoriesSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} data={data}/>
            <div className="relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500"/>
                <Input
                    className="pl-8"
                    placeholder="Search Products"
                    disabled={disabled}
                />
            </div>

            <Button variant={"secondary"} className={"size-12 shrink-0 flex lg:hidden"} onClick={() => {setIsSidebarOpen(true)}}>
                <ListFilterIcon/>
            </Button>
        </div>
    );
};

export default SearchInput;
