"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

const HomePage = () => {
  const trpc = useTRPC();
  const categories = useQuery(trpc.categories.getMany.queryOptions());
  return <div>{JSON.stringify(categories.data, null)}</div>;
};

export default HomePage;
