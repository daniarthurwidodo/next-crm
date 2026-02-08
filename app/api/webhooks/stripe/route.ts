import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createLogger } from "@/lib/logger";

const logger = createLogger({ module: "webhook", service: "stripe" });
import * as webhookService from "@/lib/services/stripeWebhookService";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Stripe webhook endpoint
 * Handles checkout completions, subscription updates, and payment events
 */
export async function POST(req: Request) {
  try {
    // Get the raw body as text for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      logger.error("Missing stripe-signature header");
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    if (!webhookSecret) {
      logger.error("STRIPE_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const error = err as Error;
      logger.error({ error: error.message }, "Webhook signature verification failed");
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${error.message}` },
        { status: 400 }
      );
    }

    logger.info({ type: event.type, id: event.id }, "Received webhook event");

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await webhookService.handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await webhookService.handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await webhookService.handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await webhookService.handlePaymentFailed(invoice);
        break;
      }

      default:
        logger.info({ type: event.type }, "Unhandled webhook event type");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const err = error as Error;
    logger.error({ error: err.message, stack: err.stack }, "Error processing webhook");
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
