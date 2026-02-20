import { test, expect } from '@fixtures/base-test';

test.describe('Language Selector', () => {
  test('language dropdown is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="lang-selector"] .dropdown-toggle')).toBeVisible();
  });
});
