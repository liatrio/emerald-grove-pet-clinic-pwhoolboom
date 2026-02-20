# 11-tasks-language-selector.md

## Relevant Files

- `src/main/resources/messages/messages.properties` - Base English file; add 3 new keys: `lang.en`, `lang.es`, `lang.de`.
- `src/main/resources/messages/messages_de.properties` - German locale; add the 3 new keys.
- `src/main/resources/messages/messages_es.properties` - Spanish locale; add the 3 new keys.
- `src/main/resources/messages/messages_fa.properties` - Farsi locale; add the 3 new keys.
- `src/main/resources/messages/messages_ko.properties` - Korean locale; add the 3 new keys.
- `src/main/resources/messages/messages_pt.properties` - Portuguese locale; add the 3 new keys.
- `src/main/resources/messages/messages_ru.properties` - Russian locale; add the 3 new keys.
- `src/main/resources/messages/messages_tr.properties` - Turkish locale; add the 3 new keys.
- `src/main/resources/templates/fragments/layout.html` - Global layout fragment; add the Bootstrap 5 language selector dropdown inside `ul.navbar-nav.ms-auto`.
- `src/test/java/org/springframework/samples/petclinic/system/I18nPropertiesSyncTest.java` - Referenced only; must continue to pass after all changes.
- `e2e-tests/tests/pages/base-page.ts` - Extend `BasePage` with language selector helper methods shared by all page objects.
- `e2e-tests/tests/features/language-selector.spec.ts` - **NEW**: Playwright E2E tests for all language selector user journeys.
- `docs/specs/11-spec-language-selector/11-proofs/` - **NEW**: Directory for proof artifact markdown files and screenshots.

### Notes

- Run Java tests with: `./mvnw test -Dtest=<TestClassName> -q`
- Run E2E tests with: `cd e2e-tests && npm test`
- Follow the `@{...}` Thymeleaf URL builder syntax used in `vetList.html` for pagination links.
- Follow the `test.describe` / page-object model structure used in `vet-specialty-filter.spec.ts`.
- `messages_en.properties` is intentionally excluded from the `I18nPropertiesSyncTest` sync check — do **not** add the new keys there.
- The language codes (`lang.en=EN`, `lang.es=ES`, `lang.de=DE`) are universal short codes and the same value in all locale files.
- All fenced code blocks in proof markdown files must include a language specifier (e.g., ` ```bash `, ` ```text `) to pass the markdownlint pre-commit hook.

---

## Tasks

### [x] 1.0 i18n: Add Language Selector Message Keys to All Locale Files

#### 1.0 Proof Artifact(s)

- Test: `I18nPropertiesSyncTest` — `./mvnw test -Dtest=I18nPropertiesSyncTest -q` returns `BUILD SUCCESS` demonstrates all 3 new keys (`lang.en`, `lang.es`, `lang.de`) are present in all 9 locale files and the base file is in sync with every locale override

#### 1.0 Tasks

- [ ] 1.1 Add the following 3 keys to `messages.properties` (base English) after the last existing key on line 87: `lang.en=EN`, `lang.es=ES`, `lang.de=DE`.
- [ ] 1.2 Add the same 3 keys to `messages_de.properties`: `lang.en=EN`, `lang.es=ES`, `lang.de=DE`. (The short codes are the same in all languages.)
- [ ] 1.3 Add the same 3 keys to `messages_es.properties`: `lang.en=EN`, `lang.es=ES`, `lang.de=DE`.
- [ ] 1.4 Add the same 3 keys to `messages_fa.properties`: `lang.en=EN`, `lang.es=ES`, `lang.de=DE`.
- [ ] 1.5 Add the same 3 keys to `messages_ko.properties`: `lang.en=EN`, `lang.es=ES`, `lang.de=DE`.
- [ ] 1.6 Add the same 3 keys to `messages_pt.properties`: `lang.en=EN`, `lang.es=ES`, `lang.de=DE`.
- [ ] 1.7 Add the same 3 keys to `messages_ru.properties`: `lang.en=EN`, `lang.es=ES`, `lang.de=DE`.
- [ ] 1.8 Add the same 3 keys to `messages_tr.properties`: `lang.en=EN`, `lang.es=ES`, `lang.de=DE`.
- [ ] 1.9 Run `./mvnw test -Dtest=I18nPropertiesSyncTest -q` and verify both tests pass (`checkNonInternationalizedStrings` and `checkI18nPropertyFilesAreInSync`): `Tests run: 2, Failures: 0`.

