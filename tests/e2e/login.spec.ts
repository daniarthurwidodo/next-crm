import { test, expect } from '@playwright/test';

// Login test

test.describe('Login', () => {
  test('should login with valid credentials', async ({ page }) => {
    const testUser = 'testuser' + Date.now();
    const testPassword = 'testpassword';

    // First register the user
    await page.goto('http://localhost:3000/dashboard/register');
    await page.fill('input[placeholder="Username"]', testUser);
    await page.fill('input[placeholder="Password"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard$/);

    // Wait a bit for the user to be fully created in Supabase
    await page.waitForTimeout(2000);

    // Clear cookies to simulate logout
    await page.context().clearCookies();

    // Logout or navigate to login page
    await page.goto('http://localhost:3000/dashboard/login');

    // Now login with the same credentials
    await page.fill('input[placeholder="Username"]', testUser);
    await page.fill('input[placeholder="Password"]', testPassword);
    await page.click('button[type="submit"]');
    
    // Wait a bit and check for error messages
    await page.waitForTimeout(1000);
    const errorText = await page.locator('.text-red-500').textContent().catch(() => null);
    if (errorText) {
      console.log('Login error message:', errorText);
    }
    
    await expect(page).toHaveURL(/.*dashboard$/);
    await expect(page.locator('.dashboard-content')).toBeVisible();
  });
});
