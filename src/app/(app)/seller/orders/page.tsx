import { getPayload } from "payload";
import config from "@payload-config";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import {SellerOrdersView} from "@/modules/seller/ui/views/seller-orders-view";

export default async function SellerOrdersPage() {
  const payload = await getPayload({ config });
  const headers = await getHeaders();
  const { user } = await payload.auth({ headers });


  // FIX (Bug 7): `payload.auth()` returns `{}` (truthy empty object) when there
  // is no active session — NOT null/undefined. The previous check `!user` was
  // always false for unauthenticated visitors. Checking `user?.id` is the correct
  // guard because an empty object has no `id` property.
  if (!user?.id || !user.roles?.includes("seller")) {
    redirect("/sign-in");
  }

  return <SellerOrdersView />;
}