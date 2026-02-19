import { test, expect } from '@fixtures/base-test';

test.describe('Upcoming Visits', () => {
  test('navigates to page via nav link and shows heading', async ({ page }, testInfo) => {
    // Arrange — start from the vet list page so the nav bar is visible
    await page.goto('/vets.html');

    // Act — click the Upcoming Visits nav link
    await page.getByRole('link', { name: /upcoming visits/i }).click();

    // Assert — URL changed and heading is visible
    await expect(page).toHaveURL(/\/visits\/upcoming/);
    await expect(page.locator('h2')).toContainText(/upcoming visits/i);

    await page.screenshot({
      path: testInfo.outputPath('upcoming-visits-nav.png'),
      fullPage: true,
    });
  });

  test('displays at least one visit row from seed data', async ({ page }, testInfo) => {
    // Arrange — seed data has 2 visits dated DATEADD(1) and DATEADD(3) from today
    await page.goto('/visits/upcoming');

    // Assert — table is present
    const table = page.locator('table.liatrio-table');
    await expect(table).toBeVisible();

    // Assert — at least one data row
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount, 'Expected seeded upcoming visits to be present').toBeGreaterThan(0);

    // Assert — first row has owner link, pet link, date, and description
    const firstRow = rows.first();
    const cells = firstRow.locator('td');
    await expect(cells.nth(0).locator('a')).toBeVisible();
    await expect(cells.nth(1).locator('a')).toBeVisible();
    await expect(cells.nth(2)).not.toBeEmpty();
    await expect(cells.nth(3)).not.toBeEmpty();

    await page.screenshot({
      path: testInfo.outputPath('upcoming-visits-data.png'),
      fullPage: true,
    });
  });
});
