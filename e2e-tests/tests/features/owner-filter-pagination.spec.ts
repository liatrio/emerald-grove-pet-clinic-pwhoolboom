import { fileURLToPath } from 'url';

import { test, expect } from '@fixtures/base-test';

import { OwnerPage } from '@pages/owner-page';
import { createOwner } from '@utils/data-factory';

test.describe('Owner Filter Pagination', () => {
  test('preserves lastName filter across forward and backward pagination', async ({ page }, testInfo) => {
    const ownerPage = new OwnerPage(page);

    // Create 6 owners with a shared lastName prefix so the search returns 2 pages (page size = 5)
    const prefix = `PageTest${Date.now()}`;
    for (let i = 0; i < 6; i++) {
      await ownerPage.goto('/owners/new');
      await ownerPage.fillOwnerForm(createOwner({ lastName: `${prefix}${i}` }));
      await ownerPage.submitOwnerForm();
    }

    // Search by prefix — 6 results → 2 pages
    await ownerPage.openFindOwners();
    await ownerPage.searchByLastName(prefix);

    // Assert page 1 is filtered
    await expect(ownerPage.ownersTable()).toBeVisible();
    expect(page.url()).toContain(`lastName=${prefix}`);
    await expect(ownerPage.activeFilterBadge()).toBeVisible();
    await expect(ownerPage.activeFilterBadge()).toContainText(prefix);

    // Navigate to page 2
    await ownerPage.clickNextPage();
    await expect(ownerPage.ownersTable()).toBeVisible();

    // Assert filter is preserved on page 2
    expect(page.url()).toContain('page=2');
    expect(page.url()).toContain(`lastName=${prefix}`);
    await expect(ownerPage.activeFilterBadge()).toBeVisible();

    // Screenshot 1: full viewport on page 2 — proves URL includes page=2 and lastName filter
    const urlScreenshotPath = fileURLToPath(
      new URL(
        '../../../docs/specs/07-spec-preserve-filter-pagination/proof/filter-pagination-url.png',
        import.meta.url
      )
    );
    await page.screenshot({ path: urlScreenshotPath, fullPage: false });

    // Screenshot 2: pagination controls area — proves links include lastName query param
    const linksScreenshotPath = fileURLToPath(
      new URL(
        '../../../docs/specs/07-spec-preserve-filter-pagination/proof/filter-pagination-links.png',
        import.meta.url
      )
    );
    await ownerPage.paginationControls().screenshot({ path: linksScreenshotPath });

    // Navigate back to page 1
    await ownerPage.clickPreviousPage();
    await expect(ownerPage.ownersTable()).toBeVisible();

    // Assert filter is still preserved on page 1
    expect(page.url()).toContain('page=1');
    expect(page.url()).toContain(`lastName=${prefix}`);
    await expect(ownerPage.activeFilterBadge()).toBeVisible();
    await expect(ownerPage.activeFilterBadge()).toContainText(prefix);

    // Diagnostic screenshot in test artifacts
    await page.screenshot({ path: testInfo.outputPath('filter-pagination-page1.png'), fullPage: true });
  });
});
