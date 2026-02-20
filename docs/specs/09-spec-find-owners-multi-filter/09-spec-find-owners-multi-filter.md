# 09-spec-find-owners-multi-filter.md

## Introduction/Overview

The Find Owners page currently supports searching only by last name. This feature extends the search form to also accept optional telephone and city inputs so that staff can quickly locate an owner using whatever identifying information they have on hand. All provided fields are applied together (AND logic), and the existing last-name-only behavior is fully preserved.

## Goals

- Add optional telephone and city fields to the Find Owners form alongside the existing last name field.
- Filter results using AND logic across all non-empty fields (last name prefix, city prefix, telephone exact match).
- Reject a non-empty telephone search value that is not exactly 10 digits with a clear inline validation message.
- Display a general "not found" message at the top of the form when no owners match the combined criteria.
- Carry all active filter values (lastName, telephone, city) through pagination links so multi-page results remain properly scoped.
- Translate all new message keys into all 8 supported locale files (en, de, es, fa, ko, pt, ru, tr).

## User Stories

- **As a clinic receptionist**, I want to search for an owner by telephone number so that I can find them quickly when they call in without knowing their last name.
- **As a clinic receptionist**, I want to search for owners by city so that I can narrow down a common last name to local patients.
- **As a clinic receptionist**, I want to combine last name, telephone, and city filters so that I get the most precise match possible.
- **As a clinic receptionist**, I want a clear error message when I type an invalid telephone number in the search form so that I know what to correct before I search.

## Demoable Units of Work

### Unit 1: Extended Search Form and Multi-Field Filtering

**Purpose:** Update the Find Owners UI and backend to support searching by any combination of last name, telephone, and city, with all provided values applied as AND filters.

**Functional Requirements:**

- The system shall display two new optional input fields on the Find Owners form: "Telephone" and "City", alongside the existing "Last Name" field.
- The system shall treat all three fields as optional; submitting the form with all fields blank shall return all owners (existing behavior for an empty last name).
- The system shall filter results so that an owner is included only when they match ALL non-empty filter fields (AND logic).
- The system shall match last name using a case-insensitive prefix (starts-with) search, preserving the existing behavior.
- The system shall match city using a case-insensitive prefix (starts-with) search (e.g., "Mad" matches "Madison").
- The system shall match telephone using an exact match (e.g., only "6085551023" matches the owner with that exact telephone).
- The system shall display a general error message at the top of the form (not tied to a specific field) when no owners are found for the provided criteria.
- The system shall redirect directly to the owner's detail page when exactly one owner matches the criteria, consistent with existing single-result behavior.
- The system shall display paginated results when multiple owners match the criteria, consistent with existing behavior.

**Proof Artifacts:**

- `Screenshot: empty Find Owners form` shows three input fields (Last Name, Telephone, City) and the Find Owner button, demonstrating the updated UI.
- `Screenshot: Find Owners with results` shows search fields filled in and matching owners listed in the results table, demonstrating that multi-field filtering works end-to-end.

---

### Unit 2: Telephone Search Validation

**Purpose:** Reject an invalid telephone value in the search form with a clear inline error so that staff get immediate feedback before a search is attempted.

**Functional Requirements:**

- The system shall validate a non-empty telephone value in the search form against the same 10-digit numeric rule used on the owner creation form (`\d{10}`).
- The system shall display an inline validation error on the Telephone field when the input is non-empty but does not match the 10-digit rule (e.g., "123", "abc1234567").
- The system shall not perform a database search when telephone validation fails; the form shall be re-displayed with the error.
- The system shall allow the telephone search field to be left blank with no error (the field is optional).
- The user shall see the same localized validation message that is shown on the owner creation form (key: `telephone.invalid`).

**Proof Artifacts:**

- `Screenshot: inline telephone validation error` shows the Find Owners form with an invalid telephone entered and the validation error message displayed beneath the field, demonstrating that invalid input is rejected before searching.

---

### Unit 3: Pagination Filter Preservation and i18n

**Purpose:** Ensure multi-page search results remain correctly scoped when navigating pages, and that all new UI text is properly translated across all supported locales.

**Functional Requirements:**

- The system shall include active telephone and city filter values as query parameters in all pagination navigation links (First, Previous, Next, Last), consistent with how `lastName` is already preserved from spec 07.
- The system shall add the following new message keys to all 8 locale files: a placeholder/label for the telephone search field, a placeholder/label for the city search field, and a general "no owners found" message for when combined criteria return no results.
- The system shall use the existing `telephone.invalid` message key for the telephone validation error on the search form (no new key required for that message).
- The `home.findOwners.help` description text shall be updated to reflect that searching by telephone and city is also supported.

**Proof Artifacts:**

- `Test: OwnerControllerTests` — new unit tests pass, demonstrating that pagination model includes telephone and city attributes when those filters are active.
- `File diff: messages*.properties` — all 8 locale files contain the new keys, demonstrating full i18n coverage.

---

### Unit 4: E2E Tests — Create and Find by Telephone and City

**Purpose:** Validate the end-to-end user journey of creating an owner and then locating them using telephone and city search, proving the feature works in a real browser.

**Functional Requirements:**

