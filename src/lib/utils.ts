import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTenantURL(tenantSubdomain: string) {
  // if (process.env.NODE_ENV === "development") {
  //   return `/tenants/${tenantSubdomain}`;
  // }
  let protocol = "https";
  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;

  if (process.env.NODE_ENV === "development") {
    protocol = "http";
  }

  return `${protocol}://${tenantSubdomain}.${domain}`;
}
