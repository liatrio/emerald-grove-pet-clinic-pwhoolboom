# Task 4.0 Proof — Playwright E2E Test: Filter Persists Across Pagination

## Overview

A Playwright E2E test was written that creates 6 owners with a shared `lastName` prefix,
applies a filter, navigates forward and backward through two pages, and asserts the filter
is preserved on every page. Two proof screenshots were captured.

## Files Created/Modified

- `e2e-tests/tests/features/owner-filter-pagination.spec.ts` — NEW: E2E test
- `e2e-tests/tests/pages/owner-page.ts` — Added `paginationControls()`, `clickNextPage()`,
  `clickPreviousPage()`, `activeFilterBadge()` helper methods
- `docs/specs/07-spec-preserve-filter-pagination/proof/filter-pagination-url.png` — Screenshot 1
- `docs/specs/07-spec-preserve-filter-pagination/proof/filter-pagination-links.png` — Screenshot 2

## Test Run Output

```text
Running 1 test using 1 worker

[chromium] › tests/features/owner-filter-pagination.spec.ts:9:3
  › Owner Filter Pagination
  › preserves lastName filter across forward and backward pagination

  1 passed (3.0s)
```

Command: `npm test -- --grep "preserves lastName filter"` (using Node.js v20.18.2)

## Test Flow Verified

| Step | Assertion | Result |
|---|---|---|
| Create 6 owners with shared `lastName` prefix | — | ✓ |
| Search by prefix → 6 results → 2 pages | `ownersTable()` visible, URL contains `lastName=prefix` | ✓ |
| Active filter badge visible on page 1 | `activeFilterBadge()` visible and contains prefix text | ✓ |
| Click Next → navigate to page 2 | URL contains `page=2` and `lastName=prefix` | ✓ |
| Filter badge still visible on page 2 | `activeFilterBadge()` visible | ✓ |
| Click Previous → navigate back to page 1 | URL contains `page=1` and `lastName=prefix` | ✓ |
| Filter badge still visible on page 1 | `activeFilterBadge()` visible and contains prefix text | ✓ |

## Screenshot 1 — `filter-pagination-url.png`

Full viewport screenshot taken on page 2 of the filtered results.

Shows:

- Filtered owner list (page 2, 1 of 6 matching owners)
- "Active filter: PageTest…" badge rendered in pagination controls
- Pagination showing pages [ 1 2 ] with navigation icons

Path: `docs/specs/07-spec-preserve-filter-pagination/proof/filter-pagination-url.png`

## Screenshot 2 — `filter-pagination-links.png`

Close-up screenshot of the `.liatrio-pagination` element on page 2.

Shows:

- "Active filter: **PageTest…**" bold badge
- "pages [ 1 2 ]" with all four navigation icon links rendered
- Confirms the filter badge and paginated navigation co-exist in the pagination div

Path: `docs/specs/07-spec-preserve-filter-pagination/proof/filter-pagination-links.png`

## URL Behavior Confirmed by Test Assertions

When filter `lastName=PageTest…` is active and on page 2:

```text
URL: /owners?page=2&lastName=PageTest1771539607269
```

When navigating back to page 1:

```text
URL: /owners?page=1&lastName=PageTest1771539607269
```

`lastName` is preserved in every pagination link throughout the navigation cycle.
