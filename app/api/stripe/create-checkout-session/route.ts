import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { plans, type PlanKey } from "@/lib/plans";
import { withLogging } from "@/lib/middleware/logger";
import { createLogger } from "@/lib/logger";

const logger = createLogger({ module: 'api', route: 'stripe-checkout' });

/**
 * POST /api/stripe/create-checkout-session
 * Body: { plan: "free" | "pro" }
 * Returns: { url: string } – Stripe Checkout Session URL
 */
export async function POST(request: NextRequest) {
  return withLogging(request, async (req) => {
    try {
      const { plan } = await req.json();
      
      // Validate plan key
      if (!plan || !(plan in plans)) {
        logger.warn({ plan }, 'Invalid plan requested');
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }

      const selectedPlan = plans[plan as PlanKey];
      logger.info({ plan, priceId: selectedPlan.priceId }, 'Creating checkout session');

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
        // Allow Stripe to collect customer email for webhook processing
        customer_email: undefined, // Let Stripe's form collect the email
        // Add metadata to track which plan was selected
        metadata: {
          plan: plan,
        },
        // Allow promotion codes for discounts
        allow_promotion_codes: true,
        // Use environment variables or fallback URLs for success/cancel
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`,
      });

      logger.info({ plan, sessionId: session.id }, 'Checkout session created');
      return NextResponse.json({ url: session.url }, { status: 200 });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined }, 'Stripe checkout session error');
      const errorMessage = error instanceof Error ? error.message : "Failed to create checkout session";
      return NextResponse.json({
        error: "Failed to create checkout session",
        details: errorMessage
      }, { status: 500 });
    }
  });
}

