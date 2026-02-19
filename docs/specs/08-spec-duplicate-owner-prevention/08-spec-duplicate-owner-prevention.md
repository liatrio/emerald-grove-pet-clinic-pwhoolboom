# 08-spec-duplicate-owner-prevention.md

## Introduction/Overview

When a clinic staff member submits the "New Owner" form (or saves edits to an existing owner), the system currently allows identical owners to be created without warning. This spec describes adding duplicate detection that blocks saving when an owner with the same first name, last name, and telephone number already exists (case-insensitive). The primary goal is to keep the owner database clean by preventing accidental duplicates while giving staff a clear, actionable error message that guides them to the existing record.

## Goals

- Prevent a new owner record from being saved when an owner with the same first name, last name, and telephone already exists in the database (case-insensitive match).
- Prevent renaming an existing owner to a name+telephone combination already held by a different owner record.
- Display a form-level alert banner with the message: _"An owner with this name already exists. Please search for the existing owner."_
- Leave the form pre-filled with the submitted data so staff can correct or search without re-entering everything.
- Verify the behavior with both a JUnit controller test and a Playwright E2E test.

## User Stories

- **As a clinic receptionist**, I want the system to warn me when I try to add an owner whose name and phone number already exist, so that I do not create a duplicate record that would confuse patient history.
- **As a clinic receptionist**, I want the duplicate error to tell me to search for the existing owner, so that I know exactly what to do next without guessing.
- **As a clinic receptionist**, I want the same protection when editing an owner's name or telephone number, so that merging records by renaming is also blocked.

## Demoable Units of Work

### Unit 1: Duplicate Detection on Owner Creation

**Purpose:** Block saving a new owner whose first name, last name, and telephone already belong to an existing owner record, and show an actionable form-level error.

**Functional Requirements:**

- The system shall query the database for an owner whose first name, last name, and telephone all match the submitted values before saving (case-insensitive comparison).
- The system shall add a global form error with the message `"An owner with this name already exists. Please search for the existing owner."` when a duplicate is detected on the create form.
- The system shall return HTTP 200 and re-display the create form (with submitted data intact) when a duplicate is detected — no new owner record shall be written to the database.
- The system shall proceed with saving and redirect to the new owner's detail page when no duplicate is found.

**Proof Artifacts:**

- `JUnit test`: `OwnerControllerTests.testProcessCreationFormDuplicateOwner` passes — demonstrates duplicate is rejected with the correct error message and no redirect.
- `Playwright E2E test`: `duplicate owner prevention` test creates an owner, attempts to create the same owner again, and asserts the form-level alert is visible and contains the expected message — demonstrates end-to-end blocking behavior.

---

### Unit 2: Duplicate Detection on Owner Edit

**Purpose:** Prevent a staff member from renaming an existing owner to a first name, last name, and telephone combination that already belongs to a different owner record.

**Functional Requirements:**

- The system shall check for a duplicate when the owner update form is submitted, using the same case-insensitive first name + last name + telephone query.
- The system shall exclude the owner being edited from the duplicate check (i.e., saving an owner with unchanged name/telephone is always allowed).
- The system shall add the same global form error message when a duplicate is detected on the edit form and return HTTP 200 re-displaying the edit form with submitted data intact.
- The system shall save the changes and redirect to the owner's detail page when no duplicate is found.

**Proof Artifacts:**

- `JUnit test`: `OwnerControllerTests.testProcessUpdateOwnerFormDuplicateOwner` passes — demonstrates the edit path rejects a duplicate rename with the correct error.
- `Playwright E2E test`: `duplicate owner prevention on edit` test creates two owners, edits the second owner's name/telephone to match the first, and asserts the form-level alert is visible — demonstrates end-to-end blocking on the edit path.

---

## Non-Goals (Out of Scope)

