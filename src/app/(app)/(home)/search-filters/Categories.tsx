import {Category} from "@/payload-types";
import CategoryDropDown from "./CategoryDropDown";

interface CategoriesProps {
    data: any;
}

const Categories = ({data}: CategoriesProps) => {
    return (
        <div className={"relative h-full"}>
            <div className={"flex flex-nowrap items-center"}>{data.map((category: Category) => (
                <div key={category.id}>
                    <CategoryDropDown
                        category={category}
                        isActive={false}
                        isNavigationHovered={false}
                    />
                </div>
            ))}</div>
        </div>
    );
};

export default Categories;
