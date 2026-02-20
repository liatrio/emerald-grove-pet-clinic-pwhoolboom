import { test, expect } from '@fixtures/base-test';
import { OwnerPage } from '@pages/owner-page';
import { createOwner } from '@utils/data-factory';

test.describe('Multi-Field Owner Search', () => {
  test('can find an owner by telephone number', async ({ page }, testInfo) => {
    const ownerPage = new OwnerPage(page);
    const owner = createOwner();

    // Create the owner first
    await ownerPage.openFindOwners();
    await ownerPage.clickAddOwner();
    await ownerPage.fillOwnerForm(owner);
    await ownerPage.submitOwnerForm();
    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();

    // Find by telephone (exact match → single result → redirect to detail page)
    await ownerPage.openFindOwners();
    await ownerPage.searchByTelephone(owner.telephone);

    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('e2e-find-by-telephone.png'), fullPage: true });
  });

  test('can find owners by city prefix', async ({ page }, testInfo) => {
    const ownerPage = new OwnerPage(page);
    // Use a city name that is unique enough to survive parallel test runs
    const uniqueCity = `CityTest${Date.now()}${Math.floor(Math.random() * 100000)}`;
    const owner = createOwner({ city: uniqueCity });

    // Create the owner
    await ownerPage.openFindOwners();
    await ownerPage.clickAddOwner();
    await ownerPage.fillOwnerForm(owner);
    await ownerPage.submitOwnerForm();
    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();

    // Search with the full unique city name (also acts as a prefix) → single result
    await ownerPage.openFindOwners();
    await ownerPage.searchByCity(uniqueCity);

    // Single result → redirects to owner detail page
    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('e2e-find-by-city.png'), fullPage: true });
  });

  test('can find an owner by combined telephone and city filters', async ({ page }, testInfo) => {
    const ownerPage = new OwnerPage(page);
    const owner = createOwner();

    // Create the owner
    await ownerPage.openFindOwners();
    await ownerPage.clickAddOwner();
    await ownerPage.fillOwnerForm(owner);
    await ownerPage.submitOwnerForm();
    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();

    // Find by combined telephone + city
    await ownerPage.openFindOwners();
    await ownerPage.searchByFilters({ telephone: owner.telephone, city: owner.city });

    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('e2e-find-by-combined.png'), fullPage: true });
  });

  test('shows inline telephone validation error for invalid telephone input', async ({ page }) => {
    const ownerPage = new OwnerPage(page);

    await ownerPage.openFindOwners();
    await ownerPage.searchByTelephone('123');

    await expect(ownerPage.telephoneValidationError()).toBeVisible();
    await expect(ownerPage.telephoneValidationError()).toContainText('10-digit');
  });
});
