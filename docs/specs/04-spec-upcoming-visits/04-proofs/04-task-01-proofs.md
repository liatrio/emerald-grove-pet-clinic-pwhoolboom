# Task 1.0 Proof — RED Phase: UpcomingVisitsControllerTests

## Command

```shell
./mvnw test -Dtest=UpcomingVisitsControllerTests
```

## Output

```text
[ERROR] COMPILATION ERROR :
[ERROR] .../UpcomingVisitsControllerTests.java:[49,17] cannot find symbol
[ERROR]   symbol:   class VisitRepository
[ERROR]   location: class ...UpcomingVisitsControllerTests
[ERROR] .../UpcomingVisitsControllerTests.java:[51,17] cannot find symbol
[ERROR]   symbol:   class UpcomingVisit
[ERROR]   location: class ...UpcomingVisitsControllerTests
[ERROR] .../UpcomingVisitsControllerTests.java:[40,13] cannot find symbol
[ERROR]   symbol: class UpcomingVisitsController
[ERROR] .../UpcomingVisitsControllerTests.java:[52,28] cannot find symbol
[ERROR]   symbol:   class UpcomingVisit
[ERROR]   location: class ...UpcomingVisitsControllerTests
[INFO] BUILD FAILURE
```

## Verification

| Check | Result |
|---|---|
| Tests written before production code exists | PASS |
| Compilation fails for the correct reason (`UpcomingVisitsController` not found) | PASS |
| `VisitRepository` not found — confirms no repository exists yet | PASS |
| `UpcomingVisit` not found — confirms no DTO exists yet | PASS |
| TDD RED phase correctly established | PASS |

## Test Methods Written

- `testShowUpcomingVisitsDefault()` — GET /visits/upcoming → HTTP 200, view, model attribute
- `testShowUpcomingVisitsWithDaysParam()` — days=14 param accepted
- `testShowUpcomingVisitsInvalidDaysZero()` — days=0 → errorMessage, no upcomingVisits
- `testShowUpcomingVisitsInvalidDays366()` — days=366 → errorMessage
- `testShowUpcomingVisitsEmptyState()` — empty list → no errorMessage
