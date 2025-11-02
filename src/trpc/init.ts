import { initTRPC, TRPCError } from "@trpc/server";
import { getPayload } from "payload";
import { cache } from "react";
import config from "@payload-config";
import { headers as getHeaders } from "next/headers";

export const createTRPCContext = cache(async () => {
  /**
   * @see: [https://trpc.io/docs/server/context](https://trpc.io/docs/server/context)
   */
  return { userId: "user_123" };
});

const t = initTRPC.create({
  /**
   * @see [https://trpc.io/docs/server/data-transformers](https://trpc.io/docs/server/data-transformers)
   */
  // transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

// Base procedure with Payload db context
export const baseProcedure = t.procedure.use(async ({ next }) => {
  const payload = await getPayload({
    config,
  });

  return next({ ctx: { db: payload } });
});

// Protected procedure with authentication
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const headers = await getHeaders();
  const session = await ctx.db.auth({ headers });

  if (!session.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not Authenticated",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: {
        ...session,
        user: session.user,
      },
    },
  });
});

// Alias for compatibility
export const cachedProductProcedure = baseProcedure;
export const cachedCategoryProcedure = baseProcedure;
export const cachedTenantProcedure = baseProcedure;
export const protectedCachedProductProcedure = protectedProcedure;
export const protectedCachedCategoryProcedure = protectedProcedure;
