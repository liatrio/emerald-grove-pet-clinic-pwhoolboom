# 03-tasks-csv-owner-export

## Relevant Files

- `src/main/java/org/springframework/samples/petclinic/owner/OwnerController.java` — Add the new
  `exportOwnersCsv` handler method here. No new files or classes are needed; the CSV logic lives
  entirely in this controller.
- `src/test/java/org/springframework/samples/petclinic/owner/OwnerControllerTests.java` — Add
  three new unit test methods for the CSV endpoint. Must be written **before** the handler
  (TDD RED phase).
- `e2e-tests/tests/features/owner-csv-export.spec.ts` — New Playwright E2E test file to create.
  Tests that a real HTTP request to `/owners.csv` returns `text/csv` and a valid header row.
- `docs/specs/03-spec-csv-owner-export/03-proofs/03-task-04-proofs.md` — New proof documentation
  file to create. Contains the captured `curl` output for both the unfiltered and filtered
  requests.

### Notes

- Unit tests live in the same package directory as the class under test
  (`src/test/java/org/springframework/samples/petclinic/owner/`).
- Run unit tests with `./mvnw test` or a targeted run with
  `./mvnw test -Dtest=OwnerControllerTests`.
- Run E2E tests from the `e2e-tests/` directory: `npm test` (full suite) or
  `npm test -- --grep "Owner CSV Export"` (targeted).
- Follow the existing `@WebMvcTest` + `MockMvc` + `@MockitoBean` pattern for all new unit tests.
- Follow the existing `test.describe` / `test(...)` pattern with the `request` fixture for the
  Playwright test.
- Commit message convention: `test:` prefix for test-only commits, `feat:` for the handler
  implementation, `docs:` for proof documentation.

---

## Tasks

### [x] 1.0 RED — Write Failing Unit Tests for the CSV Endpoint

#### 1.0 Proof Artifact(s)

- Test Run: `./mvnw test -Dtest=OwnerControllerTests` output showing the three new test methods
  **fail** (the handler does not exist yet) — demonstrates the TDD RED phase is correct and
  the tests are targeting real, not-yet-implemented behaviour.

#### 1.0 Tasks

- [x] 1.1 Open
  `src/test/java/org/springframework/samples/petclinic/owner/OwnerControllerTests.java`.
- [x] 1.2 Add test method `testExportOwnersCsvNoFilter`:
  - In the test body, call `when(this.owners.findByLastNameStartingWith(eq(""), any(Pageable.class))).thenReturn(new PageImpl<>(List.of(george())))`.
  - Perform `mockMvc.perform(get("/owners.csv"))`.
  - Assert `status().isOk()`.
  - Assert `content().contentTypeCompatibleWith("text/csv")`.
  - Assert `content().string(org.hamcrest.Matchers.containsString("id,firstName,lastName,address,city,telephone"))`.
- [x] 1.3 Add test method `testExportOwnersCsvWithLastNameFilter`:
  - In the test body, call `when(this.owners.findByLastNameStartingWith(eq("Franklin"), any(Pageable.class))).thenReturn(new PageImpl<>(List.of(george())))`.
  - Perform `mockMvc.perform(get("/owners.csv").param("lastName", "Franklin"))`.
  - Assert `status().isOk()`.
  - Assert `content().contentTypeCompatibleWith("text/csv")`.
  - Assert the response body contains a data row with George's values:
    `content().string(org.hamcrest.Matchers.containsString("1,George,Franklin,110 W. Liberty St.,Madison,6085551023"))`.
- [x] 1.4 Add test method `testExportOwnersCsvEmptyResults`:
  - In the test body, call `when(this.owners.findByLastNameStartingWith(eq("Unknown"), any(Pageable.class))).thenReturn(new PageImpl<>(List.of()))`.
  - Perform `mockMvc.perform(get("/owners.csv").param("lastName", "Unknown"))`.
  - Assert `status().isOk()`.
  - Assert `content().contentTypeCompatibleWith("text/csv")`.
  - Assert the response body contains the header row and **no additional lines**
    (e.g., use `content().string("id,firstName,lastName,address,city,telephone\n")`).
- [x] 1.5 Run `./mvnw test -Dtest=OwnerControllerTests` and confirm the three new tests fail.
  The expected failure reason is a `404 Not Found` response (the `/owners.csv` route does not
  exist yet), **not** a compilation error. Save the failure output as evidence of the RED phase.

---

### [ ] 2.0 GREEN — Implement the `/owners.csv` Handler in `OwnerController`

#### 2.0 Proof Artifact(s)

- Test Run: `./mvnw test -Dtest=OwnerControllerTests` output showing **all** tests pass —
  demonstrates the handler satisfies every unit-test assertion.
