import { fileURLToPath } from 'url';

import { test, expect } from '@fixtures/base-test';

import { VisitPage } from '@pages/visit-page';

function futureDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

function todayDate(): string {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

function yesterdayDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

test.describe('Visit Scheduling', () => {
  test('can schedule a visit for an existing pet', async ({ page }, testInfo) => {
    const visitPage = new VisitPage(page);
    // Note: searching by last name may redirect directly to owner details when there is a single match.
    // Use a stable direct URL to avoid depending on the owners list table.
    await page.goto('/owners/1');
    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();

    const addVisitLink = page.getByRole('link', { name: /^Add Visit$/i }).first();
    const addVisitHref = await addVisitLink.getAttribute('href');
    if (!addVisitHref) {
      throw new Error('Expected Add Visit link to have an href');
    }

    const petIdMatch = addVisitHref.match(/pets\/(\d+)\//);
    if (!petIdMatch) {
      throw new Error(`Expected Add Visit href to include pet id, got: ${addVisitHref}`);
    }

    const petId = petIdMatch[1];

    await addVisitLink.click();

    await expect(visitPage.heading()).toBeVisible();

    const visitDate = futureDate();
    const description = `E2E visit ${Date.now()}`;
    await visitPage.fillVisitDate(visitDate);
    await visitPage.fillDescription(description);

    await page.screenshot({ path: testInfo.outputPath('visit-scheduling-form.png'), fullPage: true });

    await visitPage.submit();

    await expect(page.getByRole('heading', { name: /Pets and Visits/i })).toBeVisible();

    const petVisitsTable = page
      .locator(`a[href*="pets/${petId}/visits/new"]`)
      .first()
      .locator('xpath=ancestor::table[1]');

    const visitRow = petVisitsTable.locator('tr').filter({ hasText: visitDate }).filter({ hasText: description });
    await expect(visitRow).toHaveCount(1);
  });

  test('validates visit description is required', async ({ page }) => {
    const visitPage = new VisitPage(page);
    await page.goto('/owners/1');
    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();

    await page.getByRole('link', { name: /Add Visit/i }).first().click();

    await visitPage.fillVisitDate(futureDate());
    await visitPage.submit();

    await expect(page.getByText(/must not be blank/i)).toBeVisible();
  });

  test('rejects a past date and shows a validation error', async ({ page }) => {
    const visitPage = new VisitPage(page);
    await page.goto('/owners/1');
    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();

    await page.getByRole('link', { name: /Add Visit/i }).first().click();

    await visitPage.fillVisitDate(yesterdayDate());
    await visitPage.fillDescription('Past date test');
    await visitPage.submit();

    await expect(page.getByText(/Invalid date: please choose today or a future date/i)).toBeVisible();

    const screenshotPath = fileURLToPath(
      new URL(
        '../../../docs/specs/06-spec-visit-date-validation/proof/past-date-validation-error.png',
        import.meta.url
      )
    );
    await page.screenshot({ path: screenshotPath, fullPage: false });
  });

  test("accepts today's date and redirects to the owner page", async ({ page }) => {
    const visitPage = new VisitPage(page);
    await page.goto('/owners/1');
    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();

    await page.getByRole('link', { name: /Add Visit/i }).first().click();

    await visitPage.fillVisitDate(todayDate());
    await visitPage.fillDescription('Same-day urgent visit');
    await visitPage.submit();

    await expect(page.getByRole('heading', { name: /Pets and Visits/i })).toBeVisible();
  });

  test('accepts a future date and redirects to the owner page', async ({ page }) => {
    const visitPage = new VisitPage(page);
    await page.goto('/owners/1');
    await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();

    await page.getByRole('link', { name: /Add Visit/i }).first().click();

    await visitPage.fillVisitDate(futureDate());
    await visitPage.fillDescription('Scheduled future visit');
    await visitPage.submit();

    await expect(page.getByRole('heading', { name: /Pets and Visits/i })).toBeVisible();
  });
});
