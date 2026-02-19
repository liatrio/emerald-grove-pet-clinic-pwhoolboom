# Task 2.0 Proofs — [GREEN] Implement owner create duplicate detection

## Summary

Task 2.0 implements the production code that makes the RED test pass. All 21 `OwnerControllerTests`
pass, confirming the duplicate detection works and no regressions were introduced.

---

## Test Results

Command run:

```bash
./mvnw test -Dtest=OwnerControllerTests -q
```

Output:

```text
[INFO] Tests run: 21, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 2.660 s
       -- in org.springframework.samples.petclinic.owner.OwnerControllerTests
[INFO] Tests run: 21, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

All 21 tests pass including the new `testProcessCreationFormDuplicateOwner` test.

---

## Changes Made

### `OwnerController.java` — `processCreationForm()`

Added duplicate check between the validation error check and `owners.save()`:

```java
Optional<Owner> existingOwner = this.owners
    .findByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndTelephone(
        owner.getFirstName(), owner.getLastName(), owner.getTelephone());
if (existingOwner.isPresent()) {
    result.reject("duplicate.owner",
        "An owner with this name already exists. Please search for the existing owner.");
    return VIEWS_OWNER_CREATE_OR_UPDATE_FORM;
}
```

### `messages.properties` and `messages_en.properties`

Added new i18n message key:

```properties
duplicate.owner=An owner with this name already exists. Please search for the existing owner.
```

### `createOrUpdateOwnerForm.html`

Added global error banner inside the `<form th:object>` element:

```html
<div th:if="${#fields.hasGlobalErrors()}" class="alert alert-danger" role="alert">
  <ul class="list-unstyled mb-0">
    <li th:each="error : ${#fields.globalErrors()}" th:text="${error}"></li>
  </ul>
</div>
```

Note: The banner must be inside the `<form th:object="...">` tag so Thymeleaf can resolve
`#fields.hasGlobalErrors()` in the form binding context.

---

## UI Verification

Screenshot captured via Playwright E2E test in Task 5.0.
The duplicate error banner is verified end-to-end with a real browser in that task.

---

## Verification

- [x] `testProcessCreationFormDuplicateOwner` now passes (GREEN)
- [x] All 21 pre-existing `OwnerControllerTests` still pass (no regressions)
- [x] `duplicate.owner` message key added to `messages.properties` and `messages_en.properties`
- [x] Global error banner added inside `<form th:object>` in `createOrUpdateOwnerForm.html`
- [x] Template fix: banner placed inside form context so `#fields.hasGlobalErrors()` resolves correctly
