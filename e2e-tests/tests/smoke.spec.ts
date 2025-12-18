import { test, expect } from '@fixtures/base-test';

test.skip('infrastructure smoke placeholder', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/PetClinic/i);
});
