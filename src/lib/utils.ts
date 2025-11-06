import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTenantURL(tenantSubdomain: string) {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isSubdomainRoutingEnabled = Boolean(
    process.env.NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING === "true"
  );
  // In development use normal routing
  if (isDevelopment || !isSubdomainRoutingEnabled) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/tenants/${tenantSubdomain}`;
  }
  // In production use subdomain routing
  const protocol = "https";
  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;

  return `${protocol}://${tenantSubdomain}.${domain}`;
}
