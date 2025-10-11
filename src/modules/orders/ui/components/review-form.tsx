import { ReviewsGetOneOutput } from "@/modules/reviews/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { trpc } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import StarPicker from "@/components/star-picker";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  productId: string;
  initialData: ReviewsGetOneOutput;
}

const formSchema = z.object({
  rating: z.number().min(1, { message: "Rating is required" }).max(5),
  description: z.string().min(1, { message: "Description is required" }),
});

const ReviewForm = ({ productId, initialData }: Props) => {
  const [isPreview, setIsPreview] = useState(!!initialData);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createReview = useMutation(
    trpc.reviews.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.reviews.getOne.queryOptions({
            productId,
          }),
        );
        setIsPreview(true);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const updateReview = useMutation(
    trpc.reviews.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.reviews.getOne.queryOptions({
            productId,
          }),
        );
        setIsPreview(true);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: initialData?.rating ?? 0,
      description: initialData?.description ?? "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (initialData) {
      updateReview.mutate({
        reviewId: initialData.id,
        rating: values.rating,
        description: values.description,
      });
    } else {
      createReview.mutate({
        productId,
        rating: values.rating,
        description: values.description,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        className={"flex flex-col gap-y-4"}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <p className={"font-medium"}>
          {isPreview ? "Your rating:" : "Liked it? Give it a raiting"}
        </p>
        <FormField
          name={"rating"}
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <StarPicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPreview}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={"description"}
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder={"Want to leave a written review?"}
                  disabled={isPreview}
                  className={"border-black"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!isPreview && (
          <Button
            variant={"secondary"}
            disabled={createReview.isPending || updateReview.isPending}
            type={"submit"}
            size={"lg"}
            className={
              "bg-black text-white hover:bg-green-600 hover:text-primary w-fit"
            }
          >
            {initialData ? "Update review" : "Post review"}
          </Button>
        )}
      </form>
      {isPreview && (
        <Button
          onClick={() => setIsPreview(false)}
          size={"lg"}
          type={"button"}
          variant={"secondary"}
          className={"w-fit border-black mt-4"}
        >
          Edit
        </Button>
      )}
    </Form>
  );
};
export default ReviewForm;
