# Team Constitution

## Purpose
Provide shared agreements on collaboration, branching, reviews, and quality standards.

## Branching & PRs
- Use feature branches: `feat/<short-desc>`, `fix/<short-desc>`, `chore/<short-desc>`.
- Open PRs against `main` and set reviewers (minimum 1 reviewer from backend/frontend).
- PRs must include a short description, linked issue (if applicable), and testing notes.
- Small PRs (<200 lines) preferred for faster reviews.

## Code Review
- Reviewers check for security, tests, readability, and performance regressions.
- Approvals require at least one approving review and passing CI checks.
- For major changes, request a design review in PR description.

## Testing
- New features must include unit tests for critical logic and integration/E2E where applicable.
- Maintain a lightweight mutation/integration test for auth flows.

## Documentation
- Update `docs/` and `PRD.md` for feature-complete work.
- Keep `docs/SPECS.md` in sync with API behavior and acceptance criteria.

## Releases & Deployments
- Create a release PR with changelog and migration notes.
- Deploy to staging for smoke tests before production release.

## Security & Secrets
- Never commit secrets. Use environment variables or secrets manager.
- Rotate OAuth and API keys if leaked.

## Communication
- Use short, descriptive commit messages.
- Tag relevant team members in PRs/issues for visibility.

## Maintenance
- Schedule monthly dependency and security review.
- Triage and label issues weekly.
