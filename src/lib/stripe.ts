import Stripe from "stripe";
import dotenv from "dotenv";

// Load environment variables if not already loaded
if (!process.env.STRIPE_SECRET_KEY) {
    dotenv.config();
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,{
    apiVersion: "2025-08-27.basil",
    typescript: true,
});
