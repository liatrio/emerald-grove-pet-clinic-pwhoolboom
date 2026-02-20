# 09 Tasks - Find Owners Multi-Filter

## Relevant Files

### Production Code

- `src/main/java/org/springframework/samples/petclinic/owner/OwnerRepository.java` — Add new multi-field query method supporting optional lastName (prefix), telephone (exact), and city (prefix) filters.
- `src/main/java/org/springframework/samples/petclinic/owner/OwnerController.java` — Update `processFindForm` to read and validate telephone/city, call the new repository method, issue a global "not found" error, and update `addPaginationModel` to pass all three filter values.
- `src/main/resources/templates/owners/findOwners.html` — Add Telephone and City input fields; add a top-of-form global error alert and per-field telephone error display.
- `src/main/resources/templates/owners/ownersList.html` — Update all pagination `th:href` links to include `telephone` and `city` query parameters alongside `lastName`; extend the active filter badge.
- `src/main/resources/messages/messages.properties` — Add new keys: `findOwners.telephone.label`, `findOwners.city.label`, `findOwners.noOwnersFound`; update `home.findOwners.help`.
- `src/main/resources/messages/messages_en.properties` — English translations for new keys.
- `src/main/resources/messages/messages_de.properties` — German translations for new keys.
- `src/main/resources/messages/messages_es.properties` — Spanish translations for new keys.
- `src/main/resources/messages/messages_fa.properties` — Persian translations for new keys.
- `src/main/resources/messages/messages_ko.properties` — Korean translations for new keys.
- `src/main/resources/messages/messages_pt.properties` — Portuguese translations for new keys.
- `src/main/resources/messages/messages_ru.properties` — Russian translations for new keys.
- `src/main/resources/messages/messages_tr.properties` — Turkish translations for new keys.

### Test Code

- `src/test/java/org/springframework/samples/petclinic/service/ClinicServiceTests.java` — Add `@DataJpaTest` integration tests for all multi-field filter combinations against the H2 sample data.
- `src/test/java/org/springframework/samples/petclinic/owner/OwnerControllerTests.java` — Add `@WebMvcTest` controller tests for multi-field filtering, telephone validation, pagination model attributes, and rendered pagination link content; update the existing `testProcessFindFormNoOwnersFound` test to expect a global form error instead of a `lastName` field error.
- `e2e-tests/tests/pages/owner-page.ts` — Extend `OwnerPage` with `searchByTelephone`, `searchByCity`, and `searchByFilters` helper methods.
- `e2e-tests/tests/features/find-owners-multi-filter.spec.ts` — New Playwright spec file: create-then-find by telephone, create-then-find by city, combined filters, and invalid telephone validation error.

### Notes

- Run Java unit tests with: `./mvnw test -Dtest=ClinicServiceTests` or `./mvnw test -Dtest=OwnerControllerTests`
- Run all Java tests with: `./mvnw test`
- Run E2E tests with: `cd e2e-tests && npm test -- --grep "Multi-Field Owner Search"`
- All production code changes must be preceded by a failing test (Red-Green-Refactor).
- The `Owner` entity has `@NotBlank` and `@Pattern` on `telephone`, but `processFindForm` does **not** use `@Valid`, so those annotations do not trigger automatically — telephone search validation must be applied manually in the controller.
- Pass `null` (not empty string) to the new repository method for omitted filters; the JPQL query should treat `null` as "no filter applied".
- The existing `testProcessFindFormNoOwnersFound` test expects a `lastName` field error; it must be updated in task 2.1 to expect a global form error instead.

## Tasks

### [x] 1.0 Add multi-field owner search to OwnerRepository

**Purpose:** Create the data-access foundation that supports filtering owners by any combination of last name (prefix), telephone (exact), and city (prefix) using AND logic. All filters are optional.

#### 1.0 Proof Artifact(s)

- Test: `ClinicServiceTests` — new `@DataJpaTest` tests pass, demonstrating that the repository correctly filters by telephone only, city only, combined last name + city, and all three fields together against the H2 sample data.
- Test: `ClinicServiceTests` — test confirms that omitting all filters (all null) returns all owners (existing behavior preserved).

#### 1.0 Tasks

