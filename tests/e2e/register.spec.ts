import { test, expect } from "@playwright/test";

test.describe("Register", () => {
  test("should register a new user", async ({ page }) => {
    await page.goto("/dashboard/register");
    const uniqueEmail = `newuser${Date.now()}@test.com`;
    await page.fill('input[placeholder="Name"]', "New User");
    await page.fill('input[placeholder="Email"]', uniqueEmail);
    await page.fill('input[placeholder="Password"]', "newpassword123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard$/);
    await expect(page.locator(".dashboard-content")).toBeVisible();
  });
});
