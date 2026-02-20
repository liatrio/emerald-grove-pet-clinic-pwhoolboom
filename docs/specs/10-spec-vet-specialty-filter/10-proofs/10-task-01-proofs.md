# Spec 10 — Task 1.0 Proof Artifacts

## Task: Repository: Add Specialty Filter Query Methods

---

## New Repository Methods

Two new `@Query` JPQL methods added to `VetRepository`:

```java
@Transactional(readOnly = true)
@Query("SELECT v FROM Vet v JOIN v.specialties s WHERE LOWER(s.name) = LOWER(:specialty)")
Page<Vet> findBySpecialtyName(@Param("specialty") String specialty, Pageable pageable);

@Transactional(readOnly = true)
@Query("SELECT v FROM Vet v WHERE v.specialties IS EMPTY")
Page<Vet> findWithNoSpecialties(Pageable pageable);
```

Neither method carries `@Cacheable` — per spec requirement to avoid per-specialty cache key complexity.

---

## CLI Output

```bash
./mvnw test -Dtest=ClinicServiceTests
```

```text
Tests run: 18, Failures: 0, Errors: 0, Skipped: 0  -- ClinicServiceTests
BUILD SUCCESS
```

---

## New Tests (3 added)

| Test | Query Path | Assertion |
|---|---|---|
| `shouldFindVetsBySpecialtyName` | `findBySpecialtyName("radiology", ...)` | 2 results: Leary, Stevens |
| `shouldFindVetsWithNoSpecialties` | `findWithNoSpecialties(...)` | 2 results: Carter, Jenkins |
| `shouldReturnEmptyPageForUnknownSpecialty` | `findBySpecialtyName("unknownXYZ", ...)` | empty page |

All 3 new tests plus all 15 pre-existing `ClinicServiceTests` pass.

---

## H2 SQL Generated (observed in test output)

```sql
-- findBySpecialtyName("radiology")
SELECT v FROM vets v JOIN vet_specialties s ON v.id=s.vet_id
JOIN specialties s1 ON s1.id=s.specialty_id
WHERE LOWER(s1.name)=LOWER(?)

-- findWithNoSpecialties
SELECT v FROM vets v
WHERE NOT EXISTS(SELECT 1 FROM vet_specialties s WHERE v.id=s.vet_id)
```
