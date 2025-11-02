import { productCache, categoryCache, tenantCache } from "./cache";

export const invalidateProductCache = (productId?: string) => {
  if (productId) {
    // Invalidate specific product
    const keys = Array.from(productCache.keys());
    keys.forEach((key) => {
      if (key.includes(productId)) {
        productCache.delete(key);
      }
    });
  } else {
    // Invalidate all products
    productCache.clear();
  }
};

export const invalidateCategoryCache = () => {
  categoryCache.clear();
};

export const invalidateTenantCache = (subdomain?: string) => {
  if (subdomain) {
    const keys = Array.from(tenantCache.keys());
    keys.forEach((key) => {
      if (key.includes(subdomain)) {
        tenantCache.delete(key);
      }
    });
  } else {
    tenantCache.clear();
  }
};
