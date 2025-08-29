import Link from "next/link";
import Image from "next/image";
import { StarIcon } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl?: string | null;
  authorUsername: string;
  authorImageUrl?: string | null;
  reviewRating: number;
  reviewCount: number;
  price: number;
  quantity: {
    amount: number;
    unit: "kg" | "g" | "l" | "ml" | "pc" | "pack" | "other";
  };
}

export const ProductCard = ({
  id,
  name,
  imageUrl,
  authorUsername,
  authorImageUrl,
  reviewRating,
  reviewCount,
  price,
  quantity,
}: ProductCardProps) => {
  return (
    <Link href={`/products/${id}`}>
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
        <div className={"p-4 border-y flex flex-col gap-2 flex-1"}>
          <div className={"flex justify-between items-center"}>
            <h2 className={"text-lg font-medium line-clamp-4"}>{name}</h2>
            {reviewCount > 0 && (
              <div className={"flex items-center gap-1"}>
                <StarIcon className={"size-3.5 fill-black"} />
                <p className={"text-sm font-medium"}>
                  {reviewRating} ({reviewCount})
                </p>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 -mt-2">
            {quantity.amount} {quantity.unit}
          </p>
          <div className={"flex items-center gap-2"} onClick={() => {}}>
            {authorImageUrl && (
              <Image
                src={authorImageUrl}
                alt={authorUsername}
                width={16}
                height={16}
                className={"rounded-full shrink-0 border size-[16px]"}
              />
            )}
            <p className={"text-sm underline font-medium"}>{authorUsername}</p>
          </div>
        </div>
        <div className={"p-4  "}>
          <div className={"relative px-2 py-1 border border-black w-fit"}>
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
      className={"w-full aspect-3/4 bg-neutral-200 rounded-lg animate-pulse"}
    />
  );
};
