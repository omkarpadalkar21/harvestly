import React from "react";
import SignUpSellerView from "@/modules/auth/ui/views/sign-up-seller-view";
import { caller } from "@/trpc/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const Page = async () => {
  const session = await caller.auth.session();
  if (session.user) {
    redirect("/");
  }
  return <SignUpSellerView />;
};
export default Page;
