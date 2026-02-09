# GitHub Copilot Instructions

## Project Documentation

Always refer to the documentation in the `docs/` folder when working on this project:

- **docs/PRD.md** - Product Requirements Document with project overview and requirements
- **docs/SPECS.md** - Technical specifications and architecture decisions
- **docs/CONSTITUTION.md** - Project principles and coding standards
- **docs/STYLES.md** - UI/UX styling guidelines
- **docs/WORKFLOWS.md** - Development workflows and processes
- **docs/EMAIL_SETUP.md** - Email service configuration
- **docs/STRIPE_SETUP.md** - Payment integration setup
- **docs/WEBHOOK_SETUP.md** - Webhook configuration
- **docs/TODO.md** - Planned features and tasks
- **docs/MCP_SETUP.md** - Context7 MCP configuration for library documentation

## Library Documentation (Context7 MCP)

When working with external libraries and frameworks, use Context7 MCP to retrieve up-to-date documentation:

1. First resolve the library ID using the resolve-library-id tool
2. Then fetch documentation using the get-library-docs tool
3. Use specific topics when possible to get focused documentation

Example libraries in this project:
- Next.js (`/vercel/next.js`)
- React (`/facebook/react`)
- Stripe (`/stripe/stripe-node`)
- Drizzle ORM (`/drizzle-team/drizzle-orm`)
- Better Auth (`/better-auth/better-auth`)

## Guidelines

1. Before implementing features, check relevant docs for requirements and specifications
2. Follow the coding standards defined in CONSTITUTION.md
3. Adhere to the styling guidelines in STYLES.md
4. Reference the appropriate setup docs when working on integrations
5. Check TODO.md for planned work and context on ongoing tasks
6. For library-specific questions, fetch current documentation via Context7 MCP rather than relying on training data
