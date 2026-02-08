import Stripe from "stripe";
import { SupabaseClient } from "@supabase/supabase-js";
import supabaseService from "../supabase/service";
import { createLogger } from "../logger";
import {
  sendWelcomeEmail,
  sendSubscriptionConfirmed,
  sendPaymentFailed,
  sendSubscriptionCancelled,
} from "./emailService";

const logger = createLogger({ module: "stripe-webhook-service" });
import * as subscriptionRepo from "../repositories/subscriptionRepository";

// Type assertion for supabaseService
const supabase = supabaseService as SupabaseClient;

/**
 * Handle checkout.session.completed event
 * Creates a user if they don't exist and stores subscription data
 */
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const email = session.customer_email;
  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  if (!email) {
    logger.error({ sessionId: session.id }, "No email found in checkout session");
    throw new Error("Email is required in checkout session");
  }

  if (!stripeCustomerId) {
    logger.error({ sessionId: session.id }, "No customer ID found in checkout session");
    throw new Error("Customer ID is required");
  }

  logger.info({ email, stripeCustomerId, sessionId: session.id }, "Processing checkout completion");

  try {
    // Check if user already exists by email
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(
      (u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase()
    );

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      userId = existingUser.id;
      logger.info({ email, userId }, "User already exists, linking subscription");
    } else {
      // Create new user without password
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          created_via: "stripe_checkout",
          stripe_customer_id: stripeCustomerId,
        },
      });

      if (createError || !newUser.user) {
        logger.error({ error: createError, email }, "Failed to create user");
        throw createError || new Error("Failed to create user");
      }

      userId = newUser.user.id;
      isNewUser = true;
      logger.info({ email, userId }, "New user created from Stripe checkout");
    }

    // Get plan name from metadata or line items
    const planName = getPlanNameFromSession(session);

    // Store subscription data
    await subscriptionRepo.createSubscription({
      userId,
      stripeCustomerId,
      stripeSubscriptionId: stripeSubscriptionId || "",
      subscriptionStatus: "active",
      planName,
      currentPeriodEnd: session.expires_at
        ? new Date(session.expires_at * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days from now
    });

    // Send welcome email for new users (non-blocking)
    if (isNewUser) {
      sendWelcomeEmail(email, email.split('@')[0]).catch((error) => {
        logger.error({ email, error }, 'Failed to send welcome email');
      });
    }

    // Send subscription confirmation email (non-blocking)
    const amount = session.amount_total || 0;
    sendSubscriptionConfirmed(email, planName, amount).catch((error) => {
      logger.error({ email, error }, 'Failed to send subscription confirmation');
    });

    logger.info(
      { userId, email, stripeCustomerId, planName, isNewUser },
      "Checkout completed successfully"
    );
  } catch (error) {
    logger.error({ error, email, stripeCustomerId }, "Error handling checkout completion");
    throw error;
  }
}

/**
 * Handle customer.subscription.updated event
 * Updates subscription status and billing period
 */
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const stripeCustomerId = subscription.customer as string;
  const status = subscription.status;
  // Stripe Subscription has current_period_end but TypeScript may not recognize it
  const currentPeriodEnd = new Date((subscription as Stripe.Subscription & { current_period_end: number }).current_period_end * 1000);

  logger.info(
    { stripeCustomerId, subscriptionId: subscription.id, status },
    "Processing subscription update"
  );

  try {
    // Check if subscription exists
    const exists = await subscriptionRepo.subscriptionExists(stripeCustomerId);

    if (!exists) {
      logger.warn(
        { stripeCustomerId, subscriptionId: subscription.id },
        "Subscription not found for update, skipping"
      );
      return;
    }

    // Get plan name from subscription items
    const planName = subscription.items.data[0]?.price.nickname || "unknown";

    await subscriptionRepo.updateSubscription(stripeCustomerId, {
      subscriptionStatus: status,
      planName,
      currentPeriodEnd,
      stripeSubscriptionId: subscription.id,
    });

    // Send email notification for subscription changes (upgrade/downgrade)
    const previousStatus = await subscriptionRepo.getSubscriptionStatus(stripeCustomerId);
    if (previousStatus && previousStatus !== status && status === 'active') {
      const userEmail = await getUserEmailByCustomerId(stripeCustomerId);
      if (userEmail) {
        const amount = subscription.items.data[0]?.price.unit_amount || 0;
        sendSubscriptionConfirmed(userEmail, planName, amount).catch((error) => {
          logger.error({ userEmail, error }, 'Failed to send subscription update email');
        });
      }
    }

    logger.info(
      { stripeCustomerId, status, planName },
      "Subscription updated successfully"
    );
  } catch (error) {
    logger.error(
      { error, stripeCustomerId, subscriptionId: subscription.id },
      "Error handling subscription update"
    );
    throw error;
  }
}

