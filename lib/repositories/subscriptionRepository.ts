import pool from "../db";
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
 * Create a new subscription record
 */
export async function createSubscription(data: SubscriptionData): Promise<void> {
  const { userId, stripeCustomerId, stripeSubscriptionId, subscriptionStatus, planName, currentPeriodEnd } = data;

  try {
    await pool.query(
      `INSERT INTO user_subscriptions 
        (user_id, stripe_customer_id, stripe_subscription_id, subscription_status, plan_name, current_period_end)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (stripe_customer_id) 
       DO UPDATE SET 
         stripe_subscription_id = EXCLUDED.stripe_subscription_id,
         subscription_status = EXCLUDED.subscription_status,
         plan_name = EXCLUDED.plan_name,
         current_period_end = EXCLUDED.current_period_end,
         updated_at = NOW()`,
      [userId, stripeCustomerId, stripeSubscriptionId, subscriptionStatus, planName, currentPeriodEnd]
    );
    
    logger.info({ userId, stripeCustomerId, subscriptionStatus }, "Subscription created/updated");
  } catch (error) {
    logger.error({ error, userId, stripeCustomerId }, "Failed to create subscription");
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
  const updateFields: string[] = [];
  const values: (string | Date)[] = [];
  let paramCount = 1;

  if (data.subscriptionStatus !== undefined) {
    updateFields.push(`subscription_status = $${paramCount++}`);
    values.push(data.subscriptionStatus);
  }

  if (data.planName !== undefined) {
    updateFields.push(`plan_name = $${paramCount++}`);
    values.push(data.planName);
  }

  if (data.currentPeriodEnd !== undefined) {
    updateFields.push(`current_period_end = $${paramCount++}`);
    values.push(data.currentPeriodEnd);
  }

  if (data.stripeSubscriptionId !== undefined) {
    updateFields.push(`stripe_subscription_id = $${paramCount++}`);
    values.push(data.stripeSubscriptionId);
  }

  if (updateFields.length === 0) {
    return;
  }

  updateFields.push(`updated_at = NOW()`);
  values.push(stripeCustomerId);

  try {
    await pool.query(
      `UPDATE user_subscriptions 
       SET ${updateFields.join(", ")}
       WHERE stripe_customer_id = $${paramCount}`,
      values
    );

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
    const result = await pool.query(
      `SELECT * FROM user_subscriptions WHERE stripe_customer_id = $1`,
      [stripeCustomerId]
    );

    return result.rows[0] || null;
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
    const result = await pool.query(
      `SELECT * FROM user_subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    return result.rows[0] || null;
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
    const result = await pool.query(
      `SELECT 1 FROM user_subscriptions WHERE stripe_customer_id = $1 LIMIT 1`,
      [stripeCustomerId]
    );

    return result.rows.length > 0;
  } catch (error) {
    logger.error({ error, stripeCustomerId }, "Failed to check subscription existence");
    throw error;
  }
}
