# 05-Task-01 Proofs — Write Failing Controller Tests (RED Phase)

## Summary

Task 1.0 complete. Three new test methods added to `PetControllerTests.java`. Two tests fail correctly (no handler mapping), confirming the RED phase. One test (`testProcessDeleteNonExistentPet`) already passes because the existing `@ModelAttribute findPet()` mechanism throws `ResourceNotFoundException` → HTTP 404 for unknown pet IDs.

---

## Test Methods Added

```java
// Added to PetControllerTests.java

private static final int TEST_PET_WITH_VISITS_ID = 3;

// In @BeforeEach setup():
Pet whiskers = new Pet();
owner.addPet(whiskers);
whiskers.setId(TEST_PET_WITH_VISITS_ID);
whiskers.setName("whiskers");
Visit visit = new Visit();
visit.setDate(LocalDate.of(2024, 1, 15));
visit.setDescription("Annual checkup");
whiskers.addVisit(visit);

// New test methods:
@Test void testProcessDeleteFormSuccess()          // expects 3xx + flash "message"
@Test void testProcessDeleteFormBlockedByVisits()  // expects 3xx + flash "error"
@Test void testProcessDeleteNonExistentPet()       // expects 404
```

---

## Test Run Output — RED Phase Evidence

```text
./mvnw test -Dtest=PetControllerTests

[ERROR] Tests run: 14, Failures: 2, Errors: 0, Skipped: 0

[ERROR] Failures:
[ERROR]   PetControllerTests.testProcessDeleteFormBlockedByVisits:239
          Range for response status value 404 expected:<REDIRECTION> but was:<CLIENT_ERROR>
[ERROR]   PetControllerTests.testProcessDeleteFormSuccess:231
          Range for response status value 404 expected:<REDIRECTION> but was:<CLIENT_ERROR>

BUILD FAILURE
```

**Interpretation:**

- `testProcessDeleteFormSuccess` — FAILS ✅ (no handler mapping, Spring returns 404)
- `testProcessDeleteFormBlockedByVisits` — FAILS ✅ (no handler mapping, Spring returns 404)
- `testProcessDeleteNonExistentPet` — PASSES ✅ (existing `@ModelAttribute findPet()` already returns 404 for unknown petId=99999; test expects 404)
- All 11 pre-existing tests — PASS ✅ (no regressions)

RED phase is complete. Tests define the required behavior before implementation.
