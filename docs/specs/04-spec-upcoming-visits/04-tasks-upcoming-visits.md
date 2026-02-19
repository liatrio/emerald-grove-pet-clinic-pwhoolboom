# 04-tasks-upcoming-visits

## Relevant Files

- `src/main/java/org/springframework/samples/petclinic/owner/UpcomingVisit.java` — New DTO record with fields `ownerId`, `ownerName`, `petName`, `date`, `description` used to pass flat data from repository to template.
- `src/main/java/org/springframework/samples/petclinic/owner/VisitRepository.java` — New Spring Data JPA repository with custom JPQL `@Query` that traverses `Owner → pets → visits` and returns `List<UpcomingVisit>` filtered by date range.
- `src/main/java/org/springframework/samples/petclinic/owner/UpcomingVisitsController.java` — New `@Controller` for `GET /visits/upcoming`; validates `days` param (1–365), queries repository, populates model.
- `src/test/java/org/springframework/samples/petclinic/owner/UpcomingVisitsControllerTests.java` — `@WebMvcTest` unit tests covering HTTP 200, view name, model attributes, default days, invalid days (0 and 366), and empty state.
- `src/main/resources/templates/visits/upcomingVisits.html` — Thymeleaf template using `fragments/layout`, `liatrio-section`/`liatrio-table-card`/`liatrio-table` CSS classes, `#{key}` i18n for all text.
- `src/main/resources/templates/fragments/layout.html` — Add the "Upcoming Visits" `menuItem` entry pointing to `/visits/upcoming` with `visits` active key and `calendar` icon.
- `src/main/resources/messages/messages.properties` — Add 4 new keys: `upcomingVisits`, `upcomingVisits.subtitle`, `upcomingVisits.empty`, `upcomingVisits.daysError`.
- `src/main/resources/messages/messages_de.properties` — Add the same 4 keys (English text as placeholder).
- `src/main/resources/messages/messages_en.properties` — Add the same 4 keys.
- `src/main/resources/messages/messages_es.properties` — Add the same 4 keys.
- `src/main/resources/messages/messages_fa.properties` — Add the same 4 keys.
- `src/main/resources/messages/messages_ko.properties` — Add the same 4 keys.
- `src/main/resources/messages/messages_pt.properties` — Add the same 4 keys.
- `src/main/resources/messages/messages_ru.properties` — Add the same 4 keys.
- `src/main/resources/messages/messages_tr.properties` — Add the same 4 keys.
- `src/main/resources/db/h2/data.sql` — Update 2 of the 4 hard-coded 2013 visit dates to use H2 `DATEADD('DAY', N, CURRENT_DATE)` so the Playwright E2E test reliably finds rows within the default 7-day window.
- `e2e-tests/tests/features/upcoming-visits.spec.ts` — New Playwright spec asserting nav link navigation, page load (HTTP 200), table heading visible, and at least one data row from seed data.

### Notes

- Unit tests follow the `@WebMvcTest` / `@MockitoBean` / `MockMvc` / Arrange-Act-Assert pattern from `VetControllerTests.java` and `VisitControllerTests.java`.
- Run unit tests with `./mvnw test -Dtest=UpcomingVisitsControllerTests`.
- Run the full suite with `./mvnw test` to catch any `I18nPropertiesSyncTest` regressions.
- Playwright requires Node ≥ 18.19; use `source ~/.nvm/nvm.sh && nvm use 20.18.2` before running E2E tests.
- Run `./mvnw spring-javaformat:apply` after every Java file edit, before committing.
- Conventional commits: `test:` for test-only changes, `feat:` for production code, `docs:` for task/proof files.

## Tasks

### [x] 1.0 RED Phase — Write Failing UpcomingVisitsControllerTests

#### 1.0 Proof Artifact(s)

- Test: `./mvnw test -Dtest=UpcomingVisitsControllerTests` output showing compilation failure (class `UpcomingVisitsController`, `VisitRepository`, and `UpcomingVisit` do not exist yet) demonstrates the TDD RED phase is correctly established before any production code is written.

#### 1.0 Tasks

