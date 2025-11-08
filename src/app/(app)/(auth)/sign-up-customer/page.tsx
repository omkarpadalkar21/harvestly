import React from "react";
import SignUpCustomerView from "@/modules/auth/ui/views/sign-up-customer-view";
import { caller } from "@/trpc/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const Page = async () => {
  const session = await caller.auth.session();
  if (session.user) {
    redirect("/");
  }
  return <SignUpCustomerView />;
};
export default Page;
