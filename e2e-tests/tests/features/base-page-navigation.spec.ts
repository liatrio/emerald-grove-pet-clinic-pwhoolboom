import { test, expect } from '@fixtures/base-test';

import { HomePage } from '@pages/home-page';
import { OwnerPage } from '@pages/owner-page';
import { VetPage } from '@pages/vet-page';

test('BasePage navigation links route to expected pages', async ({ page }) => {
  const homePage = new HomePage(page);
  const ownerPage = new OwnerPage(page);
  const vetPage = new VetPage(page);

  await homePage.open();

  await homePage.goFindOwners();
  await expect(ownerPage.heading()).toHaveText(/Find Owners/i);

  await ownerPage.goVeterinarians();
  await expect(vetPage.heading()).toBeVisible();

  await vetPage.goHome();
  const { pathname } = new URL(page.url());
  expect(pathname).toBe('/');
});
