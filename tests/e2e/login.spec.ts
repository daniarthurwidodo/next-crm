import { test, expect } from '@playwright/test';

// Login test

test.describe('Login', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/login');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard$/);
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
});
