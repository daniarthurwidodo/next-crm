import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { plans, type PlanKey } from "@/lib/plans";

/**
 * POST /api/stripe/create-checkout-session
 * Body: { plan: "free" | "pro" }
 * Returns: { url: string } – Stripe Checkout Session URL
 */
export async function POST(request: Request) {
  try {
    const { plan } = await request.json();
    // Validate plan key
    if (!plan || !(plan in plans)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const selectedPlan = plans[plan as PlanKey];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
      // Use environment variables or fallback URLs for success/cancel
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json({
      error: "Failed to create checkout session",
      details: errorMessage
    }, { status: 500 });
  }
}

