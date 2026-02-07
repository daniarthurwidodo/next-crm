
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
3. Set up environment variables for Supabase and Google OAuth
4. Run dev server: `bun run dev`

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
