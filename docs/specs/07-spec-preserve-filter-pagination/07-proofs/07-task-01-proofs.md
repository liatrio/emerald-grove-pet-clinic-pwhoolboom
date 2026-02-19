# Task 1.0 Proof — RED Phase: Failing Unit Tests

## Overview

Three new test methods were added to `OwnerControllerTests.java` before any production code was changed.
Two tests failed as required by TDD RED phase; one passed by design (null == null).

## Files Changed

- `src/test/java/org/springframework/samples/petclinic/owner/OwnerControllerTests.java`
  - Added `import org.springframework.data.domain.PageRequest;`
  - Added `import static org.hamcrest.Matchers.containsString;`
  - Added `import static org.hamcrest.Matchers.nullValue;`
  - Updated `testProcessFindFormSuccess()` to use `PageImpl(list, PageRequest.of(0,5), 10)` so `totalPages=2` renders pagination HTML
  - Added `testPaginationModelIncludesLastNameWhenFilterActive()` (FAILS in RED)
  - Added `testPaginationModelHasNullLastNameWhenNoFilterActive()` (passes by design — null matches null)
  - Added `testPaginationLinksIncludeLastNameWhenFilterActive()` (FAILS in RED)

## RED Phase Test Run Output

```text
[ERROR] Tests run: 20, Failures: 2, Errors: 0, Skipped: 0

[ERROR] OwnerControllerTests.testPaginationModelIncludesLastNameWhenFilterActive:183
  Model attribute 'lastName' expected:<Franklin> but was:<null>

[ERROR] OwnerControllerTests.testPaginationLinksIncludeLastNameWhenFilterActive:208
  Response content (rendered HTML does not contain "lastName=Franklin")

[INFO] BUILD FAILURE
```

## Verification

| Test | Expected RED Behavior | Actual |
|---|---|---|
| `testPaginationModelIncludesLastNameWhenFilterActive` | FAIL — model has no `lastName` attribute yet | FAILED ✓ |
| `testPaginationModelHasNullLastNameWhenNoFilterActive` | PASS — `null == null` by design | PASSED ✓ |
| `testPaginationLinksIncludeLastNameWhenFilterActive` | FAIL — template has no `lastName=` in hrefs | FAILED ✓ |
| All 17 pre-existing tests | Must still pass | PASSED ✓ |

RED phase established: 2 tests fail for the correct reasons, 18 pass.
