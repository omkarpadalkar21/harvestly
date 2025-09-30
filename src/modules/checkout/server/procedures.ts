import {
  baseProcedure,
  createTRPCRouter,
  protectedProcuedures
} from "@/trpc/init";
import { z } from "zod";

import { Media, Tenant } from "@/payload-types";
import { TRPCError } from "@trpc/server";
import type Stripe from "stripe";

export const checkoutRouter = createTRPCRouter({
  purchase: protectedProcuedures
    .input(
      z.object({
        productIds: z.string().min(1),
        tenantSubdomain: z.string().min(1)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const products = await ctx.db.find({
        collection: "products",
        depth: 2,
        where: {
          and: [
            {
              id: {
                in: input.productIds
              }
            },
            {
              "tenant.subdomain": {
                equals: input.tenantSubdomain
              }
            }
          ]
        }
      });

      if (products.totalDocs !== input.productIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Products not found"
        });
      }

      const tenantsData = await ctx.db.find({
        collection: "tenants",
        limit: 1,
        pagination: false,
        where: {
          subdomain: {
            equals: input.tenantSubdomain
          }
        }
      });

      const tenants = tenantsData.docs[0];
      if (!tenants) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No tenants found" });
      }

      // TODO: Throw error if stripe details not submitted

      // const lineItems = Stripe.Checkout.SessionCreateParams.LineItem[];

    }),
  getProducts: baseProcedure
    .input(
      z.object({
        ids: z.array(z.string())
      })
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.find({
        collection: "products",
        depth: 2,
        where: {
          id: {
            in: input.ids
          }
        }
      });

      if (data.totalDocs !== input.ids.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found"
        });
      }

      const totalPrice = data.docs.reduce((acc, product) => {
        const price = Number(product.price);
        return acc + (isNaN(price) ? 0 : price);
      }, 0);

      return {
        ...data,
        totalPrice: totalPrice,
        docs: data.docs.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null }
        }))
      };
    })
});
