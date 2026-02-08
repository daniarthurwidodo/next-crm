// Central definition of subscription plans used throughout the app.
// Each plan maps a friendly identifier to its Stripe price ID.
export const plans = {
  free: {
    name: "Free",
    priceId: "price_1SyTsDCV46sldwAasQWrUPbP",
    displayName: "Start for Free",
  },
  pro: {
    name: "Pro",
    priceId: "price_1SyTsECV46sldwAaWXtRAKMk",
    displayName: "Go Pro",
  },
} as const;

export type PlanKey = keyof typeof plans;
