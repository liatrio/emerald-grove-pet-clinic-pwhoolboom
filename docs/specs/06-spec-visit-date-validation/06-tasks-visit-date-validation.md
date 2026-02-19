# 06-tasks-visit-date-validation.md

## Relevant Files

- `src/main/java/org/springframework/samples/petclinic/owner/VisitController.java` — Add the past-date guard using `result.rejectValue("date", "visitDate.pastNotAllowed")` inside `processNewVisitForm()`.
- `src/main/resources/messages/messages.properties` — Add the `visitDate.pastNotAllowed` message key (base fallback).
- `src/main/resources/messages/messages_en.properties` — Add the English translation for `visitDate.pastNotAllowed`.
- `src/main/resources/messages/messages_es.properties` — Add the Spanish translation for `visitDate.pastNotAllowed`.
- `src/test/java/org/springframework/samples/petclinic/owner/VisitControllerTests.java` — Add a `@Nested` class with three new date-boundary tests (past, today, future).
- `e2e-tests/tests/features/visit-scheduling.spec.ts` — Add three new E2E date-validation tests; also fix the existing hardcoded past date `2024-02-02` to use a dynamic future date.
- `e2e-tests/tests/features/pet-management.spec.ts` — Fix the hardcoded past date `2024-01-01` used in the "can add a pet" test to use a dynamic future date.
- `docs/specs/06-spec-visit-date-validation/proof/` — New directory for proof screenshots committed to the repository.

### Notes

- `src/main/resources/templates/pets/createOrUpdateVisitForm.html` — **No changes needed.** The `inputField` Thymeleaf fragment already renders field errors via `th:errors`, so the error message will display automatically once the controller rejects the value.
- `src/main/resources/templates/fragments/inputField.html` — **No changes needed** for the same reason.
- `e2e-tests/tests/pages/visit-page.ts` — **No changes needed.** The new E2E tests can use inline `page.getByText()` assertions consistent with existing tests in `visit-scheduling.spec.ts`.
- Run JUnit tests with: `./mvnw test -Dtest=VisitControllerTests`
- Run E2E tests with: `npm test` from inside the `e2e-tests/` directory.
- Follow the repository's strict TDD requirement: **write failing tests before any production code changes**.

---

## Tasks

### [x] 1.0 Write Failing JUnit Tests for Visit Date Validation (RED Phase)

Add a `@Nested` class to `VisitControllerTests` with three tests covering all date boundary scenarios. The past-date test must fail before any production code is touched — this confirms the RED phase. The today and future tests will pass immediately (the controller currently accepts all dates) and will act as regression guards.

#### 1.0 Proof Artifact(s)

- Test: `./mvnw test -Dtest=VisitControllerTests` exits with **BUILD FAILURE** and the output includes `testProcessNewVisitFormWithPastDate` in the failures list — demonstrates the RED phase is correctly established with at least one failing test before any production code changes.

#### 1.0 Tasks

- [x] 1.1 Open `VisitControllerTests.java` and add the following imports below the existing import block:

  ```java
  import java.time.LocalDate;
  import org.junit.jupiter.api.Nested;
  ```

- [x] 1.2 Inside the `VisitControllerTests` class (after the existing `testAddVisitToNonExistentPet` test method), add a `@Nested` class named `ProcessNewVisitFormDateValidation`.
- [x] 1.3 Inside `ProcessNewVisitFormDateValidation`, write `testProcessNewVisitFormWithPastDate()`. This test should POST to `/owners/{ownerId}/pets/{petId}/visits/new` with:
  - `date` param set to `LocalDate.now().minusDays(1).toString()` (yesterday)
  - `description` param set to `"Visit Description"`

  Assert:
  - `status().isOk()` (form is re-rendered, not redirected)
  - `model().attributeHasFieldErrors("visit", "date")`
  - `model().attributeHasFieldErrorCode("visit", "date", "visitDate.pastNotAllowed")`
  - `view().name("pets/createOrUpdateVisitForm")`
