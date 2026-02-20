# 11-spec-language-selector.md

## Introduction/Overview

The Emerald Grove application already supports multiple locales via Spring's `SessionLocaleResolver` and `LocaleChangeInterceptor` (triggered by `?lang=xx`), but there is no user-facing control to switch languages. This feature adds a Bootstrap dropdown to the global navbar that lets users switch between English (EN), Spanish (ES), and German (DE) using the existing `?lang=xx` mechanism. The selected language persists for the rest of the browser session.

## Goals

- Expose the existing locale-switching mechanism through a visible, usable UI control in every page's navbar.
- Display the currently active language as the dropdown button label, with all three options listed inside the dropdown.
- Highlight the active language in the dropdown so users always know which language is selected.
- Ensure the selector integrates cleanly with the Bootstrap 5 responsive navbar (collapses into the hamburger menu on mobile).
- Cover the feature with an automated Playwright E2E test that switches language and asserts translated content.

## User Stories

**As a user**, I want to switch the UI language from within the app so that I can use the application in my preferred language without manually editing URLs.

**As a user**, I want the selected language to persist as I navigate through the site so that I do not have to re-select my language on every page.

**As a user**, I want to see which language is currently active so that I am not confused about the current locale state.

---

## Demoable Units of Work

### Unit 1 — Language Selector UI and i18n Keys

**Purpose:** A Bootstrap dropdown labeled with the current locale code appears in the navbar on every page. Three message keys power the labels; all 9 locale files contain them, keeping `I18nPropertiesSyncTest` green.

**Functional Requirements:**

- FR-1.1 The layout fragment (`fragments/layout.html`) shall include a Bootstrap 5 dropdown inside the collapsible `#main-navbar` div (i.e., within the hamburger-responsive area), positioned in the right-aligned `navbar-nav ms-auto` section.
- FR-1.2 The dropdown trigger button shall display the current language's short code (e.g., "EN", "ES", or "DE") using the Thymeleaf expression `${#locale.language.toUpperCase()}` so it reflects the active session locale.
- FR-1.3 The dropdown shall contain exactly three items: EN (links to current page with `?lang=en`), ES (links to current page with `?lang=es`), and DE (links to current page with `?lang=de`).
- FR-1.4 The dropdown item whose `lang` value matches the current session locale shall have the Bootstrap `active` class and `aria-current="true"` applied so it is visually highlighted.
- FR-1.5 All visible text in the selector (the three item labels) shall use `th:text="#{...}"` bound to message keys — no hardcoded visible strings — to satisfy `I18nPropertiesSyncTest.checkNonInternationalizedStrings`.
- FR-1.6 Three new message keys shall be added to `messages.properties` (base English) and to all 8 locale override files: `lang.en=EN`, `lang.es=ES`, `lang.de=DE`.
- FR-1.7 `I18nPropertiesSyncTest` (both `checkNonInternationalizedStrings` and `checkI18nPropertyFilesAreInSync`) shall pass after the template and message file changes.

**Proof Artifacts:**

- Test: `I18nPropertiesSyncTest` — `./mvnw test -Dtest=I18nPropertiesSyncTest -q` returns `BUILD SUCCESS` demonstrates all 3 new keys are present in all 9 locale files and no hardcoded visible text exists.
- Screenshot: `lang-selector-en.png` — Vet Directory page with dropdown open in English ("EN" active and highlighted) demonstrates the selector UI and active-state highlighting.

---

### Unit 2 — Language Switching and Session Persistence

**Purpose:** Clicking a language option navigates to the same page in the chosen language, and that language remains active across subsequent page navigations in the same session.

**Functional Requirements:**

- FR-2.1 When a user clicks a language option, the browser navigates to the current page's path with `?lang=xx` appended (e.g., `/vets.html?lang=es`), triggering the `LocaleChangeInterceptor` to update the session locale.
- FR-2.2 After selecting a language, visible UI text — including navbar labels, page headings, and form labels — shall render in the selected language on the returned page.
- FR-2.3 After switching language on one page, navigating to any other page in the same session shall continue to render UI text in the selected language (no `?lang=xx` needed on subsequent URLs).
- FR-2.4 On a fresh session with no language selected, the application shall default to English.
- FR-2.5 Switching from one language to another (e.g., ES → DE) shall immediately reflect the new language on the current page.

**Proof Artifacts:**

- Screenshot: `lang-selector-es.png` — The same Vet Directory page captured in Spanish (nav labels and page heading in Spanish) demonstrates language switching works.
- Screenshot: `lang-selector-de.png` — The same page captured in German demonstrates a second successful language switch.

---

### Unit 3 — Playwright E2E Tests

**Purpose:** Automated E2E tests verify the selector is visible, language switching works, UI text is translated, and the selection persists across page navigation.

**Functional Requirements:**

- FR-3.1 A new `language-selector.spec.ts` file shall be created under `e2e-tests/tests/features/` following the same `test.describe` / page-object structure used by other spec files in the suite.
- FR-3.2 Test `language dropdown is visible and shows active language`: open any page, assert the language dropdown toggle is visible and its text matches the current locale code ("EN" by default).
- FR-3.3 Test `can switch UI language to Spanish`: click the ES option, assert at least one translated nav label (e.g., "Veterinarios" for the Veterinarians link) is visible on the returned page; assert "ES" is the active dropdown item.
- FR-3.4 Test `language persists across page navigation`: switch to Spanish, then navigate to a different page (e.g., Find Owners), assert the translated nav label is still visible without re-applying `?lang=es`.
- FR-3.5 A `LanguageSelectorPage` helper (or extension to an existing base page) shall expose: `languageDropdown()` locator, `switchLanguage(code: string)` action, `activeLanguage()` getter returning the currently displayed code, and `openWithLanguage(lang: string)` for navigating with a pre-set locale.

