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

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

// interface NavbarSidebarProps {
//   href: string;
//   children: React.ReactNode;
// }

interface Props {
  items: typeof navbarItems;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

const NavbarSidebar = ({ items, open, onOpenChange, user, onLogout, isLoggingOut }: Props) => {
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
