# 04-spec-upcoming-visits

## Introduction/Overview

This feature adds a read-only page at `/visits/upcoming` that shows all scheduled visits
falling within the next N days (default 7). It gives clinic staff a quick at-a-glance view of
what appointments are coming up without having to open each owner's detail page individually.
A new navigation menu item and a `days` query parameter make the window configurable.

## Goals

- Provide a dedicated page at `/visits/upcoming` listing all visits scheduled within the next
  N days, sorted earliest-first.
- Support a `days` query parameter (default 7, valid range 1–365) so staff can look further
  ahead or focus on a shorter window.
- Display owner name (linked to owner detail), pet name (linked to owner detail), visit date,
  and visit description for each result.
- Show a clear empty-state message when no visits fall in the requested window.
- Add an "Upcoming Visits" link to the top navigation bar for easy discovery.

## User Stories

**As a clinic staff member**, I want to see all upcoming visits in a single list so that I can
prepare for appointments without clicking through every owner record.

**As a clinic staff member**, I want to control how many days ahead I look by changing the
`?days=` parameter so that I can focus on today's appointments or plan for the whole month.

**As a clinic staff member**, I want owner and pet names to link to their detail pages so that
I can quickly pull up a patient's full record from the upcoming-visits view.

## Demoable Units of Work

### Unit 1: Upcoming Visits Page — Basic Rendering

**Purpose:** Proves that `GET /visits/upcoming` returns a rendered HTML page with a table of
visits sorted date-ascending, using the existing seed data to supply visible rows.

**Functional Requirements:**

- The system shall expose `GET /visits/upcoming` as a new controller endpoint.
- The system shall accept an optional `days` query parameter (integer, default 7).
- The system shall query all visits whose date falls in the range `[today, today + days - 1]`
  inclusive, returning them sorted by visit date ascending.
- The system shall render a Thymeleaf template at `visits/upcomingVisits` with the results.
- The template shall display a table with columns: **Owner**, **Pet**, **Date**, **Description**.
- Each row's **Owner** cell shall be a hyperlink to `/owners/{ownerId}`.
- Each row's **Pet** cell shall be a hyperlink to `/owners/{ownerId}` (the owner detail page,
  which already lists the pet's visits).
- When no visits match, the system shall display a message stating no upcoming visits were
  found for the requested window (e.g. "No upcoming visits in the next 7 days.").
- The page shall follow the existing Thymeleaf layout fragment (`fragments/layout`) and use
  i18n message keys for all user-visible strings (no hardcoded English text in the template).

**Proof Artifacts:**

- Screenshot: `/visits/upcoming` page rendered in a browser showing the visits table with at
  least one data row from seed data — demonstrates the endpoint exists and data is displayed.
- Unit Test: `UpcomingVisitsControllerTests` passes, verifying HTTP 200, correct view name,
  and model attribute containing visit rows for a mocked date range — demonstrates TDD
  coverage of the controller logic.

### Unit 2: Days Parameter Validation

**Purpose:** Proves that invalid `days` values are rejected gracefully with a user-visible
error message on the page rather than a stack trace or silent misbehaviour.

**Functional Requirements:**

- The system shall validate that `days` is an integer in the range 1–365 (inclusive).
- When `days` is less than or equal to 0 or greater than 365, the system shall re-render the
  same page with an error message (e.g. "days must be between 1 and 365.") and no table rows,
  returning HTTP 200.
- When `days` is omitted, the system shall default to 7.
- The error message shall use an i18n message key consistent with the project's
  `messages.properties` pattern.

**Proof Artifacts:**

- Unit Test: `UpcomingVisitsControllerTests` — tests for `days=0`, `days=366`, and no `days`
  param (default) pass — demonstrates all validation branches are covered.
- Browser: Navigating to `/visits/upcoming?days=0` shows the error message and no table —
  demonstrates the validation is user-facing, not just a 400 response.

### Unit 3: Navigation Link and Playwright E2E Verification

**Purpose:** Proves that the page is reachable from the nav bar, loads correctly in a real
browser, and displays at least one visit row using the application's seed data.

**Functional Requirements:**

- The system shall add an "Upcoming Visits" menu item to the top navigation bar in
  `fragments/layout.html`, pointing to `/visits/upcoming` and using an appropriate Font
  Awesome icon (e.g. `calendar`).
- The navigation item shall highlight as active when the current page is `/visits/upcoming`,
  consistent with the existing `menuItem` fragment pattern.
- The Playwright E2E test shall navigate to `/visits/upcoming` via the nav link and assert
  that the page loads (HTTP 200) and the visits table heading is visible.
- The Playwright E2E test shall also assert that at least one data row is visible in the
  table, confirming that the seed data query works end-to-end.

**Proof Artifacts:**

- Playwright Test: `e2e-tests/tests/features/upcoming-visits.spec.ts` passes — demonstrates
  nav link works, page renders, and seed data row is visible in a real Chromium browser.
- Screenshot: Playwright screenshot of the upcoming visits page showing the nav item
  highlighted and at least one visit row — demonstrates end-to-end rendering.

## Non-Goals (Out of Scope)

1. **Past visits**: The page shows only future/today visits (`date >= today`). Historical
   visits are already visible on owner detail pages.
2. **Editing or cancelling visits from this page**: This is a read-only summary view; all
   mutation goes through the existing per-pet visit form.
