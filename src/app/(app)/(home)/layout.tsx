import { Category } from "@/payload-types";
import Footer from "./Footer";
import Navbar from "./Navbar";
import SearchFilters from "./search-filters";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import { CustomCategory } from "@/app/(app)/(home)/types";
interface LayoutProps {
  children: React.ReactNode;
}
const Layout = async ({ children }: LayoutProps) => {
  const payload = await getPayload({
    config: configPromise,
  });

  const data = await payload.find({
    collection: "categories",
    where: { parent: { exists: false } },
    depth: 1, // Populate subcategories, subcateogies.[0] will be a type of category
    pagination: false,
    sort: "desc"
  });

  const formattedData: CustomCategory[] = data.docs.map((doc) => ({
    ...doc,
    subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
      ...(doc as Category), // Because of "depth 1", we are confident that the "doc" will be a type of category
    })),
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <SearchFilters data={formattedData} />
      <div className="flex-1 bg-[#f3f3f3]">{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
