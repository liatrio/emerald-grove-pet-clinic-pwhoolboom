# 07-tasks-preserve-filter-pagination.md

## Relevant Files

- `src/main/java/org/springframework/samples/petclinic/owner/OwnerController.java` — Controller to modify: update `addPaginationModel()` to accept and expose the active `lastName` filter in the Spring MVC model.
- `src/main/resources/templates/owners/ownersList.html` — Template to modify: replace all 5 hardcoded pagination link `th:href` expressions with Thymeleaf parameter-map syntax; add conditional "Active filter" badge.
- `src/test/java/org/springframework/samples/petclinic/owner/OwnerControllerTests.java` — Existing test class to extend: add three new failing tests in the RED phase; confirm they pass after implementation.
- `e2e-tests/tests/features/owner-filter-pagination.spec.ts` — New Playwright test file to create: full end-to-end test for filter persistence across forward and backward pagination.
- `e2e-tests/tests/pages/owner-page.ts` — Existing page object to extend: add helper methods for clicking next/previous pagination links and locating the active filter badge.
- `docs/specs/07-spec-preserve-filter-pagination/proof/` — New directory: store committed proof screenshots for spec validation.

### Notes

- All Java tests live in `src/test/java/` alongside their production counterparts. Run with `./mvnw test -Dtest=OwnerControllerTests`.
- The project enforces **Strict TDD**: write failing tests first (RED), then implement (GREEN), then clean up (REFACTOR). Never modify production code before a failing test exists.
- Thymeleaf's `@{/url(param=${value})}` URL syntax **automatically omits a parameter when its value is `null`**. It does NOT omit it when the value is an empty string `""`. This means the controller must store `null` (not `""`) in the model when there is no active filter, so that clean URLs like `/owners?page=2` are generated without a trailing `&lastName=`.
- Playwright tests import from path aliases: `@fixtures/base-test`, `@pages/owner-page`, `@utils/data-factory`. The project uses ES modules (`"type": "module"` in `package.json`). Run all E2E tests with `cd e2e-tests && npm test`.
- The H2 seed data has only 10 owners with no single last-name prefix producing 6 or more matches. The Playwright test must create owners programmatically via the UI to generate enough rows to trigger multi-page pagination (page size = 5, so 6 owners with a shared prefix = 2 pages).
- For committed proof screenshots, use an explicit absolute path resolved via `fileURLToPath(new URL('../../../docs/specs/07-spec-preserve-filter-pagination/proof/filename.png', import.meta.url))`, following the pattern established in `visit-scheduling.spec.ts`.

---

## Tasks

### [x] 1.0 RED — Write Failing Unit Tests for Filter Preservation

Write the failing tests that define the expected behavior before touching any production code. These tests must fail at this stage because the controller does not yet pass `lastName` to the model and the template does not yet include it in pagination links.

#### 1.0 Proof Artifact(s)

- Test run: `./mvnw test -Dtest=OwnerControllerTests` output shows the three new tests failing, confirming RED phase is established before any production code changes.

#### 1.0 Tasks

