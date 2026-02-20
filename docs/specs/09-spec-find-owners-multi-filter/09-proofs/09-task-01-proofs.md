# Spec 09 — Task 1.0 Proof Artifacts

## Task: Add multi-field owner search to OwnerRepository

---

## CLI Output

```bash
./mvnw test -Dtest=ClinicServiceTests -q
```

```text
Tests run: 15, Failures: 0, Errors: 0, Skipped: 0

BUILD SUCCESS
```

---

## Test Results

`ClinicServiceTests` — 15 tests, all passing.

Five new tests were added to cover multi-field filtering:

| Test Method | Assertion |
|---|---|
| `shouldFindOwnersByTelephone` | Exact match `"6085551023"` → 1 result (George Franklin); unknown phone → 0 results |
| `shouldFindOwnersByCityPrefix` | City prefix `"Mad"` → 4 results (Franklin, McTavish, Escobito, Schroeder in Madison) |
| `shouldFindOwnersByLastNameAndCity` | `lastName="Davis"` + `city="Wind"` → 1 result (Harold Davis, Windsor only; not Betty Davis, Sun Prairie) |
| `shouldFindOwnersByAllThreeFilters` | `lastName="Franklin"` + `telephone="6085551023"` + `city="Mad"` → 1 result |
| `shouldReturnAllOwnersWhenNoFiltersProvided` | All params `null` → all 10 sample owners returned |

---

## Repository Method Added

```java
// OwnerRepository.java
@Query("SELECT o FROM Owner o WHERE "
    + "(:lastName IS NULL OR LOWER(o.lastName) LIKE LOWER(CONCAT(:lastName, '%'))) AND "
    + "(:telephone IS NULL OR o.telephone = :telephone) AND "
    + "(:city IS NULL OR LOWER(o.city) LIKE LOWER(CONCAT(:city, '%')))")
Page<Owner> findByFilters(@Param("lastName") String lastName, @Param("telephone") String telephone,
    @Param("city") String city, Pageable pageable);
```

---

## Verification

- All 15 `ClinicServiceTests` pass (10 pre-existing + 5 new)
- Repository correctly applies AND logic across all three optional filters
- Passing `null` for a parameter treats it as "no filter applied"
- Existing last-name-only behavior is preserved (tested via `shouldFindOwnersByLastName`)
