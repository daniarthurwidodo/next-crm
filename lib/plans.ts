// Central definition of subscription plans used throughout the app.
// Each plan maps a friendly identifier to its Stripe price ID.
export const plans = {
  free: {
    name: "Free",
    priceId: "price_0", // TODO: replace with actual Stripe price ID for the free tier
    displayName: "Start for Free",
  },
  pro: {
    name: "Pro",
    priceId: "price_1", // TODO: replace with actual Stripe price ID for the Pro tier
    displayName: "Go Pro",
  },
} as const;

export type PlanKey = keyof typeof plans;

