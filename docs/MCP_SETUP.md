# Context7 MCP Setup Guide

Context7 MCP (Model Context Protocol) provides up-to-date documentation for external libraries and frameworks, ensuring agents work with current information rather than outdated training data.

## Configuration

Add Context7 MCP to your VS Code settings:

1. Open VS Code Settings (JSON): `Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)"

2. Add the MCP configuration:

```json
{
  "github.copilot.chat.mcp.enabled": true,
  "github.copilot.chat.mcp.servers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upshift-dev/mcp-context7"]
    }
  }
}
```

3. Restart VS Code or reload window: `Ctrl+Shift+P` → "Developer: Reload Window"

## Usage

Agents will automatically use Context7 when you ask about external libraries:

### Examples:
- "How do I use Server Actions in Next.js 15?"
- "Show me the latest Stripe payment intent API"
- "What's the Drizzle ORM syntax for relations?"
- "How do I configure Better Auth with email provider?"

### Manual MCP Queries:
You can also explicitly request library docs:
- "Fetch Next.js docs about the App Router"
- "Get Stripe documentation for webhooks"

## Supported Libraries in this Project

- **Next.js** - `/vercel/next.js`
- **React** - `/facebook/react`  
- **Stripe** - `/stripe/stripe-node`
- **Drizzle ORM** - `/drizzle-team/drizzle-orm`
- **Better Auth** - `/better-auth/better-auth`
- **Resend** - `/resend/resend-node`
- **Tailwind CSS** - `/tailwindlabs/tailwindcss`

## Benefits

1. **Always Current**: Gets latest documentation, not outdated training data
2. **Accurate Examples**: Real code examples from official docs
3. **Version-Specific**: Can fetch docs for specific library versions
4. **Comprehensive**: Accesses full documentation including edge cases

## Troubleshooting

**MCP not working?**
- Ensure `npx` is available in your PATH
- Check VS Code output panel: `View` → `Output` → Select "GitHub Copilot Chat"
- Verify MCP is enabled in settings

**Slow responses?**
- First query fetches docs (slower), subsequent queries use cache
- Reduce `tokens` parameter if getting too much documentation

## Advanced Usage

For specific documentation needs, you can request:
```
"Get Next.js middleware documentation with focus on rewrite patterns"
"Fetch Stripe webhook event types documentation"  
"Show Drizzle schema definition syntax"
```

The MCP server will automatically resolve library IDs and fetch relevant documentation.
