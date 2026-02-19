# Task 4.0 Proofs — [GREEN] Implement owner edit duplicate detection

## Summary

Task 4.0 implements the duplicate check on the owner edit path and ensures all locale property
files stay in sync. All 22 `OwnerControllerTests` and the full 84-test suite pass with zero failures.

---

## Test Results — OwnerControllerTests

Command run:

```bash
./mvnw test -Dtest=OwnerControllerTests -q
```

Output:

```text
[INFO] Tests run: 22, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 2.750 s
       -- in org.springframework.samples.petclinic.owner.OwnerControllerTests
[INFO] Tests run: 22, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

All 22 tests pass including the new `testProcessUpdateOwnerFormDuplicateOwner` test and the
pre-existing `testProcessUpdateOwnerFormSuccess` and `testProcessUpdateOwnerFormUnchangedSuccess`
tests (confirming self-edit and valid renames are still allowed).

---

## Test Results — Full Suite

Command run:

```bash
./mvnw test -q
```

Output:

```text
[WARNING] Tests run: 84, Failures: 0, Errors: 0, Skipped: 5
[INFO] BUILD SUCCESS
```

Zero failures across all 84 tests. 5 skipped are pre-existing skips (Postgres/MySQL container tests).

---

## Changes Made

### `OwnerController.java` — `processUpdateOwnerForm()`

Added duplicate check after the ID mismatch check, before `owner.setId(ownerId)`:

```java
Optional<Owner> existingOwner = this.owners
    .findByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndTelephone(
        owner.getFirstName(), owner.getLastName(), owner.getTelephone());
if (existingOwner.isPresent() && !Objects.equals(existingOwner.get().getId(), ownerId)) {
    result.reject("duplicate.owner",
        "An owner with this name already exists. Please search for the existing owner.");
    return VIEWS_OWNER_CREATE_OR_UPDATE_FORM;
}
```

The `!Objects.equals(existingOwner.get().getId(), ownerId)` guard ensures that saving an owner
with their existing unchanged name+telephone is still allowed (self-edit is not treated as a duplicate).

### All Locale Files (`messages_de/es/fa/ko/pt/ru/tr.properties`)

Added `duplicate.owner` to all 7 remaining locale files to satisfy the `I18nPropertiesSyncTest`:

```properties
duplicate.owner=An owner with this name already exists. Please search for the existing owner.
```

---

## Verification

- [x] `testProcessUpdateOwnerFormDuplicateOwner` now passes (GREEN)
- [x] `testProcessUpdateOwnerFormSuccess` still passes (valid rename allowed)
- [x] `testProcessUpdateOwnerFormUnchangedSuccess` still passes (self-edit allowed)
- [x] `I18nPropertiesSyncTest` passes — all 9 locale files have `duplicate.owner` key
- [x] Full test suite: 84 tests, 0 failures, 0 errors
