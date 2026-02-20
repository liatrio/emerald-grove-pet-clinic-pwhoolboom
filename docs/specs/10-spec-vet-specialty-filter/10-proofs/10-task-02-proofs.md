# Spec 10 — Task 2.0 Proof Artifacts

## Task: Controller: Accept `specialty` Param and Route to Filtered Queries

---

## Controller Changes

`VetController.showVetList()` updated to accept `@RequestParam(defaultValue = "") String specialty`.

Routing logic in `findPaginated(int page, String specialty)`:

```java
if ("none".equals(specialty)) {
    return vetRepository.findWithNoSpecialties(pageable);
}
else if (!specialty.isEmpty()) {
    return vetRepository.findBySpecialtyName(specialty, pageable);
}
return vetRepository.findAll(pageable);
```

Model attributes added in `addPaginationModel()`:

```java
model.addAttribute("specialty", specialty);
List<String> listSpecialties = this.vetRepository.findAll()
    .stream()
    .flatMap(vet -> vet.getSpecialties().stream())
    .map(Specialty::getName)
    .distinct()
    .sorted()
    .toList();
model.addAttribute("listSpecialties", listSpecialties);
```

`listSpecialties` leverages the existing `@Cacheable("vets")` `findAll()` — no extra query.

---

## CLI Output

```bash
./mvnw test -Dtest=VetControllerTests
```

```text
Tests run: 6, Failures: 0, Errors: 0, Skipped: 0  -- VetControllerTests
BUILD SUCCESS
```

---

## New Tests (4 added)

| Test | Scenario | Assertions |
|---|---|---|
| `testShowVetListHtmlNoFilter` | No `specialty` param | model has `listSpecialties`, `specialty=""` |
| `testShowVetListHtmlFilterBySpecialty` | `?specialty=radiology` | model `specialty="radiology"`, `listSpecialties` present |
| `testShowVetListHtmlFilterByNone` | `?specialty=none` | model `specialty="none"`, routes to `findWithNoSpecialties` |
| `testShowVetListHtmlFilterByUnknownSpecialty` | `?specialty=unknownXYZ` | model `specialty="unknownXYZ"`, `totalItems=0` |

All 6 `VetControllerTests` pass (2 pre-existing + 4 new).
