# 07-spec-preserve-filter-pagination.md

## Introduction/Overview

When a user searches for owners by last name and the results span multiple pages, clicking any pagination link (next, previous, first, last, or a page number) currently drops the `lastName` filter parameter from the URL. This causes the list to reset to all owners, breaking the user's search session. This feature fixes the Owners list pagination so that all navigation links preserve the active `lastName` filter as a query parameter, and displays a visible badge when a filter is active.

## Goals

- All pagination links in the Owners list include the active `lastName` query parameter when a filter is set.
- When no filter is active, pagination URLs are clean (e.g., `/owners?page=2`, not `/owners?page=2&lastName=`).
- A visible "Active filter: [value]" badge appears near the pagination controls whenever a `lastName` filter is active.
- A Playwright E2E test verifies that applying a filter, paging forward, and paging back all retain the filtered results.
- Playwright screenshots capture both the browser address bar URL and the pagination link `href` attributes showing query parameters.

## User Stories

- **As a receptionist**, I want pagination links to keep my last-name search active so that I can browse through multiple pages of search results without losing my filter.
- **As a receptionist**, I want a visible indicator on the list page that tells me which filter is currently active so that I always know what results I am looking at.
- **As a developer**, I want the filter state to be fully contained in the URL so that filtered pages can be bookmarked, shared, or refreshed without losing state.

## Demoable Units of Work

### Unit 1: Backend Controller Passes `lastName` to Template Model

**Purpose:** Make the `lastName` filter value available to the Thymeleaf template so pagination links can include it.

**Functional Requirements:**

- The system shall add the active `lastName` value as a model attribute named `lastName` in `OwnerController.addPaginationModel()` so the Owners list template can reference it.
- The system shall treat an empty string `lastName` and a `null` `lastName` identically — both mean "no active filter."
- The system shall not change the existing search, redirect, or error-handling logic in `OwnerController.processFindForm()`.

**Proof Artifacts:**

- Unit test: Updated `OwnerControllerTests` passes and verifies that the model contains a `lastName` attribute with the correct value when a filter is active.
- Unit test: Verifies that `lastName` is absent (or empty) in the model when no filter is provided.

---

### Unit 2: Template Pagination Links Include `lastName` Parameter

**Purpose:** Fix every pagination link in `ownersList.html` to include the active filter so navigation does not reset the list.

**Functional Requirements:**

- The system shall append `&lastName={value}` to every pagination link URL (page numbers, first, previous, next, last) when the `lastName` model attribute is non-empty.
- The system shall generate clean URLs without a `lastName` parameter when `lastName` is empty or absent (e.g., `/owners?page=2` not `/owners?page=2&lastName=`).
- The system shall display a badge with the text "Active filter: [lastName]" near the pagination controls when a `lastName` filter is active and shall not display this badge when no filter is active.
- The system shall not change the table structure, row rendering, or any other part of the Owners list template.

**Proof Artifacts:**

- Screenshot: Browser DevTools or status bar showing pagination link `href` attributes containing `?page=N&lastName=X` demonstrates that template links are correctly constructed.
- Unit test: `OwnerControllerTests` MockMvc test verifies the rendered HTML contains expected `href` values with the `lastName` parameter when a filter is active.

---

### Unit 3: Playwright E2E Test — Filter Persistence Across Pages

**Purpose:** Provide automated end-to-end proof that filtering and paginating through the Owners list works correctly without losing the filter.

**Functional Requirements:**

- The Playwright test shall navigate to the Find Owners page, enter a last-name filter that returns multiple pages of results, and submit the search form.
- The Playwright test shall verify the first page of results is filtered (all displayed owner names match the filter).
- The Playwright test shall click the "next page" link and verify results on the second page are still filtered.
- The Playwright test shall click the "previous page" link and verify results return to the first page, still filtered.
- The Playwright test shall take a screenshot of the browser address bar showing a URL that includes both `page` and `lastName` query parameters.
- The Playwright test shall take a screenshot of the pagination controls area showing link `href` attributes (e.g., by hovering or via page HTML inspection) that include query parameters.
- The Playwright test shall be placed in the existing `e2e-tests/tests/` directory following the project's Playwright conventions.

**Proof Artifacts:**

- Playwright test run: All assertions pass, demonstrating filter is retained across forward and backward pagination.
- Screenshot artifact 1: Browser address bar showing `/owners?page=2&lastName=X` proves the URL includes the filter parameter.
- Screenshot artifact 2: Pagination controls area screenshot showing link hrefs that include query parameters.

