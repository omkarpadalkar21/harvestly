import Link from "next/link";
import Image from "next/image";
import { StarIcon } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl?: string | null;
  tenantSubdomain: string;
  tenantImageUrl?: string | null;
  reviewRating: number;
  reviewCount: number;
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
  quantity,
}: ProductCardProps) => {
  return (
    <Link prefetch href={`/orders/${id}`}>
      <div
        className={
          "hover:shadow-lg transition-shadow duration-200 border border-black rounded-lg bg-white h-full flex flex-col"
        }
      >
        <div className={"relative aspect-square"}>
          <Image
            src={imageUrl || "/placeholder.png"}
            alt={name}
            fill
            className={"object-cover object-center rounded-t-lg"}
          />
        </div>
        <div className={"p-3 md:p-4 border-y flex flex-col gap-2 flex-1"}>
          <div className={"flex justify-between items-center"}>
            <h2 className={"text-sm md:text-lg font-medium line-clamp-2"}>{name}</h2>
          </div>
          <div className="text-xs md:text-sm text-gray-600 -mt-2 flex justify-between items-center">
            {quantity.amount} {quantity.unit}
            {reviewCount > 0 && (
              <div className={"flex items-center gap-1"}>
                <StarIcon className={"size-3 md:size-3.5 fill-black"} />
                <p className={"text-xs md:text-sm font-medium"}>
                  {reviewRating} ({reviewCount})
                </p>
              </div>
            )}
          </div>
          <div className={"flex items-center gap-1.5 md:gap-2"}>
            {tenantImageUrl && (
              <Image
                src={tenantImageUrl}
                alt={tenantSubdomain}
                width={16}
                height={16}
                className={"rounded-full shrink-0 border size-[14px] md:size-[16px]"}
              />
            )}
            <p className={"text-xs md:text-sm underline font-medium truncate"}>{tenantSubdomain}</p>
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
      <div className={"p-3 md:p-4 border-y flex flex-col gap-2 flex-1"}>
        <div className={"flex justify-between items-center"}>
          <div className={"h-4 md:h-5 bg-neutral-200 rounded animate-pulse w-3/4"} />
        </div>
        <div className="text-xs md:text-sm text-gray-600 -mt-2 flex justify-between items-center">
          <div className={"h-3 md:h-4 bg-neutral-200 rounded animate-pulse w-12 md:w-16"} />
          <div className={"h-3 md:h-4 bg-neutral-200 rounded animate-pulse w-16 md:w-20"} />
        </div>
        <div className={"flex items-center gap-1.5 md:gap-2"}>
          <div className={"size-3.5 md:size-4 bg-neutral-200 rounded-full animate-pulse"} />
          <div className={"h-3 md:h-4 bg-neutral-200 rounded animate-pulse w-16 md:w-20"} />
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
