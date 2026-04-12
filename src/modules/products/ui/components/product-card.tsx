import Link from "next/link";
import Image from "next/image";
import { StarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateTenantURL } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl?: string | null;
  tenantSubdomain: string;
  tenantImageUrl?: string | null;
  reviewRating: number;
  reviewCount: number;
  price: number;
  stock?: number | null;
  quantity: {
    amount: number;
    unit: "kg" | "g" | "l" | "ml" | "pc" | "pack" | "other";
  };
}

export const ProductCard = ({
  id,
  name,
  imageUrl,
  tenantSubdomain,
  tenantImageUrl,
  reviewRating,
  reviewCount,
  price,
  stock,
  quantity,
}: ProductCardProps) => {
  const router = useRouter();
  const isOutOfStock = typeof stock === "number" && stock === 0;
  const isLowStock = typeof stock === "number" && stock > 0 && stock <= 10;

  const handleUserClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(generateTenantURL(tenantSubdomain));
  };

  return (
    <Link href={`${generateTenantURL(tenantSubdomain)}/products/${id}`}>
      <div
        className={`hover:shadow-lg transition-shadow duration-200 border border-black rounded-lg bg-white h-full flex flex-col ${isOutOfStock ? "opacity-70" : ""}`}
      >
        <div className={"relative aspect-square"}>
          <Image
            src={imageUrl || "/placeholder.png"}
            alt={name}
            fill
            className={"object-cover object-center rounded-t-lg"}
          />
          {/* Stock badge overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-t-lg">
              <span className="bg-white text-black text-xs font-bold px-2 py-1 rounded-sm border border-black">
                Out of Stock
              </span>
            </div>
          )}
          {isLowStock && !isOutOfStock && (
            <div className="absolute top-2 right-2">
              <span className="bg-amber-100 border border-amber-400 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                Low Stock
              </span>
            </div>
          )}
        </div>
        <div className={"p-4 border-y flex flex-col gap-2 flex-1"}>
          <div className={"flex justify-between items-center"}>
            <h2 className={"text-lg font-medium line-clamp-4"}>{name}</h2>
          </div>
          <div className="text-sm text-gray-600 -mt-2 flex justify-between items-center">
            {quantity.amount} {quantity.unit}
            {reviewCount > 0 && (
              <div className={"flex items-center gap-1"}>
                <StarIcon className={"size-3.5 fill-black"} />
                <p className={"text-sm font-medium"}>
                  {reviewRating} ({reviewCount})
                </p>
              </div>
            )}
          </div>
          <div className={"flex items-center gap-2"} onClick={handleUserClick}>
            {tenantImageUrl && (
              <Image
                src={tenantImageUrl}
                alt={tenantSubdomain}
                width={16}
                height={16}
                className={"rounded-full shrink-0 border size-[16px]"}
              />
            )}
            <p className={"text-sm underline font-medium"}>{tenantSubdomain}</p>
          </div>

          {/* Stock status text */}
          {typeof stock === "number" && (
            <p
              className={`text-xs font-medium mt-auto ${
                isOutOfStock
                  ? "text-red-600"
                  : isLowStock
                    ? "text-amber-600"
                    : "text-green-700"
              }`}
            >
              {isOutOfStock
                ? "Out of Stock"
                : isLowStock
                  ? `Low Stock – ${stock} left`
                  : `In Stock (${stock} units)`}
            </p>
          )}
        </div>
        <div className={"p-4"}>
          <div
            className={
              "relative px-2 py-1 border border-black w-fit bg-green-600 text-white"
            }
          >
            <p>₹{price}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div
      className={
        "hover:shadow-lg transition-shadow duration-200 border border-black rounded-lg bg-white h-full flex flex-col"
      }
    >
      <div
        className={
          "relative aspect-square bg-neutral-200 rounded-t-lg animate-pulse"
        }
      />
      <div className={"p-4 border-y flex flex-col gap-2 flex-1"}>
        <div className={"flex justify-between items-center"}>
          <div className={"h-5 bg-neutral-200 rounded animate-pulse w-3/4"} />
        </div>
        <div className="text-sm text-gray-600 -mt-2 flex justify-between items-center">
          <div className={"h-4 bg-neutral-200 rounded animate-pulse w-16"} />
          <div className={"h-4 bg-neutral-200 rounded animate-pulse w-20"} />
        </div>
        <div className={"flex items-center gap-2"}>
          <div className={"size-4 bg-neutral-200 rounded-full animate-pulse"} />
          <div className={"h-4 bg-neutral-200 rounded animate-pulse w-20"} />
        </div>
      </div>
      <div className={"p-4"}>
        <div className={"relative px-2 py-1 border border-black w-fit"}>
          <div className={"h-4 bg-neutral-200 rounded animate-pulse w-16"} />
        </div>
      </div>
    </div>
  );
};
