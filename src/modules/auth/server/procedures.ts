import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { headers as getHeaders } from "next/headers";
import { TRPCError } from "@trpc/server";
import { loginSchema, registerSellerSchema, registerCustomerSchema } from "@/modules/auth/schemas";
import { generateAuthCookie, clearAuthCookie } from "@/modules/auth/utils";
import { stripe } from "@/lib/stripe";

export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async ({ ctx }) => {
    const headers = await getHeaders();
    return await ctx.db.auth({ headers });
  }),

  registerSeller: baseProcedure
    .input(registerSellerSchema)
    .mutation(async ({ input, ctx }) => {
      const existingData = await ctx.db.find({
        collection: "users",
        limit: 1,
        where: {
          username: {
            equals: input.username,
          },
        },
      });

      const existingUser = existingData.docs[0];
      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username already exists",
        });
      }

      const account = await stripe.accounts.create({});

      if (!account) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to create Stripe account",
        });
      }

      const tenant = await ctx.db.create({
        collection: "tenants",
        data: {
          name: input.username,
          subdomain: input.username,
          stripeAccountId: account.id,
        },
        overrideAccess: true,
      });

      await ctx.db.create({
        collection: "users",
        data: {
          email: input.email,
          password: input.password, //payload handles hashing of password
          username: input.username,
          roles: ["seller"],
          tenants: [
            {
              tenant: tenant.id,
            },
          ],
        },
        overrideAccess: true,
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

      await generateAuthCookie({
        prefix: ctx.db.config.cookiePrefix,
        value: data.token,
      });
    }),
  registerCustomer: baseProcedure
    .input(registerCustomerSchema)
    .mutation(async ({ input, ctx }) => {
      const existingData = await ctx.db.find({
        collection: "users",
        limit: 1,
        where: {
          username: {
            equals: input.username,
          },
        },
      });

      const existingUser = existingData.docs[0];
      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username already exists",
        });
      }

      await ctx.db.create({
        collection: "users",
        data: {
          email: input.email,
          password: input.password, //payload handles hashing of password
          username: input.username,
          roles: ["customer"],
          tenants: [],
        },
        overrideAccess: true,
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

      await generateAuthCookie({
        prefix: ctx.db.config.cookiePrefix,
        value: data.token,
      });
    }),
  login: baseProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
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

    await generateAuthCookie({
      prefix: ctx.db.config.cookiePrefix,
      value: data.token,
    });

    return data;
  }),
  logout: baseProcedure.mutation(async ({ ctx }) => {
    await clearAuthCookie(ctx.db.config.cookiePrefix);
    return { success: true };
  }),
});
