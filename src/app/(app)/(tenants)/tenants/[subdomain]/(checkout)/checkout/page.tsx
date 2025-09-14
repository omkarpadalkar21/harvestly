import CheckoutView from "@/modules/checkout/ui/views/checkout-view";

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { subdomain } = await params;
  return <CheckoutView tenantSubdomain={subdomain} />;
};
export default Page;