- [x] 1.1 In `ClinicServiceTests`, write a failing test `shouldFindOwnersByTelephone` that calls the new method with only a telephone value (e.g., `"6085551023"`) and asserts exactly one owner is returned (George Franklin), and with a telephone that matches no one returns an empty result. (RED)
- [x] 1.2 Write a failing test `shouldFindOwnersByCityPrefix` that calls the new method with only a city prefix (e.g., `"Mad"`) and asserts two owners are returned (Franklin and McTavish, both in "Madison"). (RED)
- [x] 1.3 Write a failing test `shouldFindOwnersByLastNameAndCity` that calls the new method with both lastName `"Davis"` and city `"Wind"` and asserts only Harold Davis (Windsor) is returned, not Betty Davis (Sun Prairie). (RED)
- [x] 1.4 Write a failing test `shouldFindOwnersByAllThreeFilters` that calls the new method with all three values (e.g., lastName `"Franklin"`, telephone `"6085551023"`, city `"Mad"`) and asserts exactly one owner is returned. (RED)
- [x] 1.5 Write a failing test `shouldReturnAllOwnersWhenNoFiltersProvided` that calls the new method with all three parameters as `null` and asserts all owners in the sample data are returned. (RED)
- [x] 1.6 Add a new method to `OwnerRepository` — for example `findByFilters(String lastName, String telephone, String city, Pageable pageable)` — using a `@Query` JPQL annotation with conditional AND logic: `(:lastName IS NULL OR LOWER(o.lastName) LIKE LOWER(CONCAT(:lastName, '%')))`, `(:telephone IS NULL OR o.telephone = :telephone)`, `(:city IS NULL OR LOWER(o.city) LIKE LOWER(CONCAT(:city, '%')))`. (GREEN)
- [x] 1.7 Run `./mvnw test -Dtest=ClinicServiceTests` and confirm all five new tests and all pre-existing tests pass. (VERIFY)

---

### [x] 2.0 Extend Find Owners form and controller for multi-field filtering

**Purpose:** Add Telephone and City input fields to the Find Owners form and update the controller to pass all three filter values to the new repository method, displaying a general "not found" error at the top of the form when no owners match.

#### 2.0 Proof Artifact(s)

- Screenshot: `find-owners-form-empty.png` — empty Find Owners form showing Last Name, Telephone, and City input fields with the Find Owner button, demonstrating the updated UI.
- Screenshot: `find-owners-results.png` — Find Owners form with a filter value filled in and the matching owner(s) listed in the results table, demonstrating end-to-end multi-field filtering.
- Test: `OwnerControllerTests` — new controller tests pass for: filtering by telephone only, filtering by city only, filtering by all three fields, and the general "not found" error displayed when no owners match.

#### 2.0 Tasks

- [x] 2.1 In `OwnerControllerTests`, update the existing `testProcessFindFormNoOwnersFound` test to expect a **global** form error (`model().hasErrors()`) instead of the current `lastName` field error (`model().attributeHasFieldErrors("owner", "lastName")`), because the "not found" message will move to a top-of-form alert. (RED — this test should now fail with the current code)
- [x] 2.2 In `OwnerControllerTests`, write a failing test `testProcessFindFormByTelephone` that performs `GET /owners?telephone=6085551023`, stubs the new repository method to return one owner, and expects a redirect to that owner's detail page. (RED)
- [x] 2.3 Write a failing test `testProcessFindFormByCityPrefix` that performs `GET /owners?city=Mad&page=1`, stubs the new method to return a multi-owner page, and expects the `ownersList` view with `listOwners` in the model. (RED)
- [x] 2.4 Write a failing test `testProcessFindFormByAllThreeFilters` that passes lastName, telephone, and city params together and expects the single-result redirect behaviour. (RED)
- [x] 2.5 Update `processFindForm` in `OwnerController`: read `telephone` and `city` from the `Owner` model binding (Spring MVC will populate them automatically); convert empty strings to `null`; call the new `findByFilters` repository method (instead of `findByLastNameStartingWith`). Update `findPaginatedForOwnersLastName` to also accept and forward `telephone` and `city` parameters, or replace it with a new helper `findPaginatedByFilters`. (GREEN)
- [x] 2.6 Update the "not found" branch in `processFindForm` to use `result.reject("notFound", "not found")` (a global form error) instead of `result.rejectValue("lastName", "notFound", "not found")`. (GREEN)
- [x] 2.7 In `findOwners.html`, add a **Telephone** `<div class="form-group">` block with `<input th:field="*{telephone}" ...>` following the same `control-group` Bootstrap structure as the existing Last Name field. Add a **City** field block in the same way beneath Telephone. (GREEN)
- [x] 2.8 In `findOwners.html`, add a `<div th:if="${#fields.hasGlobalErrors()}" class="alert alert-danger">` block at the top of the form (above the Last Name field group) to display the global "not found" error message. Remove the existing lastName-scoped `#fields.hasAnyErrors()` error block from inside the lastName `control-group` (or narrow it to lastName-specific errors only). (GREEN)
- [x] 2.9 Run `./mvnw test -Dtest=OwnerControllerTests` and confirm all new and updated tests pass. Then start the application (`./mvnw spring-boot:run`) and take the two screenshots: `find-owners-form-empty.png` (empty form with three fields) and `find-owners-results.png` (results after searching). (VERIFY)

