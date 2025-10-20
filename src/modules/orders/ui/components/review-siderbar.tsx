import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import ReviewForm from "@/modules/orders/ui/components/review-form";

interface Props {
  productId: string;
}

export const ReviewSiderbar = ({ productId }: Props) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.reviews.getOne.queryOptions({
      productId,
    }),
  );
  return <ReviewForm productId={productId} initialData={data} />;
};