- [ ] 1.1 In `OwnerControllerTests.java`, update the existing `testProcessFindFormSuccess()` mock setup so the returned `PageImpl` has a `totalElements` count greater than 5 (the page size). Use the three-argument `PageImpl` constructor: `new PageImpl<>(list, PageRequest.of(0, 5), 10)`. This causes `totalPages` to be 2, which is required for the pagination `div` to render in the template. Without this, the pagination HTML is not rendered and the href assertions in task 1.4 would be meaningless.
- [ ] 1.2 Add a new test method `testPaginationModelIncludesLastNameWhenFilterActive()` to `OwnerControllerTests`. The test should: (1) mock `findByLastNameStartingWith("Franklin", ...)` to return a `PageImpl` with at least 2 owners and `totalElements = 10`; (2) perform `GET /owners?page=1&lastName=Franklin`; (3) assert `status().isOk()`, `view().name("owners/ownersList")`, and `model().attribute("lastName", "Franklin")`. This test **must fail** because `addPaginationModel()` does not yet add `lastName` to the model.
- [ ] 1.3 Add a new test method `testPaginationModelHasNullLastNameWhenNoFilterActive()` to `OwnerControllerTests`. The test should: (1) mock `findByLastNameStartingWith("", ...)` to return a `PageImpl` with at least 2 owners and `totalElements = 10`; (2) perform `GET /owners?page=1` (no `lastName` param); (3) assert `model().attribute("lastName", Matchers.nullValue())`. This test **must fail** for the same reason — `lastName` is not in the model at all yet.
- [ ] 1.4 Add a new test method `testPaginationLinksIncludeLastNameWhenFilterActive()` to `OwnerControllerTests`. The test should: (1) use the same mock setup as 1.2 (multi-page result for "Franklin"); (2) perform `GET /owners?page=1&lastName=Franklin`; (3) assert that the rendered HTML response body contains the string `lastName=Franklin` (use `content().string(containsString("lastName=Franklin"))`). This test **must fail** because the template currently generates hardcoded pagination links without `lastName`.
- [ ] 1.5 Run `./mvnw test -Dtest=OwnerControllerTests` and confirm the three new tests fail. The existing tests should still pass. Save or screenshot the failing test output as confirmation of the RED phase before proceeding.

---

### [x] 2.0 GREEN — Update `OwnerController` to Pass `lastName` to Template Model

Implement the minimum controller change to make the RED phase model-attribute tests pass: route the active `lastName` filter value from `processFindForm()` through `addPaginationModel()` into the Spring MVC model.

#### 2.0 Proof Artifact(s)

- Test run: `./mvnw test -Dtest=OwnerControllerTests` output shows all tests pass, including the two new model-attribute tests from tasks 1.2 and 1.3. The rendered-HTML test (1.4) may still fail at this stage — that is expected; the template is fixed in Task 3.0.

#### 2.0 Tasks

- [ ] 2.1 In `OwnerController.java`, update the signature of the private `addPaginationModel()` method to accept a `String lastName` parameter. The full new signature should be: `private String addPaginationModel(int page, Model model, Page<Owner> paginated, String lastName)`.
- [ ] 2.2 Inside `addPaginationModel()`, add the line `model.addAttribute("lastName", lastName.isEmpty() ? null : lastName);` after the existing `model.addAttribute` calls. Setting the value to `null` when empty (rather than `""`) ensures that Thymeleaf will omit the `lastName` URL parameter entirely when there is no active filter, producing clean URLs like `/owners?page=2`.
- [ ] 2.3 In `processFindForm()`, update the call to `addPaginationModel()` to pass the local `lastName` variable as the new fourth argument. The updated call should be: `return addPaginationModel(page, model, ownersResults, lastName);`.
- [ ] 2.4 Run `./mvnw test -Dtest=OwnerControllerTests`. Confirm that tests 1.2 (`testPaginationModelIncludesLastNameWhenFilterActive`) and 1.3 (`testPaginationModelHasNullLastNameWhenNoFilterActive`) now pass. Test 1.4 (`testPaginationLinksIncludeLastNameWhenFilterActive`) is expected to still fail until the template is updated in Task 3.0.

---

### [~] 3.0 GREEN — Update `ownersList.html` to Include Filter in Pagination Links and Display Active Filter Badge

Fix every pagination link in the Owners list template to include the `lastName` query parameter when a filter is active. Use Thymeleaf parameter-map URL syntax so the parameter is automatically omitted when `lastName` is `null`. Add a conditional "Active filter" badge.

#### 3.0 Proof Artifact(s)

- Test run: `./mvnw test -Dtest=OwnerControllerTests` output shows all tests pass, including test 1.4 (`testPaginationLinksIncludeLastNameWhenFilterActive`), confirming the template now correctly includes `lastName` in pagination link `href` attributes.
- Screenshot: `docs/specs/07-spec-preserve-filter-pagination/proof/filter-pagination-links.png` — browser DevTools Elements panel (or link hover status bar) showing a pagination link `href` of the form `/owners?page=2&lastName=Franklin`, demonstrating that template links correctly carry the filter parameter.

