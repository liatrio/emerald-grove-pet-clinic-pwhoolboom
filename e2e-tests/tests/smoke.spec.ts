import { test, expect } from '@playwright/test';

test.skip('infrastructure smoke placeholder', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/PetClinic/i);
});
