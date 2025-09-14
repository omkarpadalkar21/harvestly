import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generateTenantURL } from "@/lib/utils";

interface Props {
  subdomain: string;
}

const Navbar = ({ subdomain }: Props) => {
  return (
    <nav className="h-20 border-b border-black bg-white font-medium">
      <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12">
        <p className="text-xl">Checkout</p>
        <Button variant={"secondary"} asChild>
          <Link href={generateTenantURL(subdomain)}>Continue Shopping</Link>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
