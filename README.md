
# File2Drive

Send any file to your Google Drive using a simple shortcode. Share your unique link, and anyone can upload files directly to your Drive.

## Features
- Unique shortcode for each user
- Public upload page
- Free ($0, 5GB/100 files) and Pro ($5/month, unlimited) plans
- Google Drive integration (OAuth2)
- Dashboard for uploads and settings
- Built with Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, Supabase

## Getting Started
1. Clone the repo
2. Install dependencies: `bun install`
3. Set up environment variables for Supabase, Google OAuth, and email (see below)
4. Run database migrations (see Database Setup below)
5. Run dev server: `bun run dev`

## Environment Variables

Create a `.env.local` file in the project root with the following variables:
# File2Drive (next-crm)

File2Drive lets people upload files directly into a user's Google Drive via a short, shareable shortcode. This repository contains the web app (Next.js) and backend integrations (Supabase + Stripe).

## Highlights
- Shortcode-based public upload pages
- Uploads stored in the user's Google Drive via OAuth2
- Free tier and paid subscriptions (Stripe)
- Dashboard for managing uploads and settings
- Built with Next.js 16, React 19, Tailwind CSS 4, `shadcn/ui`, and Supabase

## Quickstart
1. Clone the repo
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` in the project root (see required variables below)
4. Run database migrations (see Database Setup)
5. Start dev server:

```bash
npm run dev
```

## Environment Variables
Create a `.env.local` file with the values your environment requires. Common variables used by the app:

### Core / Required
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT
JWT_SECRET=your_jwt_secret

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Email (dev / prod)
```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
SMTP_SECURE=false
EMAIL_FROM="Next CRM <noreply@nextcrm.com>"
```

### Billing / OAuth (optional)
```bash
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Google OAuth (if using Drive integration)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

See `docs/EMAIL_SETUP.md` for detailed email configuration and `docs/STRIPE_SETUP.md` for Stripe tips.

## Database Setup
This repo includes SQL and migration helpers. You can run migrations manually (paste SQL into your Postgres/Supabase SQL editor) or use `drizzle-kit` if you prefer automated migrations.

Basic steps:
1. Inspect SQL files in `migrations/` and `drizzle/` and apply them to your database in order.
2. Confirm the `users` and `user_subscriptions` tables/views exist and that the auth provider is configured.

If you use `drizzle-kit`, run the migrate command that's compatible with your configuration (check `drizzle.config.ts`).

## Project Structure
- `app/` — Next.js App Router pages and routes
- `components/` — UI and landing components
- `lib/` — utilities, controllers, and service integrations
- `docs/` — project documentation, specs, and runbooks

## Scripts
- `npm run dev` — Start development server (Next.js)
- `npm run build` — Build for production
- `npm run start` — Run production server
- `npm run lint` — Run ESLint

## E2E tests (Playwright)
Start the dev server, then run:

```bash
npx playwright test
```

Optional env vars for test fixtures: `E2E_TEST_USER` and `E2E_TEST_PASSWORD`.

## Deployment
Vercel is the recommended platform for this Next.js app. Ensure environment variables are set in the deployment environment and that any webhooks (Stripe) are configured with appropriate publicly reachable endpoints.

## Contributing
- Open issues for bugs or feature requests
- Send PRs with changes and link related docs in `docs/`

## Docs
- Core documentation lives in `docs/` (PRD, specs, TODOs, runbooks)
- See `docs/SPECS.md` and `docs/TODO.md` for work in progress and acceptance criteria

## Style Guide
See `docs/styles.md` for UI conventions and component patterns.
