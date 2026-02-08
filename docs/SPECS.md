# Specs & API

## Overview
This document defines the API endpoints, data models, auth flow, and acceptance criteria used for verification and releases.

## API Endpoints
- `POST /api/register` — create a new user. Request: `{ email, password }`. Response: `{ user: { id, email, shortcode } }` on success. Sends welcome email.
- `POST /api/login` — authenticate user. Request: `{ email, password }`. Response: `{ accessToken, refreshToken, user }`.
- `POST /api/auth/forgot-password` — request password reset. Request: `{ email }`. Response: `{ message }`. Sends password reset email.
- `POST /api/auth/reset-password` — reset password with token. Request: `{ token, password }`. Response: `{ message }`.
- `POST /upload/:shortcode` — public upload endpoint (no login required) — saves file metadata and uploads to user Google Drive via OAuth credentials. Sends upload notification email.
## Data Models (simplified)
- User
  - `id: uuid`
  - `email: string`
  - `password_hash: string`
  - `shortcode: string` (unique, 6-8 chars)
  - `plan: enum('free','pro')`
  - `google_refresh_token: string | null`

- Upload
  - `id: uuid`
  - `user_id: uuid`
  - `filename: string`
  - `size: number`
  - `drive_file_id: string | null`
  - `created_at: timestamp`

## Auth Flow
1. User signs up via `/api/register` → server stores hashed password and generates `shortcode`. Welcome email sent.
2. User can reset password via `/api/auth/forgot-password` → receives email with reset token.
3. User connects Google Drive via OAuth — server stores refresh token encrypted.
4. Uploads sent to `POST /upload/:shortcode` are accepted and forwarded to the target user's Drive using stored OAuth tokens. User receives upload notification email.

## Acceptance Criteria (examples)
- Register
  - Given valid `email` and `password`, `POST /api/register` returns 201 and user object.
  - Passwords are hashed using a secure algorithm (bcrypt/scrypt/argon2).
  - Welcome email is sent to the user (non-blocking, doesn't fail registration).
- Login
  - Given correct credentials, `POST /api/login` returns access and refresh tokens.
  - Invalid credentials return 401 with a consistent error shape.
- Password Reset
  - `POST /api/auth/forgot-password` with valid email sends reset email and returns 200.
  - `POST /api/auth/reset-password` with valid token and password resets password successfully.
  - Invalid or expired token returns 400.
- Upload
  - `POST /upload/:shortcode` with small file returns 200 and Drive file id if user has connected Drive.
  - If user hasn't connected Drive, upload returns 202 with metadata saved and notification to user.
  - Upload notification email sent to shortcode owner (non-blocking).
- Email Notifications
  - All emails include both HTML and plain text versions.
  - Failed email sends are logged but don't block primary operations.
  - Subscription lifecycle events trigger appropriate emails (confirmation, payment failed, cancellation).

  ## UI / Component Specs
  These spec items describe visual and interaction rules for small, reusable form components.

  - Inputs & Selects
    - Border: `1px solid #d1d5db` (neutral gray)
    - Padding: `8px 10px`
    - Border radius: `6px`
    - Full-width within their grid cell; use `box-sizing: border-box`.
    - Accessible labels are required; inputs should have `id` and `label` correctly associated.

  - Form Layout
    - Default forms should use a 2-column grid for related fields:
      - `display: grid; grid-template-columns: 1fr 1fr; gap: 12px;`
      - Fields that need the full width (like password, long text areas) should span the full row: `grid-column: 1 / -1`.
      - On small screens, forms should collapse to a single column (stack) at `max-width: 640px`.

  - Validation
    - Client-side validation should mirror server-side rules. We use `zod` for client schemas in pages/components.
    - Validation messages should be shown inline near the offending field and also surfaced in a summary area above the form when appropriate.

  Acceptance tests should include UI checks for form layout, validation messages, and accessibility attributes (labels, role, aria-live for error summaries).

## Testing
- Unit tests for controllers and services with mocked Supabase and Drive API.
- E2E tests in `tests/e2e` that exercise register → connect Drive (mock) → upload flow.

## Release Checklist
- All acceptance criteria pass in CI (unit + e2e)
- PRD and Specs updated for the release features
- Migration scripts (if any) included and reviewed
