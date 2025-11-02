import { useCartStore } from "@/modules/checkout/store/use-cart-store";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

export const useCart = (tenantSubdomain: string) => {
  const clearCart = useCartStore((state) => state.clearCart);
  const clearAllCarts = useCartStore((state) => state.clearAllCarts);
  const addProduct = useCartStore((state) => state.addProduct);
  const removeProduct = useCartStore((state) => state.removeProduct);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const cartItems = useCartStore(
    useShallow((state) => {
      const items = state.tenantCarts[tenantSubdomain]?.productIds || [];
      return items.map((item) => {
        if (typeof item === 'string') {
          return { id: item, quantity: 1 };
        }
        return item;
      });
    }),
  );
  
  const productIds = cartItems.map((item) => item.id).filter(Boolean);

  const toggleProduct = useCallback(
    (productId: string) => {
      if (productIds.includes(productId)) {
        removeProduct(tenantSubdomain, productId);
      } else {
        addProduct(tenantSubdomain, productId);
      }
    },
    [addProduct, removeProduct, productIds, tenantSubdomain],
  );

  const isProductInCart = useCallback(
    (productId: string) => {
      return productIds.includes(productId);
    },
    [productIds],
  );

  const clearTenantCart = useCallback(() => {
    clearCart(tenantSubdomain);
  }, [tenantSubdomain, clearCart]);

  const handleAddProduct = useCallback(
    (productId: string, quantity?: number) => {
      addProduct(tenantSubdomain, productId, quantity);
    },
    [tenantSubdomain, addProduct],
  );

  const handleRemoveProduct = useCallback(
    (productId: string) => {
      removeProduct(tenantSubdomain, productId);
    },
    [tenantSubdomain, removeProduct],
  );

  const handleUpdateQuantity = useCallback(
    (productId: string, quantity: number) => {
      updateQuantity(tenantSubdomain, productId, quantity);
    },
    [tenantSubdomain, updateQuantity],
  );

  const getProductQuantity = useCallback(
    (productId: string) => {
      const item = cartItems.find((item) => item.id === productId);
      return item?.quantity || 0;
    },
    [cartItems],
  );

  return {
    productIds,
    cartItems,
    addProduct: handleAddProduct,
    removeProduct: handleRemoveProduct,
    updateQuantity: handleUpdateQuantity,
    getProductQuantity,
    clearCart: clearTenantCart,
    clearAllCarts,
    toggleProduct,
    isProductInCart,
    totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
  };
};
