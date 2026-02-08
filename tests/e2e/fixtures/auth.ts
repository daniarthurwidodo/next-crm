import { test as base, expect } from "@playwright/test";

const defaultTestEmail = "e2e@test.com";
const defaultTestPassword = "e2epassword";

export const testEmail = process.env.E2E_TEST_EMAIL ?? defaultTestEmail;
export const testPassword = process.env.E2E_TEST_PASSWORD ?? defaultTestPassword;

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

/**
 * Log in via the Better Auth API and inject the session cookie.
 * Use this instead of UI login for faster, more reliable tests.
 */
export async function loginWithApi(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
  origin: string = baseURL
): Promise<void> {
  const res = await page.request.post(`${origin}/api/auth/sign-in/email`, {
    data: { email, password },
  });
  if (!res.ok()) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Login failed: ${body?.message ?? res.status()}`);
  }

  // Better Auth sets session cookies via Set-Cookie headers automatically.
  // The cookies are already applied to the browser context by Playwright
  // when using page.request (same origin).
}

export const test = base.extend<{
  testEmail: string;
  testPassword: string;
  loginAsTestUser: (page: import("@playwright/test").Page) => Promise<void>;
}>({
  testEmail: async ({}, use) => {
    await use(testEmail);
  },
  testPassword: async ({}, use) => {
    await use(testPassword);
  },
  loginAsTestUser: async ({ testEmail: email, testPassword: pass }, use) => {
    await use(async (page: import("@playwright/test").Page) => {
      await loginWithApi(page, email, pass);
    });
  },
});

export { expect };