- [ ] 1.1 Create `UpcomingVisitsControllerTests.java` in `src/test/java/org/springframework/samples/petclinic/owner/` with the Apache license header, `@WebMvcTest(UpcomingVisitsController.class)`, `@DisabledInNativeImage`, `@DisabledInAotMode`, `@Autowired MockMvc mockMvc`, and `@MockitoBean VisitRepository visitRepository`. Add a private helper method `upcomingVisit()` that returns a sample `UpcomingVisit` instance (ownerId=1, ownerName="George Franklin", petName="Samantha", date=LocalDate.now().plusDays(1), description="rabies shot").
- [ ] 1.2 Write `testShowUpcomingVisitsDefault()`: mock `visitRepository.findUpcomingVisits(any(), any())` to return a list containing the sample visit; perform `GET /visits/upcoming`; assert HTTP 200, view name `"visits/upcomingVisits"`, and model attribute `"upcomingVisits"` exists.
- [ ] 1.3 Write `testShowUpcomingVisitsWithDaysParam()`: mock the repository; perform `GET /visits/upcoming?days=14`; assert HTTP 200 and model attribute `"upcomingVisits"` exists.
- [ ] 1.4 Write `testShowUpcomingVisitsInvalidDaysZero()`: perform `GET /visits/upcoming?days=0` with **no** repository mock; assert HTTP 200, model attribute `"errorMessage"` exists, and `"upcomingVisits"` is **not** in the model.
- [ ] 1.5 Write `testShowUpcomingVisitsInvalidDays366()`: perform `GET /visits/upcoming?days=366` with no repository mock; assert HTTP 200 and model attribute `"errorMessage"` exists.
- [ ] 1.6 Write `testShowUpcomingVisitsEmptyState()`: mock the repository to return an empty list; perform `GET /visits/upcoming`; assert HTTP 200, model attribute `"upcomingVisits"` is an empty list, and `"errorMessage"` is absent.
- [ ] 1.7 Run `./mvnw spring-javaformat:apply` to satisfy the pre-commit format hook.
- [ ] 1.8 Run `./mvnw test -Dtest=UpcomingVisitsControllerTests` and confirm the output shows a compilation error (the controller/repository/DTO do not yet exist). This is the expected RED state.

---

### [x] 2.0 GREEN Phase — Create UpcomingVisit DTO, VisitRepository, and UpcomingVisitsController

#### 2.0 Proof Artifact(s)

- Test: `./mvnw test -Dtest=UpcomingVisitsControllerTests` output showing all 6 tests GREEN demonstrates that the controller, DTO, and repository are correctly wired and all validation branches are covered.

#### 2.0 Tasks

- [ ] 2.1 Create `UpcomingVisit.java` in `src/main/java/org/springframework/samples/petclinic/owner/` as a Java record: `public record UpcomingVisit(Integer ownerId, String ownerName, String petName, LocalDate date, String description) {}`. Add the Apache license header and the `java.time.LocalDate` import.
- [ ] 2.2 Create `VisitRepository.java` in `src/main/java/org/springframework/samples/petclinic/owner/` extending `JpaRepository<Visit, Integer>`. Add a single method annotated with `@Query` using JPQL that traverses `Owner o JOIN o.pets p JOIN p.visits v`, filters `v.date >= :startDate AND v.date <= :endDate`, orders by `v.date ASC`, and returns `List<UpcomingVisit>` using the constructor expression `new org.springframework.samples.petclinic.owner.UpcomingVisit(o.id, CONCAT(o.firstName, ' ', o.lastName), p.name, v.date, v.description)`. Use `@Param("startDate")` and `@Param("endDate")` on the method parameters.
- [ ] 2.3 Create `UpcomingVisitsController.java` in `src/main/java/org/springframework/samples/petclinic/owner/` as a package-private `@Controller`. Inject `VisitRepository` via constructor. Add `@GetMapping("/visits/upcoming")` method accepting `@RequestParam(defaultValue = "7") int days` and `Model model`. If `days < 1 || days > 365`, add `"errorMessage"` → `"upcomingVisits.daysError"` to model and return `"visits/upcomingVisits"`. Otherwise call `visitRepository.findUpcomingVisits(LocalDate.now(), LocalDate.now().plusDays(days - 1))`, add the result as `"upcomingVisits"` and the `days` value as `"days"` to the model, then return `"visits/upcomingVisits"`.
- [ ] 2.4 Run `./mvnw spring-javaformat:apply`.
- [ ] 2.5 Run `./mvnw test -Dtest=UpcomingVisitsControllerTests` and confirm all 6 tests are GREEN before proceeding.

---

### [x] 3.0 Create Thymeleaf Template, i18n Keys, and Navigation Link

#### 3.0 Proof Artifact(s)

- Test: `./mvnw test` output showing the full test suite (including `I18nPropertiesSyncTest`) passes with no new failures demonstrates all template strings use `#{key}` and every new key exists in all `messages*.properties` files.
- Screenshot: Browser screenshot of `/visits/upcoming` with the nav item highlighted as active and the visits table (or empty-state message) visible demonstrates the full page renders correctly end-to-end.

#### 3.0 Tasks

- [ ] 3.1 Add the following 4 keys to `src/main/resources/messages/messages.properties`:

  ```properties
  upcomingVisits=Upcoming Visits
  upcomingVisits.subtitle=Appointments scheduled within the next {0} days.
  upcomingVisits.empty=No upcoming visits in the next {0} days.
  upcomingVisits.daysError=days must be between 1 and 365.
  ```

