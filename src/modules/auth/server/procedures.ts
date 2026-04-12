import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { headers as getHeaders } from "next/headers";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
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
        where: { username: { equals: input.username } },
      });
      const existingUser = existingData.docs[0];
      if (existingUser) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Username already exists" });
      }

      const account = await stripe.accounts.create();
      if (!account) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to create Stripe account" });
      }

      // FIX (Bug 9): lat and lng are now `null` (not 0).
      // Previously lat: 0, lng: 0 was used as a placeholder. That is a real
      // coordinate (Gulf of Guinea, 0°N 0°E), and since 0 is falsy in JS it also
      // caused ALL new sellers to bypass geo-filtering (Bug 1 + Bug 9 combined).
      // Coordinates will be auto-set by the Tenants.ts beforeChange hook the
      // first time the seller updates their pincode in the CMS dashboard.
      const tenant = await ctx.db.create({
        collection: "tenants",
        data: {
          name: input.username,
          subdomain: input.username,
          stripeAccountId: account.id,
          location: {
            city: "Unknown",
            state: "Unknown",
            pincode: "000000",
            lat: null,
            lng: null,
            serviceRadiusKm: 50,
          },
        },
        overrideAccess: true,
      });

      await ctx.db.create({
        collection: "users",
        data: {
          email: input.email,
          password: input.password,
          username: input.username,
          roles: ["seller"],
          tenants: [{ tenant: tenant.id }],
        },
        overrideAccess: true,
      });

      const data = await ctx.db.login({
        collection: "users",
        data: { email: input.email, password: input.password },
      });

      if (!data.token) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Failed to login" });
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
        where: { username: { equals: input.username } },
      });
      const existingUser = existingData.docs[0];
      if (existingUser) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Username already exists" });
      }

      await ctx.db.create({
        collection: "users",
        data: {
          email: input.email,
          password: input.password,
          username: input.username,
          roles: ["customer"],
          tenants: [],
        },
        overrideAccess: true,
      });

      const data = await ctx.db.login({
        collection: "users",
        data: { email: input.email, password: input.password },
      });

      if (!data.token) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Failed to login" });
      }

      await generateAuthCookie({
        prefix: ctx.db.config.cookiePrefix,
        value: data.token,
      });
    }),

  login: baseProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const data = await ctx.db.login({
      collection: "users",
      data: { email: input.email, password: input.password },
    });

    if (!data.token) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Failed to login" });
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

  /**
   * Saves a customer's location to their profile for the "Notify Me" feature.
   * Silently succeeds for guests (location is only persisted for logged-in users).
   * Validates lat/lng ranges to prevent junk data being stored.
   */
  notifyLocation: baseProcedure
    .input(
      z.object({
        pincode: z.string().regex(/^\d{6}$/, "Invalid 6-digit pincode"),
        city: z.string().max(100).optional(),
        state: z.string().max(100).optional(),
        // Validate coordinate ranges to prevent arbitrary values being stored
        lat: z.number().min(-90).max(90).optional(),
        lng: z.number().min(-180).max(180).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const headers = await getHeaders();
      const session = await ctx.db.auth({ headers });

      if (session.user) {
        await ctx.db.update({
          collection: "users",
          id: session.user.id,
          data: {
            location: {
              pincode: input.pincode,
              city: input.city,
              state: input.state,
              lat: input.lat,
              lng: input.lng,
            },
          },
          overrideAccess: true,
        });
      }

      return { success: true };
    }),
});