1. **Fuzzy / phonetic matching**: The duplicate check is exact (case-insensitive) on first name + last name + telephone only — no Soundex, Levenshtein, or "similar name" suggestions.
2. **Merging duplicate records**: This spec does not include tooling to merge or de-duplicate records that already exist in the database.
3. **Retroactive deduplication**: Existing duplicate records in the database are not cleaned up; only new duplicates are blocked going forward.
4. **Email or address-based detection**: Only first name, last name, and telephone are used as the uniqueness key.
5. **Database-level unique constraint**: No DDL migration adding a unique index is included — detection is application-level only.
6. **Admin override**: There is no bypass or admin-only flag to force-save a duplicate.

## Design Considerations

The error message must appear as a **global alert banner at the top of the form** (not as a field-level error attached to a specific input). The banner should follow the existing Bootstrap alert pattern used elsewhere in the application (e.g., `alert alert-danger` class). The form must remain populated with the data the user submitted so they do not need to re-enter it.

No new pages or routes are required. The create and edit forms share a single Thymeleaf template (`owners/createOrUpdateOwnerForm.html`); the global error display must work in both modes.

## Repository Standards

- **TDD mandatory**: Write failing JUnit tests first, then implement the minimum code to pass them, then refactor. No production code before a failing test (Red-Green-Refactor per `CLAUDE.md`).
- **Controller-layer detection**: Follow the existing pattern in `PetController` — check for a duplicate via the repository before calling `save()`, then call `result.rejectValue()` or add a global error to `BindingResult`.
- **Spring Data naming conventions**: Add a new repository query method following existing `findBy…` naming patterns in `OwnerRepository`.
- **Bean Validation + BindingResult pattern**: Global errors are added via `result.reject(errorCode, defaultMessage)` (not `rejectValue`) so they appear at the form level, not on a specific field.
- **i18n**: Add the new message key to `src/main/resources/messages/messages.properties` (and all sibling locale files if they exist) rather than hard-coding strings in Java.
- **Arrange-Act-Assert**: All tests must follow this structure with descriptive method names per `TESTING.md`.
- **@WebMvcTest** for controller tests; **Playwright page object pattern** (`OwnerPage`) for E2E tests.
- **Conventional commits**: Use `feat:` prefix for production changes, `test:` prefix for test-only commits.

## Technical Considerations

- **New repository method**: Add `Optional<Owner> findByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndTelephone(String firstName, String lastName, String telephone)` (or a JPQL equivalent) to `OwnerRepository`.
- **Edit exclusion**: When checking for duplicates during an update, filter out the owner being edited by ID. This can be done in the controller by checking whether the returned Optional contains an owner with a different ID than the one being edited.
- **BindingResult global error**: Use `result.reject("duplicate.owner", "An owner with this name already exists. Please search for the existing owner.")` so the error key is `duplicate.owner` and the fallback message is the human-readable string. Register the key in `messages.properties`.
- **Thymeleaf template**: Display global errors using `th:if="${#fields.hasGlobalErrors()}"` / `th:each` on the existing `createOrUpdateOwnerForm.html` template, wrapped in a Bootstrap `alert alert-danger` div.
- **Test mocking**: In `OwnerControllerTests`, mock `owners.findByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndTelephone(...)` to return a populated `Optional<Owner>` for the duplicate scenario and an empty `Optional` for the success scenario.
- **Playwright data factory**: Use the existing `createOwner()` utility in `e2e-tests/tests/utils/data-factory.ts` with a fixed (non-random) owner for the duplicate test to ensure the second attempt matches exactly.

## Security Considerations

No specific security considerations identified. The duplicate check uses parameterized Spring Data queries, so there is no SQL injection risk. No sensitive data beyond what is already handled by the existing form is involved.

## Success Metrics

1. **Zero duplicate creation**: Submitting the create form twice with identical first name, last name, and telephone results in exactly one owner record in the database.
2. **Test coverage ≥ 90%**: New code paths (repository method, controller duplicate check, template error display) are covered by the new JUnit tests.
3. **Clear UX**: The form-level alert containing _"An owner with this name already exists. Please search for the existing owner."_ is visible and correctly styled when a duplicate is attempted (validated by Playwright assertion).
4. **No regression**: All existing `OwnerControllerTests` and E2E owner tests continue to pass after the change.

## Open Questions

No open questions at this time.
