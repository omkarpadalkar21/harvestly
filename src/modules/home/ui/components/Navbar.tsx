"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Poppins } from "next/font/google";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import NavbarSidebar from "./NavbarSidebar";
import { MenuIcon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

interface NavbarItemsProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

const NavbarItems = ({ href, children, isActive }: NavbarItemsProps) => {
  return (
    <Button
      asChild
      variant={"outline"}
      className={cn(
        "bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent px-3.5 text-lg",
        isActive && "bg-black text-white hover:bg-black hover:text-white"
      )}
    >
      <Link prefetch href={href}>
        {children}
      </Link>
    </Button>
  );
};

export const navbarItems = [
  {
    href: "/",
    children: "Home",
  },
  {
    href: "/about",
    children: "About",
  },
  {
    href: "/features",
    children: "Features",
  },
  {
    href: "/orders",
    children: "Orders",
  },
];

const Navbar = () => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const session = useQuery(trpc.auth.session.queryOptions());
  
  const logout = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.auth.session.queryFilter());
        toast.success("Logged out successfully");
        router.push("/");
        router.refresh();
      },
      onError: () => {
        toast.error("Failed to logout");
      },
    })
  );
  const filteredNavbarItems = navbarItems.filter((item) => {
    if (item.href === "/orders") {
      return session.data?.user?.roles?.includes("customer");
    }
    return true;
  });

  return (
    <nav className="flex h-20 border-b border-black justify-between font-medium bg-white">
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
            width={50}
            height={50}
          />
          <p className="hidden md:flex md:text-3xl lg:text-5xl">Harvestly</p>
        </span>
      </Link>

      <NavbarSidebar
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        items={filteredNavbarItems}
        user={session.data?.user}
        onLogout={() => logout.mutate()}
        isLoggingOut={logout.isPending}
      />
      <div className="items-center hidden gap-4 lg:flex">
        {filteredNavbarItems.map((item) => (
          <NavbarItems
            key={item.href}
            {...item}
            isActive={item.href === pathname}
          />
        ))}
      </div>

      {session.data?.user ? (
        <div className="hidden lg:flex p-0">
          {(session.data.user.roles?.includes("seller") ||
            session.data.user.roles?.includes("super-admin")) ? (
            <Button
              asChild
              className="border-l border-b-0 border-r-0 border-t-0 px-12 h-full rounded-none bg-black hover:bg-green-600 hover:text-black transition-colors text-lg"
            >
              <Link href="/admin">Dashboard</Link>
            </Button>
          ) : (
            <Button
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="border-l border-b-0 border-r-0 border-t-0 px-12 h-full rounded-none bg-black hover:bg-green-600 hover:text-black transition-colors text-lg"
            >
              Sign Out
            </Button>
          )}
        </div>
      ) : (
        <div className="hidden lg:flex p-0">
          <Button
            asChild
            variant="secondary"
            className="border-l border-b-0 border-r-0 border-t-0 px-12 h-full rounded-none hover:bg-green-600 transition-colors text-lg"
          >
            <Link prefetch href="/sign-in">
              Log In
            </Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            className="border-l border-b-0 border-r-0 border-t-0 px-12 h-full rounded-none hover:bg-green-600 transition-colors text-lg"
          >
            <Link prefetch href="/sign-up-customer">
              Sign Up
            </Link>
          </Button>
          <Button
            asChild
            className="border-l border-b-0 border-r-0 border-t-0 px-12 h-full rounded-none bg-black hover:bg-green-600 hover:text-black transition-colors text-lg"
          >
            <Link prefetch href="/sign-up-seller">
              Sell on Harvestly
            </Link>
          </Button>
        </div>
      )}

      <div className="flex lg:hidden items-center justify-center p-3">
        <Button
          variant={"ghost"}
          className="size-12 border-transparent bg-white"
          onClick={() => setIsSidebarOpen(true)}
        >
          <MenuIcon className="size-full" />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
