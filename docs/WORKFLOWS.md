# Workflow Diagrams

This document provides detailed sequence diagrams for the authentication and subscription workflows in the Next.js CRM application.

## Table of Contents

1. [Login Workflow](#login-workflow)
2. [Registration Workflow](#registration-workflow)
3. [Subscription Workflow](#subscription-workflow)

---

## Login Workflow

The login process authenticates users through Supabase Auth and issues JWT tokens for session management.

```mermaid
sequenceDiagram
    actor User
    participant UI as Login Page<br/>(app/dashboard/login/page.tsx)
    participant API as API Route<br/>(app/api/login/route.ts)
    participant Logger as Logging Middleware<br/>(lib/middleware/logger.ts)
    participant Controller as Login Controller<br/>(lib/controllers/loginController.ts)
    participant Service as Login Service<br/>(lib/services/loginService.ts)
    participant Supabase as Supabase Auth<br/>(auth.users)
    participant JWT as JWT Utils<br/>(lib/utils/auth.ts)
    participant Dashboard as Dashboard<br/>(app/dashboard/page.tsx)

    User->>UI: Enter username & password
    UI->>API: POST /api/login<br/>{username, password}
    
    API->>Logger: withLogging(request, handler)
    Logger->>Logger: Log request details
    
    API->>Controller: loginController(username, password)
    
    alt Missing credentials
        Controller-->>API: {error: "Missing credentials"}<br/>Status 400
        API-->>UI: Error response
        UI-->>User: Show error message
    else Valid input
        Controller->>Service: loginService(username, password)
        
        Note over Service: Transform username to email<br/>If no "@", append "@local.invalid"
        Service->>Service: email = username.includes("@")<br/>? username<br/>: `${username}@local.invalid`
        
        Service->>Supabase: signInWithPassword({email, password})
        
        alt Invalid credentials
            Supabase-->>Service: Authentication failed
            Service-->>Controller: {error: "Invalid credentials"}<br/>Status 401
            Controller-->>API: Error response
            API-->>Logger: Log error
            Logger-->>API: Return logged response
            API-->>UI: {error: "Invalid credentials"}
            UI-->>User: Show error message
        else Valid credentials
            Supabase-->>Service: {data: {user}, error: null}
            
            Service->>JWT: generateToken(username)
            Note over JWT: Create JWT with 7-day expiry<br/>Secret: JWT_SECRET<br/>Payload: {username}
            JWT-->>Service: token (JWT string)
            
            Service-->>Controller: {success: true, token}
            Controller-->>API: {success: true, token}
            API-->>Logger: Log success (redact token)
            Logger-->>API: Return logged response
            API-->>UI: {success: true, token}<br/>Status 200
            
            UI->>UI: Set cookie: token={token}; path=/;
            UI->>Dashboard: Navigate to /dashboard
            Dashboard->>Dashboard: Verify JWT from cookie
            Dashboard-->>User: Show dashboard
        end
    end
```

**Key Points:**
- Username accepts both email format or plain text (converts to `username@local.invalid`)
- Supabase handles password verification
- JWT tokens expire after 7 days
- All requests/responses logged via middleware (sensitive data redacted)
- No subscription check during login

---

## Registration Workflow

The registration process creates new user accounts in Supabase and sends welcome emails (non-blocking).

```mermaid
sequenceDiagram
    actor User
    participant UI as Register Page<br/>(app/dashboard/register/page.tsx)
    participant API as API Route<br/>(app/api/register/route.ts)
    participant Logger as Logging Middleware<br/>(lib/middleware/logger.ts)
    participant Controller as Register Controller<br/>(lib/controllers/registerController.ts)
    participant Service as Register Service<br/>(lib/services/registerService.ts)
    participant Auth as Auth Utils<br/>(lib/utils/auth.ts)
    participant Supabase as Supabase Auth<br/>(auth.users)
    participant JWT as JWT Utils<br/>(lib/utils/auth.ts)
    participant Email as Email Service<br/>(lib/services/emailService.ts)
    participant Dashboard as Dashboard<br/>(app/dashboard/page.tsx)

    User->>UI: Enter username & password
    UI->>API: POST /api/register<br/>{username, password}
    
    API->>Logger: withLogging(request, handler)
    Logger->>Logger: Log request details
    
    API->>Controller: registerController(username, password)
    
    alt Missing credentials
        Controller-->>API: {error: "Missing credentials"}<br/>Status 400
        API-->>UI: Error response
        UI-->>User: Show error message
    else Valid input
        Controller->>Service: registerService(username, password)
        
        Note over Service: Transform username to email<br/>If no "@", append "@local.invalid"
        Service->>Service: email = username.includes("@")<br/>? username<br/>: `${username}@local.invalid`
        
        Service->>Auth: hashPassword(password)
        Note over Auth: Simple Base64 encoding<br/>(demo only - not production secure)
        Auth-->>Service: passwordHash
        
        Service->>Supabase: admin.createUser({<br/>  email,<br/>  password,<br/>  email_confirm: true,<br/>  user_metadata: {<br/>    username,<br/>    password_hash,<br/>    created_via: "registration"<br/>  }<br/>})
        
        alt User already exists
            Supabase-->>Service: Error: duplicate/unique constraint
            Service-->>Controller: {error: "User already exists"}<br/>Status 409
            Controller-->>API: Error response
            API-->>Logger: Log error
            Logger-->>API: Return logged response
            API-->>UI: {error: "User already exists"}
            UI-->>User: Show error message
        else User created successfully
            Supabase-->>Service: {data: {user}, error: null}
            
            Service->>JWT: generateToken(username)
            Note over JWT: Create JWT with 7-day expiry<br/>Secret: JWT_SECRET<br/>Payload: {username}
            JWT-->>Service: token (JWT string)
            
            Note over Service: Send welcome email (non-blocking)<br/>Failures don't block registration
            Service->>Email: sendWelcomeEmail(email, username)
            Email->>Email: Create SMTP transport<br/>Retry up to 3 attempts
            Email-->>Service: (async, no wait)
            
            Service-->>Controller: {success: true, token}
            Controller-->>API: {success: true, token}<br/>Status 201
            API-->>Logger: Log success (redact token)
            Logger-->>API: Return logged response
            API-->>UI: {success: true, token}
            
            UI->>UI: Set cookie: token={token}; path=/;
            UI->>Dashboard: Navigate to /dashboard
            Dashboard->>Dashboard: Verify JWT from cookie
            Dashboard-->>User: Show dashboard
        end
    end
    
    Note over Email,User: Email sent asynchronously<br/>(may arrive after redirect)
```

**Key Points:**
- Auto-confirms email (`email_confirm: true`) - no verification required
- Password stored securely by Supabase, hash in metadata is for demo
- Welcome email failures don't block registration (`.catch()` handler)
- No subscription record created - registration and subscriptions are decoupled
- User can register and access dashboard without subscribing

---

## Subscription Workflow

The subscription system integrates Stripe for payment processing, with webhooks managing subscription lifecycle events.

### Part A: Checkout Flow

```mermaid
sequenceDiagram
    actor User
    participant Landing as Landing Page<br/>(app/page.tsx)
    participant Pricing as Pricing Component<br/>(components/landing/pricing.tsx)
    participant Plans as Plans Config<br/>(lib/plans.ts)
    participant Checkout as Checkout Page<br/>(app/checkout/[plan]/page.tsx)
    participant API as Create Session API<br/>(app/api/stripe/create-checkout-session/route.ts)
    participant Stripe as Stripe API<br/>(stripe.checkout.sessions)
    participant StripePage as Stripe Checkout Page<br/>(stripe-hosted)

    User->>Landing: Visit homepage
    Landing->>Pricing: Render pricing tiers
    
    Note over Pricing,Plans: Plans: free (price_1Sy...), pro (price_1Sy...)
    
    User->>Pricing: Click "Go Pro" or "Start for Free"
    Pricing->>Checkout: Navigate to /checkout/{plan}
    
    Note over Checkout: Auto-execute on mount
    Checkout->>API: POST /api/stripe/create-checkout-session<br/>{plan: "free" | "pro"}
    
    API->>Plans: Validate plan exists in plans object
    
    alt Invalid plan
        API-->>Checkout: {error: "Invalid plan"}<br/>Status 400
        Checkout-->>User: Show error message
    else Valid plan
        API->>Stripe: stripe.checkout.sessions.create({<br/>  payment_method_types: ["card"],<br/>  mode: "subscription",<br/>  line_items: [{<br/>    price: selectedPlan.priceId,<br/>    quantity: 1<br/>  }],<br/>  metadata: { plan },<br/>  allow_promotion_codes: true,<br/>  success_url: "/dashboard?session_id={CHECKOUT_SESSION_ID}",<br/>  cancel_url: "/pricing"<br/>})
        
        Stripe-->>API: {id: "cs_...", url: "https://checkout.stripe.com/..."}
        API-->>Checkout: {url: session.url}<br/>Status 200
        
        Checkout->>StripePage: window.location.href = session.url
        StripePage-->>User: Show Stripe checkout form
        
        User->>StripePage: Enter email & payment details
        User->>StripePage: Complete payment
        
        Note over StripePage,Stripe: Stripe processes payment<br/>Creates customer & subscription
    end
```

### Part B: Webhook Processing (Checkout Completed)

```mermaid
sequenceDiagram
    participant Stripe as Stripe
    participant Webhook as Webhook API<br/>(app/api/webhooks/stripe/route.ts)
    participant Service as Webhook Service<br/>(lib/services/stripeWebhookService.ts)
    participant Supabase as Supabase Auth<br/>(auth.users)
    participant Repo as Subscription Repository<br/>(lib/repositories/subscriptionRepository.ts)
    participant DB as PostgreSQL<br/>(user_subscriptions)
    participant Email as Email Service<br/>(lib/services/emailService.ts)
    participant User as User Browser

    Stripe->>Webhook: POST /api/webhooks/stripe<br/>Event: checkout.session.completed
    
    Note over Webhook: Verify webhook signature<br/>using STRIPE_WEBHOOK_SECRET
    
    Webhook->>Webhook: stripe.webhooks.constructEvent(<br/>  body, signature, secret<br/>)
    
    alt Invalid signature
        Webhook-->>Stripe: Status 400 (Invalid signature)
    else Valid signature
        Webhook->>Service: handleCheckoutCompleted(session)
        
        Service->>Service: Extract data:<br/>- customer_email<br/>- stripeCustomerId (cus_...)<br/>- stripeSubscriptionId (sub_...)<br/>- plan from metadata
        
        Service->>Supabase: auth.admin.listUsers()
        Service->>Service: Filter users by email
        
        alt User exists
            Note over Service: Link subscription to existing user
        else User does NOT exist
            Service->>Supabase: auth.admin.createUser({<br/>  email: customer_email,<br/>  email_confirm: true,<br/>  user_metadata: {<br/>    created_via: "stripe_checkout",<br/>    stripe_customer_id: stripeCustomerId<br/>  }<br/>})
            Supabase-->>Service: {data: {user: {id: userId}}}
        end
        
        Service->>Service: Extract subscription details:<br/>- status: "active"<br/>- currentPeriodEnd<br/>- planName
        
        Service->>Repo: createSubscription({<br/>  userId,<br/>  stripeCustomerId,<br/>  stripeSubscriptionId,<br/>  subscriptionStatus: "active",<br/>  planName,<br/>  currentPeriodEnd<br/>})
        
        Repo->>DB: INSERT INTO user_subscriptions<br/>ON CONFLICT (stripe_customer_id)<br/>DO UPDATE SET ...<br/>(upsert to prevent duplicates)
        
        DB-->>Repo: Subscription created/updated
        Repo-->>Service: Success
        
        Note over Service: Send emails (non-blocking)<br/>Failures don't block webhook
        
        Service->>Email: sendWelcomeEmail(email, username)<br/>(if new user)
        Service->>Email: sendSubscriptionConfirmed(email, planName, amount)
        
        Email->>Email: Send via SMTP with retry logic
        Email-->>Service: (async, no wait)
        
        Service-->>Webhook: Success (200)
        Webhook-->>Stripe: Status 200
    end
    
    Note over Stripe,User: User redirected to:<br/>/dashboard?session_id={CHECKOUT_SESSION_ID}
    
    Stripe->>User: Redirect to success_url
```

### Part C: Subscription Lifecycle Events

```mermaid
sequenceDiagram
    participant Stripe as Stripe
    participant Webhook as Webhook API<br/>(app/api/webhooks/stripe/route.ts)
    participant Service as Webhook Service<br/>(lib/services/stripeWebhookService.ts)
    participant Repo as Subscription Repository<br/>(lib/repositories/subscriptionRepository.ts)
    participant DB as PostgreSQL<br/>(user_subscriptions)
    participant Email as Email Service<br/>(lib/services/emailService.ts)

    Note over Stripe,Email: Event: customer.subscription.updated

    Stripe->>Webhook: POST /api/webhooks/stripe<br/>Event: customer.subscription.updated
    Webhook->>Webhook: Verify signature
    Webhook->>Service: handleSubscriptionUpdated(subscription)
    
    Service->>Repo: subscriptionExists(stripeCustomerId)
    Repo->>DB: SELECT FROM user_subscriptions<br/>WHERE stripe_customer_id = $1
    DB-->>Repo: Subscription record or null
    Repo-->>Service: exists: boolean
    
    alt Subscription not found
        Service-->>Webhook: Log warning, return 200
    else Subscription exists
        Service->>Service: Extract plan name from<br/>subscription.items.data[0].price.nickname
        
        Service->>Repo: updateSubscription(stripeCustomerId, {<br/>  subscriptionStatus,<br/>  planName,<br/>  currentPeriodEnd,<br/>  stripeSubscriptionId<br/>})
        
        Repo->>DB: UPDATE user_subscriptions<br/>SET ..., updated_at = NOW()<br/>WHERE stripe_customer_id = $1
        DB-->>Repo: Updated
        Repo-->>Service: Success
        
        alt Status changed to "active"
            Service->>Email: sendSubscriptionConfirmed(email, planName, amount)
            Email-->>Service: (async, no wait)
        end
        
        Service-->>Webhook: Success (200)
    end
    Webhook-->>Stripe: Status 200

    Note over Stripe,Email: Event: customer.subscription.deleted

    Stripe->>Webhook: POST /api/webhooks/stripe<br/>Event: customer.subscription.deleted
    Webhook->>Webhook: Verify signature
    Webhook->>Service: handleSubscriptionDeleted(subscription)
    
    Service->>Repo: subscriptionExists(stripeCustomerId)
    Repo->>DB: SELECT FROM user_subscriptions
    DB-->>Repo: Subscription record
    Repo-->>Service: exists: true
    
    Service->>Repo: updateSubscription(stripeCustomerId, {<br/>  subscriptionStatus: "canceled"<br/>})
    
    Repo->>DB: UPDATE user_subscriptions<br/>SET subscription_status = 'canceled'
    DB-->>Repo: Updated
    Repo-->>Service: Success
    
    Service->>Email: sendSubscriptionCancelled(email, planName, endDate)
    Email-->>Service: (async, no wait)
    
    Service-->>Webhook: Success (200)
    Webhook-->>Stripe: Status 200

    Note over Stripe,Email: Event: invoice.payment_failed

    Stripe->>Webhook: POST /api/webhooks/stripe<br/>Event: invoice.payment_failed
    Webhook->>Webhook: Verify signature
    Webhook->>Service: handlePaymentFailed(invoice)
    
    Service->>Repo: subscriptionExists(stripeCustomerId)
    Repo->>DB: SELECT FROM user_subscriptions
    DB-->>Repo: Subscription record
    Repo-->>Service: exists: true
    
    Service->>Repo: updateSubscription(stripeCustomerId, {<br/>  subscriptionStatus: "past_due"<br/>})
    
    Repo->>DB: UPDATE user_subscriptions<br/>SET subscription_status = 'past_due'
    DB-->>Repo: Updated
    Repo-->>Service: Success
    
    Service->>Email: sendPaymentFailed(email, planName, retryDate)
    Email-->>Service: (async, no wait)
    
    Service-->>Webhook: Success (200)
    Webhook-->>Stripe: Status 200
```

**Key Points:**
- **Decoupled Architecture:** Registration and subscriptions are independent
- **Email Matching:** Stripe checkout email links subscriptions to existing users
- **User Creation:** New users auto-created during checkout if email doesn't exist
- **Upsert Logic:** Prevents duplicate subscriptions (by `stripe_customer_id`)
- **Non-Blocking Emails:** All email operations use `.catch()` - never fail webhooks
- **Webhook Idempotency:** Safe to replay events (upserts and last-write-wins updates)
- **Status Transitions:** active → past_due (payment failed) → canceled
- **No Auth Check:** Dashboard currently doesn't verify subscription status (gap)

---

## Integration Summary

### Authentication Flow
- **Storage:** Supabase Auth (`auth.users` table)
- **Session:** JWT tokens (7-day expiry, stored in cookies)
- **Verification:** `verifyJWT()` in dashboard pages

### Subscription Flow
- **Payment:** Stripe Checkout (subscription mode)
- **Storage:** PostgreSQL `user_subscriptions` table (via repository pattern)
- **Events:** Real-time webhooks for lifecycle management
- **Linking:** Email-based matching between Stripe and Supabase users

### External Services
- **Supabase:** User authentication and management
- **Stripe:** Payment processing and subscription management
- **PostgreSQL:** Subscription data storage (separate from Supabase tables)
- **SMTP:** Email notifications (nodemailer with retry logic)

### Critical Gap
⚠️ **No subscription verification in dashboard:** Users can access dashboard regardless of subscription status. Consider adding subscription checks in [app/dashboard/page.tsx](app/dashboard/page.tsx) or middleware.

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJ...

# JWT
JWT_SECRET=your-secret-key

# Database (PostgreSQL connection for subscriptions)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (SMTP)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-username
SMTP_PASS=your-password
EMAIL_FROM=noreply@yourapp.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Database Schema

### `user_subscriptions` Table

```sql
CREATE TABLE user_subscriptions (
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

CREATE INDEX idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(subscription_status);
```

### Row Level Security (RLS)

```sql
-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role has full access (for webhooks)
```
