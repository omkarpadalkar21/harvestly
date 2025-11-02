import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CartItem {
  id: string;
  quantity: number;
}

interface TenantCart {
  productIds: CartItem[];
}

interface CartState {
  tenantCarts: Record<string, TenantCart>;
  addProduct: (tenantSlug: string, productId: string, quantity?: number) => void;
  removeProduct: (tenantSlug: string, productId: string) => void;
  updateQuantity: (tenantSlug: string, productId: string, quantity: number) => void;
  clearCart: (tenantSlug: string) => void;
  clearAllCarts: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      tenantCarts: {},
      addProduct: (tenantSlug, productId, quantity = 1) =>
        set((state) => {
          const existingCart = state.tenantCarts[tenantSlug]?.productIds || [];
          const existingItem = existingCart.find((item) => item.id === productId);
          
          if (existingItem) {
            return {
              tenantCarts: {
                ...state.tenantCarts,
                [tenantSlug]: {
                  productIds: existingCart.map((item) =>
                    item.id === productId
                      ? { ...item, quantity: item.quantity + quantity }
                      : item
                  ),
                },
              },
            };
          }
          
          return {
            tenantCarts: {
              ...state.tenantCarts,
              [tenantSlug]: {
                productIds: [...existingCart, { id: productId, quantity }],
              },
            },
          };
        }),
      removeProduct: (tenantSlug, productId) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts,
            [tenantSlug]: {
              productIds:
                state.tenantCarts[tenantSlug]?.productIds.filter(
                  (item) => item.id !== productId,
                ) || [],
            },
          },
        })),
      updateQuantity: (tenantSlug, productId, quantity) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts,
            [tenantSlug]: {
              productIds:
                state.tenantCarts[tenantSlug]?.productIds.map((item) =>
                  item.id === productId ? { ...item, quantity } : item
                ) || [],
            },
          },
        })),
      clearCart: (tenantSlug) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts,
            [tenantSlug]: {
              productIds: [],
            },
          },
        })),
      clearAllCarts: () => set({ tenantCarts: {} }),
    }),
    {
      name: "harvestly-cart",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          const state = persistedState as { tenantCarts: Record<string, { productIds: (string | CartItem)[] }> };
          const migratedCarts: Record<string, TenantCart> = {};
          
          Object.keys(state.tenantCarts || {}).forEach((tenantSlug) => {
            const cart = state.tenantCarts[tenantSlug];
            migratedCarts[tenantSlug] = {
              productIds: cart.productIds.map((item) => {
                if (typeof item === 'string') {
                  return { id: item, quantity: 1 };
                }
                return item;
              }).filter((item) => item.id),
            };
          });
          
          return { tenantCarts: migratedCarts };
        }
        return persistedState as CartState;
      },
    },
  ),
);
