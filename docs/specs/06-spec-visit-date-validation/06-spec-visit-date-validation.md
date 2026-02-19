# 06-spec-visit-date-validation.md

## Introduction/Overview

Clinic staff currently can accidentally book a visit with a date that has already passed, which creates confusing data and misleads the upcoming-visits view. This feature adds a server-side validation rule to the visit scheduling form that rejects any submitted date earlier than today, displays a clear error message in the user's language, and keeps today and future dates working as before.

## Goals

- Prevent visits from being saved with a date strictly in the past (before today).
- Display the message `"Invalid date: please choose today or a future date"` (localised) next to the date field when validation fails.
- Keep visits scheduled for today or any future date working without regressions.
- Add message keys to all three i18n property files (base, English, Spanish).
- Provide automated coverage via both JUnit controller tests and Playwright E2E tests.

## User Stories

**As a clinic receptionist**, I want the visit scheduling form to reject past dates so that I cannot accidentally book a visit in the past and corrupt the upcoming-visits view.

**As a clinic receptionist**, I want a clear error message next to the date field so that I immediately understand what went wrong and can correct my entry.

**As a clinic receptionist**, I want today's date to be accepted so that I can book same-day urgent visits without obstruction.

## Demoable Units of Work

### Unit 1: Server-Side Validation and i18n Messages

**Purpose:** The core validation rule lives in `VisitController`, rejects past dates, and returns a localised error to the user via the existing form template and i18n message files.

**Functional Requirements:**

- The system shall reject a visit form submission when the submitted `date` is strictly before `LocalDate.now()`.
- The system shall add a field error on `date` with message key `visitDate.pastNotAllowed` when validation fails.
- The system shall re-render `pets/createOrUpdateVisitForm` (HTTP 200) when the date is invalid, preserving all other form values.
- The system shall redirect to the owner detail page (HTTP 3xx) when the date is today or in the future and all other fields are valid.
- The `messages.properties` file shall contain the key `visitDate.pastNotAllowed=Invalid date: please choose today or a future date`.
- The `messages_en.properties` file shall contain the same key with the same English value.
- The `messages_es.properties` file shall contain the key with the Spanish translation `Fecha inválida: por favor elija hoy o una fecha futura`.

**Proof Artifacts:**

- Screenshot: visit form showing the validation error message next to the date field after a past date is submitted, demonstrates the UI error display works.
- Screenshot: successful redirect to owner detail page after submitting today's date, demonstrates today is still accepted.

---

### Unit 2: JUnit Controller Tests

**Purpose:** Automated unit tests covering all three date boundary scenarios (past, today, future) so regressions are caught before any PR merges.

**Functional Requirements:**

- The `VisitControllerTests` class shall include a test that posts a date one day in the past and asserts `model().attributeHasFieldErrors("visit", "date")` with error code `visitDate.pastNotAllowed`.
- The `VisitControllerTests` class shall include a test that posts today's date with a valid description and asserts a `3xx` redirect.
- The `VisitControllerTests` class shall include a test that posts a date one year in the future with a valid description and asserts a `3xx` redirect.
- The new tests shall be grouped in a `@Nested` class (e.g., `ProcessNewVisitFormDateValidation`) following the existing `@Nested` pattern used in `PetControllerTests`.
- All existing `VisitControllerTests` tests shall continue to pass after the changes.

**Proof Artifacts:**

- Test: `./mvnw test -Dtest=VisitControllerTests` exits with BUILD SUCCESS and shows all tests (including new ones) passing, demonstrates the validation logic is correctly exercised.

---

### Unit 3: Playwright E2E Tests

**Purpose:** Browser-level tests confirm the feature works end-to-end through the running application, covering all three date scenarios.

**Functional Requirements:**

