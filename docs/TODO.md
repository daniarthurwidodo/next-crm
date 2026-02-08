# TODO / Project Status

## Completed
- Basic Next.js app scaffold and landing pages
- Supabase integration for auth and user management
- API routes: `/api/login`, `/api/register` (tests present in `tests/api`)
- Playwright e2e test fixtures and basic e2e tests for login/register
- Email notifications system with nodemailer and Mailtrap
  - Welcome emails on registration
  - Upload notifications (service ready for upload feature)
  - Subscription lifecycle emails (confirmation, payment failed, cancellation)
  - Password reset functionality with email notifications

## In Progress
- Dashboard UX refinements
- Billing / Stripe integration (Pro tier)
- Upload feature implementation (email notification ready)

## Needs Improvement
- Tests: increase unit coverage for services (`lib/services`) and controllers
- Error handling: consistent API error shapes and logging
- Documentation: API specs, acceptance criteria, and deployment playbook
- Security: review OAuth2 refresh flow and session handling

## Next Steps (short-term)
1. Finalize `docs/SPECS.md` acceptance criteria for login/register (owner: @frontend)
2. Add unit tests for `lib/services/registerService.ts` and `loginService.ts` (owner: @backend)
3. Wire Stripe sandbox and document billing flow (owner: @backend)

## How to contribute to TODOs
- Update this file with PR reference and short status update when closing tasks.
- Use PR titles prefixed with scope: `feat(auth): ...`, `fix(api): ...`, `chore(docs): ...`.
