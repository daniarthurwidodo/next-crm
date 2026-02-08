
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

### Required Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT
JWT_SECRET=your_jwt_secret

# Email (Mailtrap for dev/test, production SMTP for prod)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password
SMTP_SECURE=false
EMAIL_FROM="Next CRM <noreply@nextcrm.com>"

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe (optional, for billing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Google OAuth (optional, for Drive integration)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

See [docs/EMAIL_SETUP.md](docs/EMAIL_SETUP.md) for detailed email configuration instructions.

## Database Setup

### Running Migrations

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run migrations in order:
   - `migrations/001_create_user_subscriptions.sql`
   - `migrations/002_create_users_view.sql`

Alternatively, copy the SQL from each migration file and paste it into the Supabase SQL Editor.

### What the migrations do
- **001**: Creates `user_subscriptions` table to store Stripe subscription data
- **002**: Creates a `users` view that combines `auth.users` with subscription data

## Project Structure
- `app/` – Next.js App Router pages
- `components/` – UI and landing page components
- `lib/` – Utilities and Supabase clients

## Scripts
- `bun run dev` – Start dev server
- `bun run build` – Build for production
- `bun run lint` – Lint code

## E2E tests (Playwright)
Run `bunx playwright test` (ensure the dev server is running on the configured base URL). Optional env vars: `E2E_TEST_USER` and `E2E_TEST_PASSWORD` for a pre-created test user; if unset, defaults `e2euser` / `e2epassword` are used for fixtures that need credentials.

## Deployment
Deploy on Vercel for best results. Configure environment variables for Supabase and Google OAuth.

## Contributing
Open issues or PRs for improvements. See PRD.md for roadmap and specs.

## Documentation
- **Docs folder:** `docs/` contains TODOs, specs, and team constitution.
- **Quick links:** [TODO docs](docs/TODO.md), [Specs](docs/SPECS.md), [Constitution](docs/CONSTITUTION.md), [Email Setup](docs/EMAIL_SETUP.md)

If you're updating features or tests, update the relevant docs in `docs/` and the PRD.
