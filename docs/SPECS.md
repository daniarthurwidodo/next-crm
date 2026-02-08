# Specs & API

## Overview
This document defines the API endpoints, data models, auth flow, and acceptance criteria used for verification and releases.

## API Endpoints
- `POST /api/register` — create a new user. Request: `{ email, password }`. Response: `{ user: { id, email, shortcode } }` on success.
- `POST /api/login` — authenticate user. Request: `{ email, password }`. Response: `{ accessToken, refreshToken, user }`.
- `POST /upload/:shortcode` — public upload endpoint (no login required) — saves file metadata and uploads to user Google Drive via OAuth credentials.

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
1. User signs up via `/api/register` → server stores hashed password and generates `shortcode`.
2. User connects Google Drive via OAuth — server stores refresh token encrypted.
3. Uploads sent to `POST /upload/:shortcode` are accepted and forwarded to the target user's Drive using stored OAuth tokens.

## Acceptance Criteria (examples)
- Register
  - Given valid `email` and `password`, `POST /api/register` returns 201 and user object.
  - Passwords are hashed using a secure algorithm (bcrypt/scrypt/argon2).
- Login
  - Given correct credentials, `POST /api/login` returns access and refresh tokens.
  - Invalid credentials return 401 with a consistent error shape.
- Upload
  - `POST /upload/:shortcode` with small file returns 200 and Drive file id if user has connected Drive.
  - If user hasn't connected Drive, upload returns 202 with metadata saved and notification to user.

## Testing
- Unit tests for controllers and services with mocked Supabase and Drive API.
- E2E tests in `tests/e2e` that exercise register → connect Drive (mock) → upload flow.

## Release Checklist
- All acceptance criteria pass in CI (unit + e2e)
- PRD and Specs updated for the release features
- Migration scripts (if any) included and reviewed