#### 3.0 Tasks

- [ ] 3.1 In `ownersList.html`, replace all five hardcoded pagination `th:href` expressions with Thymeleaf parameter-map URL syntax. Use `@{/owners(page=..., lastName=${lastName})}` for each link. The specific replacements are:
  - **Page number links** (inside `th:each`): change `@{'/owners?page=' + ${i}}` to `@{/owners(page=${i}, lastName=${lastName})}`
  - **First page**: change `@{'/owners?page=1'}` to `@{/owners(page=1, lastName=${lastName})}`
  - **Previous page**: change `@{'/owners?page=__${currentPage - 1}__'}` to `@{/owners(page=${currentPage - 1}, lastName=${lastName})}`
  - **Next page**: change `@{'/owners?page=__${currentPage + 1}__'}` to `@{/owners(page=${currentPage + 1}, lastName=${lastName})}`
  - **Last page**: change `@{'/owners?page=__${totalPages}__'}` to `@{/owners(page=${totalPages}, lastName=${lastName})}`

  Because the controller sets `lastName` to `null` when no filter is active (Task 2.2), Thymeleaf will automatically omit the `lastName` parameter from the URL in that case, producing clean URLs. No extra conditional logic in the template is required.

- [ ] 3.2 Add a conditional "Active filter" badge in `ownersList.html`. Place it inside the `<div class="liatrio-pagination">` block, before the `<span th:text="#{pages}">` element. Use `th:if="${lastName != null}"` so it only renders when a filter is active. The badge text should be "Active filter: " followed by the value from `${lastName}`. Style it consistently with the existing `liatrio-pagination` dark-theme styles. Example:

  ```html
  <span th:if="${lastName != null}" class="liatrio-active-filter">
    Active filter: <strong th:text="${lastName}"></strong>
  </span>
  ```

  Add a CSS rule for `.liatrio-active-filter` to `petclinic.scss` if distinct styling is desired (e.g., italics or a highlight color), or omit if the default pagination text color is sufficient.

- [ ] 3.3 Run `./mvnw test -Dtest=OwnerControllerTests` and confirm all tests pass — including the three new ones from Task 1.0. This is the GREEN phase completion for both the controller and template changes.

- [ ] 3.4 Start the application locally with `./mvnw spring-boot:run`. Open a browser, navigate to the Find Owners page, search for "Franklin", observe the Owners list (it will redirect to the single-owner detail because only 1 Franklin exists in seed data — instead search for "Davis" which has 2 results or open a direct URL such as `http://localhost:8080/owners?page=1&lastName=D`). With the Owners list showing, open browser DevTools, inspect any pagination link, and confirm its `href` includes `lastName=` in the URL. Take a screenshot of this DevTools view and save it to `docs/specs/07-spec-preserve-filter-pagination/proof/filter-pagination-links.png`.

---

### [ ] 4.0 Playwright E2E Test — Verify Filter Persists Across Pagination

Write a Playwright TypeScript test that creates enough owner test data to span two pages, applies a `lastName` filter, navigates forward and backward through pages, and asserts the filter is retained on every page. Capture required proof screenshots.

#### 4.0 Proof Artifact(s)

- Test run: `cd e2e-tests && npm test -- --grep "preserves lastName filter"` passes all assertions, demonstrating filter persistence across forward and backward pagination.
- Screenshot: `docs/specs/07-spec-preserve-filter-pagination/proof/filter-pagination-url.png` — full viewport screenshot taken while on page 2 of the filtered results, confirming the browser is showing filtered page-2 content.
- Screenshot: `docs/specs/07-spec-preserve-filter-pagination/proof/filter-pagination-links.png` — already captured in Task 3.4 (shared proof artifact).

#### 4.0 Tasks

- [ ] 4.1 Create the proof directory: `docs/specs/07-spec-preserve-filter-pagination/proof/`. This directory will hold committed screenshot proof artifacts.