---

### [x] 2.0 Template: Add Bootstrap Language Selector Dropdown to Global Layout

#### 2.0 Proof Artifact(s)

- Test: `I18nPropertiesSyncTest` — `./mvnw test -Dtest=I18nPropertiesSyncTest -q` returns `BUILD SUCCESS` demonstrates no hardcoded visible text exists in the updated layout template
- Screenshot: `lang-selector-en.png` — Home page showing the language dropdown button (labeled "EN") open in the navbar with "EN" highlighted as the active option demonstrates the selector UI and active-state
- Screenshot: `lang-selector-es.png` — Same Home page after switching to Spanish (nav labels show "Inicio", "Veterinarios", etc., and "ES" is the active dropdown option) demonstrates language switching works

#### 2.0 Tasks

- [ ] 2.1 Create `e2e-tests/tests/features/language-selector.spec.ts` with a single failing test as the TDD RED phase: import `{ test, expect } from '@fixtures/base-test'`, open a `test.describe('Language Selector', ...)` block, and add one test `language dropdown is visible` that navigates to `http://localhost:8080/` and asserts `page.locator('[data-testid="lang-selector"] .dropdown-toggle').isVisible()`. Run `cd e2e-tests && npx playwright test tests/features/language-selector.spec.ts --reporter=line` and confirm the test **fails** (the element does not exist yet).
- [ ] 2.2 In `layout.html`, add the following Bootstrap 5 dropdown as a new `<li>` inside `ul.navbar-nav.ms-auto` (after the Error menu item, before `</ul>`). The `<li>` must carry `data-testid="lang-selector"` for reliable E2E targeting:
  - The `<li>` element: `<li class="nav-item dropdown" data-testid="lang-selector">`
  - The dropdown trigger `<a>`: `class="nav-link dropdown-toggle"`, `href="#"`, `role="button"`, `data-bs-toggle="dropdown"`, `aria-expanded="false"`, `aria-label="Select language"`, and `th:text="${#locale.language.toUpperCase()}"` (renders the current 2-letter locale code in uppercase, e.g., "EN").
  - The dropdown menu: `<ul class="dropdown-menu dropdown-menu-end">` containing three `<li>` items — one for each of EN (`lang=en`), ES (`lang=es`), and DE (`lang=de`).
  - Each dropdown `<a>` item must: use `class="dropdown-item"`, use `th:classappend="${#locale.language == 'en'} ? ' active'"` (substituting `en`, `es`, `de` for each respective item) to highlight the active language, use `th:text="#{lang.en}"` (substituting `lang.en`, `lang.es`, `lang.de`) for the label, and use `th:href="@{__${#request.requestURI}__(lang=en)}"` (substituting `en`, `es`, `de`) to navigate to the current page path with the new `lang` parameter.
  - Add a fallback visible text (`>EN<`, `>ES<`, `>DE<`) inside each `<a>` for Thymeleaf's static preview — these will be replaced at runtime by `th:text`.
- [ ] 2.3 Run `./mvnw test -Dtest=I18nPropertiesSyncTest -q` and verify BUILD SUCCESS (`Tests run: 2, Failures: 0`). If `checkNonInternationalizedStrings` fails, it means a visible text string in the template was not wrapped with `th:text="#{...}"` — fix it before proceeding.
- [ ] 2.4 With the app running (`./mvnw spring-boot:run`), use `agent-browser` to navigate to `http://localhost:8080/`, open the language dropdown, and take a full-page screenshot. Save it to `docs/specs/11-spec-language-selector/11-proofs/lang-selector-en.png`.
- [ ] 2.5 Navigate to `http://localhost:8080/?lang=es`, open the language dropdown, and take a full-page screenshot. Save it to `docs/specs/11-spec-language-selector/11-proofs/lang-selector-es.png`. Confirm that nav labels show Spanish text (e.g., "Inicio", "Veterinarios") and "ES" is the highlighted active option in the dropdown.

