import { test as base, expect } from '@playwright/test';

const defaultTestUser = 'e2euser@gmail.com';
const defaultTestPassword = 'e2epassword';

export const testUser =
  process.env.E2E_TEST_USER ?? defaultTestUser;
export const testPassword =
  process.env.E2E_TEST_PASSWORD ?? defaultTestPassword;

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

/**
 * Log in via the API and set the token cookie on the page's context.
 * Use this instead of UI login for faster, more reliable tests.
 */
export async function loginWithApi(
  page: import('@playwright/test').Page,
  username: string,
  password: string,
  origin: string = baseURL
): Promise<void> {
  const res = await page.request.post(`${origin}/api/login`, {
    data: { username, password },
  });
  const body = await res.json().catch(() => ({}));
  if (!body?.token) {
    throw new Error(
      `Login failed: ${body?.error ?? res.status()}`
    );
  }
  await page.context().addCookies([
    {
      name: 'token',
      value: body.token,
      url: origin,
      path: '/',
    },
  ]);
}

export const test = base.extend<{
  testUser: string;
  testPassword: string;
  loginAsTestUser: (page: import('@playwright/test').Page) => Promise<void>;
}>({
  testUser: async ({}, use) => {
    await use(testUser);
  },
  testPassword: async ({}, use) => {
    await use(testPassword);
  },
  loginAsTestUser: async ({ testUser: user, testPassword: pass }, use) => {
    await use(async (page: import('@playwright/test').Page) => {
      await loginWithApi(page, user, pass);
    });
  },
});

export { expect };