- [ ] 3.2 Add the same 4 keys (using the same English values as placeholders) to each of the 8 locale files: `messages_de.properties`, `messages_en.properties`, `messages_es.properties`, `messages_fa.properties`, `messages_ko.properties`, `messages_pt.properties`, `messages_ru.properties`, and `messages_tr.properties`.
- [ ] 3.3 Create `src/main/resources/templates/visits/upcomingVisits.html`. Use `<!DOCTYPE html><html th:replace="~{fragments/layout :: layout (~{::body}, 'visits')}">` as the layout wrapper. Inside `<body>`, create a `<section class="liatrio-section">` containing a `<div class="liatrio-table-card">` with a `<div class="liatrio-card-header">` (h2 using `th:text="#{upcomingVisits}"`, subtitle `<p>` using `th:text="#{upcomingVisits.subtitle(${days})}"` or omit on error). Add an error `<div th:if="${errorMessage != null}">` using `th:text="#{${errorMessage}}"`. Add a `<table class="table table-striped liatrio-table">` with thead columns Owner / Pet / Date / Description (all via `th:text="#{...}"` reusing existing keys `owner`, `pet`, `date`, `description`). In `<tbody>`, iterate `th:each="v : ${upcomingVisits}"` with `<td>` cells: Owner as `<a th:href="@{/owners/{id}(id=${v.ownerId})}" th:text="${v.ownerName}">`, Pet as `<a th:href="@{/owners/{id}(id=${v.ownerId})}" th:text="${v.petName}">`, Date as `<td th:text="${#temporals.format(v.date, 'yyyy-MM-dd')}">`, Description as `<td th:text="${v.description}">`. Add an empty-state `<tr th:if="${upcomingVisits != null and #lists.isEmpty(upcomingVisits)}"><td colspan="4" th:text="#{upcomingVisits.empty(${days})}"></td></tr>`.
- [ ] 3.4 Add the "Upcoming Visits" nav item to `src/main/resources/templates/fragments/layout.html` immediately after the existing Veterinarians `<li>` entry (line 57–60): `<li th:replace="~{::menuItem ('/visits/upcoming','visits','upcoming visits','calendar',#{upcomingVisits})}">`.
- [ ] 3.5 Run `./mvnw spring-javaformat:apply`.
- [ ] 3.6 Run `./mvnw test` and confirm all tests pass with no new failures — particularly `I18nPropertiesSyncTest`.

---

### [ ] 4.0 Update Seed Data and Add Playwright E2E Test

#### 4.0 Proof Artifact(s)

- Test: `source ~/.nvm/nvm.sh && nvm use 20.18.2 && cd e2e-tests && npm test -- --grep "Upcoming Visits"` output showing both E2E tests PASSED in Chromium demonstrates nav link navigation works, page loads, and seed data rows are visible end-to-end.
- Screenshot: Playwright screenshot saved as `docs/specs/04-spec-upcoming-visits/04-proofs/upcoming-visits-screenshot.png` showing the "Upcoming Visits" nav item highlighted and at least one visit row in the table.

#### 4.0 Tasks

- [ ] 4.1 Update `src/main/resources/db/h2/data.sql`: change the first two visits from hard-coded 2013 dates to H2-relative expressions so they fall within the default 7-day window. Replace `'2013-01-01'` with `DATEADD('DAY', 1, CURRENT_DATE)` and `'2013-01-02'` with `DATEADD('DAY', 3, CURRENT_DATE)`. Leave the remaining two visits with their original 2013 dates (they serve as historical data).
- [ ] 4.2 Create `e2e-tests/tests/features/upcoming-visits.spec.ts` with two tests inside `test.describe('Upcoming Visits', ...)`. Test 1 — "navigates via nav link and loads the page": use the `page` fixture, navigate to `/`, click the "Upcoming Visits" nav link, wait for the URL to contain `/visits/upcoming`, assert the page heading (`h2`) containing "Upcoming Visits" is visible. Test 2 — "displays at least one visit row from seed data": navigate directly to `/visits/upcoming`, assert the `table` is visible and `tbody tr` count is at least 1; assert the first row contains a linked owner name, a linked pet name, a date, and a non-empty description.
- [ ] 4.3 Run the E2E suite: `source ~/.nvm/nvm.sh && nvm use 20.18.2` then `cd e2e-tests && npm test -- --grep "Upcoming Visits"`. Confirm both tests pass.
- [ ] 4.4 Capture a Playwright screenshot (via `page.screenshot({ path: '...' })` in the test or the HTML report) and save it to `docs/specs/04-spec-upcoming-visits/04-proofs/upcoming-visits-screenshot.png`.
