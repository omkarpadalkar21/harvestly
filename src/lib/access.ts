import { ClientUser } from "payload";
import type { User } from "@/payload-types";

export const isSuperAdmin = (user: User | ClientUser | null) => {
  return Boolean(user?.roles?.includes("super-admin"));
};

export const isSeller = (user: User | ClientUser | null) => {
  return Boolean(user?.roles?.includes("seller"));
};

export const isSellerOrSuperAdmin = (user: User | ClientUser | null) => {
  return isSuperAdmin(user) || isSeller(user);
};
