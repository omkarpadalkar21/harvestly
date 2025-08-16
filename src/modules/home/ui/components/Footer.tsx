import { cn } from "@/lib/utils";
import React from "react";
import { Poppins } from "next/font/google";
import Image from "next/image";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

const Footer = () => {
  return (
    <footer className="font-medium border-t p-6 bg-muted text-muted-foreground">
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-start gap-6 md:items-center">
        <div>
          <span
            className={cn(
              "font-semibold flex gap-2 items-center",
              poppins.className,
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
          <a href="/about" className="hover:underline">
            About
          </a>
          <a href="/contact" className="hover:underline">
            Contact
          </a>
          <a href="/privacy" className="hover:underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
