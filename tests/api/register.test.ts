import { describe, it, expect } from "vitest";

/**
 * Register API tests
 *
 * Registration is now handled by Better Auth via /api/auth/sign-up/email.
 * The old /api/register route has been removed.
 * Integration/E2E tests cover the registration flow against a running server.
 */

describe("registration", () => {
  it("Better Auth handles sign-up via catch-all route", async () => {
    const mod = await import("../../app/api/auth/[...all]/route");
    expect(mod.POST).toBeDefined();
  });
});
