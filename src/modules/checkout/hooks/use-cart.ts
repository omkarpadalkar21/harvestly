import { useCartStore } from "@/modules/checkout/store/use-cart-store";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

export const useCart = (tenantSubdomain: string) => {
  const clearCart = useCartStore((state) => state.clearCart);
  const clearAllCarts = useCartStore((state) => state.clearAllCarts);
  const addProduct = useCartStore((state) => state.addProduct);
  const removeProduct = useCartStore((state) => state.removeProduct);

  const productIds = useCartStore(
    useShallow((state) => state.tenantCarts[tenantSubdomain]?.productIds || []),
  );

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
    (productId: string) => {
      addProduct(tenantSubdomain, productId);
    },
    [tenantSubdomain, addProduct],
  );

  const handleRemoveProduct = useCallback(
    (productId: string) => {
      removeProduct(tenantSubdomain, productId);
    },
    [tenantSubdomain, removeProduct],
  );

  return {
    productIds,
    addProduct: handleAddProduct,
    removeProduct: handleRemoveProduct,
    clearCart: clearTenantCart,
    clearAllCarts,
    toggleProduct,
    isProductInCart,
    totalItems: productIds.length,
  };
};
