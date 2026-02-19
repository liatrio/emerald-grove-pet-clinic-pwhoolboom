# Task 1.0 Proofs — [RED] Write failing JUnit test for create duplicate detection

## Summary

Task 1.0 establishes the RED phase of TDD for duplicate owner detection on the create path.
The failing test confirms the test harness is correctly wired before any production code is written.

---

## CLI Output — Failing Test Confirmation

Command run:

```bash
./mvnw test -Dtest="OwnerControllerTests#testProcessCreationFormDuplicateOwner" -q
```

Output:

```text
[ERROR] Tests run: 1, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 2.445 s <<< FAILURE!
       -- in org.springframework.samples.petclinic.owner.OwnerControllerTests
[ERROR] OwnerControllerTests.testProcessCreationFormDuplicateOwner -- Time elapsed: 0.238 s <<< FAILURE!
java.lang.AssertionError: Status expected:<200> but was:<302>
    at OwnerControllerTests.testProcessCreationFormDuplicateOwner(OwnerControllerTests.java:144)

[ERROR] Failures:
[ERROR]   OwnerControllerTests.testProcessCreationFormDuplicateOwner:144 Status expected:<200> but was:<302>
[ERROR] Tests run: 1, Failures: 1, Errors: 0, Skipped: 0
```

**Interpretation:** The test correctly fails because `processCreationForm()` currently saves and
redirects (302) instead of detecting the duplicate and returning the form (200).
This is the expected RED state before implementation.

---

## Changes Made

### `OwnerRepository.java`

- Added `findByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndTelephone(String, String, String)` method
  signature. Spring Data JPA auto-generates the implementation.

### `OwnerControllerTests.java`

- Added default `Optional.empty()` stub in `@BeforeEach setup()` so all pre-existing tests remain green.
- Added `testProcessCreationFormDuplicateOwner()` test that mocks the repository to return an
  existing owner and asserts HTTP 200 + form view (not a redirect).

---

## Verification

- [x] Test `testProcessCreationFormDuplicateOwner` exists in `OwnerControllerTests`
- [x] Test fails with `Status expected:<200> but was:<302>` (correct RED failure reason)
- [x] Failure is due to missing logic in controller, not a test wiring error
- [x] `OwnerRepository` declares the new query method
