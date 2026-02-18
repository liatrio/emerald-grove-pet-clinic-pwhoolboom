# 03-spec-csv-owner-export

## Introduction/Overview

This feature adds a CSV download endpoint (`GET /owners.csv`) to the Emerald Grove Veterinary Clinic
application. It allows users and integrators to export owner records as a structured CSV file, using
the same `lastName` search filter that the existing HTML owner-list page supports. The primary goal
is to enable lightweight data export of owner information without changing any existing behavior.

## Goals

- Provide a `GET /owners.csv` endpoint that returns owner data as a valid CSV file.
- Honour the `lastName` query parameter so callers can filter results the same way as the HTML list.
- Return all matching results in a single response (no pagination limit).
- Return a correct `text/csv` Content-Type header so browsers and tools handle the file appropriately.
- Include a header row and the columns: `id`, `firstName`, `lastName`, `address`, `city`, `telephone`.

## User Stories

**As a clinic administrator**, I want to download a CSV file of owners so that I can import the data
into a spreadsheet or external system for reporting.

**As an API consumer**, I want to filter the CSV export by last name so that I can retrieve only the
relevant subset of owners without post-processing a large file.

**As a developer**, I want the CSV endpoint to behave predictably (correct Content-Type, consistent
columns, always a header row) so that downstream tooling can parse it reliably.

## Demoable Units of Work

### Unit 1: CSV Endpoint — Core Response

**Purpose:** Proves that `GET /owners.csv` exists, returns `text/csv`, and produces a well-formed
CSV with a header row and data rows for all matching owners.

**Functional Requirements:**

- The system shall expose `GET /owners.csv` as a new HTTP endpoint in `OwnerController`.
- The system shall respond with `Content-Type: text/csv`.
- The system shall always include a header row as the first line:
  `id,firstName,lastName,address,city,telephone`
- The system shall include one data row per matching owner, with fields in the same column order as
  the header.
- The system shall accept the optional `lastName` query parameter and filter results using
  prefix-matching (the same logic as the existing `GET /owners` endpoint).
- When `lastName` is omitted or empty, the system shall return all owners.
- When no owners match the filter, the system shall return only the header row with HTTP 200.
- The system shall return all matching results without any pagination limit.

**Proof Artifacts:**

- `curl`: Unfiltered export snippet (`curl -i "http://localhost:8080/owners.csv"`) showing the
  `Content-Type: text/csv` header and at least the header row plus multiple data rows — demonstrates
  the endpoint exists and returns valid CSV.
- `curl`: Filtered export snippet (`curl -i "http://localhost:8080/owners.csv?lastName=Davis"`)
  showing only rows whose last name starts with "Davis" — demonstrates the search parameter is
  respected.
- `Unit Test`: `OwnerControllerTests` — new test methods verifying the response Content-Type,
  header row presence, and data row content using MockMvc — demonstrates TDD coverage of the
  endpoint logic.

### Unit 2: Playwright E2E CSV Download Verification

**Purpose:** Proves that a real browser can trigger the CSV download and that the downloaded file
contains a valid header row, giving end-to-end confidence in the feature.

**Functional Requirements:**

- The Playwright test suite shall include a new test that programmatically requests `/owners.csv`
  and captures the response.
- The test shall assert that the response Content-Type contains `text/csv`.
- The test shall assert that the response body begins with the expected header row:
  `id,firstName,lastName,address,city,telephone`.

**Proof Artifacts:**

- `Playwright Test`: `e2e-tests/tests/features/owner-csv-export.spec.ts` passes — demonstrates
  end-to-end CSV download and header row validation in a real browser context.

## Non-Goals (Out of Scope)

1. **Pagination support in the CSV endpoint**: The CSV export deliberately returns all results; the
   `page` parameter is ignored.
2. **Authentication or access control**: The existing application has no authentication layer, and
   this endpoint will not add one.
3. **Additional export formats** (Excel, JSON, XML): Only CSV is in scope.
4. **Pet or visit data in the export**: Only owner scalar fields are included; no nested collections.
5. **A UI download button**: No changes to the Thymeleaf templates or frontend are required.
6. **Streaming large result sets**: A simple in-memory response is acceptable for the current data
   volume.

## Design Considerations

No specific UI/UX design requirements. The endpoint is headless (API-only). The CSV column order is
fixed: `id,firstName,lastName,address,city,telephone`.

## Repository Standards

- **Strict TDD**: All production code must be preceded by a failing test (Red-Green-Refactor).
  The unit tests for the new controller handler must be written before the handler is implemented.
- **Controller layer only**: The CSV logic lives in `OwnerController`; no new service class is
  needed for this scope.
- **Test annotations**: Use `@WebMvcTest(OwnerController.class)`, `@MockitoBean`, and `MockMvc`
  for unit tests — consistent with `OwnerControllerTests`.
- **Arrange-Act-Assert**: All test methods follow the existing AAA pattern with descriptive names.
- **Conventional commits**: Commit messages should follow the `feat:` / `test:` / `docs:` prefix
  convention used in the project history.
- **Minimum 90% line coverage** for new code; all branches in the new handler must be covered.
- **E2E page-object pattern**: If a helper class is warranted, follow the `OwnerPage` pattern in
  `e2e-tests/tests/`; for a single endpoint test a plain `test()` block is acceptable.

## Technical Considerations

- **No new library required**: CSV formatting for the fixed six-column schema can be implemented
  with a `StringBuilder` or `String.join` in the controller. If a library is preferred,
  Apache Commons CSV is a common choice — add it to `pom.xml` as a compile-scoped dependency.
- **Repository call**: Use `owners.findByLastNameStartingWith(lastName, Pageable.unpaged())` to
  retrieve all results without a page limit. `Pageable.unpaged()` is available from Spring Data.
- **Method signature**: The new handler should be a `@GetMapping` with `produces = "text/csv"` and
  return `ResponseEntity<String>` (or write directly to `HttpServletResponse`).
- **`lastName` binding**: Bind `lastName` via `@RequestParam(defaultValue = "")` — an empty string
  triggers the "return all" path in the existing repository method.
- **Field escaping**: Owner fields currently do not contain commas or quotes based on the domain
  model constraints; basic comma-separation is sufficient. If future-proofing is desired, wrap
  each field value in double quotes.
- **Build**: Run `./mvnw test` to execute unit tests; `cd e2e-tests && npm test` for Playwright.

## Security Considerations

- **No credentials or API keys** are involved in this feature.
- **Data exposure**: The CSV contains personal contact information (address, telephone). Since the
  application currently has no authentication, this is consistent with the existing owner-detail
  pages. No additional risk is introduced beyond what already exists.
- **Proof artifacts**: The `curl` snippets in proof documentation should use `localhost` URLs and
  must not contain real production data. Sample output using the seeded H2 test data is fine.
- **Input sanitisation**: The `lastName` parameter is passed directly to a parameterised JPA query
  — SQL injection is not a concern. No additional sanitisation is required.

## Success Metrics

1. **All new unit tests pass** (`./mvnw test`) with no regressions in existing tests.
2. **Playwright E2E test passes** (`cd e2e-tests && npm test`) confirming CSV download and header
   row validation.
3. **Code coverage** for the new handler meets the project's ≥ 90% line coverage requirement.
4. **curl proof snippets** produce correct output against a locally running application instance,
   with `Content-Type: text/csv` visible in the response headers.

## Open Questions

No open questions at this time.
