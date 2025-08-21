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
  return (
    <div
      className={
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
      }
    >
      {data?.docs.map((product) => (
        <div key={product.id} className={"border border-black rounded-md bg-white p-4"}>
          <h2 className={"text-xl font-medium"}>{product.name}</h2>
          <p>₹{product.price}</p>
        </div>
      ))}
    </div>
  );
};

export const ProductListLoading = () => {
  return <div>Loading...</div>;
};