---

### [x] 3.0 Add inline telephone validation to the search form

**Purpose:** Reject a non-empty telephone value in the search form that does not match the 10-digit numeric rule, surfacing a clear inline error message beneath the Telephone field without performing a database search.

#### 3.0 Proof Artifact(s)

- Screenshot: `find-owners-telephone-validation-error.png` — Find Owners form with an invalid telephone value entered (e.g., `"123"`) and the localized `telephone.invalid` error message displayed inline beneath the Telephone field.
- Test: `OwnerControllerTests` — new controller tests pass for: invalid telephone shows field error and returns `findOwners` view; valid 10-digit telephone proceeds to search; blank telephone is ignored (no error).

#### 3.0 Tasks

- [x] 3.1 In `OwnerControllerTests`, write a failing test `testProcessFindFormInvalidTelephone` that performs `GET /owners?telephone=123` and expects: status `200`, view `owners/findOwners`, and a field error on `telephone` with code `telephone.invalid`. (RED)
- [x] 3.2 Write a failing test `testProcessFindFormEmptyTelephoneNoError` that performs `GET /owners?page=1` (no telephone param), stubs `findByFilters` to return an empty page, and expects that no field error exists on `telephone` — only the global "not found" error. (RED)
- [x] 3.3 Write a failing test `testProcessFindFormValidTelephoneNoError` that performs `GET /owners?telephone=6085551023&page=1`, stubs `findByFilters` to return one owner, and expects a redirect — confirming that a valid telephone is not rejected. (RED)
- [x] 3.4 In `processFindForm` in `OwnerController`, add a telephone format check **before** calling the repository: if `telephone` is non-null and non-empty and does not match the regex `\d{10}`, call `result.rejectValue("telephone", "telephone.invalid")` and immediately return the `findOwners` view. (GREEN)
- [x] 3.5 In `findOwners.html`, inside the Telephone `control-group`, add a `<div th:if="${#fields.hasErrors('telephone')}"><p th:each="err : ${#fields.errors('telephone')}" th:text="${err}">Error</p></div>` block beneath the telephone input (matching the same inline error style used in `createOrUpdateOwnerForm.html`). (GREEN)
- [x] 3.6 Run `./mvnw test -Dtest=OwnerControllerTests` and confirm all three new tests and all pre-existing tests pass. Start the app, enter `"123"` in the Telephone search field, click Find Owner, and take the screenshot `find-owners-telephone-validation-error.png`. (VERIFY)

---

### [x] 4.0 Preserve telephone and city in pagination links and add i18n message keys

**Purpose:** Carry all three active filter values (lastName, telephone, city) through pagination navigation links so that multi-page results remain correctly scoped, and add all new UI text message keys to all 8 locale files.

#### 4.0 Proof Artifact(s)

- Test: `OwnerControllerTests` — new controller tests pass confirming the model contains `telephone` and `city` attributes when multi-page results are returned with those filters active, and that the rendered HTML pagination links include the correct `telephone=` and `city=` query parameters.
- Test: `I18nPropertiesSyncTest` passes, confirming all 8 locale files contain the new keys.

#### 4.0 Tasks

- [x] 4.1 In `OwnerControllerTests`, write a failing test `testPaginationModelIncludesTelephoneWhenFilterActive` that stubs `findByFilters` to return a multi-page result for a telephone filter, performs `GET /owners?telephone=6085551023&page=1`, and asserts `model().attribute("telephone", "6085551023")`. (RED)
- [x] 4.2 Write a failing test `testPaginationModelIncludesCityWhenFilterActive` that performs `GET /owners?city=Mad&page=1` with a multi-page stub result and asserts `model().attribute("city", "Mad")`. (RED)
- [x] 4.3 Write a failing test `testPaginationLinksIncludeTelephoneAndCityWhenFiltersActive` that performs `GET /owners?lastName=Franklin&telephone=6085551023&city=Mad&page=1` with a multi-page stub result and asserts the rendered content contains both `telephone=6085551023` and `city=Mad` as substrings (using `content().string(containsString(...))`). (RED)
- [x] 4.4 Update `addPaginationModel` in `OwnerController` to accept `telephone` and `city` parameters and add them to the model using the same null-check pattern as `lastName` (e.g., `model.addAttribute("telephone", telephone == null || telephone.isEmpty() ? null : telephone)`). Update the `findPaginatedByFilters` helper to pass telephone and city through as well. (GREEN)
- [x] 4.5 In `ownersList.html`, update **all six** pagination `th:href` expressions (page numbers, First, Previous, Next, Last) to include `telephone=${telephone}` and `city=${city}` alongside the existing `lastName=${lastName}` parameter, for example: `@{/owners(page=${i}, lastName=${lastName}, telephone=${telephone}, city=${city})}`. (GREEN)
- [x] 4.6 In `ownersList.html`, extend the active filter badge `<span>` to also display telephone and city when those model attributes are non-null (add similar `th:if` spans for telephone and city next to the existing lastName badge). (GREEN)
- [x] 4.7 Add the following four keys to `src/main/resources/messages/messages.properties`:
  - `findOwners.telephone.label=Telephone`
  - `findOwners.city.label=City`
  - `findOwners.noOwnersFound=No owners found matching the provided criteria.`
  - Update `home.findOwners.help=Search by last name, telephone, or city to locate an owner record.`
  (GREEN)
