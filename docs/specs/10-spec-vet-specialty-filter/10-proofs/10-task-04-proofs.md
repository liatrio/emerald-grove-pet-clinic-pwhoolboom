# Spec 10 — Task 4.0 Proof Artifacts

## Task: E2E Playwright Tests: Specialty Filter User Journeys

---

## VetPage Extensions

New helper methods added to `e2e-tests/tests/pages/vet-page.ts`:

```typescript
specialtyFilter(): Locator {
  return this.page.locator('select[name="specialty"]');
}

async filterBySpecialty(value: string): Promise<void> {
  await this.specialtyFilter().selectOption(value);
  await this.page.locator('form[action="/vets.html"] button[type="submit"]').click();
  await this.page.waitForLoadState('networkidle');
}

async selectedFilter(): Promise<string> {
  return this.specialtyFilter().inputValue();
}

async openWithFilter(specialty: string): Promise<void> {
  await this.goto(`/vets.html?specialty=${encodeURIComponent(specialty)}`);
  await this.heading().waitFor();
}
```

---

## New Tests — `vet-specialty-filter.spec.ts`

| Test | Scenario | Assertions |
|---|---|---|
| `can filter vets by a named specialty` | Select "radiology", click Filter | Table shows Helen Leary + Henry Stevens only (2 rows) |
| `can filter vets to show only those with no specialties` | Select "none", click Filter | Table shows James Carter + Sharon Jenkins only (2 rows) |
| `can navigate directly to a filtered URL and see correct results` | Navigate to `?specialty=radiology` | Correct vets shown; `selectedFilter()` returns "radiology" |
| `can clear the filter to show all vets` | Navigate to radiology, then filter by "" (All) | Row count > 2; James Carter, Helen Leary, Henry Stevens all visible |

---

## CLI Output — Targeted Run

```bash
cd e2e-tests && PATH="/Users/patrickhoolboom/.nvm/versions/node/v20.18.2/bin:$PATH" npx playwright test tests/features/vet-specialty-filter.spec.ts --reporter=line
```

```text
Running 4 tests using 4 workers
  4 passed (2.7s)
```

---

## CLI Output — Full Suite (Regression Check)

```bash
cd e2e-tests && PATH="/Users/patrickhoolboom/.nvm/versions/node/v20.18.2/bin:$PATH" npx playwright test --reporter=line
```

```text
Running 39 tests using 5 workers
  38 passed, 1 skipped (7.8s)
```

38 passing (4 new + 34 pre-existing), 1 skipped (intentional smoke placeholder), 0 failed.

---

## Screenshot

`e2e-vet-filter-by-specialty.png` — Captured during the "can clear the filter to show all vets" test
via `testInfo.outputPath('e2e-vet-filter-by-specialty.png')`, showing the unfiltered vet table
after clearing the radiology filter.
