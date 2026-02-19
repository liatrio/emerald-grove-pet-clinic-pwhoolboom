# Task 3.0 Proof — GREEN Phase: `ownersList.html` Template Updated

## Overview

All five pagination link `th:href` expressions in `ownersList.html` were updated to use Thymeleaf's
parameter-map URL syntax, which automatically omits `lastName` when null (no filter active).
A conditional "Active filter: [value]" badge was added inside the pagination div.

## Files Changed

- `src/main/resources/templates/owners/ownersList.html`
  - Added conditional active filter badge (renders only when `lastName` is non-null)
  - Updated all 5 pagination `th:href` expressions to `@{/owners(page=..., lastName=${lastName})}` syntax

## Template Diff Summary

```html
<!-- BEFORE: all links hardcoded, no lastName, no badge -->
<div th:if="${totalPages > 1}" class="liatrio-pagination">
  <span th:text="#{pages}">Pages:</span>
  <span th:each="i: ...">
    <a th:href="@{'/owners?page=' + ${i}}">...</a>
  </span>
  <a th:href="@{'/owners?page=1'}">first</a>
  <a th:href="@{'/owners?page=__${currentPage - 1}__'}">prev</a>
  <a th:href="@{'/owners?page=__${currentPage + 1}__'}">next</a>
  <a th:href="@{'/owners?page=__${totalPages}__'}">last</a>
</div>

<!-- AFTER: parameter-map syntax, badge, lastName preserved -->
<div th:if="${totalPages > 1}" class="liatrio-pagination">
  <span th:if="${lastName != null}" class="liatrio-active-filter">
    Active filter: <strong th:text="${lastName}"></strong>
  </span>
  <span th:text="#{pages}">Pages:</span>
  <span th:each="i: ...">
    <a th:href="@{/owners(page=${i}, lastName=${lastName})}">...</a>
  </span>
  <a th:href="@{/owners(page=1, lastName=${lastName})}">first</a>
  <a th:href="@{/owners(page=${currentPage - 1}, lastName=${lastName})}">prev</a>
  <a th:href="@{/owners(page=${currentPage + 1}, lastName=${lastName})}">next</a>
  <a th:href="@{/owners(page=${totalPages}, lastName=${lastName})}">last</a>
</div>
```

## Test Run — All 20 Tests Pass

```text
[INFO] Tests run: 20, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

Including the previously-failing test:

- `testPaginationLinksIncludeLastNameWhenFilterActive` — PASSED ✓

## Full Suite Run

```text
[WARNING] Tests run: 82, Failures: 0, Errors: 0, Skipped: 5
[INFO] BUILD SUCCESS
```

5 skipped = Docker-dependent MySQL/PostgreSQL container tests (Docker not available in this env).
All application-level tests pass.

## Pagination URL Behavior

| Scenario | Generated URL |
|---|---|
| Filter `lastName=Franklin`, page 2 | `/owners?page=2&lastName=Franklin` |
| Filter `lastName=Franklin`, page 1 (first) | `/owners?page=1&lastName=Franklin` |
| No filter, page 2 | `/owners?page=2` (clean — no `lastName=`) |

Note: Thymeleaf automatically omits `lastName` from the URL when the model value is `null`,
which is what the controller sets when no filter is active (`lastName.isEmpty() ? null : lastName`).

## Screenshot

See `proof/filter-pagination-links.png` — captured by the Playwright E2E test in Task 4.0,
which navigates the rendered page and confirms pagination `href` attributes include `lastName`.