- The E2E suite shall include a test that navigates to an existing pet's "Add Visit" form, submits a date one day in the past, and asserts the validation error message `"Invalid date: please choose today or a future date"` is visible on the page.
- The E2E suite shall include a test that submits today's date with a valid description and asserts the browser redirects to the owner detail page (success).
- The E2E suite shall include a test that submits a future date with a valid description and asserts the browser redirects to the owner detail page (success).
- The three tests shall live in the existing `e2e-tests/` directory following the established Playwright + TypeScript conventions.

**Proof Artifacts:**

- Screenshot: `past-date-validation-error.png` captured by the failing-date test, demonstrates the error message is visible in the browser.
- Test: `npm test` inside `e2e-tests/` exits with all tests (including new ones) passing, demonstrates end-to-end correctness.

---

## Non-Goals (Out of Scope)

1. **Edit-visit validation**: This spec covers the new-visit form only (`/owners/{ownerId}/pets/{petId}/visits/new`). If an edit-visit form exists or is added later, past-date rejection for edits is out of scope here.
2. **Maximum future date limit**: No upper bound on how far in the future a visit can be scheduled.
3. **Additional visit fields**: No changes to description or other visit fields — only the `date` field is in scope.
4. **Admin override**: No role-based bypass of the validation rule.
5. **Database-level constraint**: No DB migration or JPA-level constraint is added; validation is controller-only.

## Design Considerations

The existing Thymeleaf fragment `pets/createOrUpdateVisitForm.html` already renders field errors using Spring's standard `th:errors` binding. No template structural changes are expected — adding the message key and wiring the field error in the controller should be sufficient for the error to render in the existing error display area.

The error message must appear adjacent to the date input field so the user can immediately associate the message with the field they need to correct.

## Repository Standards

- **Validation pattern**: Follow `PetController`'s approach of calling `result.rejectValue("fieldName", "errorCode")` inside the `@PostMapping` handler after the `@Valid` check — no new validator class required for a single-rule field.
- **Test structure**: Use `@Nested` inner classes to group related controller test scenarios, as established in `PetControllerTests`.
- **i18n**: All user-visible strings must have keys in `messages.properties`, `messages_en.properties`, and `messages_es.properties`.
- **TDD**: Write failing JUnit tests (RED) before adding the controller logic (GREEN), then refactor.
- **Commit conventions**: Use conventional commits (e.g., `feat:`, `test:`, `fix:`).
- **Annotations**: New test classes must carry `@DisabledInNativeImage` and `@DisabledInAotMode` if they use `@WebMvcTest`, matching existing controller test classes.

## Technical Considerations

- The validation check is a simple `LocalDate` comparison: `if (visit.getDate() != null && visit.getDate().isBefore(LocalDate.now()))` inside `VisitController.processNewVisitForm()`.
- The error code `visitDate.pastNotAllowed` is added as a key in the three `messages*.properties` files so Spring's `MessageSource` resolves it to the localised string.
- The `Visit` entity constructor sets `this.date = LocalDate.now()` by default, so the form pre-populates with today's date — users must actively pick a past date to trigger the error.
- Playwright tests rely on a running Spring Boot application (the `e2e-tests/` config already starts it via Maven); no additional infrastructure is needed.
- No database schema changes are required.

## Security Considerations

No specific security considerations identified. The validation is entirely server-side and operates on a date value that is not sensitive. No credentials, tokens, or personally identifiable information are involved in this feature.

## Success Metrics

1. **Zero past-date bookings saved**: A visit with a past date cannot be persisted through the form after this change.
2. **All JUnit tests pass**: `./mvnw test -Dtest=VisitControllerTests` exits BUILD SUCCESS with at least three new test cases covering past, today, and future dates.
3. **All Playwright tests pass**: `npm test` in `e2e-tests/` exits successfully with three new visit-date scenarios green.
4. **No regressions**: The full `./mvnw test` suite remains green after the changes.
5. **i18n coverage**: The message key is present in all three property files with appropriate values.

## Open Questions

No open questions at this time.
