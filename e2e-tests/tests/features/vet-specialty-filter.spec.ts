import { test, expect } from '@fixtures/base-test';

import { VetPage } from '@pages/vet-page';

test.describe('Vet Specialty Filter', () => {
  test('can filter vets by a named specialty', async ({ page }, testInfo) => {
    const vetPage = new VetPage(page);
    await vetPage.open();

    await vetPage.filterBySpecialty('radiology');

    await expect(vetPage.vetsTable()).toContainText('Helen Leary');
    await expect(vetPage.vetsTable()).toContainText('Henry Stevens');
    await expect(vetPage.vetsTable()).not.toContainText('James Carter');
    await expect(vetPage.vetsTable()).not.toContainText('Linda Douglas');
    await expect(vetPage.vetsTable()).not.toContainText('Rafael Ortega');
    await expect(vetPage.vetsTable()).not.toContainText('Sharon Jenkins');

    const rows = vetPage.vetsTable().locator('tbody tr');
    await expect(rows).toHaveCount(2);

    await page.screenshot({ path: testInfo.outputPath('e2e-vet-filter-radiology.png'), fullPage: true });
  });

  test('can filter vets to show only those with no specialties', async ({ page }) => {
    const vetPage = new VetPage(page);
    await vetPage.open();

    await vetPage.filterBySpecialty('none');

    await expect(vetPage.vetsTable()).toContainText('James Carter');
    await expect(vetPage.vetsTable()).toContainText('Sharon Jenkins');
    await expect(vetPage.vetsTable()).not.toContainText('Helen Leary');
    await expect(vetPage.vetsTable()).not.toContainText('Linda Douglas');
    await expect(vetPage.vetsTable()).not.toContainText('Rafael Ortega');
    await expect(vetPage.vetsTable()).not.toContainText('Henry Stevens');

    const rows = vetPage.vetsTable().locator('tbody tr');
    await expect(rows).toHaveCount(2);
  });

  test('can navigate directly to a filtered URL and see correct results', async ({ page }) => {
    const vetPage = new VetPage(page);

    await vetPage.openWithFilter('radiology');

    await expect(vetPage.vetsTable()).toContainText('Helen Leary');
    await expect(vetPage.vetsTable()).toContainText('Henry Stevens');
    await expect(vetPage.vetsTable()).not.toContainText('James Carter');

    const selectedValue = await vetPage.selectedFilter();
    expect(selectedValue).toBe('radiology');
  });

  test('can clear the filter to show all vets', async ({ page }, testInfo) => {
    const vetPage = new VetPage(page);

    await vetPage.openWithFilter('radiology');
    await vetPage.filterBySpecialty('');

    const rows = vetPage.vetsTable().locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount, 'Expected more than 2 vets when All is selected').toBeGreaterThan(2);

    await expect(vetPage.vetsTable()).toContainText('James Carter');
    await expect(vetPage.vetsTable()).toContainText('Helen Leary');
    await expect(vetPage.vetsTable()).toContainText('Henry Stevens');

    await page.screenshot({ path: testInfo.outputPath('e2e-vet-filter-by-specialty.png'), fullPage: true });
  });
});
