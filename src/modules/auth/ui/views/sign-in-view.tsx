"use client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Poppins } from "next/font/google";
import React from "react";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/modules/auth/schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

const SignInView = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const login = useMutation(
    trpc.auth.login.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        router.push("/");
      },
    }),
  );
  const form = useForm<z.infer<typeof loginSchema>>({
    mode: "all",
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: "",
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    login.mutate(values);
  };

  return (
    <div className={"grid grid-cols-1 lg:grid-cols-6"}>
      <div
        className={"bg-[#f4f4f4] h-screen w-full lg:col-span-4 overflow-y-auto"}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={"flex flex-col p-4 gap-8 lg:p-16"}
          >
            <div className={"flex items-center justify-between mb-8"}>
              <Link href={"/"}>
                <div className={"flex gap-1"}>
                  <Image
                    src={"/logo.svg"}
                    alt="Harvestly Logo"
                    width={35}
                    height={35}
                  />
                  <p
                    className={cn(
                      "hidden md:flex md:text-xl lg:text-3xl",
                      poppins.className,
                    )}
                  >
                    Harvestly
                  </p>
                </div>
              </Link>
              <Button
                asChild
                variant={"ghost"}
                className={"text-base border-none underline"}
                size={"sm"}
              >
                <Link prefetch href={"/sign-up"}>
                  Sign Up
                </Link>
              </Button>
            </div>
            <h1 className={"text-4xl font-medium"}>Your Harvest Awaits</h1>

            <FormField
              name={"email"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={"text-base"}>Email</FormLabel>
                  <FormControl>
                    <Input {...field} className={"border-black"} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name={"password"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={"text-base"}>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className={"border-black"}
                      type="password"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={login.isPending}
              type={"submit"}
              size={"lg"}
              variant={"default"}
              className={"hover:bg-green-600 hover:text-primary"}
            >
              Sign In
            </Button>
          </form>
        </Form>
      </div>
      <div
        className={
          "relative h-screen w-full lg:col-span-2 hidden lg:block bg-[#f4f4f4] overflow-hidden"
        }
      >
        <video
          className="absolute inset-0 h-full w-full object-cover object-[45%_15%]"
          autoPlay
          muted
          playsInline
          aria-hidden="true"
        >
          <source src="/signin.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
};
export default SignInView;