/**
 * Handle customer.subscription.deleted event
 * Marks subscription as canceled
 */
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripeCustomerId = subscription.customer as string;

  logger.info(
    { stripeCustomerId, subscriptionId: subscription.id },
    "Processing subscription deletion"
  );

  try {
    const exists = await subscriptionRepo.subscriptionExists(stripeCustomerId);

    if (!exists) {
      logger.warn(
        { stripeCustomerId, subscriptionId: subscription.id },
        "Subscription not found for deletion, skipping"
      );
      return;
    }

    await subscriptionRepo.updateSubscription(stripeCustomerId, {
      subscriptionStatus: "canceled",
    });

    // Send cancellation confirmation email (non-blocking)
    const userEmail = await getUserEmailByCustomerId(stripeCustomerId);
    if (userEmail) {
      const planName = subscription.items.data[0]?.price.nickname || "unknown";
      const endDate = new Date((subscription as Stripe.Subscription & { current_period_end: number }).current_period_end * 1000);
      sendSubscriptionCancelled(userEmail, planName, endDate).catch((error) => {
        logger.error({ userEmail, error }, 'Failed to send cancellation email');
      });
    }

    logger.info({ stripeCustomerId }, "Subscription marked as canceled");
  } catch (error) {
    logger.error(
      { error, stripeCustomerId, subscriptionId: subscription.id },
      "Error handling subscription deletion"
    );
    throw error;
  }
}

/**
 * Handle invoice.payment_failed event
 * Updates subscription status to reflect payment issues
 */
export async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const stripeCustomerId = invoice.customer as string;

  logger.warn(
    { stripeCustomerId, invoiceId: invoice.id },
    "Processing payment failure"
  );

  try {
    const exists = await subscriptionRepo.subscriptionExists(stripeCustomerId);

    if (!exists) {
      logger.warn(
        { stripeCustomerId, invoiceId: invoice.id },
        "Subscription not found for payment failure, skipping"
      );
      return;
    }

    await subscriptionRepo.updateSubscription(stripeCustomerId, {
      subscriptionStatus: "past_due",
    });

    // Send payment failure notification (non-blocking)
    const userEmail = await getUserEmailByCustomerId(stripeCustomerId);
    if (userEmail) {
      const planName = invoice.lines.data[0]?.description || "your subscription";
      const retryDate = invoice.next_payment_attempt 
        ? new Date(invoice.next_payment_attempt * 1000) 
        : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // Default 3 days
      sendPaymentFailed(userEmail, planName, retryDate).catch((error) => {
        logger.error({ userEmail, error }, 'Failed to send payment failure email');
      });
    }

    logger.info({ stripeCustomerId }, "Subscription marked as past_due");
  } catch (error) {
    logger.error(
      { error, stripeCustomerId, invoiceId: invoice.id },
      "Error handling payment failure"
    );
    throw error;
  }
}

/**
 * Get user email by Stripe customer ID
 */
async function getUserEmailByCustomerId(stripeCustomerId: string): Promise<string | null> {
  try {
    const subscription = await subscriptionRepo.getSubscriptionByCustomerId(stripeCustomerId);
    if (!subscription?.userId) {
      logger.warn({ stripeCustomerId }, 'User not found for customer ID');
      return null;
    }

    const { data: user, error } = await supabase.auth.admin.getUserById(subscription.userId);
    if (error || !user?.user?.email) {
      logger.error({ error, userId: subscription.userId }, 'Failed to get user email');
      return null;
    }

    return user.user.email;
  } catch (error) {
    logger.error({ error, stripeCustomerId }, 'Error getting user email');
    return null;
  }
}

/**
 * Extract plan name from checkout session
 */
function getPlanNameFromSession(session: Stripe.Checkout.Session): string {
  // Try to get from metadata first
  if (session.metadata?.plan) {
    return session.metadata.plan;
  }

  // Try to get from line items (if expanded)
  if (session.line_items?.data?.[0]?.description) {
    return session.line_items.data[0].description;
  }

  // Default fallback
  return "pro";
}