- [x] 4.8 Add the same four keys (translated) to each of the 8 locale files: `messages_en.properties`, `messages_de.properties`, `messages_es.properties`, `messages_fa.properties`, `messages_ko.properties`, `messages_pt.properties`, `messages_ru.properties`, `messages_tr.properties`. Use the same key names; provide a reasonable translation for each locale (machine translation is acceptable as a starting point). (GREEN)
- [x] 4.9 Update `findOwners.html` to use `th:text="#{findOwners.telephone.label}"` on the Telephone field label and `th:text="#{findOwners.city.label}"` on the City field label (replacing any hardcoded text added in task 2.7). (GREEN)
- [x] 4.10 Run `./mvnw test -Dtest="OwnerControllerTests,I18nPropertiesSyncTest"` and confirm all new and pre-existing tests pass. (VERIFY)

---

### [x] 5.0 Add E2E Playwright tests for multi-field owner search

**Purpose:** Validate the full end-to-end user journey of creating an owner and then finding them by telephone, city, and a combination of both, and confirm that invalid telephone input on the search form is rejected with a visible error.

#### 5.0 Proof Artifact(s)

- Test: `find-owners-multi-filter.spec.ts` — all Playwright tests in the new spec file pass, covering create-then-find by telephone, create-then-find by city, combined filters, and the validation error.
- Screenshot: `e2e-find-by-telephone.png` — captured inside the "find by telephone" test, showing the owner detail page reached via telephone search.
- Screenshot: `e2e-find-by-city.png` — captured inside the "find by city" test, showing the owners results table with the matching owner visible.

#### 5.0 Tasks

- [x] 5.1 In `e2e-tests/tests/pages/owner-page.ts`, add the following helper methods to the `OwnerPage` class:
  - `async searchByTelephone(telephone: string)` — fills the `input#telephone` search field and clicks Find Owner.
  - `async searchByCity(city: string)` — fills the `input#city` search field and clicks Find Owner.
  - `async searchByFilters({ lastName, telephone, city }: { lastName?: string; telephone?: string; city?: string })` — fills whichever of the three fields are provided and clicks Find Owner.
  - `telephoneValidationError(): Locator` — returns the locator for the inline telephone field error (e.g., `this.page.locator('#telephoneGroup .help-inline p')` or the equivalent selector matching the template).
- [x] 5.2 Create `e2e-tests/tests/features/find-owners-multi-filter.spec.ts` with a `test.describe('Multi-Field Owner Search', ...)` block. Write a test `'can find an owner by telephone number'` that: creates a new owner via `createOwner()`, navigates to Find Owners, calls `searchByTelephone(owner.telephone)`, and asserts that the Owner Information heading is visible (single-result redirect). Capture `testInfo.outputPath('e2e-find-by-telephone.png')` after landing on the detail page.
- [x] 5.3 Add a test `'can find owners by city prefix'` that: creates a new owner with a distinctive city (e.g., override `city: 'UniqueCity'`), navigates to Find Owners, calls `searchByCity('UniqueC')`, and asserts the owners results table is visible and contains the owner's name. Capture `testInfo.outputPath('e2e-find-by-city.png')`.
- [x] 5.4 Add a test `'can find an owner by combined telephone and city filters'` that: creates a new owner, navigates to Find Owners, calls `searchByFilters({ telephone: owner.telephone, city: owner.city })`, and asserts the owner detail page or results table is shown. Capture a screenshot `testInfo.outputPath('e2e-find-by-combined.png')`.
- [x] 5.5 Add a test `'shows inline telephone validation error for invalid telephone input'` that: navigates to Find Owners, calls `searchByTelephone('123')`, and asserts `ownerPage.telephoneValidationError()` is visible and contains the text "10-digit".
- [x] 5.6 Run `cd e2e-tests && npm test -- --grep "Multi-Field Owner Search"` and confirm all four new tests pass. (VERIFY)
- [x] 5.7 Run the full E2E suite (`cd e2e-tests && npm test`) and confirm no pre-existing tests are broken. (VERIFY)
