import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';

test('Home page accessibility scan reports violations', async ({ page }) => {
  await page.goto('/');

  const require = createRequire(import.meta.url);
  const axePath = require.resolve('axe-core/axe.min.js');
  await page.addScriptTag({ path: axePath });

  const results = await page.evaluate(async () => {
    const w = window as any;
    return await w.axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });
  });

  const violations = (results as any).violations as any[];
  const critical = violations.filter((v) => v.impact === 'critical');
  expect(critical.length).toBeGreaterThan(0);
});