- [x] 1.4 Inside `ProcessNewVisitFormDateValidation`, write `testProcessNewVisitFormWithTodayDate()`. POST with:
  - `date` param set to `LocalDate.now().toString()` (today)
  - `description` param set to `"Visit Description"`

  Assert:
  - `status().is3xxRedirection()`
  - `view().name("redirect:/owners/{ownerId}")`
- [x] 1.5 Inside `ProcessNewVisitFormDateValidation`, write `testProcessNewVisitFormWithFutureDate()`. POST with:
  - `date` param set to `LocalDate.now().plusYears(1).toString()` (one year from now)
  - `description` param set to `"Visit Description"`

  Assert:
  - `status().is3xxRedirection()`
  - `view().name("redirect:/owners/{ownerId}")`
- [x] 1.6 Run `./mvnw test -Dtest=VisitControllerTests` from the project root. Confirm that `testProcessNewVisitFormWithPastDate` appears in the failure list and the build fails. The today and future tests should pass. **Do not proceed to Task 2.0 until this failure is confirmed.**

---

### [x] 2.0 Implement Visit Date Validation and i18n Messages (GREEN Phase)

Add the past-date guard to `VisitController` and populate the message key in all three i18n files. The implementation is done when every `VisitControllerTests` test turns green.

#### 2.0 Proof Artifact(s)

- Test: `./mvnw test -Dtest=VisitControllerTests` exits with **BUILD SUCCESS** — all tests (including the three new ones) pass — demonstrates the GREEN phase is complete.
- Test: `./mvnw test` (full suite) exits with **BUILD SUCCESS** — demonstrates no regressions were introduced.
- Screenshot: `docs/specs/06-spec-visit-date-validation/proof/past-date-junit-green.png` — a screenshot of the terminal showing `BUILD SUCCESS` with all `VisitControllerTests` passing — committed as a proof artifact.

#### 2.0 Tasks

- [x] 2.1 Open `VisitController.java` and add the following import below the existing `java.util.*` imports:

  ```java
  import java.time.LocalDate;
  ```

- [x] 2.2 In `VisitController.processNewVisitForm()`, add the past-date validation check **before** the existing `if (result.hasErrors())` block:

  ```java
  if (visit.getDate() != null && visit.getDate().isBefore(LocalDate.now())) {
      result.rejectValue("date", "visitDate.pastNotAllowed");
  }
  ```

- [x] 2.3 Open `src/main/resources/messages/messages.properties` and add the following line at the end of the file (after the `deletePet.*` keys):

  ```properties
  visitDate.pastNotAllowed=Invalid date: please choose today or a future date
  ```

- [x] 2.4 Open `src/main/resources/messages/messages_en.properties` and add the following line at the end of the file (after the `deletePet.*` keys):

  ```properties
  visitDate.pastNotAllowed=Invalid date: please choose today or a future date
  ```

- [x] 2.5 Open `src/main/resources/messages/messages_es.properties` and add the following line at the end of the file (after the `deletePet.*` keys):

  ```properties
  visitDate.pastNotAllowed=Fecha inválida: por favor elija hoy o una fecha futura
  ```

- [x] 2.6 Run `./mvnw test -Dtest=VisitControllerTests`. Confirm all tests pass (BUILD SUCCESS). **If the past-date test still fails, recheck step 2.2 — the `rejectValue` call must be placed before the `hasErrors()` check.**
- [x] 2.7 Run the full test suite with `./mvnw test`. Confirm BUILD SUCCESS with no new failures.
- [x] 2.8 Create the proof directory `docs/specs/06-spec-visit-date-validation/proof/` and save a screenshot of the terminal showing BUILD SUCCESS as `past-date-junit-green.png` inside it.

---

### [x] 3.0 Add Playwright E2E Tests for Visit Date Validation

Fix two existing E2E tests that use hardcoded past dates (they will break once the validation is live), then add three new browser-level tests covering the past/today/future date scenarios.

