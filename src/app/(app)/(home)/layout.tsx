import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import Footer from "../../../modules/home/ui/components/Footer";
import Navbar from "../../../modules/home/ui/components/Navbar";
import {
  SearchFilters,
  SearchFiltersLoading,
} from "../../../modules/home/ui/components/search-filters";
import { Suspense } from "react";

interface LayoutProps {
  children: React.ReactNode;
}
const Layout = async ({ children }: LayoutProps) => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.categories.getMany.queryOptions());
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<SearchFiltersLoading />}>
          <SearchFilters />
        </Suspense>
      </HydrationBoundary>
      <div className="flex-1 ">{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