3. **Filtering by vet, pet type, or owner**: Only the `days` window is configurable.
4. **Pagination**: The dataset of upcoming visits within 365 days is expected to be small
   enough for a single page; no pagination is required.
5. **JSON/API variant**: Only the HTML page is in scope; no REST endpoint for this data.
6. **Hardening for very large clinics**: No performance optimisation beyond a straightforward
   date-range query is required for this feature.

## Design Considerations

The page must follow the existing Thymeleaf + Bootstrap + Liatrio design system:

- Use `th:replace="~{fragments/layout :: layout (~{::body}, 'visits')}"` as the layout wrapper
  (the `'visits'` menu key will match the new nav item's active state).
- Use the `liatrio-section`, `liatrio-table-card`, and `liatrio-table` CSS classes consistent
  with `vetList.html` and other list pages.
- Use `th:text="#{key}"` for all visible text to avoid triggering
  `I18nPropertiesSyncTest.checkNonInternationalizedStrings`.
- Add all new i18n keys to every `messages*.properties` file in
  `src/main/resources/messages/` (English first; use the same English text as the default for
  other locales if translations are not available).

## Repository Standards

- **Strict TDD**: Failing unit tests must be written before any production code. Follow the
  Red-Green-Refactor cycle for every sub-task.
- **Test annotations**: Use `@WebMvcTest`, `MockMvc`, `@MockitoBean`, and Arrange-Act-Assert
  consistent with `VisitControllerTests` and `VetControllerTests`.
- **Controller-layer pattern**: Follow `VetController` as the model for a simple read-only
  list controller — constructor injection, `@RequestParam` with `defaultValue`, model
  attributes, view name string return.
- **Spring Java Format**: Run `./mvnw spring-javaformat:apply` before every commit.
- **Conventional commits**: `test:` for test-only, `feat:` for production code, `docs:` for
  documentation.
- **Coverage**: ≥ 90% line coverage on all new classes; all validation branches explicitly
  tested.
- **E2E page-object pattern**: Create a lightweight `UpcomingVisitsPage` helper class in
  `e2e-tests/tests/pages/` consistent with the existing `OwnerPage` pattern, or use a plain
  `test()` block if only a single spec file is needed.

## Technical Considerations

- **Data access**: There is currently no `VisitRepository`. Visits are persisted through the
  Owner → Pet → Visit cascade and are not directly queryable by date via any existing
  repository method. A new `VisitRepository extends JpaRepository<Visit, Integer>` with a
  custom `@Query` (JPQL or native SQL) is the recommended approach to query visits by date
  range and join back to their owning Pet and Owner. Alternatively, a new method on
  `OwnerRepository` could traverse the graph, but a dedicated repository is cleaner.
- **Data transfer**: Because the template needs owner id, owner name, pet name, visit date,
  and description in a flat structure, a simple DTO or record (e.g. `UpcomingVisit`) should
  be created to avoid exposing the full entity graph to the view.
- **Date calculation**: Use `LocalDate.now()` as `today` and `today.plusDays(days - 1)` as
  the upper bound (inclusive), both evaluated at request time.
- **Seed data**: The H2 seed data (`src/main/resources/db/h2/data.sql`) contains visits; some
  of their dates may need to be relative to today's date (or set in the future) to ensure the
  Playwright E2E test can reliably find at least one row without test-specific data insertion.
  Inspect the seed dates before writing the E2E assertion.
- **i18n sync test**: Adding any new hardcoded English text to a Thymeleaf template will fail
  `I18nPropertiesSyncTest`. All strings must use `#{key}` and the key must exist in all
  `messages*.properties` files.
- **Build**: `./mvnw test` for unit tests; `cd e2e-tests && npm test` for Playwright (requires
  Node ≥ 18.19; use `nvm use 20` if needed).

## Security Considerations

- **No credentials or sensitive data** are involved.
- **Input validation**: The `days` parameter is parsed as an integer by Spring MVC. Providing
  a non-integer value (e.g. `?days=abc`) will result in a Spring type-mismatch error; consider
  handling `MethodArgumentTypeMismatchException` in a `@ControllerAdvice` or via `@ExceptionHandler`
  to show the same user-friendly error page instead of a 400/500. This may be addressed in a
  follow-up; it is noted but not required for this spec.
- **Proof artifacts**: Screenshots and test output should use seed/local data only. No
  production or patient data should be committed.

## Success Metrics

1. **Unit tests pass**: `./mvnw test -Dtest=UpcomingVisitsControllerTests` → all tests green,
   ≥ 90% line coverage on the new controller and DTO.
2. **Playwright E2E test passes**: `upcoming-visits.spec.ts` passes in Chromium against the
   running application, asserting page load, nav link highlight, and at least one visit row.
3. **No regressions**: `./mvnw test` introduces no new test failures beyond the pre-existing
   `I18nPropertiesSyncTest` issue (which is tracked separately).
4. **i18n compliance**: `I18nPropertiesSyncTest` does not flag any new hardcoded strings from
   this feature's template.

## Open Questions

1. The H2 seed data may use fixed calendar dates for visits. If all seeded visits are in the
   past, the Playwright E2E test will see an empty table. The implementer should check
   `src/main/resources/db/h2/data.sql` and either update the seed dates to be relative to
   today (using H2's `DATEADD` function) or set a specific future date that the E2E test can
   assert against.
