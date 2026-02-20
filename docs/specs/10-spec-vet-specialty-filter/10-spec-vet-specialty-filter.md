# 10-spec-vet-specialty-filter.md

## Introduction/Overview

The Vet Directory (`/vets.html`) currently displays all veterinarians in a paginated table with no way to narrow the list. This feature adds a specialty filter — a `<select>` dropdown above the table — so clinic staff can quickly find vets with a specific skill. Selecting a specialty filters the table to matching vets only; the active filter is reflected in the URL so the narrowed view can be bookmarked or shared. The existing unfiltered behavior is fully preserved.

## Goals

- Add a `<select>` dropdown to the Vet Directory that lists "All", each distinct specialty (alphabetically), and "None".
- Filter the displayed vet list server-side so only matching vets are shown when a specialty is selected.
- Encode the active filter in the URL query string (`?specialty=radiology`) so filtered pages are bookmarkable and shareable.
- Carry the active specialty filter through pagination links so multi-page filtered results stay correctly scoped.
- Display only vets with no specialties when "None" is selected (`?specialty=none`).

## User Stories

- **As a clinic receptionist**, I want to filter the vet list by specialty so that I can quickly identify which vets can handle a specific type of case without scrolling through the entire list.
- **As a clinic manager**, I want the filtered view to have its own URL so that I can share a link directly to, for example, all radiology vets without the recipient needing to re-apply the filter.
- **As a clinic administrator**, I want to see only vets with no assigned specialties so that I can identify staff who may need specialty assignments.

## Demoable Units of Work

### Unit 1: Backend Specialty Filtering

**Purpose:** Add the server-side data-access and controller logic that powers filtered vet queries. The controller accepts an optional `?specialty=` query parameter and returns the correctly filtered set of vets — including the special `none` value for unassigned vets.

**Functional Requirements:**

- The system shall accept an optional `specialty` query parameter on `GET /vets.html` (e.g., `?specialty=radiology`, `?specialty=none`, or absent/empty for all vets).
- When `specialty` is absent or empty, the system shall return all vets (existing behavior unchanged).
- When `specialty` matches a known specialty name (case-insensitive), the system shall return only vets who have that specialty assigned.
- When `specialty` is the literal string `none`, the system shall return only vets who have no specialties assigned.
- When `specialty` is a non-empty string that matches no known specialty name and is not `none`, the system shall return an empty list (no vets shown, no error).
- The controller shall add a `listSpecialties` model attribute containing all distinct specialty names sorted alphabetically, so the template can populate the dropdown.
- The controller shall add a `specialty` model attribute echoing the current filter value (or empty string if unfiltered), so the template can mark the active selection and build pagination links.

**Proof Artifacts:**

- Test: `VetControllerTests` — new `@WebMvcTest` tests pass for: no filter (all vets), filter by specialty name, filter by `none`, and unknown specialty name.
- Test: `ClinicServiceTests` or new `VetRepositoryTests` — `@DataJpaTest` tests pass demonstrating that the new repository query returns correct results for each filter combination against H2 sample data.

---

### Unit 2: Specialty Filter Dropdown and Shareable URLs

**Purpose:** Add the visible filter control to the Vet Directory template and wire up shareable URLs with pagination support. A user can select a specialty from the dropdown, submit the form, and see the filtered list — and the URL in the browser reflects the active filter so it can be copied and shared.

**Functional Requirements:**

- The system shall display a `<select>` dropdown above the vets table, labeled using the i18n key `vets.filter.label` (e.g., "Filter by specialty:").
- The dropdown shall include the following options in order: a first option labeled "All" (value: empty string), then each specialty name in alphabetical order, then a final option labeled "None" (value: `none`). All option labels shall use i18n keys.
- The dropdown shall show the currently active filter as the selected option when the page loads (i.e., if the URL is `?specialty=radiology`, the dropdown shows "radiology" selected).
- Submitting the form (changing the dropdown) shall navigate to `/vets.html?specialty=<value>`, resetting to page 1.
- When a specialty filter is active, all pagination links (First, Previous, page numbers, Next, Last) shall include the `specialty` query parameter so the filter is preserved when paging through results.
- The following new i18n keys shall be added to `messages.properties` and all 8 locale files: `vets.filter.label`, `vets.filter.all`, `vets.filter.none`.

**Proof Artifacts:**

- Screenshot: `vets-filter-dropdown.png` — Vet Directory page showing the specialty dropdown and the table filtered to a specific specialty (e.g., radiology shows Helen Leary and Henry Stevens only).
- Test: `I18nPropertiesSyncTest` passes, confirming all 8 locale files contain the three new keys.

---

### Unit 3: E2E Playwright Tests

**Purpose:** Validate the full end-to-end user journey of applying a specialty filter, verifying results, and navigating via a shared URL — in a real browser against the running application.

**Functional Requirements:**

- The E2E test suite shall include a test that opens the Vet Directory, selects a named specialty from the dropdown, and verifies that only vets with that specialty are shown in the table.
- The E2E test suite shall include a test that selects "None" from the dropdown and verifies that only vets without specialties are shown.
- The E2E test suite shall include a test that navigates directly to `/vets.html?specialty=radiology` (without using the dropdown) and verifies the correct vets are displayed and the dropdown shows the correct selection — demonstrating the URL is shareable.
- The E2E test suite shall include a test that selects "All" (or removes the filter) and verifies all seeded vets are shown.
- The `VetPage` page-object shall be extended with helper methods for interacting with the specialty filter dropdown.

**Proof Artifacts:**