- [ ] 4.2 In `e2e-tests/tests/pages/owner-page.ts`, add the following helper methods to the `OwnerPage` class:
  - `paginationControls(): Locator` — returns `this.page.locator('div.liatrio-pagination')`
  - `async clickNextPage(): Promise<void>` — clicks the enabled next-page link: `await this.page.locator('div.liatrio-pagination a[title]').filter({ has: this.page.locator('.fa-step-forward') }).click()`
  - `async clickPreviousPage(): Promise<void>` — clicks the enabled previous-page link: `await this.page.locator('div.liatrio-pagination a[title]').filter({ has: this.page.locator('.fa-step-backward') }).click()`
  - `activeFilterBadge(): Locator` — returns `this.page.locator('.liatrio-active-filter')`

  Note: The `title` attribute is set by Thymeleaf on the `<a>` tags using `th:title="#{next}"` etc. If the title attribute value differs from expectations, adjust the locator to use the Font Awesome icon class directly (e.g., `this.page.locator('div.liatrio-pagination a:has(.fa-step-forward)')`).

- [ ] 4.3 Create the file `e2e-tests/tests/features/owner-filter-pagination.spec.ts`. Add the required imports at the top of the file:

  ```typescript
  import { fileURLToPath } from 'url';
  import { test, expect } from '@fixtures/base-test';
  import { OwnerPage } from '@pages/owner-page';
  import { createOwner } from '@utils/data-factory';
  ```

- [ ] 4.4 Inside `owner-filter-pagination.spec.ts`, add a `test.describe('Owner Filter Pagination', ...)` block. Inside it, write a single test `'preserves lastName filter across forward and backward pagination'`. The test should create 6 owners that all share the same `lastName` prefix. Use a timestamped prefix such as ``const prefix = `PageTest${Date.now()}`;`` so each test run uses a unique prefix and avoids collisions with previous runs. Create each owner by navigating to `/owners/new`, calling `ownerPage.fillOwnerForm(createOwner({ lastName: \`${prefix}${i}\` }))`, then`ownerPage.submitOwnerForm()`. Repeat in a`for` loop from `i = 0` to `i < 6`.

- [ ] 4.5 After creating the owners, navigate to the Find Owners page with `ownerPage.openFindOwners()` and search by the prefix using `ownerPage.searchByLastName(prefix)`. Wait for the Owners table to be visible. Assert that:
  - `ownerPage.ownersTable()` is visible
  - `page.url()` includes `lastName=${prefix}` (use `expect(page.url()).toContain(...)`)
  - `ownerPage.activeFilterBadge()` is visible and its text contains the prefix (use `expect(ownerPage.activeFilterBadge()).toContainText(prefix)`)

- [ ] 4.6 Click the next page link using `await ownerPage.clickNextPage()`. Wait for the page to load (the table should still be visible). Assert that:
  - `page.url()` includes `page=2`
  - `page.url()` includes `lastName=${prefix}`
  - `ownerPage.ownersTable()` is visible (filtered results still showing)
  - `ownerPage.activeFilterBadge()` is still visible

- [ ] 4.7 While on page 2, take the proof screenshot. Resolve an absolute path using `fileURLToPath` pointing to `docs/specs/07-spec-preserve-filter-pagination/proof/filter-pagination-url.png`. Take a full-page screenshot: `await page.screenshot({ path: screenshotPath, fullPage: true })`. This captures the pagination controls and the active filter badge on page 2 as visual proof.

- [ ] 4.8 Click the previous page link using `await ownerPage.clickPreviousPage()`. Wait for the page to load. Assert that:
  - `page.url()` includes `page=1`
  - `page.url()` includes `lastName=${prefix}`
  - `ownerPage.ownersTable()` is visible
  - `ownerPage.activeFilterBadge()` is still visible

- [ ] 4.9 Run `cd e2e-tests && npm test -- --grep "preserves lastName filter"` and confirm the test passes. If the test fails because the app is not running, start it first with `./mvnw spring-boot:run` in a separate terminal. Confirm that both screenshot files exist in `docs/specs/07-spec-preserve-filter-pagination/proof/`.
