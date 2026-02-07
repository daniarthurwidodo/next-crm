import { test, expect } from '@playwright/test';

test.describe('Register', () => {
  test('should register a new user', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/register');
    await page.fill('input[name="email"]', 'newuser'+Date.now()+'@example.com');
    await page.fill('input[name="password"]', 'newpassword');
    await page.fill('input[name="confirmPassword"]', 'newpassword');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard$/);
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
});
