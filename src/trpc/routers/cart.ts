import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";

export const cartRouter = createTRPCRouter({
  syncCart: protectedProcedure
    .input(
      z.object({
        tenantSubdomain: z.string(),
        items: z.array(
          z.object({
            id: z.string(),
            quantity: z.number().min(1),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session;

      // Find existing cart for user and tenant
      const existingCartResult = await ctx.db.find({
        collection: "carts",
        where: {
          and: [
            { user: { equals: user.id } },
            { tenantSubdomain: { equals: input.tenantSubdomain } },
          ],
        },
        limit: 1,
      });

      const itemsForDb = input.items.map((item) => ({
        product: item.id,
        quantity: item.quantity,
      }));

      if (existingCartResult.totalDocs > 0) {
        const cartId = existingCartResult.docs[0].id;
        return await ctx.db.update({
          collection: "carts",
          id: cartId,
          data: {
            items: itemsForDb,
          },
        });
      } else {
        return await ctx.db.create({
          collection: "carts",
          data: {
            user: user.id,
            tenantSubdomain: input.tenantSubdomain,
            items: itemsForDb,
          },
        });
      }
    }),

  getCart: protectedProcedure
    .input(
      z.object({
        tenantSubdomain: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { user } = ctx.session;

      const result = await ctx.db.find({
        collection: "carts",
        where: {
          and: [
            { user: { equals: user.id } },
            { tenantSubdomain: { equals: input.tenantSubdomain } },
          ],
        },
        limit: 1,
        depth: 0,
      });

      if (result.totalDocs === 0) return null;
      return result.docs[0];
    }),
});
