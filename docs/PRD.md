# Product Requirements Document (PRD)

## Product: File2Drive (next-crm)

### Summary
File2Drive provides shortcode-based public upload pages so third parties can upload files directly to a user's Google Drive. Users share a unique shortcode, and anyone can use it to upload files without needing a Google account or Drive access.

### Problem
Sharing upload flows is fragmented: users must create folders, share Drive links, or rely on third‑party storage. A shortcode + OAuth2 flow simplifies uploads and centralizes files in the user's Drive.

### Target Users
- Individuals who need simple one-off uploads
- Small teams and educators who collect files from multiple contributors
- Event organizers collecting photos/videos from attendees

### Key Use Cases
- Share a shortcode to collect photos or files from non-technical contributors
- Teachers collecting student submissions without requiring Drive access
- Teams aggregating documents into a single owner Drive
- Event photographers receiving uploads from multiple participants

### Core Features

#### Implemented ✅
- **User Authentication**: Email/password registration and login via Better Auth
- **User Management Dashboard**: Full CRUD operations for users (admin capability)
- **Stripe Billing**: Subscription management with Free and Pro tiers
- **Email Notifications**: Welcome emails, password reset, subscription lifecycle, upload notifications
- **Landing Pages**: Marketing site with hero, features, pricing, FAQ
- **Responsive UI**: Built with Tailwind CSS 4 and shadcn/ui components
- **PostgreSQL Database**: Drizzle ORM with migrations

#### In Development 🚧
- **Shortcode Generation**: Unique shortcode per user for upload page
- **Public Upload Pages**: `/upload/:shortcode` endpoint for file submission
- **Google Drive OAuth**: Per-user OAuth2 token management and refresh
- **File Upload to Drive**: Proxy uploads through backend using user's Drive credentials
- **Upload History**: View and manage uploaded files in dashboard

#### Planned 📋
- **Usage Analytics**: Track upload volume, file sizes, and user activity
- **Rate Limiting**: Configurable limits per plan (file size, upload count)
- **Team Support**: Multi-user accounts with shared shortcodes
- **Custom Branding**: White-label upload pages for Pro users
- **Webhook Notifications**: Real-time upload notifications via webhooks

### Non-functional Requirements
- Secure per-user OAuth2 tokens with encryption at rest
- Audit logs for uploads and billing events
- Rate limits and file size constraints (configurable per plan)
- HTTPS enforced in production
- GDPR compliance for EU users
- 99.9% uptime SLA for Pro users

### Architecture Overview
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui
- **Auth**: Better Auth with email/password strategy
- **Database**: PostgreSQL via Supabase with Drizzle ORM
- **ORM & Migrations**: Drizzle Kit for schema management
- **Storage**: Google Drive API (uploads proxied through backend using per-user OAuth tokens)
- **Billing**: Stripe Checkout + webhooks for subscription management
- **Email**: Nodemailer with transactional email templates
- **Testing**: Playwright (E2E), Vitest (unit tests)
- **Deployment**: Vercel-ready (or any Node.js platform)

### Success Metrics
- **User Acquisition**: Signups (free vs paid), conversion rate free → Pro
- **Engagement**: Monthly active users, uploads per user, average file size
- **Revenue**: MRR (Monthly Recurring Revenue), churn rate, LTV
- **Technical**: Upload success rate, API error rate, webhook delivery success rate
- **Performance**: Page load times, time-to-first-upload, Drive API latency

### Current Status (as of Feb 2026)
**Phase 1 Complete**: User management, authentication, billing infrastructure, and email system are fully operational. Users can sign up, manage accounts, and subscribe to plans.

**Phase 2 In Progress**: Core upload functionality (Google Drive integration, shortcode system, public upload endpoints) is in development. Email notification system is prepared and ready to integrate with upload events.

### Roadmap

#### Q1 2026 - Foundation (Completed ✅)
- ✅ User authentication and registration
- ✅ User management dashboard with CRUD operations  
- ✅ Stripe billing integration
- ✅ Email notification system
- ✅ Landing pages and marketing site
- ✅ Database schema and migrations

#### Q2 2026 - Core Upload Features (Current)
- 🚧 Shortcode generation and management
- 🚧 Google Drive OAuth2 integration
- 🚧 Public upload endpoint `/upload/:shortcode`
- 🚧 File upload to Drive with user credentials
- 🚧 Upload history and management in dashboard
- 📋 Upload notification integration
- 📋 Basic usage tracking

#### Q3 2026 - Enhancement & Scale
- 📋 Advanced analytics dashboard
- 📋 Rate limiting and quota enforcement
- 📋 File type restrictions and validation
- 📋 Custom upload page branding (Pro)
- 📋 API webhooks for upload events
- 📋 Performance optimization and caching

#### Q4 2026 - Team & Enterprise
- 📋 Multi-user team accounts
- 📋 Shared shortcodes with permissions
- 📋 Advanced admin controls
- 📋 Audit logs and compliance features
- 📋 SSO support for enterprise
- 📋 White-label options

## Docs & Specs
Keep `docs/` and `PRD.md` synchronized. Key documentation:
- **[docs/TODO.md](docs/TODO.md)** — Current sprint tasks, completed work, and backlog
- **[docs/SPECS.md](docs/SPECS.md)** — API specifications and acceptance criteria
- **[docs/CONSTITUTION.md](docs/CONSTITUTION.md)** — Team workflow, PR guidelines, and conventions
- **[docs/STRIPE_SETUP.md](docs/STRIPE_SETUP.md)** — Stripe integration guide
- **[docs/EMAIL_SETUP.md](docs/EMAIL_SETUP.md)** — Email configuration and testing
- **[docs/WEBHOOK_SETUP.md](docs/WEBHOOK_SETUP.md)** — Webhook setup for Stripe events
- **[docs/styles.md](docs/styles.md)** — UI patterns, component guidelines, and accessibility

### Development Workflow
Run migrations: `bunx drizzle-kit migrate`  
Generate new migration: `bunx drizzle-kit generate`  
Browse database: `bunx drizzle-kit studio`  
Dev server: `bun run dev`  
Run tests: `bunx playwright test` (E2E), `bun test` (unit)

### UI & Accessibility
Follow **[docs/styles.md](docs/styles.md)** for consistent form layouts, component patterns, and accessibility guidelines. Use Zod for validation on both client and server sides. All forms should include proper ARIA labels and keyboard navigation support.

### Testing & Quality
- **E2E Tests**: Playwright tests cover authentication flows, user management, and critical paths
- **Unit Tests**: Vitest for services, controllers, and utilities
- **Type Safety**: Full TypeScript coverage with strict mode
- **Code Quality**: ESLint configuration for Next.js and React 19

### Release Criteria
Before marking features as complete:
1. Update **[docs/SPECS.md](docs/SPECS.md)** with acceptance tests
2. Verify Playwright E2E tests cover critical user flows
3. Ensure unit test coverage for new services/controllers
4. Update **[docs/TODO.md](docs/TODO.md)** with completion status
5. Document any new environment variables or setup steps

### Security Considerations
- Secure per-user OAuth2 tokens with encryption at rest
- JWT secrets rotated regularly
- Rate limiting on public endpoints (especially `/upload/:shortcode`)
- File type validation and virus scanning (planned)
- Audit logs for uploads and billing events
- HTTPS enforced in production
- CSRF protection on state-changing operations