**Proof Artifacts:**

- Test: `language-selector.spec.ts` — `cd e2e-tests && npm test` passes all new tests and all pre-existing tests with 0 failures demonstrates end-to-end switching behavior.

---

## Non-Goals (Out of Scope)

1. **Additional languages beyond EN/ES/DE**: Farsi, Korean, Portuguese, Russian, and Turkish locale files exist in the repository and will receive the three new i18n keys (required by `I18nPropertiesSyncTest`), but no UI language options will be added for them.
2. **Browser language auto-detection**: The application will not inspect `Accept-Language` headers to set a default locale automatically.
3. **Persistent language preference beyond the session**: Language selection will not be stored in a cookie, database, or user profile; it resets to English on a new session.
4. **Flag icons or emoji in the selector**: Labels are short codes only ("EN", "ES", "DE").
5. **Translating any existing message values**: Only the three new `lang.xx` keys will be added; no existing translations will be modified.

---

## Design Considerations

- The dropdown trigger button shall carry `class="btn btn-sm btn-outline-light dropdown-toggle"` (or similar muted style) so it does not visually compete with the primary nav links; align with the existing Bootstrap 5 dark-navbar aesthetic.
- The dropdown shall use Bootstrap's standard `.dropdown-menu` / `.dropdown-item` markup; active item uses `.dropdown-item.active` + `aria-current="true"`.
- On desktop the selector appears on the right of the navbar (inside `ms-auto` list); on mobile it collapses inside the hamburger menu alongside the other nav items.
- The dropdown trigger button needs an accessible label: use `aria-label` set to a descriptive phrase (e.g., `aria-label="Select language"`) in addition to the visible code text.
- Refer to the existing `findOwners.html` for Bootstrap 5 form/nav patterns and `vetList.html` for the `@{...}` Thymeleaf URL builder syntax used in navigation links.

---

## Repository Standards

- **Strict TDD**: All HTML changes must be driven by failing tests first. Since the UI change is in a shared layout fragment (not a controller), the primary test driver is `I18nPropertiesSyncTest` (add keys → template → verify both sync tests pass) and the E2E test suite.
- **`@WebMvcTest` + `@MockitoBean`**: No new controller tests are needed (no controller logic changes); `I18nPropertiesSyncTest` covers the template/i18n side.
- **No hardcoded visible text in HTML**: All user-facing strings must use `th:text="#{key}"` — enforced by `I18nPropertiesSyncTest.checkNonInternationalizedStrings`.
- **All 9 locale files in sync**: `messages.properties` (base) + `messages_en.properties` + 7 locale overrides must all contain the 3 new keys — enforced by `I18nPropertiesSyncTest.checkI18nPropertyFilesAreInSync`.
- **Conventional commits**: `feat:` for template and i18n changes, `test:` for E2E additions.
- **Playwright page-object model**: New page helpers in `e2e-tests/tests/pages/`; tests in `e2e-tests/tests/features/`; screenshots via `testInfo.outputPath(...)`.
- **Markdownlint**: All fenced code blocks in proof markdown files must include a language specifier (e.g., ` ```bash `).
- **Pre-commit hooks**: Maven compile check and whitespace trim run on every commit; ensure no compilation errors before committing.

---

## Technical Considerations

- **No backend changes required**: `SessionLocaleResolver` and `LocaleChangeInterceptor` are already configured in `WebConfiguration.java` and respond to `?lang=xx` on any URL.
- **"Stay on current page" implementation**: The dropdown items shall link to the current request path with `?lang=xx`. In Thymeleaf, use `${#httpServletRequest.requestURI}` to obtain the current path; build the link as a Thymeleaf URL expression or by appending the `lang` parameter. Note: existing query parameters (e.g., `?page=2&specialty=radiology`) will not be preserved — only the path is carried over.
- **Active item detection**: Use `th:classappend="${#locale.language == 'en'} ? 'active'"` (and analogously for `es`, `de`) to conditionally apply Bootstrap's active class.
- **The three new i18n keys are intentionally trivial** (`lang.en=EN`, etc.) — their main purpose is satisfying `I18nPropertiesSyncTest` for a template that must use `#{...}` for all visible text.
- **E2E test reliability**: `?lang=en` can be used in `openWithLanguage()` to reset the session locale to English at the start of each test, ensuring test isolation without relying on session state from previous tests.

---

## Security Considerations

- The `lang` parameter is handled entirely by Spring's `LocaleChangeInterceptor`; it validates against `java.util.Locale`, so malformed values are silently ignored (locale falls back to the session default). No sanitization code is needed.
- No credentials, tokens, or sensitive data are involved in this feature.
- Proof artifact screenshots show only the public UI; no sensitive information will be captured.

---

## Success Metrics

1. **`I18nPropertiesSyncTest` green**: Both sync tests pass after adding keys — 0 failures, 0 warnings.
2. **E2E suite green**: All pre-existing E2E tests continue to pass; all new language-selector tests pass — 0 failures.
3. **Visible across all pages**: The language dropdown is present in the navbar on every page rendered by the layout fragment.
4. **Language switching works end-to-end**: Selecting ES or DE changes at least the navbar labels and page headings to the corresponding language, confirmed by screenshot and Playwright assertion.

---

## Open Questions

No open questions at this time.
