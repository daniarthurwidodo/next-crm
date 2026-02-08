import Stripe from "stripe";
import { createLogger } from "./logger";

const logger = createLogger({ module: 'stripe' });

if (!process.env.STRIPE_SECRET_KEY) {
  logger.error('STRIPE_SECRET_KEY is not defined in environment variables');
  throw new Error('STRIPE_SECRET_KEY is required');
}

logger.info({ apiVersion: "2023-10-16" }, 'Initializing Stripe client');

// Initialize Stripe with the secret key from environment variables.
// Ensure STRIPE_SECRET_KEY is defined in .env.local.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export default stripe;