#### 3.0 Proof Artifact(s)

- Screenshot: `docs/specs/06-spec-visit-date-validation/proof/past-date-validation-error.png` — captured by the past-date E2E test showing the error message `"Invalid date: please choose today or a future date"` visible next to the date field in the browser — committed as proof.
- Test: `npm test` inside `e2e-tests/` exits successfully with all tests passing including the three new visit-date tests — demonstrates end-to-end correctness across all scenarios.

#### 3.0 Tasks

- [x] 3.1 Create the directory `docs/specs/06-spec-visit-date-validation/proof/` (if not already created in Task 2.0). This directory must exist before the screenshot can be written by the Playwright test.
- [x] 3.2 Open `e2e-tests/tests/features/visit-scheduling.spec.ts`. The existing `'can schedule a visit for an existing pet'` test uses the hardcoded past date `'2024-02-02'`. Replace it with a dynamic future date using:

  ```typescript
  const future = new Date();
  future.setFullYear(future.getFullYear() + 1);
  const visitDate = [
    future.getFullYear(),
    String(future.getMonth() + 1).padStart(2, '0'),
    String(future.getDate()).padStart(2, '0'),
  ].join('-');
  ```

  Update the `visitDate` variable and the assertion that looks for `visitDate` in the visit row to use this dynamic value.
- [x] 3.3 Open `e2e-tests/tests/features/pet-management.spec.ts`. The `'can add a pet to an existing owner'` test uses the hardcoded past date `'2024-01-01'` on the visit add form (line `await page.locator('input#date').fill('2024-01-01')`). Replace it with a dynamic future date using the same pattern as step 3.2, and update any assertion that checks for that specific date string.
- [x] 3.4 At the top of `visit-scheduling.spec.ts`, add the following import (after the existing imports) — this is needed to write the proof screenshot to an absolute path:

  ```typescript
  import { fileURLToPath } from 'url';
  ```

- [x] 3.5 Inside the `test.describe('Visit Scheduling', ...)` block in `visit-scheduling.spec.ts`, add a new test `'rejects a past date and shows a validation error'`:
  - Compute yesterday's date as a `YYYY-MM-DD` string using the same numeric pattern as step 3.2 but with `date.setDate(date.getDate() - 1)`.
  - Navigate to `/owners/1`.
  - Click the first `Add Visit` link.
  - Fill the date field with yesterday's date string.
  - Fill the description field with any text (e.g., `'Past date test'`).
  - Click the submit button.
  - Assert that `page.getByText(/Invalid date: please choose today or a future date/i)` is visible.
  - Save a screenshot to the proof directory using the same `fileURLToPath` + `new URL(...)` pattern used in `pet-management.spec.ts`:

    ```typescript
    const screenshotPath = fileURLToPath(
      new URL(
        '../../../docs/specs/06-spec-visit-date-validation/proof/past-date-validation-error.png',
        import.meta.url
      )
    );
    await page.screenshot({ path: screenshotPath, fullPage: false });
    ```

- [x] 3.6 Add a new test `'accepts today\'s date and redirects to the owner page'`:
  - Compute today's date as a `YYYY-MM-DD` string.
  - Navigate to `/owners/1`, click `Add Visit`, fill in today's date and a valid description, then submit.
  - Assert `page.getByRole('heading', { name: /Pets and Visits/i })` is visible (confirms redirect to owner detail page).
- [x] 3.7 Add a new test `'accepts a future date and redirects to the owner page'`:
  - Compute a future date (e.g., one year from today) as a `YYYY-MM-DD` string.
  - Navigate to `/owners/1`, click `Add Visit`, fill in the future date and a valid description, then submit.
  - Assert `page.getByRole('heading', { name: /Pets and Visits/i })` is visible.
- [x] 3.8 From inside the `e2e-tests/` directory, run `npm test`. Confirm all tests pass. If any pre-existing test fails due to a past date that was not updated, find and fix the hardcoded date in that test file, then re-run.
