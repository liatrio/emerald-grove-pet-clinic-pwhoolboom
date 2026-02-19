# Task 2.0 Proof — GREEN Phase: `OwnerController` Updated

## Overview

`OwnerController.addPaginationModel()` was updated to accept and expose `lastName` in the Spring MVC model.
The model-attribute tests from Task 1.0 now pass. The HTML-link test still fails (template not yet updated — expected).

## Files Changed

- `src/main/java/org/springframework/samples/petclinic/owner/OwnerController.java`
  - `addPaginationModel()` signature updated: added `String lastName` parameter
  - `model.addAttribute("lastName", lastName.isEmpty() ? null : lastName)` added (null when no filter → Thymeleaf omits param)
  - `processFindForm()` updated: passes `lastName` as 4th argument to `addPaginationModel()`

## Code Diff Summary

```java
// BEFORE
private String addPaginationModel(int page, Model model, Page<Owner> paginated) {
    ...
    // lastName NOT added to model
    return "owners/ownersList";
}
return addPaginationModel(page, model, ownersResults);

// AFTER
private String addPaginationModel(int page, Model model, Page<Owner> paginated, String lastName) {
    ...
    model.addAttribute("lastName", lastName.isEmpty() ? null : lastName);
    return "owners/ownersList";
}
return addPaginationModel(page, model, ownersResults, lastName);
```

## Test Run After Controller Change

```text
[INFO] Tests run: 20, Failures: 1, Errors: 0, Skipped: 0

Still failing (expected — template not yet updated):
  OwnerControllerTests.testPaginationLinksIncludeLastNameWhenFilterActive

Now passing:
  OwnerControllerTests.testPaginationModelIncludesLastNameWhenFilterActive  ✓
  OwnerControllerTests.testPaginationModelHasNullLastNameWhenNoFilterActive  ✓
  (all 17 pre-existing tests)  ✓
```

## Verification

| Test | Status |
|---|---|
| `testPaginationModelIncludesLastNameWhenFilterActive` | PASSED ✓ — model now contains `lastName="Franklin"` |
| `testPaginationModelHasNullLastNameWhenNoFilterActive` | PASSED ✓ — model contains `lastName=null` when no filter |
| `testPaginationLinksIncludeLastNameWhenFilterActive` | STILL FAILS — template fix in Task 3.0 |
| All 17 pre-existing tests | PASSED ✓ |
