import Stripe from "stripe";

export type ProductMetaData = {
  stripeAccountId: string;
  id: string;
  name: string;
  price: number;
};

export type CheckoutMetaData = {
  userId: string;
};

export type expandedLineItem = Stripe.LineItem & {
  price: Stripe.Price & {
    product: Stripe.Product & {
      metadata: ProductMetaData;
    };
  };
};