## Non-Goals (Out of Scope)

1. **Vet list filter**: The Vet list (`/vets.html`) has no search filter today. Adding a filter to the Vet list is explicitly out of scope for this feature.
2. **Server-side session or cookie persistence**: Filter state is URL-only. No session storage, cookies, or local storage are involved.
3. **Additional filter fields**: Only the existing `lastName` filter is in scope. No new filter parameters (e.g., city, telephone) will be added.
4. **Find Owners form pre-population**: The separate Find Owners form at `/owners/find` is not changed. The active filter badge appears on the list page only.
5. **Sorting**: No sorting parameters are introduced or preserved as part of this feature.

## Design Considerations

The "Active filter" badge should be visually consistent with the existing `liatrio-pagination` styles (dark background `#1E2327`, light text). It should appear adjacent to or inside the existing pagination `div` so users see the active filter and navigation controls together.

Example badge appearance:

```text
Active filter: Franklin  [Pages: [ 1 2 ] ◀◀ ◀ ▶ ▶▶]
```

The badge should only render when `lastName` is non-empty. No mockups are required beyond this description — follow the existing Liatrio CSS design tokens and patterns already in `petclinic.scss`.

## Repository Standards

- **TDD Mandatory**: Write failing tests in the RED phase before modifying any production code. Follow the Red-Green-Refactor cycle documented in `CLAUDE.md` and `docs/DEVELOPMENT.md`.
- **Test structure**: Use Arrange-Act-Assert pattern with descriptive `@DisplayName` or method names. All new tests go in the existing test class files where applicable.
- **Controller tests**: Use `@WebMvcTest` + `@MockitoBean` + `MockMvc` as established in `OwnerControllerTests.java`.
- **Playwright tests**: Follow the structure in `e2e-tests/tests/` using TypeScript. Use `npm test` to run.
- **Coverage**: New code must meet the project minimum of 90% line coverage.
- **Commit style**: Use conventional commits (e.g., `fix:`, `test:`, `feat:`).
- **Thymeleaf URLs**: Use Thymeleaf `@{...}` URL expressions consistently with the existing template patterns.

## Technical Considerations

- **Controller change**: `OwnerController.addPaginationModel()` must receive and pass the `lastName` string to the `Model`. The existing `processFindForm()` already has `lastName` in scope — it only needs to be forwarded to `addPaginationModel`.
- **Template URL construction**: Thymeleaf's `@{/owners(page=${i}, lastName=${lastName})}` syntax should be used to build query strings cleanly, rather than string concatenation. This automatically omits the parameter when its value is `null` or empty, which satisfies the "clean URL when no filter" requirement.
- **Single-result redirect**: The existing redirect to a single owner's detail page (`redirect:/owners/{id}`) is unaffected by this change.
- **Vet caching**: `VetRepository.findAll()` is annotated `@Cacheable("vets")`. This feature does not touch vet code, so no cache invalidation concerns arise.
- **Playwright test data**: The test needs multiple owners sharing the same last-name prefix to produce more than one page (5+ matching owners). The default H2 seed data may not provide this; the test may need to use a broad single-letter filter (e.g., `lastName = "D"`) or create test data programmatically if the existing seed supports it.

## Security Considerations

- The `lastName` parameter is an existing user-supplied value already passed to the repository via `findByLastNameStartingWith()`, which uses parameterized JPA queries — no SQL injection risk introduced.
- The `lastName` value will be rendered in the "Active filter" badge via Thymeleaf, which auto-escapes HTML output by default — no XSS risk introduced.
- No credentials, API keys, or sensitive data are involved.
- Playwright screenshots should not capture any sensitive personal data; use filter values like a last-name prefix that returns test/seed data only.

## Success Metrics

1. **All pagination links preserve filter**: Every pagination link on the Owners list page includes `lastName` in the URL when a filter is active (verified by unit test and E2E test).
2. **Clean URLs when unfiltered**: When no filter is active, pagination link URLs contain only `page` — no empty `lastName` parameter (verified by unit test).
3. **Active filter badge renders**: The badge "Active filter: [value]" is visible on the list page when a filter is active and absent when no filter is set (verified by Playwright assertion).
4. **E2E test passes**: The Playwright test covering filter → next page → previous page all pass in CI with no flakiness.
5. **Code coverage ≥ 90%**: New controller and template changes are covered by tests meeting the project threshold.

## Open Questions

No open questions at this time.
