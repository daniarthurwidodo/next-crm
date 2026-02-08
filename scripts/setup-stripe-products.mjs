#!/usr/bin/env node

/**
 * Script to create Stripe products and prices for the CRM application.
 * Run this script once to set up your Stripe products and get the price IDs.
 * 
 * Usage: node scripts/setup-stripe-products.mjs
 */

import Stripe from 'stripe';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

async function setupStripeProducts() {
  try {
    console.log('Setting up Stripe products and prices...\n');

    // Create Free tier product (for reference, though free plans typically don't need Stripe)
    console.log('Creating Free tier product...');
    const freeProduct = await stripe.products.create({
      name: 'Free Plan',
      description: '5GB storage or 100 files/month, Basic support, Shortcode uploads',
    });
    
    const freePrice = await stripe.prices.create({
      product: freeProduct.id,
      unit_amount: 0,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });
    
    console.log(`✓ Free tier created: ${freePrice.id}\n`);

    // Create Pro tier product
    console.log('Creating Pro tier product...');
    const proProduct = await stripe.products.create({
      name: 'Pro Plan',
      description: 'Unlimited storage & uploads, Priority support, Custom branding',
    });
    
    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 500, // $5.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });
    
    console.log(`✓ Pro tier created: ${proPrice.id}\n`);

    // Update plans.ts file
    console.log('Updating lib/plans.ts with new price IDs...');
    const plansPath = join(__dirname, '..', 'lib', 'plans.ts');
    const plansContent = `// Central definition of subscription plans used throughout the app.
// Each plan maps a friendly identifier to its Stripe price ID.
export const plans = {
  free: {
    name: "Free",
    priceId: "${freePrice.id}",
    displayName: "Start for Free",
  },
  pro: {
    name: "Pro",
    priceId: "${proPrice.id}",
    displayName: "Go Pro",
  },
} as const;

export type PlanKey = keyof typeof plans;
`;
    
    writeFileSync(plansPath, plansContent, 'utf-8');
    console.log('✓ lib/plans.ts updated successfully\n');

    console.log('='.repeat(60));
    console.log('Stripe setup complete!');
    console.log('='.repeat(60));
    console.log('\nPrice IDs:');
    console.log(`  Free: ${freePrice.id}`);
    console.log(`  Pro:  ${proPrice.id}`);
    console.log('\nThese have been automatically saved to lib/plans.ts');
    console.log('\nYou can now test the checkout flow!');
    
  } catch (error) {
    console.error('Error setting up Stripe products:', error.message);
    process.exit(1);
  }
}

setupStripeProducts();
