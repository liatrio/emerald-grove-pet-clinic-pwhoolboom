# 06 Task 1.0 Proofs — Write Failing JUnit Tests (RED Phase)

## CLI Output

### Command

```bash
./mvnw test -Dtest=VisitControllerTests
```

### Test Results

```text
[ERROR] Tests run: 7, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 0.075 s <<< FAILURE!
       -- in org.springframework.samples.petclinic.owner.VisitControllerTests$ProcessNewVisitFormDateValidation
[ERROR] org.springframework.samples.petclinic.owner.VisitControllerTests.testProcessNewVisitFormWithPastDate
       -- Time elapsed: 0.015 s <<< FAILURE!
java.lang.AssertionError: Status expected:<200> but was:<302>

[ERROR] Tests run: 7, Failures: 1, Errors: 0, Skipped: 0

[INFO] ------------------------------------------------------------------------
[INFO] BUILD FAILURE
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  7.634 s
[INFO] Finished at: 2026-02-19T10:52:19-08:00
```

## Verification

- `testProcessNewVisitFormWithPastDate` — **FAILS** (expected HTTP 200 re-render, got 302 redirect)
  — confirms the RED phase: the controller currently accepts past dates and must be fixed.
- `testProcessNewVisitFormWithTodayDate` — **PASSES** (regression guard in place)
- `testProcessNewVisitFormWithFutureDate` — **PASSES** (regression guard in place)
- All 4 pre-existing `VisitControllerTests` tests — **PASS** (no regressions)

## RED Phase Confirmed

The `@Nested` class `ProcessNewVisitFormDateValidation` has been added to `VisitControllerTests.java`
with three boundary-condition tests. Exactly one test (`testProcessNewVisitFormWithPastDate`) fails,
correctly establishing the TDD RED phase before any production code is modified.
