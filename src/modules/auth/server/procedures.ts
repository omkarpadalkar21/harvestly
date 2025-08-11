import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { headers as getHeaders, cookies as getCookies } from "next/headers";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { authCookie } from "@/modules/auth/constants";

export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async ({ ctx }) => {
    const headers = await getHeaders();
    return await ctx.db.auth({ headers });
  }),
  logout: baseProcedure.mutation(async ({ ctx }) => {
    const cookies = await getCookies();
    cookies.delete(authCookie);
  }),
  register: baseProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(3, "Password must be at least 3 characters"),
        username: z
          .string()
          .min(3, "Username must be at least 3 characters")
          .max(63, "Username must be less than 63 characters")
          .regex(
            /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
            "Username can only contain lowercase letters, numbers and hyphens. It must start and end with a letter or number",
          )
          .refine(
            (val) => !val.includes("--"),
            "Username cannot contain consecutive hyphens.",
          ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.create({
        collection: "users",
        data: {
          email: input.email,
          password: input.password, //payload handles hashing of password
          username: input.username,
        },
      });
      const data = await ctx.db.login({
        collection: "users",
        data: {
          email: input.email,
          password: input.password,
        },
      });

      if (!data.token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Failed to login",
        });
      }

      const cookies = await getCookies();
      cookies.set({
        name: authCookie,
        value: data.token,
        httpOnly: true,
        path: "/",
      });
    }),
  login: baseProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.db.login({
        collection: "users",
        data: {
          email: input.email,
          password: input.password,
        },
      });

      if (!data.token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Failed to login",
        });
      }

      const cookies = await getCookies();
      cookies.set({
        name: authCookie,
        value: data.token,
        httpOnly: true,
        path: "/",
      });

      return data;
    }),
});
