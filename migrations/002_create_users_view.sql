-- Migration: Create users view
-- Purpose: Expose auth.users alongside subscription/plan data for admin dashboard
-- Run this in your Supabase SQL Editor AFTER running 001_create_user_subscriptions.sql

-- Create a view that combines auth.users with user_subscriptions
CREATE OR REPLACE VIEW public.users AS
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.updated_at,
  au.email_confirmed_at,
  COALESCE(us.plan_name, 'free') AS plan,
  us.subscription_status,
  us.stripe_customer_id,
  us.stripe_subscription_id,
  us.current_period_end
FROM 
  auth.users au
LEFT JOIN 
  user_subscriptions us ON au.id = us.user_id;

-- Add comment
COMMENT ON VIEW public.users IS 'Combined view of auth users and their subscription data';

-- Grant access to authenticated users to view (adjust based on your RLS needs)
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;
