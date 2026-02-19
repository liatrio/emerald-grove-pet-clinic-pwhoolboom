# Task 3.0 Proofs — [RED] Write failing JUnit test for edit duplicate detection

## Summary

Task 3.0 establishes the RED phase of TDD for duplicate owner detection on the edit/update path.
The failing test confirms that the edit path currently has no duplicate protection.

---

## CLI Output — Failing Test Confirmation

Command run:

```bash
./mvnw test -Dtest="OwnerControllerTests#testProcessUpdateOwnerFormDuplicateOwner" -q
```

Output:

```text
[ERROR] Tests run: 1, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 2.322 s <<< FAILURE!
       -- in org.springframework.samples.petclinic.owner.OwnerControllerTests
[ERROR] OwnerControllerTests.testProcessUpdateOwnerFormDuplicateOwner -- Time elapsed: 0.169 s <<< FAILURE!
java.lang.AssertionError: Status expected:<200> but was:<302>
    at OwnerControllerTests.testProcessUpdateOwnerFormDuplicateOwner(OwnerControllerTests.java:317)

[ERROR] Failures:
[ERROR]   OwnerControllerTests.testProcessUpdateOwnerFormDuplicateOwner:317 Status expected:<200> but was:<302>
[ERROR] Tests run: 1, Failures: 1, Errors: 0, Skipped: 0
```

**Interpretation:** The test correctly fails because `processUpdateOwnerForm()` has no duplicate
check yet — it saves the owner and redirects (302) even when the name+telephone belongs to a
different existing owner. This is the expected RED state.

---

## Changes Made

### `OwnerControllerTests.java`

Added `testProcessUpdateOwnerFormDuplicateOwner()` test method that:

- Creates a conflicting owner with `id=2` holding the target `firstName/lastName/telephone`
- Mocks the repository to return this conflicting owner for the duplicate lookup
- Posts to `/owners/1/edit` (TEST_OWNER_ID=1) with the conflicting name+telephone
- Asserts HTTP 200 and form view (not a redirect)

---

## Verification

- [x] Test `testProcessUpdateOwnerFormDuplicateOwner` exists in `OwnerControllerTests`
- [x] Test fails with `Status expected:<200> but was:<302>` (correct RED failure reason)
- [x] Failure is due to missing duplicate check in `processUpdateOwnerForm()`, not a test wiring error
