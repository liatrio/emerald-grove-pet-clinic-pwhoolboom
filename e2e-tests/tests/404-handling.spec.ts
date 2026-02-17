import { test, expect } from '@playwright/test';

test.describe('404 Error Handling', () => {

  test('should show friendly 404 page for non-existent owner', async ({ page }) => {
    const response = await page.goto('http://localhost:8080/owners/99999');
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/couldn't find that pet or owner/i)).toBeVisible();
  });

  test('should show Find Owners link on 404 page', async ({ page }) => {
    await page.goto('http://localhost:8080/owners/99999');
    const findOwnersLink = page.getByRole('link', { name: /find owners/i });
    await expect(findOwnersLink).toBeVisible();

    // Click link and verify navigation to /owners/find
    await findOwnersLink.click();
    await expect(page).toHaveURL(/.*\/owners\/find/);
  });

  test('should not expose stack traces or technical details', async ({ page }) => {
    await page.goto('http://localhost:8080/owners/99999');
    const bodyText = await page.locator('body').textContent();

    // Assert page does not contain technical details
    expect(bodyText).not.toMatch(/exception/i);
    expect(bodyText).not.toMatch(/java/i);
    expect(bodyText).not.toMatch(/stack trace/i);
    expect(bodyText).not.toMatch(/org\.springframework/i);
  });

  test('should show 404 for non-existent pet', async ({ page }) => {
    const response = await page.goto('http://localhost:8080/owners/1/pets/99999/edit');
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/couldn't find that pet or owner/i)).toBeVisible();
  });

});
