import { test, expect } from '@playwright/test';

test.describe('Register', () => {
  test('should register a new user', async ({ page }) => {
    await page.goto('/dashboard/register');
    const uniqueUser = 'newuser' + Date.now();
    await page.fill('input[placeholder="Username"]', uniqueUser);
    await page.fill('input[placeholder="Password"]', 'newpassword');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard$/);
    await expect(page.locator('.dashboard-content')).toBeVisible();
  });
});
