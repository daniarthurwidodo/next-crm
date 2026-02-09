# Product Requirements Document (PRD)

## Product: next-crm (File2Drive-style upload to Google Drive)

### Summary
next-crm provides shortcode-based public upload pages so third parties can upload files directly to a user's Google Drive. The product is designed for quick sharing, team collection points, and lightweight intake flows.

### Problem
Sharing upload flows is fragmented: users must create folders, share Drive links, or rely on third‑party storage. A shortcode + OAuth2 flow simplifies uploads and centralizes files in the user's Drive.

### Target Users
- Individuals who need simple one-off uploads
- Small teams and educators who collect files from multiple contributors

### Key Use Cases
- Share a shortcode to collect photos or files from non-technical contributors
- Teachers collecting student submissions without requiring Drive access
- Teams aggregating documents into a single owner Drive

### Core Features
- Shortcode per user and public upload page
- OAuth2-based Google Drive uploads scoped per-user
- User dashboard for viewing uploads and managing settings
- Email notifications on new uploads (optional)
- Stripe billing support for pro features

### Non-functional Requirements
- Secure per-user OAuth2 tokens and rotated secrets
- Audit logs for uploads and billing events
- Reasonable rate limits and file size constraints (configurable)

### Architecture Overview
- Frontend: Next.js 16 (App Router), React 19, Tailwind CSS 4
- Auth & DB: Supabase (auth + Postgres)
- Storage: Google Drive API (uploads proxied through backend using per-user tokens)
- Billing: Stripe webhooks + subscription records
- Deployment: Vercel (or any platform supporting Next.js server functions)

### Success Metrics
- Signups (free vs paid)
- Monthly upload volume and average file size
- Conversion rate from free → paid
- Error rate on uploads and webhook handling

### Roadmap (next 3 quarters)
1) MVP: Shortcode pages, Google Drive upload, basic dashboard, free tier
2) Billing: Stripe integration, subscription management, usage tracking
3) polish: Notifications, analytics, multi-user/team support

## Docs & Specs
Keep `docs/` and `PRD.md` synchronized. Key docs:
- [docs/TODO.md](docs/TODO.md) — current tasks and backlog
- [docs/SPECS.md](docs/SPECS.md) — API specs and acceptance criteria
- [docs/CONSTITUTION.md](docs/CONSTITUTION.md) — team workflow and PR rules

### UI & Accessibility
Follow `docs/styles.md` for consistent form layouts and accessibility patterns. Use Zod for validation on client and server.

### Release Criteria
Before marking features done, update `docs/SPECS.md` with acceptance tests and verify Playwright tests cover E2E flows.
