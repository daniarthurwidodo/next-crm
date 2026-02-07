import { test, expect, loginWithApi } from './fixtures/auth';

test.describe('Login', () => {
  test('should login with valid credentials', async ({ page }) => {
    const uniqueUser = 'testuser' + Date.now();
    const password = 'testpassword';

    // Register the user via UI
    await page.goto('/dashboard/register');
    await page.fill('input[placeholder="Username"]', uniqueUser);
    await page.fill('input[placeholder="Password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard$/);

    // Clear cookies to simulate logout
    await page.context().clearCookies();

    // Log in via API (shared helper) and assert dashboard
    await loginWithApi(page, uniqueUser, password);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard$/);
    await expect(page.locator('.dashboard-content')).toBeVisible();
  });
});