- Test: `vet-specialty-filter.spec.ts` — all new Playwright tests pass, demonstrating filter application, "None" handling, and direct URL navigation.
- Screenshot: `e2e-vet-filter-by-specialty.png` — captured during the test showing the filtered vet table.

---

## Non-Goals (Out of Scope)

1. **Multi-specialty filter**: Selecting more than one specialty at a time is not included. The filter is single-select only.
2. **Real-time filtering without page reload**: The filter submits a form (GET request); client-side JavaScript filtering without a server round-trip is out of scope.
3. **Filtering the JSON API endpoint** (`GET /vets`): Only the HTML view (`/vets.html`) is updated. The JSON endpoint is unchanged.
4. **Adding or editing specialties**: Managing the specialty list (CRUD) is not part of this feature.
5. **Filtering by specialty on any other page** (e.g., owner search, visit scheduling): The filter applies only to the Vet Directory.

## Design Considerations

The `<select>` dropdown and its label should appear inside the existing `liatrio-card-header` div, beneath the subtitle paragraph, and above the table. It should be wrapped in a `<form method="get" action="/vets.html">` so that changing the dropdown and clicking a "Filter" button (or using an `onchange` JavaScript auto-submit) navigates to the filtered URL. To keep the implementation simple and avoid JavaScript, a small "Filter" button next to the dropdown is preferred over auto-submit via JS.

The dropdown should follow the same Bootstrap `form-group` / `form-control` structure used elsewhere in the app (e.g., `findOwners.html`) so it fits visually without new CSS. The active filter can optionally be shown as a small badge or note below the dropdown, but this is not required.

## Repository Standards

- **TDD (Strict Red-Green-Refactor)**: All production code changes must be preceded by a failing test. Write the test first, watch it fail, then implement the minimum code to make it pass.
- **Controller tests**: Use `@WebMvcTest(VetController.class)` with `@MockitoBean` and `MockMvc`, following the existing pattern in `VetControllerTests.java`.
- **Repository query methods**: Add a new `@Query` JPQL method to `VetRepository` for specialty-filtered queries (or use Spring Data derived query naming). Do **not** add `@Cacheable` to the new filtered method — the cache is appropriate for the full-list endpoints but complicates per-specialty queries.
- **Thymeleaf templates**: Use `th:field`, `th:selected`, `th:each`, and `th:text` with `#{}` message keys following the existing `control-group` / `form-group` / Bootstrap grid structure.
- **Message keys**: Add keys to `messages.properties` and all 8 locale files using the flat-key naming pattern (e.g., `vets.filter.label`). The `I18nPropertiesSyncTest` must continue to pass.
- **E2E tests**: Use the page-object model (`VetPage`), `test.describe` grouping, and screenshot capture via `testInfo.outputPath(...)` — following the pattern in `vet-directory.spec.ts` and `find-owners-multi-filter.spec.ts`.
- **Commit style**: Conventional commits (`feat:`, `test:`, `docs:`).
- **Coverage**: New production code must maintain ≥ 90% line coverage.

## Technical Considerations

- **Existing `@Cacheable("vets")`**: The two existing `findAll()` methods on `VetRepository` are annotated with `@Cacheable("vets")`. A new filtered query method should **not** carry this annotation, as caching per specialty would require cache key parameterization that adds unnecessary complexity. The full-list cache is unaffected.
- **Specialty name lookup**: Because the filter value in the URL is the specialty name (e.g., `?specialty=radiology`), the repository query must match by specialty name. A JPQL `@Query` joining `vet_specialties` and `specialties` tables by name is the most direct approach: `SELECT v FROM Vet v JOIN v.specialties s WHERE LOWER(s.name) = LOWER(:specialty)`.
- **"None" special value**: The controller must explicitly check for the literal string `"none"` before calling the repository, routing to a different query: `SELECT v FROM Vet v WHERE v.specialties IS EMPTY`. This avoids leaking the special token into the repository layer.
- **Specialty list for dropdown**: The controller needs all distinct specialty names to populate the dropdown. These can be fetched from `VetRepository.findAll()` (already cached) by streaming all vets and collecting unique specialty names — no new repository method is needed for this.
- **Pagination URL format**: The existing `vetList.html` pagination links use string interpolation (`'/vets.html?page=__${i}__'`) rather than Thymeleaf's `@{}` URL builder. When adding the specialty param, switch to the Thymeleaf URL builder pattern `@{/vets.html(page=${i}, specialty=${specialty})}` for cleaner and correct URL encoding, consistent with the approach used in `ownersList.html`.
- **Form submission method**: The filter form should use `method="get"` so the specialty value appears in the URL. This is what makes URLs shareable.

## Security Considerations

- The `specialty` query parameter is passed to a JPQL parameterized query via `@Param` — no raw SQL concatenation, preventing SQL injection.
- The selected specialty value rendered back into the template (to mark the dropdown's selected option) is escaped by Thymeleaf's default output encoding, preventing XSS.
- No authentication or authorization changes are required.
- No sensitive data (API keys, credentials) is involved.

## Success Metrics

1. **All new unit tests pass** with `./mvnw test`, including controller tests for all filter combinations (no filter, named specialty, "none", unknown specialty).
2. **All new E2E tests pass** with `npm test` in `e2e-tests/`, covering filter by specialty, filter by "None", direct URL navigation, and "All" (unfiltered) view.
3. **Three new i18n keys present in all 8 locale files**, verified by the existing `I18nPropertiesSyncTest`.
4. **Existing tests continue to pass** — no regression in the unfiltered vet list or JSON endpoint.

## Open Questions

No open questions at this time.
