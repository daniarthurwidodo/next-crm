import { describe, it, expect } from "vitest";

/**
 * Auth API tests
 *
 * The old Supabase + JWT auth has been replaced with Better Auth.
 * Better Auth handles sign-in/sign-up via its catch-all route at /api/auth/[...all].
 * These routes are framework-managed and best tested via integration/E2E tests
 * against a running server with a real database.
 *
 * Unit tests for auth logic are no longer needed because Better Auth
 * encapsulates the auth flow internally.
 */

describe("/api/auth", () => {
  it("catch-all route module exists", async () => {
    const mod = await import("../../app/api/auth/[...all]/route");
    expect(mod.GET).toBeDefined();
    expect(mod.POST).toBeDefined();
  });
});
