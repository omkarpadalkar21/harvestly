import { cn } from "@/lib/utils";
import React from "react";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

const Footer = () => {
  return (
    <footer className="font-medium border-t border-black p-6 bg-white text-muted-foreground">
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-start gap-6 md:items-center">
        <div>
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
            <p className="text-black text-3xl">Harvestly</p>
          </span>
          <p className="text-sm">123 Farm Lane, AgriTech City, IN 400001</p>
          <p className="text-sm">Phone: +91 98765 43210</p>
        </div>
        <div className="flex gap-6 text-sm">
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
