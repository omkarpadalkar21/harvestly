"use client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

interface Props {
  category?: string;
  subcategory?: string;
}

export const ProductList = ({ category, subcategory }: Props) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.products.getMany.queryOptions({
      category,
      subcategory,
    }),
  );
  return <div>{JSON.stringify(data, null, 2)}</div>;
};

export const ProductListLoading = () => {
  return <div>Loading...</div>;
};
