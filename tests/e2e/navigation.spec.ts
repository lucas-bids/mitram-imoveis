import { test, expect } from '@playwright/test';

test('has title and can navigate', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Mitram Imóveis/);

  // Check if "Imóveis" link exists
  const imoveisLink = page.locator('nav a:has-text("Imóveis")');
  await expect(imoveisLink).toBeVisible();

  // Click on "Imóveis" and check URL
  await imoveisLink.click();
  await expect(page).toHaveURL(/.*\/imoveis/);
});

test('footer links to the admin login', async ({ page }) => {
  await page.goto('/');

  const adminLink = page.locator('footer a:has-text("Área administrativa")');
  await expect(adminLink).toBeVisible();
  await expect(adminLink).toHaveAttribute('href', '/admin/login');
});