---

### [ ] 3.0 E2E: Playwright Tests for Language Selector

#### 3.0 Proof Artifact(s)

- Test: `language-selector.spec.ts` — `cd e2e-tests && npm test` (full suite) passes with all 4 new language selector tests and all pre-existing tests demonstrates end-to-end language switching, active-state highlighting, and session persistence across navigation

#### 3.0 Tasks

- [ ] 3.1 In `e2e-tests/tests/pages/base-page.ts`, add the following language selector helper methods to `BasePage`:
  - `languageSelectorToggle(): Locator` — returns `this.page.locator('[data-testid="lang-selector"] .dropdown-toggle')`
  - `async switchLanguage(code: string): Promise<void>` — clicks `languageSelectorToggle()` to open the dropdown, then clicks the dropdown item whose text matches the given uppercase code (e.g., `'EN'`, `'ES'`, `'DE'`): `await this.page.locator('[data-testid="lang-selector"] .dropdown-item', { hasText: code }).click()` followed by `await this.page.waitForLoadState('networkidle')`
  - `async activeLanguage(): Promise<string>` — returns the trimmed text of `languageSelectorToggle()` via `(await this.languageSelectorToggle().textContent() ?? '').trim()`
  - `async openWithLanguage(lang: string): Promise<void>` — navigates to `/?lang=${lang}` and waits for the page to be networkidle: `await this.goto(\`/?lang=\${lang}\`); await this.page.waitForLoadState('networkidle')`
- [ ] 3.2 Replace the single placeholder test in `language-selector.spec.ts` (written in sub-task 2.1) with the following full test suite. Import `BasePage` helpers by using the existing `page` fixture; instantiate `new BasePage(page)` is not possible (it is abstract) — instead call the helper methods directly on a concrete page object such as `new VetPage(page)` which inherits from `BasePage`, or create a lightweight `HomePage` if one exists. Check `e2e-tests/tests/pages/` for an existing `home-page.ts`. If it exists, import and use `HomePage`; otherwise use `VetPage` as the concrete page for navigation helpers.
- [ ] 3.3 Add test `language dropdown is visible and shows active language`: navigate to `/`, assert `languageSelectorToggle()` is visible, assert `activeLanguage()` returns `'EN'` (the default English locale).
- [ ] 3.4 Add test `can switch UI language to Spanish`: navigate to `/`, call `switchLanguage('ES')`, assert `activeLanguage()` returns `'ES'`, assert the navbar contains a link whose text is `'Veterinarios'` (the Spanish translation of `#{vets}`), and assert the navbar contains a link whose text is `'Inicio'` (the Spanish translation of `#{home}`).
- [ ] 3.5 Add test `language persists across page navigation`: call `openWithLanguage('es')` to start in Spanish, then call `goVeterinarians()` (inherited from `BasePage`) to navigate to the Vet Directory, assert `activeLanguage()` still returns `'ES'` and the page heading contains `'Veterinarios'` — confirming session persistence without a `?lang=es` param on the subsequent URL.
- [ ] 3.6 Add test `can switch back to English`: call `openWithLanguage('es')`, call `switchLanguage('EN')`, assert `activeLanguage()` returns `'EN'`, assert the navbar link for Veterinarians shows `'Veterinarians'`. Capture a full-page screenshot using `testInfo.outputPath('e2e-lang-selector-switch.png')` to document the switching flow.
- [ ] 3.7 Run `cd e2e-tests && npm test` and verify all 4 new tests pass and all pre-existing E2E tests continue to pass (`0 failed`). Confirm the screenshot was saved.
