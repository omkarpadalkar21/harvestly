import Link from "next/link";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import Image from "next/image";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});
const Footer = () => {
  return (
    <nav className="h-20 border-t  border-black bg-white font-medium">
      <div className="max-w-(--breakpoint-xl) py-6 mx-auto flex gap-2 items-center h-full px-4 lg:px-12">
        <p>Powered by</p>
        <Link href={"/"} className=" flex items-center pl-6">
          <span
            className={cn(
              "font-semibold flex gap-2 items-center",
              poppins.className
            )}
          >
            <Image
              src={"/logo.svg"}
              alt="Harvestly Logo"
              width={30}
              height={30}
            />
            <p className="hidden md:flex md:text-xl lg:text-3xl">Harvestly</p>
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default Footer;
