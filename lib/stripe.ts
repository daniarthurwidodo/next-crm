import Stripe from "stripe";

// Initialize Stripe with the secret key from environment variables.
// Ensure STRIPE_SECRET_KEY is defined in .env.local.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export default stripe;