- Test Run: `./mvnw test` full suite output with no regressions — demonstrates no existing
  behaviour was broken by the new handler.

#### 2.0 Tasks

- [ ] 2.1 Open
  `src/main/java/org/springframework/samples/petclinic/owner/OwnerController.java`.
- [ ] 2.2 Add the following import at the top of the file (if not already present):
  `import org.springframework.http.ResponseEntity;`
- [ ] 2.3 Add a new handler method below the existing `processFindForm` method:

  ```java
  @GetMapping(value = "/owners.csv", produces = "text/csv")
  public ResponseEntity<String> exportOwnersCsv(
          @RequestParam(defaultValue = "") String lastName) {
      List<Owner> results = owners
              .findByLastNameStartingWith(lastName, Pageable.unpaged())
              .getContent();
      StringBuilder csv = new StringBuilder("id,firstName,lastName,address,city,telephone\n");
      for (Owner owner : results) {
          csv.append(owner.getId()).append(',')
             .append(owner.getFirstName()).append(',')
             .append(owner.getLastName()).append(',')
             .append(owner.getAddress()).append(',')
             .append(owner.getCity()).append(',')
             .append(owner.getTelephone()).append('\n');
      }
      return ResponseEntity.ok(csv.toString());
  }
  ```

- [ ] 2.4 Run `./mvnw test -Dtest=OwnerControllerTests` and confirm all tests pass, including
  the three new CSV tests added in Task 1.0.
- [ ] 2.5 Run `./mvnw test` (full suite) and confirm there are no regressions in any other
  test class.

---

### [ ] 3.0 Playwright E2E — CSV Download Verification

#### 3.0 Proof Artifact(s)

- Test Run: `cd e2e-tests && npm test -- --grep "Owner CSV Export"` output showing the test
  in `owner-csv-export.spec.ts` **passes** — demonstrates end-to-end CSV response validation
  against a running application.

#### 3.0 Tasks

- [ ] 3.1 Ensure the Spring Boot application is running locally on port 8080 before running the
  E2E tests (the Playwright config auto-starts it via `webServer` if it is not already running).
- [ ] 3.2 Create the file
  `e2e-tests/tests/features/owner-csv-export.spec.ts` with the following content:

  ```typescript
  import { test, expect } from '@fixtures/base-test';

  test.describe('Owner CSV Export', () => {
    test('GET /owners.csv returns text/csv with header row', async ({ request }) => {
      // Act
      const response = await request.get('/owners.csv');
      const body = await response.text();

      // Assert
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('text/csv');
      expect(body).toContain('id,firstName,lastName,address,city,telephone');
    });
  });
  ```

- [ ] 3.3 From the `e2e-tests/` directory, run:
  `npm test -- --grep "Owner CSV Export"`
  and confirm the test passes. If the application is not already running, Playwright will start
  it automatically (allow up to 2 minutes for the first cold start).

---

### [ ] 4.0 Proof Documentation — curl Snippets

#### 4.0 Proof Artifact(s)

- curl (unfiltered): Captured terminal output of
  `curl -i "http://localhost:8080/owners.csv"` showing `Content-Type: text/csv` in the response
  headers and the header row plus multiple data rows in the body — demonstrates the endpoint
  exists and returns valid CSV.
- curl (filtered): Captured terminal output of
  `curl -i "http://localhost:8080/owners.csv?lastName=Davis"` showing only rows whose last name
  starts with "Davis" — demonstrates the `lastName` search parameter is respected.

#### 4.0 Tasks

- [ ] 4.1 Ensure the Spring Boot application is running:
  `./mvnw spring-boot:run`
  (If it is already running from Task 3.0, you can skip this step.)
- [ ] 4.2 Run the unfiltered curl command and copy the **full terminal output** (headers + body):
  `curl -i "http://localhost:8080/owners.csv"`
- [ ] 4.3 Run the filtered curl command and copy the **full terminal output**:
  `curl -i "http://localhost:8080/owners.csv?lastName=Davis"`
- [ ] 4.4 Create the directory:
  `docs/specs/03-spec-csv-owner-export/03-proofs/`
- [ ] 4.5 Create the file
  `docs/specs/03-spec-csv-owner-export/03-proofs/03-task-04-proofs.md` with the following
  structure, pasting your captured output into each fenced code block:

  ````markdown
  # Task 4.0 Proof — curl Snippets

  ## Unfiltered Export

  Command: `curl -i "http://localhost:8080/owners.csv"`

  ```
  <paste full curl output here>
  ```

  ## Filtered Export (lastName=Davis)

  Command: `curl -i "http://localhost:8080/owners.csv?lastName=Davis"`

  ```
  <paste full curl output here>
  ```
  ````