- The E2E test suite shall include a test that creates a new owner and then successfully finds that owner by searching with their telephone number.
- The E2E test suite shall include a test that creates a new owner and then successfully finds that owner by searching with their city.
- The E2E test suite shall include a test that finds an owner using a combination of telephone and city (both fields filled).
- The E2E test suite shall include a test that verifies an invalid telephone on the search form shows the validation error message.
- The `OwnerPage` page-object shall be extended with helper methods for filling the telephone and city search fields.
- All new E2E tests shall follow the existing `test.describe` / `test` structure and use `createOwner()` from the data factory.

**Proof Artifacts:**

- `E2E test run: find-owners-multi-filter.spec.ts passes` — all new Playwright tests pass, demonstrating create-then-find flows for telephone and city search.
- `Screenshot: E2E find by telephone` — captured during the test showing the owner found via telephone search.
- `Screenshot: E2E find by city` — captured during the test showing the owner found via city search.

## Non-Goals (Out of Scope)

1. **Address search**: Searching by street address is not included in this feature.
2. **First name search**: Filtering by first name is not part of this spec.
3. **Full-text / contains search for telephone**: Only prefix-based and exact matching are in scope; fuzzy or substring telephone matching is excluded.
4. **Sorting search results**: Changing the sort order of results is not included.
5. **CSV export filter extension**: The `/owners.csv` endpoint is not updated to accept telephone or city filters.
6. **OR-logic search**: All fields are combined with AND logic only; OR-logic across fields is out of scope.

## Design Considerations

The Find Owners form (`findOwners.html`) currently has a single "Last Name" field with a "Find Owner" button and an "Add Owner" link. The updated form should add "Telephone" and "City" optional inputs beneath the existing "Last Name" field, maintaining the same visual style (Bootstrap grid, `liatrio-form` class, `control-group` structure). The "no results" general error should appear at the top of the form using the same `alert alert-danger` pattern used elsewhere in the application (e.g., on the duplicate owner banner). The existing help text below the form heading should be updated to mention all three searchable fields.

## Repository Standards

- **TDD (Strict Red-Green-Refactor)**: All production code changes must be preceded by a failing test. Write the test first, watch it fail, then implement the minimum code to make it pass.
- **Controller tests**: Use `@WebMvcTest` with `@MockitoBean` and `MockMvc`, following the pattern in `OwnerControllerTests.java`.
- **Repository query methods**: Follow Spring Data JPA naming conventions or use `@Query` annotations consistent with existing methods in `OwnerRepository`.
- **Thymeleaf templates**: Use `th:field`, `th:if`, and `th:text` with message keys; follow the `control-group` / `form-group` / Bootstrap grid structure in `findOwners.html`.
- **Message keys**: Add keys to `messages.properties` and all 8 locale files using the flat-key naming pattern (e.g., `findOwners.telephone.label`, `findOwners.noOwnersFound`).
- **E2E tests**: Use the page-object model (`OwnerPage`), `createOwner()` data factory, `test.describe` grouping, and screenshot capture via `testInfo.outputPath(...)`.
- **Commit style**: Conventional commits (`feat:`, `test:`, `docs:`).
- **Coverage**: New production code must maintain ≥ 90% line coverage.

## Technical Considerations

- The current `processFindForm` method in `OwnerController` accepts an `Owner` model binding and reads `owner.getLastName()`. Since `Owner` has `@NotBlank` and `@Pattern` annotations on `telephone`, using `@Valid Owner` for the search form would fail for blank telephone. The search handler must **not** use `@Valid` for the `Owner` parameter (consistent with the existing implementation), and telephone validation on the search form must be applied manually in the controller.
- The repository currently has `findByLastNameStartingWith(String lastName, Pageable pageable)`. Supporting optional AND-combination of three fields will likely require either a Spring Data JPA `Specification` (Criteria API), a custom `@Query` JPQL with conditional `IS NULL` / empty-string handling, or multiple repository methods for each non-empty combination. The implementation approach is left to the developer; the spec requires the correct behavior, not a specific technique.
- City matching is case-insensitive prefix (starts-with), consistent with how `lastName` matching works today.
- Telephone matching is exact — the search value must equal the stored telephone exactly.
- The `addPaginationModel` helper in `OwnerController` currently passes only `lastName` to the model for pagination link construction. It must be updated to also pass `telephone` and `city` when those filters are active.
- The Thymeleaf `ownersList.html` pagination template must include `telephone` and `city` as query parameters in its pagination links, mirroring the existing `lastName` parameter handling.

## Security Considerations

- All search inputs are passed through Spring Data JPA parameterized queries; no raw SQL concatenation is permitted, preventing SQL injection.
- Telephone and city values rendered back into the form must be HTML-escaped by Thymeleaf (the default behavior), preventing XSS.
- No authentication or authorization changes are required for this feature.
- No sensitive data (API keys, credentials) is involved.

## Success Metrics

1. **All new unit tests pass** with `./mvnw test`, including controller tests for all telephone/city filter combinations.
2. **All new E2E tests pass** with `npm test` in `e2e-tests/`, covering create-then-find by telephone, by city, and by combined criteria.
3. **New message keys present in all 8 locale files**, verified by the existing `I18nPropertiesSyncTest`.
4. **Existing tests continue to pass** — no regression in last-name-only search behavior.
5. **Code coverage ≥ 90%** for new production code as reported by JaCoCo.

## Open Questions

No open questions at this time.
