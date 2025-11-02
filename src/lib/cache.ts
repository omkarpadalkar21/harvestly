import { LRUCache } from "lru-cache";

interface CacheOptions {
  max?: number;
  ttl?: number;
}

// Create a singleton cache instance (string keys, unknown values)
const createCache = (options: CacheOptions = {}) => {
  const instance = new LRUCache({
    max: options.max || 500, // Maximum 500 items
    ttl: options.ttl || 1000 * 60 * 5, // 5 minutes TTL
    updateAgeOnGet: true, // Reset TTL when item is accessed
    updateAgeOnHas: false,
  });

  return instance as unknown as LRUCache<string, Record<string, unknown>>;
};

// Product query cache
export const productCache = createCache({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

// Category cache
export const categoryCache = createCache({
  max: 100,
  ttl: 1000 * 60 * 10, // 10 minutes (categories change less frequently)
});

// Tenant cache
export const tenantCache = createCache({
  max: 50,
  ttl: 1000 * 60 * 15, // 15 minutes
});

// Helper to generate cache keys
export const generateCacheKey = (
  prefix: string,
  params: Record<string, unknown>
): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce(
      (acc, key) => {
        if (params[key] !== undefined && params[key] !== null) {
          acc[key] = params[key];
        }
        return acc;
      },
      {} as Record<string, unknown>
    );

  return `${prefix}:${JSON.stringify(sortedParams)}`;
};

// Clear all caches
export const clearAllCaches = () => {
  productCache.clear();
  categoryCache.clear();
  tenantCache.clear();
};
