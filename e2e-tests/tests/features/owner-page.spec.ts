import { test, expect } from '../fixtures/base-test';

import { OwnerPage } from '../pages/owner-page';

test('OwnerPage can search owners by last name and open owner details', async ({ page }: { page: any }) => {
  const ownerPage = new OwnerPage(page);

  await ownerPage.openFindOwners();
  await ownerPage.searchByLastName('Davis');

  await expect(ownerPage.ownersTable()).toBeVisible();
  await expect(ownerPage.ownersTable().locator('tbody tr')).toHaveCount(2);

  await ownerPage.openOwnerDetailsByName('Betty Davis');
  await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();

  await page.screenshot({ path: 'test-results/owner-details.png', fullPage: true });
});
