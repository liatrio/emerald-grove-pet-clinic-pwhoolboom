# Spec 09 — Task 4.0 Proof Artifacts

## Task: Preserve telephone and city in pagination links and add i18n message keys

---

## CLI Output

```bash
./mvnw test -Dtest="OwnerControllerTests,I18nPropertiesSyncTest" -q
```

```text
Tests run: 33, Failures: 0, Errors: 0, Skipped: 0  -- OwnerControllerTests
Tests run: 2,  Failures: 0, Errors: 0, Skipped: 0  -- I18nPropertiesSyncTest

BUILD SUCCESS
```

---

## Test Results

### OwnerControllerTests — Pagination Model Tests

New tests confirming telephone and city are carried through pagination:

| Test Method | Assertion |
|---|---|
| `testPaginationModelIncludesTelephoneWhenFilterActive` | `GET /owners?telephone=6085551023&page=1` multi-page stub → `model().attribute("telephone", "6085551023")` |
| `testPaginationModelIncludesCityWhenFilterActive` | `GET /owners?city=Mad&page=1` multi-page stub → `model().attribute("city", "Mad")` |
| `testPaginationLinksIncludeTelephoneAndCityWhenFiltersActive` | Rendered HTML contains `telephone=6085551023` and `city=Mad` as substrings in pagination links |

### I18nPropertiesSyncTest — 2 tests, 0 failures

All locale files are in sync with `messages.properties`. The test validates that all 7 non-English locale files (`de`, `es`, `fa`, `ko`, `pt`, `ru`, `tr`) contain every key defined in `messages.properties`.

---

## New i18n Keys Added

`messages.properties`:

```properties
findOwners.telephone.label=Telephone
findOwners.city.label=City
findOwners.noOwnersFound=No owners found matching the provided criteria.
home.findOwners.help=Search by last name, telephone, or city to locate an owner record.
```

All 7 locale files received translated equivalents (German, Spanish, Persian, Korean, Portuguese, Russian, Turkish).

---

## Pagination Link Example

`ownersList.html` — all 6 pagination href expressions updated:

```html
th:href="@{/owners(page=${i}, lastName=${lastName}, telephone=${telephone}, city=${city})}"
```

---

## Verification

- Telephone and city values are preserved across page navigation when filters are active
- `I18nPropertiesSyncTest` passes — all 8 locale files in sync
- Pagination links include `telephone=` and `city=` query params when those filters are set
- Active filter badge extended to display telephone and city alongside lastName
