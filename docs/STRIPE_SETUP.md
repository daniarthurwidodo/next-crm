# Stripe Setup Guide

This guide explains how to set up Stripe for the checkout functionality in the CRM application.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Stripe API keys (found in your Stripe Dashboard under Developers > API keys)

## Configuration Steps

### 1. Add Stripe API Keys to Environment Variables

Add your Stripe keys to `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

**Important:** 
- Use test keys (starting with `sk_test_` and `pk_test_`) for development
- Never commit your secret keys to version control
- Use live keys (starting with `sk_live_` and `pk_live_`) only in production

### 2. Create Stripe Products and Prices

Run the setup script to automatically create the required products and prices in your Stripe account:

```bash
node scripts/setup-stripe-products.mjs
```

This script will:
- Create a "Free Plan" product with a $0/month price
- Create a "Pro Plan" product with a $5/month price
- Automatically update `lib/plans.ts` with the generated price IDs

### 3. Verify the Setup

After running the script, check:

1. **Stripe Dashboard**: Go to Products in your Stripe dashboard to see the created products
2. **lib/plans.ts**: Verify that the price IDs have been updated from placeholders to actual Stripe price IDs (starting with `price_`)

## Manual Setup (Alternative)

If you prefer to create products manually:

1. Go to your Stripe Dashboard > Products
2. Create a new product for each plan:
   - **Free Plan**: $0/month
   - **Pro Plan**: $5/month
3. Copy the price IDs (they start with `price_`)
4. Update `lib/plans.ts` with your price IDs:

```typescript
export const plans = {
  free: {
    name: "Free",
    priceId: "price_your_free_price_id_here",
    displayName: "Start for Free",
  },
  pro: {
    name: "Pro",
    priceId: "price_your_pro_price_id_here",
    displayName: "Go Pro",
  },
} as const;
```

## Testing the Checkout Flow

1. Start your development server: `npm run dev`
2. Navigate to the pricing page
3. Click "Go Pro" button
4. You should be redirected to a Stripe Checkout page

### Test Cards

Use these test card numbers in Stripe test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Use any future expiry date and any 3-digit CVC

## Troubleshooting

### "Invalid plan" Error
- Ensure the plan name in the URL matches the keys in `lib/plans.ts` (e.g., "pro", "free")
- Check that the checkout page is correctly passing the plan parameter

### "Failed to create checkout session" Error
- Verify your Stripe secret key is correct in `.env.local`
- Ensure the price IDs in `lib/plans.ts` are valid Stripe price IDs
- Check the server console for detailed error messages
- Verify the products exist in your Stripe dashboard

### Price ID Format
- Valid price IDs start with `price_` (e.g., `price_1234567890abcdef`)
- Placeholder values like `price_0` or `price_1` will not work

## Production Deployment

Before deploying to production:

1. Create production products in Stripe (or switch to live mode)
2. Update environment variables with live Stripe keys
3. Update `lib/plans.ts` with production price IDs
4. Test the checkout flow thoroughly in production

## Additional Resources

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe API Reference](https://stripe.com/docs/api)
