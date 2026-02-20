import { test, expect } from '@fixtures/base-test';

import { HomePage } from '@pages/home-page';

test.describe('Language Selector', () => {
  test('language dropdown is visible and shows active language', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();

    await expect(homePage.languageSelectorToggle()).toBeVisible();
    const active = await homePage.activeLanguage();
    expect(active).toBe('EN');
  });

  test('can switch UI language to Spanish', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();

    await homePage.switchLanguage('ES');

    expect(await homePage.activeLanguage()).toBe('ES');
    await expect(homePage.navLink(/Veterinarios/i)).toBeVisible();
    await expect(homePage.navLink(/Inicio/i)).toBeVisible();
  });

  test('language persists across page navigation', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.openWithLanguage('es');

    // Navigate by URL (no ?lang param) to prove session locale persists independently
    await homePage.goto('/vets.html');
    await page.waitForLoadState('networkidle');

    expect(await homePage.activeLanguage()).toBe('ES');
    await expect(page.getByRole('heading', { name: /Veterinarios/i })).toBeVisible();
  });

  test('can switch back to English from Spanish', async ({ page }, testInfo) => {
    const homePage = new HomePage(page);
    await homePage.openWithLanguage('es');

    await homePage.switchLanguage('EN');

    expect(await homePage.activeLanguage()).toBe('EN');
    await expect(homePage.navLink(/Veterinarians/i)).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath('e2e-lang-selector-switch.png'),
      fullPage: true,
    });
  });
});
