# Product Requirements Document (PRD)

## Product: File2Drive – Send Any File to Google Drive via Shortcode

### Executive Summary
File2Drive is a web service that allows users to send any file to their Google Drive using a simple, shareable shortcode. The service offers a free tier and a paid subscription, making file transfers to Google Drive seamless for both casual and power users.

### Problem Statement
Transferring files to Google Drive from various devices or sharing upload links is cumbersome. File2Drive solves this by providing a unique shortcode for each user, enabling anyone to upload files directly to the user’s Google Drive.

### Target Users
- Individuals needing quick file transfers to their Google Drive
- Small businesses and teams sharing files with a central Drive
- Educators and students exchanging assignments and resources

### Use Cases
- Share a shortcode with friends to collect photos
- Teachers receive assignments from students
- Teams gather documents in a shared Drive folder

### Features
- Unique shortcode for each user
- Public upload page for each shortcode
- File uploads directly to user’s Google Drive
- Free tier: $0/month (5GB or 100 files/month)
- Pro tier: $5/month (unlimited uploads)
- Email notifications on upload (optional)
- Secure OAuth2 authentication with Google
- Dashboard to manage uploads and settings

### Technical Architecture
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui
- **Backend:** Supabase for authentication, user management, and file metadata
- **Storage:** Google Drive API (OAuth2 per user)
- **Pricing:** Stripe for subscription management
- **Deployment:** Vercel

### Success Metrics
- Number of signups (free/paid)
- Upload volume per user
- Conversion rate to paid tier
- Retention and churn rates

### Roadmap
1. MVP: Shortcode, upload page, Google Drive integration, free tier
2. Pro tier, Stripe integration, dashboard
3. Notifications, analytics, team features
