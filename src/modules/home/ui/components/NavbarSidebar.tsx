"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Poppins } from "next/font/google";

import { navbarItems } from "./Navbar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { User } from "@/payload-types";
import { useLocationStore } from "@/modules/home/store/use-location-store";
import { MapPinIcon } from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

interface Props {
  items: typeof navbarItems;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onLogout?: () => void;
  isLoggingOut?: boolean;
  onOpenLocationPrompt?: () => void;
}

const NavbarSidebar = ({
  items,
  open,
  onOpenChange,
  user,
  onLogout,
  isLoggingOut,
  onOpenLocationPrompt,
}: Props) => {
  const { location } = useLocationStore();

  const locationLabel = location?.city
    ? `${location.city}${location.pincode ? ` – ${location.pincode}` : ""}`
    : location?.pincode ?? null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-0 transition-none" side="left">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center">
            <SheetTitle>
              <span
                className={cn(
                  "font-semibold flex gap-2 items-center",
                  poppins.className,
                )}
              >
                <Image
                  src={"/logo.svg"}
                  alt="Harvestly Logo"
                  width={50}
                  height={50}
                />
                <p className="text-4xl">Harvestly</p>
              </span>
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Mobile location chip */}
        <button
          onClick={() => {
            onOpenChange(false);
            // Small delay so sidebar closes smoothly before modal opens
            setTimeout(() => onOpenLocationPrompt?.(), 200);
          }}
          className="w-full flex items-center gap-2 px-4 py-3 border-b text-sm text-left hover:bg-neutral-50 transition-colors"
          aria-label="Set or change delivery location"
        >
          <MapPinIcon className="size-4 text-green-700 shrink-0" />
          {locationLabel ? (
            <span className="font-medium text-neutral-700 truncate">
              📍 {locationLabel}
              <span className="text-neutral-400 font-normal ml-1">· Change</span>
            </span>
          ) : (
            <span className="text-neutral-500">
              Set your delivery location
            </span>
          )}
        </button>

        <ScrollArea className="flex flex-col overflow-y-auto h-full pb-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="w-full text-left p-4 hover:bg-black hover:text-white items-center text-lg 
              font-lg flex flex-col"
              onClick={() => onOpenChange(false)}
            >
              {item.children}
            </Link>
          ))}
          <div className="flex flex-col">
            {user ? (
              <>
                {(user.roles?.includes("seller") || user.roles?.includes("super-admin")) ? (
                  <Link
                    href={"/admin"}
                    className="border-l-0 border-b border-r-0 border-t w-full rounded-none bg-black text-white hover:bg-green-600 hover:text-black transition-colors text-lg flex items-center justify-center p-4"
                    onClick={() => onOpenChange(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Button
                    onClick={() => {
                      onLogout?.();
                      onOpenChange(false);
                    }}
                    disabled={isLoggingOut}
                    className="border-l-0 border-b border-r-0 border-t w-full rounded-none bg-black text-white hover:bg-green-600 hover:text-black transition-colors text-lg h-auto p-4"
                  >
                    Sign Out
                  </Button>
                )}
              </>
            ) : (
              <>
                <Link
                  href={"sign-in"}
                  className="border-l-0 border-b border-r-0 border-t w-full rounded-none bg-white  hover:bg-green-600 hover:text-black transition-colors text-lg flex items-center justify-center p-4"
                  onClick={() => onOpenChange(false)}
                >
                  Log In
                </Link>
                <Link
                  href={"sign-up-customer"}
                  className="border-l-0 border-b border-r-0 border-t w-full rounded-none bg-white hover:bg-green-600 hover:text-black transition-colors text-lg flex items-center justify-center p-4"
                  onClick={() => onOpenChange(false)}
                >
                  Sign Up
                </Link>
                <Link
                  href={"sign-up-seller"}
                  className="border-l-0 border-b border-r-0 border-t w-full rounded-none bg-black text-white hover:bg-green-600 hover:text-black transition-colors text-lg flex items-center justify-center p-4"
                  onClick={() => onOpenChange(false)}
                >
                  Sell on Harvestly
                </Link>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NavbarSidebar;
