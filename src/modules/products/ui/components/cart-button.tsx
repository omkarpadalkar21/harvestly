import { cn } from "@/lib/utils";
import { useCart } from "@/modules/checkout/hooks/use-cart";
import { Button } from "@/components/ui/button";

interface Props {
  tenantSlug: string;
  productId: string;
}

export const CartButton = ({ tenantSlug, productId }: Props) => {
  const cart = useCart(tenantSlug);
  return (
    <Button
      variant={"secondary"}
      className={cn(
        "flex-1 py-3 bg-green-600",
        cart.isProductInCart(productId) && "bg-white"
      )}
      onClick={() => cart.toggleProduct(productId)}
    >
      {cart.isProductInCart(productId) ? "Remove from cart" : "Add to cart"}
    </Button>
  );
};
