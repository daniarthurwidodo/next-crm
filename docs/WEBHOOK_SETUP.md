# Stripe Webhook Setup Guide

This guide explains how to set up and test Stripe webhooks for automatic user registration and subscription management.

## Overview

When a customer completes checkout:
1. Stripe sends webhook event to `/api/webhooks/stripe`
2. Webhook creates user account in Supabase (if doesn't exist)
3. Supabase sends password setup email automatically
4. Subscription data is stored in `user_subscriptions` table
5. User can login with their email and set password

## Database Setup

### Step 1: Run Migration

1. Go to your Supabase Dashboard → SQL Editor
2. Copy the contents of `migrations/001_create_user_subscriptions.sql`
3. Paste and execute the SQL
4. Verify the table was created: `SELECT * FROM user_subscriptions;`

This creates:
- `user_subscriptions` table with proper foreign keys
- Indexes for fast webhook processing
- Row Level Security policies

## Local Development Setup

### Step 1: Install Stripe CLI

```bash
# Windows (using Chocolatey)
choco install stripe-cli

# macOS
brew install stripe/stripe-cli/stripe

# Or download from https://stripe.com/docs/stripe-cli
```

### Step 2: Login to Stripe

```bash
stripe login
```

### Step 3: Forward Webhooks to Local Server

```bash
# Start your Next.js dev server first
bun dev

# In another terminal, forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This command will output a webhook signing secret like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### Step 4: Add Webhook Secret to Environment

Copy the webhook secret and add to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Important:** Restart your dev server after adding the secret!

### Step 5: Test Webhook

In another terminal, trigger a test checkout completion:

```bash
stripe trigger checkout.session.completed
```

You should see:
1. Logs in your Next.js terminal showing webhook processing
2. New user created in Supabase Auth
3. New record in `user_subscriptions` table
4. Password setup email sent (check Supabase logs)

## Production Setup

### Step 1: Deploy Your Application

Ensure your production app is deployed and accessible via HTTPS.

### Step 2: Add Webhook Endpoint in Stripe Dashboard

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click "Add endpoint"

### Step 3: Copy Webhook Signing Secret

1. Click on your new webhook endpoint
2. Click "Reveal" under "Signing secret"
3. Copy the secret (starts with `whsec_`)

### Step 4: Add to Production Environment

Add the webhook secret to your production environment variables:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

Make sure to redeploy after adding the secret.

### Step 5: Test Production Webhook

1. Complete a real test checkout using Stripe test mode cards:
   - Test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVC
2. Check Stripe Dashboard → Webhooks → Your endpoint → Events
3. Verify event was successfully received (200 response)
4. Check Supabase for new user and subscription

## Webhook Events Handled

### `checkout.session.completed`
- **Triggered:** When customer completes payment
- **Actions:**
  - Checks if user exists by email
  - Creates new Supabase user (if doesn't exist)
  - Stores subscription in `user_subscriptions` table
  - Sends password setup email via Supabase recovery link

### `customer.subscription.updated`
- **Triggered:** When subscription changes (upgrade, downgrade, renewal)
- **Actions:**
  - Updates subscription status
  - Updates billing period
  - Updates plan name

### `customer.subscription.deleted`
- **Triggered:** When subscription is canceled
- **Actions:**
  - Marks subscription as `canceled` in database
  - User retains access until end of billing period

### `invoice.payment_failed`
- **Triggered:** When payment fails (expired card, insufficient funds)
- **Actions:**
  - Marks subscription as `past_due`
  - Stripe automatically retries payment

## Testing Different Scenarios

### Test New User Registration

```bash
# Trigger checkout completion
stripe trigger checkout.session.completed

# Check logs
# - Should see "New user created from Stripe checkout"
# - Should see "Password setup link generated"

# Verify in Supabase
# - Check auth.users table for new user
# - Check user_subscriptions table for subscription
```

### Test Existing User Subscription

1. Create a user manually in Supabase first
2. Complete checkout with that user's email
3. Should link subscription to existing user without creating duplicate

### Test Subscription Update

```bash
# Trigger subscription update
stripe trigger customer.subscription.updated

# Check logs
# - Should see "Subscription updated successfully"
```

### Test Subscription Cancellation

```bash
# Trigger subscription deletion
stripe trigger customer.subscription.deleted

# Check logs
# - Should see "Subscription marked as canceled"
```

### Test Payment Failure

```bash
# Trigger payment failure
stripe trigger invoice.payment_failed

# Check logs
# - Should see "Subscription marked as past_due"
```

## Verifying Setup

### Check Webhook Logs

In your application logs, look for:

```
✓ Received webhook event: checkout.session.completed
✓ New user created from Stripe checkout
✓ Password setup link generated
✓ Subscription created/updated
✓ Checkout completed successfully
```

### Check Supabase

**Auth Users:**
```sql
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

**Subscriptions:**
```sql
SELECT 
  us.id,
  u.email,
  us.stripe_customer_id,
  us.subscription_status,
  us.plan_name,
  us.current_period_end
FROM user_subscriptions us
JOIN auth.users u ON us.user_id = u.id
ORDER BY us.created_at DESC;
```

### Check Stripe Dashboard

1. Go to Customers → Find customer by email
2. Verify subscription is active
3. Check webhook logs for successful deliveries

## Troubleshooting

### Webhook Signature Verification Failed

**Error:** `Webhook signature verification failed`

**Solutions:**
1. Check `STRIPE_WEBHOOK_SECRET` is correct in `.env.local`
2. Restart dev server after adding secret
3. For local testing, use webhook secret from `stripe listen` command
4. For production, use secret from Stripe Dashboard

### User Not Created

**Error:** `Failed to create user`

**Solutions:**
1. Check `SUPABASE_SERVICE_ROLE_KEY` is set correctly
2. Verify Supabase URL is correct
3. Check Supabase logs for auth errors
4. Ensure user doesn't already exist with that email

### Email Not Sent

**Error:** `Failed to generate password setup link`

**Solutions:**
1. Check Supabase Email settings are configured
2. Verify email templates are set up in Supabase Dashboard
3. Check Supabase logs for email sending errors
4. For development, check Supabase → Authentication → Email Templates

### Database Error

**Error:** `relation "user_subscriptions" does not exist`

**Solutions:**
1. Run the migration in `migrations/001_create_user_subscriptions.sql`
2. Verify table exists: `SELECT * FROM user_subscriptions LIMIT 1;`
3. Check database connection string is correct

### Webhook Not Receiving Events

**Solutions:**
1. **Local:** Ensure `stripe listen` is running
2. **Production:** Check webhook endpoint URL is correct (HTTPS)
3. Check Stripe Dashboard → Webhooks for delivery attempts
4. Verify your server is publicly accessible (for production)
5. Check firewall/security group settings

## Password Setup Email Configuration

The recovery email is automatically sent by Supabase. To customize:

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Select "Change Email Address (Password Recovery)"
3. Customize the email template
4. Use variables: `{{ .ConfirmationURL }}`, `{{ .SiteURL }}`, etc.

Example template:
```html
<h2>Set Your Password</h2>
<p>Thanks for subscribing! Click the link below to set your password:</p>
<p><a href="{{ .ConfirmationURL }}">Set Password</a></p>
```

## Security Considerations

1. **Never commit secrets:** Keep `.env.local` in `.gitignore`
2. **Use HTTPS in production:** Webhooks require HTTPS
3. **Verify signatures:** Always verify webhook signatures (handled automatically)
4. **Service role key:** Keep `SUPABASE_SERVICE_ROLE_KEY` secret - it bypasses RLS
5. **Idempotency:** Webhook handlers use `ON CONFLICT` to handle duplicate events

## Next Steps

After webhooks are working:

1. **Add user dashboard:** Display subscription status and billing info
2. **Handle plan upgrades:** Allow users to change plans
3. **Implement access control:** Use subscription status to gate features
4. **Add customer portal:** Use Stripe Customer Portal for self-service
5. **Monitor webhooks:** Set up alerts for failed webhook deliveries

## Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
