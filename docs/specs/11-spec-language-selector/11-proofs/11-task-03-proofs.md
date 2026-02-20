# Spec 11 — Task 3.0 Proof Artifacts

## Task: E2E — Playwright Tests for Language Selector

---

## BasePage Extensions

New language selector helper methods added to `e2e-tests/tests/pages/base-page.ts`:

```typescript
languageSelectorToggle(): Locator {
  return this.page.locator('[data-testid="lang-selector"] .dropdown-toggle');
}

async switchLanguage(code: string): Promise<void> {
  await this.languageSelectorToggle().click();
  await this.page
    .locator('[data-testid="lang-selector"] .dropdown-item', { hasText: code })
    .click();
  await this.page.waitForLoadState('networkidle');
}

async activeLanguage(): Promise<string> {
  return ((await this.languageSelectorToggle().textContent()) ?? '').trim();
}

async openWithLanguage(lang: string): Promise<void> {
  await this.goto(`/?lang=${lang}`);
  await this.page.waitForLoadState('networkidle');
}
```

---

## New Tests — `language-selector.spec.ts`

| Test | Scenario | Assertions |
|---|---|---|
| `language dropdown is visible and shows active language` | Open home page | Dropdown toggle visible; `activeLanguage()` returns "EN" |
| `can switch UI language to Spanish` | Click ES in dropdown | `activeLanguage()` returns "ES"; nav shows "Veterinarios" and "Inicio" |
| `language persists across page navigation` | Set ES via `openWithLanguage('es')`, navigate to `/vets.html` | `activeLanguage()` still "ES"; heading shows "Veterinarios" |
| `can switch back to English from Spanish` | Start in ES, click EN | `activeLanguage()` returns "EN"; nav shows "Veterinarians"; screenshot captured |

**Note on persistence test:** Navigation is done via direct URL (`goto('/vets.html')`) rather than
clicking the nav link, because the nav link text is locale-dependent ("Veterinarios" in Spanish).
Navigating by URL without `?lang=` confirms the `SessionLocaleResolver` maintains the locale
independently of the URL parameter.

---

## CLI Output — Targeted Run

```bash
cd e2e-tests && PATH="/Users/patrickhoolboom/.nvm/versions/node/v20.18.2/bin:$PATH" npx playwright test tests/features/language-selector.spec.ts --reporter=line
```

```text
Running 4 tests using 4 workers
  4 passed
```

---

## CLI Output — Full Suite (Regression Check)

```bash
cd e2e-tests && PATH="/Users/patrickhoolboom/.nvm/versions/node/v20.18.2/bin:$PATH" npx playwright test --reporter=line
```

```text
Running 43 tests using 5 workers
  42 passed, 1 skipped
```

42 passing (4 new + 38 pre-existing), 1 skipped (intentional smoke placeholder), 0 failed.
