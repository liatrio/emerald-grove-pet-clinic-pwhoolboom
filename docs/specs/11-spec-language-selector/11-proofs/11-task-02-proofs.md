# Spec 11 — Task 2.0 Proof Artifacts

## Task: Template — Add Bootstrap Language Selector Dropdown to Global Layout

---

## TDD Red Phase

A failing E2E test was written first (`language-selector.spec.ts`) asserting the dropdown toggle
element `[data-testid="lang-selector"] .dropdown-toggle` was visible. The test failed with 1
failure before the template change, confirming TDD RED phase.

---

## Implementation Notes

- Added `<li class="nav-item dropdown" data-testid="lang-selector">` inside `ul.navbar-nav.ms-auto`
  in `src/main/resources/templates/fragments/layout.html`
- Dropdown trigger uses `th:text="${#locale.language.toUpperCase()}"` to show current locale code
- Each dropdown item uses `th:text="#{lang.en|es|de}"` and `th:classappend` for active highlighting
- `${currentUrl}` model attribute (provided by new `LanguageAdvice.java` `@ControllerAdvice`)
  used in `@{__${currentUrl}__(lang=xx)}` URL expressions to stay on current page
- `#request.requestURI` is not available in Thymeleaf 3.1+ templates; `LanguageAdvice`
  is the standard Spring MVC alternative

---

## CLI Output — I18nPropertiesSyncTest

```bash
./mvnw test -Dtest=I18nPropertiesSyncTest -q
```

```text
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0  -- I18nPropertiesSyncTest
BUILD SUCCESS
```

Both `checkNonInternationalizedStrings` and `checkI18nPropertyFilesAreInSync` pass,
confirming no hardcoded visible text in the updated layout template.

---

## Screenshots

### lang-selector-en.png

`lang-selector-en.png` — Home page with the language dropdown open, "EN" toggle button visible
in the navbar and the three options (EN, ES, DE) shown in the dropdown menu.

### lang-selector-es.png

`lang-selector-es.png` — Same Home page after navigating to `/?lang=es`. Nav links show Spanish
translations ("Inicio", "Buscar propietarios", "Veterinarios"). The dropdown button shows "ES"
and the dropdown is open with "ES" as the active highlighted item.
