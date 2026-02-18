# Task 1.0 Proof — RED Phase: Failing Unit Tests

## Summary

Three new unit tests were added to `OwnerControllerTests.java` before any production code was
written. The test run below confirms all three fail with HTTP 404 (the `/owners.csv` route does
not exist yet), while the 14 existing tests continue to pass. This satisfies the TDD RED phase
requirement.

## Command

```shell
./mvnw test -Dtest=OwnerControllerTests -q
```

## Test Output

```text
[ERROR] Tests run: 17, Failures: 3, Errors: 0, Skipped: 0, Time elapsed: 2.649 s <<< FAILURE!
  -- in org.springframework.samples.petclinic.owner.OwnerControllerTests

[ERROR] OwnerControllerTests.testExportOwnersCsvEmptyResults
        Status expected:<200> but was:<404>

[ERROR] OwnerControllerTests.testExportOwnersCsvWithLastNameFilter
        Status expected:<200> but was:<404>

[ERROR] OwnerControllerTests.testExportOwnersCsvNoFilter
        Status expected:<200> but was:<404>

[ERROR] Tests run: 17, Failures: 3, Errors: 0, Skipped: 0
```

## Failure Detail (representative)

```text
MockHttpServletResponse:
    Status = 404
    Error message = No static resource owners.csv.
    Content type = null
    Body =
```

## Verification

| Check | Result |
|---|---|
| New tests fail for the right reason (404 — no handler) | PASS |
| Failure is not a compilation error | PASS |
| All 14 pre-existing tests still pass | PASS |
| RED phase complete — no production code written | PASS |
