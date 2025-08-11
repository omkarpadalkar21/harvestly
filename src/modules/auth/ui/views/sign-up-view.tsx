"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

import React from "react";

const SignUpView = () => {
  return (
    <div className={"grid grid-cols-1 lg:grid-cols-5"}>
      <div
        className={"bg-[#f4f4f4] h-screen w-full lg:col-span-3 overflow-y-auto"}
      ></div>
      <div
        className={"h-screen w-full lg:col-span-2 hidden lg:block"}
        style={{
          backgroundImage: `url('/sign-up-bg.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>
    </div>
  );
};
export default SignUpView;
