import { db } from "@/lib/db";
import { userSubscriptions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { createLogger } from "../logger";

const logger = createLogger({ module: "subscription-repository" });

export interface SubscriptionData {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  subscriptionStatus: string;
  planName: string;
  currentPeriodEnd: Date;
}

export interface UpdateSubscriptionData {
  subscriptionStatus?: string;
  planName?: string;
  currentPeriodEnd?: Date;
  stripeSubscriptionId?: string;
}

/**
 * Create a new subscription record (upsert on stripe_customer_id)
 */
export async function createSubscription(data: SubscriptionData): Promise<void> {
  try {
    await db
      .insert(userSubscriptions)
      .values({
        userId: data.userId,
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        subscriptionStatus: data.subscriptionStatus,
        planName: data.planName,
        currentPeriodEnd: data.currentPeriodEnd,
      })
      .onConflictDoUpdate({
        target: userSubscriptions.stripeCustomerId,
        set: {
          stripeSubscriptionId: data.stripeSubscriptionId,
          subscriptionStatus: data.subscriptionStatus,
          planName: data.planName,
          currentPeriodEnd: data.currentPeriodEnd,
          updatedAt: sql`now()`,
        },
      });

    logger.info(
      { userId: data.userId, stripeCustomerId: data.stripeCustomerId, subscriptionStatus: data.subscriptionStatus },
      "Subscription created/updated"
    );
  } catch (error) {
    logger.error({ error, userId: data.userId, stripeCustomerId: data.stripeCustomerId }, "Failed to create subscription");
    throw error;
  }
}

/**
 * Update an existing subscription by Stripe customer ID
 */
export async function updateSubscription(
  stripeCustomerId: string,
  data: UpdateSubscriptionData
): Promise<void> {
  const updates: Record<string, unknown> = { updatedAt: sql`now()` };

  if (data.subscriptionStatus !== undefined) updates.subscriptionStatus = data.subscriptionStatus;
  if (data.planName !== undefined) updates.planName = data.planName;
  if (data.currentPeriodEnd !== undefined) updates.currentPeriodEnd = data.currentPeriodEnd;
  if (data.stripeSubscriptionId !== undefined) updates.stripeSubscriptionId = data.stripeSubscriptionId;

  // Only updatedAt -- nothing to do
  if (Object.keys(updates).length <= 1) return;

  try {
    await db
      .update(userSubscriptions)
      .set(updates)
      .where(eq(userSubscriptions.stripeCustomerId, stripeCustomerId));

    logger.info({ stripeCustomerId, updates: data }, "Subscription updated");
  } catch (error) {
    logger.error({ error, stripeCustomerId }, "Failed to update subscription");
    throw error;
  }
}

/**
 * Get subscription by Stripe customer ID
 */
export async function getSubscriptionByCustomerId(stripeCustomerId: string) {
  try {
    const rows = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.stripeCustomerId, stripeCustomerId))
      .limit(1);

    return rows[0] ?? null;
  } catch (error) {
    logger.error({ error, stripeCustomerId }, "Failed to get subscription by customer ID");
    throw error;
  }
}

/**
 * Get subscription by user ID
 */
export async function getSubscriptionByUserId(userId: string) {
  try {
    const rows = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .orderBy(sql`${userSubscriptions.createdAt} desc`)
      .limit(1);

    return rows[0] ?? null;
  } catch (error) {
    logger.error({ error, userId }, "Failed to get subscription by user ID");
    throw error;
  }
}

/**
 * Check if a subscription exists for a Stripe customer
 */
export async function subscriptionExists(stripeCustomerId: string): Promise<boolean> {
  try {
    const rows = await db
      .select({ id: userSubscriptions.id })
      .from(userSubscriptions)
      .where(eq(userSubscriptions.stripeCustomerId, stripeCustomerId))
      .limit(1);

    return rows.length > 0;
  } catch (error) {
    logger.error({ error, stripeCustomerId }, "Failed to check subscription existence");
    throw error;
  }
}

/**
 * Get subscription status by Stripe customer ID
 */
export async function getSubscriptionStatus(stripeCustomerId: string): Promise<string | null> {
  try {
    const rows = await db
      .select({ subscriptionStatus: userSubscriptions.subscriptionStatus })
      .from(userSubscriptions)
      .where(eq(userSubscriptions.stripeCustomerId, stripeCustomerId))
      .limit(1);

    return rows[0]?.subscriptionStatus ?? null;
  } catch (error) {
    logger.error({ error, stripeCustomerId }, "Failed to get subscription status");
    throw error;
  }
}
