import { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export type CatgegoriesGetManyOutput =
  inferRouterOutputs<AppRouter>["categories"]["getMany"];

export type CatgegoriesGetManyOutputSingle = CatgegoriesGetManyOutput[0];
