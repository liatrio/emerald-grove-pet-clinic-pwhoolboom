# Spec 09 — Task 2.0 Proof Artifacts

## Task: Extend Find Owners form and controller for multi-field filtering

---

## Screenshots

### Empty Form — Three Input Fields

`find-owners-form-empty.png` — Shows the updated Find Owners form with Last Name, Telephone, and City input fields and the Find Owner button.

![Find Owners form empty](find-owners-form-empty.png)

### Search Result After Filtering by Telephone

`find-owners-results.png` — Shows the Owner Information page after searching by telephone `6085551023` (single match redirects directly to owner detail).

![Find Owners results](find-owners-results.png)

---

## CLI Output

```bash
./mvnw test -Dtest=OwnerControllerTests -q
```

```text
Tests run: 33, Failures: 0, Errors: 0, Skipped: 0

BUILD SUCCESS
```

---

## Test Results

`OwnerControllerTests` — 33 tests, all passing.

New/updated tests covering multi-field form and controller:

| Test Method | Assertion |
|---|---|
| `testProcessFindFormNoOwnersFound` (updated) | No-results returns global form error (`model().hasErrors()`) — not a lastName field error |
| `testProcessFindFormByTelephone` | `GET /owners?telephone=6085551023` with single-result stub → redirect to owner detail |
| `testProcessFindFormByCityPrefix` | `GET /owners?city=Mad&page=1` with multi-result stub → `ownersList` view with `listOwners` model |
| `testProcessFindFormByAllThreeFilters` | All three params + single-result stub → redirect |

---

## Controller Changes

- `processFindForm` reads `telephone` and `city` from `Owner` model binding
- Empty strings are converted to `null` via `nullIfEmpty()` helper
- Calls `findPaginatedByFilters(page, lastName, telephone, city)` (replaces old last-name-only helper)
- No-results branch uses `result.reject("notFound")` (global error, not field error)

---

## Template Changes

`findOwners.html` — Added Telephone and City form groups matching Bootstrap `control-group` structure. Global error alert added inside `<form th:object>` context.

---

## Verification

- 33 `OwnerControllerTests` pass
- Form shows three input fields (Last Name, Telephone, City)
- Searching by telephone `6085551023` redirects to George Franklin's detail page
- Searching with no criteria that match shows a general "not found" alert at the top of the form
