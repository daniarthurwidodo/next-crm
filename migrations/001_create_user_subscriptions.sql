-- Migration: Create user_subscriptions table
-- Purpose: Store Stripe subscription data linked to Supabase Auth users
-- Run this in your Supabase SQL Editor

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT,
  subscription_status TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on stripe_customer_id for fast lookups in webhooks
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer 
  ON user_subscriptions(stripe_customer_id);

-- Create index on user_id for fast user subscription queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id 
  ON user_subscriptions(user_id);

-- Create index on subscription_status for filtering active subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status 
  ON user_subscriptions(subscription_status);

-- Add comment to table
COMMENT ON TABLE user_subscriptions IS 'Stores Stripe subscription data linked to users';
COMMENT ON COLUMN user_subscriptions.stripe_customer_id IS 'Stripe customer ID (cus_...)';
COMMENT ON COLUMN user_subscriptions.stripe_subscription_id IS 'Stripe subscription ID (sub_...)';
COMMENT ON COLUMN user_subscriptions.subscription_status IS 'Stripe subscription status: active, canceled, past_due, etc.';
COMMENT ON COLUMN user_subscriptions.plan_name IS 'Plan name: free, pro, etc.';
COMMENT ON COLUMN user_subscriptions.current_period_end IS 'When the current billing period ends';

-- Optional: Enable Row Level Security (RLS) if you want users to query their own subscriptions
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" 
  ON user_subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Service role can do everything (for webhooks)
CREATE POLICY "Service role has full access" 
  ON user_subscriptions 
  FOR ALL 
  USING (auth.role() = 'service_role');
