# Task 2.0 Proof — GREEN Phase: UpcomingVisit DTO, VisitRepository, UpcomingVisitsController

## Command

```shell
./mvnw test -Dtest=UpcomingVisitsControllerTests
```

## Output

```text
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 2.544 s
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

## Files Created

- `src/main/java/.../owner/UpcomingVisit.java` — Java record: `(Integer ownerId, String ownerName, String petName, LocalDate date, String description)`
- `src/main/java/.../owner/VisitRepository.java` — `JpaRepository<Visit, Integer>` with JPQL query traversing `Owner → pets → visits` filtered by date range
- `src/main/java/.../owner/UpcomingVisitsController.java` — `@Controller` with `GET /visits/upcoming`, `days` validation (1–365), model population
- `src/main/resources/templates/visits/upcomingVisits.html` — minimal stub template (replaced with full template in Task 3.0)

## Verification

| Check | Result |
|---|---|
| `testShowUpcomingVisitsDefault` — HTTP 200, view name, model attribute | PASS |
| `testShowUpcomingVisitsWithDaysParam` — days=14 accepted | PASS |
| `testShowUpcomingVisitsInvalidDaysZero` — days=0 → errorMessage, no upcomingVisits | PASS |
| `testShowUpcomingVisitsInvalidDays366` — days=366 → errorMessage | PASS |
| `testShowUpcomingVisitsEmptyState` — empty list, no errorMessage | PASS |
| All 5 tests GREEN | PASS |
| TDD GREEN phase complete | PASS |
