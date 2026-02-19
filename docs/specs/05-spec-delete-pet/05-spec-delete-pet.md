# 05-spec-delete-pet.md

## Introduction/Overview

This feature adds the ability to delete a pet from an owner's profile in the Emerald Grove Veterinary Clinic application. A "Delete Pet" button will appear alongside the existing "Edit Pet" link on the owner details page. Clicking it opens a Bootstrap modal confirmation dialog; confirmed deletions are blocked if the pet has any visit history, and successful deletions redirect back to the owner details page with a flash success message.

## Goals

- Allow clinic staff to remove a pet from an owner's record when no visit history exists.
- Prevent accidental deletions via a modal confirmation step before any data is removed.
- Enforce data integrity by blocking deletion of pets that have associated visits.
- Provide clear, localized UI feedback for both blocked and successful deletion scenarios across all 9 supported locales.
- Demonstrate the full delete flow via an automated Playwright E2E test with a screenshot of the confirmation modal.

## User Stories

**As a clinic staff member**, I want to delete a pet from an owner's profile so that the record reflects the owner's current pets (e.g., a pet entered in error).

**As a clinic staff member**, I want a confirmation step before a pet is deleted so that I can avoid accidental data loss.

**As a clinic staff member**, I want the system to prevent me from deleting a pet that has visit history so that clinical records are not inadvertently lost.

**As a clinic staff member**, I want to see a clear success message after deletion so that I know the action was completed.

## Demoable Units of Work

### Unit 1: Delete Button with Visit Guard on Owner Details Page

**Purpose:** Surface a "Delete Pet" button for every pet on the owner details page. Pets with no visit history show an active (red) button; pets with existing visits show a disabled (grayed-out) button with a tooltip explaining why deletion is blocked.

**Functional Requirements:**

- The system shall render a "Delete Pet" button in the pet actions column of the owner details page alongside the existing "Edit Pet" link.
- The button shall be styled as `btn-danger` (red) for pets with no visits.
- The button shall be disabled (`disabled` attribute) and styled as `btn-secondary` (grayed out) for pets that have one or more associated visits.
- The disabled button shall display a tooltip with the text: `"Cannot delete: this pet has visit history."` (sourced from an i18n message key).
- The system shall add message keys to all 9 supported locale files (`messages.properties`, `messages_en.properties`, `messages_de.properties`, `messages_es.properties`, `messages_fa.properties`, `messages_ko.properties`, `messages_pt.properties`, `messages_ru.properties`, `messages_tr.properties`); non-English locales shall use the English text as a placeholder.

**Proof Artifacts:**

- `Screenshot`: Owner details page showing an active "Delete Pet" button (red) for a pet with no visits and a disabled "Delete Pet" button (grayed out) for a pet with visits demonstrates the visit guard UI.
- `Test`: `OwnerControllerTests` or `PetControllerTests` (JUnit/MockMvc) asserting that the delete endpoint returns 403/redirect-with-error when the target pet has visits demonstrates the server-side guard.

---

### Unit 2: Bootstrap Modal Confirmation Dialog

**Purpose:** When a staff member clicks an active "Delete Pet" button, a Bootstrap modal dialog asks them to confirm the destructive action before any data is modified.

**Functional Requirements:**

- The system shall display a Bootstrap 5 modal dialog when an active "Delete Pet" button is clicked.
- The modal shall display the text: `"Are you sure you want to delete [Pet Name]?"` using the pet's name.
- The modal shall contain a "Cancel" button that closes the modal without navigating away or deleting data.
- The modal shall contain a "Confirm Delete" button (`btn-danger`) that submits a `POST /owners/{ownerId}/pets/{petId}/delete` request.
- The modal shall not navigate to a new page; it operates entirely within the owner details page via JavaScript.

**Proof Artifacts:**

- `Screenshot`: Playwright screenshot of the open modal dialog (saved to `e2e-tests/test-results/artifacts/05-delete-pet-confirmation-modal.png`) demonstrates the confirmation UI exists and is correctly labeled.
- `Test`: `OwnerControllerTests` (MockMvc) asserting `POST /owners/{ownerId}/pets/{petId}/delete` redirects to `/owners/{ownerId}` with a flash success attribute for a valid (no-visit) pet demonstrates the controller endpoint works.

---

### Unit 3: Delete Execution and Success Feedback

**Purpose:** When the user confirms deletion, the pet is removed from the owner's record and the user is returned to the owner details page with a success message confirming the action.

**Functional Requirements:**

- The system shall expose a `POST /owners/{ownerId}/pets/{petId}/delete` endpoint in `PetController`.
- The system shall verify server-side that the pet belongs to the specified owner before deleting; if not, the system shall return a 404.
- The system shall verify server-side that the pet has no associated visits before deleting; if visits exist, the system shall redirect to `/owners/{ownerId}` with an error flash message (i18n key).
- The system shall delete the pet using the cleanest available JPA approach (orphanRemoval via owner collection save or direct repository delete).
- The system shall redirect to `/owners/{ownerId}` after successful deletion with a flash success message: `"Pet [Name] has been successfully deleted."` (i18n key).
- The flash success message shall auto-dismiss after 3 seconds, consistent with the existing pattern in `ownerDetails.html`.

**Proof Artifacts:**

- `Test`: `ClinicServiceTests` or `PetControllerTests` (integration) asserting the pet no longer exists after deletion demonstrates data removal.
- `Playwright E2E test`: A test that creates a pet, clicks "Delete Pet," confirms in the modal, and asserts the pet no longer appears on the owner details page demonstrates the full end-to-end flow.

---

### Unit 4: Playwright E2E Test with Screenshot

**Purpose:** An automated end-to-end test exercises the full delete flow (create → confirm deletion via modal → verify removal) and captures a screenshot of the confirmation modal as a committed proof artifact.

**Functional Requirements:**

- The system shall have a Playwright test that navigates to an owner's details page, creates a new pet, clicks the "Delete Pet" button, waits for the modal to appear, captures a screenshot of the modal, clicks "Confirm Delete," and asserts the pet is no longer visible on the page.
- The screenshot shall be saved to `e2e-tests/test-results/artifacts/` with the filename `05-delete-pet-confirmation-modal.png`.
- The test shall follow the existing Page Object Model pattern (`pages/pet-page.ts` or a new `PetDeletePage`).
- The test shall be placed in `e2e-tests/tests/features/pet-management.spec.ts` (or a new `pet-deletion.spec.ts`) following existing naming conventions.

**Proof Artifacts:**

- `Screenshot file`: `e2e-tests/test-results/artifacts/05-delete-pet-confirmation-modal.png` committed to the repository demonstrates the confirmation modal was rendered.
- `Playwright test run`: `npm test -- --grep "Delete Pet"` passes demonstrates the full E2E flow succeeds.

---

## Non-Goals (Out of Scope)

1. **Soft delete / archive**: Pets will be hard-deleted. No "restore deleted pet" functionality.
2. **Visit deletion**: This feature does not add the ability to delete visits; they serve as the guard against pet deletion.
3. **Owner deletion**: Deleting owners (which already cascades to pets) is not affected.
4. **Bulk deletion**: Only one pet at a time can be deleted.
5. **Non-English translation copy**: Locale files for non-English languages will receive English placeholder text; accurate translations are out of scope.
6. **REST / JSON API**: This feature uses the existing server-rendered HTML + form-POST pattern; no REST endpoint returning JSON is added.

## Design Considerations

**Delete Button:**

- Appears in the "Actions" column of each pet row on `ownerDetails.html`, immediately after the "Edit Pet" link.
- Active state: `<button class="btn btn-danger btn-sm">Delete Pet</button>`
- Blocked state: `<button class="btn btn-secondary btn-sm" disabled title="[i18n tooltip]">Delete Pet</button>`

**Confirmation Modal:**

- Standard Bootstrap 5 modal structure (`modal`, `modal-dialog`, `modal-content`, `modal-header`, `modal-body`, `modal-footer`).
- Header: `"Confirm Delete"` (i18n)
- Body: `"Are you sure you want to delete [Pet Name]? This action cannot be undone."` (i18n with pet name interpolation)
- Footer: `"Cancel"` (`btn-secondary`, dismisses modal) and `"Confirm Delete"` (`btn-danger`, submits POST form).
- The modal is triggered via a data attribute on the Delete button; the pet name and form action URL are injected dynamically (Thymeleaf inline or `th:data-*` attributes).

**Flash Message:**

- Consistent with existing pattern in `ownerDetails.html`: green `.alert-success` banner that auto-dismisses after 3 seconds.

## Repository Standards

- **Strict TDD**: All new server-side code must follow RED → GREEN → REFACTOR. Tests must be written and failing before production code is written.
- **Arrange-Act-Assert**: All JUnit tests use the AAA pattern with descriptive `@Test` method names.
- **`@WebMvcTest` for controller tests**: Use `MockMvc` and `@MockitoBean` for repository dependencies, consistent with `OwnerControllerTests` and `PetControllerTests`.
- **i18n**: All user-visible strings must use `th:text="#{message.key}"` in Thymeleaf and be present in all 9 locale files.
- **Conventional commits**: Commit messages follow the `type: description` format used in the project (`feat:`, `test:`, `docs:`).
- **Playwright Page Object Model**: E2E tests extend `BasePage` or use existing page objects; new helper methods are added to `pet-page.ts` (or a new page object) rather than inline in test files.
- **Coverage**: New production code must maintain ≥ 90% line coverage. Critical guard logic (visit check) requires 100% branch coverage.
- **Test isolation**: Controller tests mock repositories; integration tests use `@DataJpaTest` with H2; E2E tests run against the full application.

## Technical Considerations

- **Endpoint**: `POST /owners/{ownerId}/pets/{petId}/delete` in `PetController`. Standard form POST (no `DELETE` HTTP method) to stay consistent with existing HTML form patterns.
- **Visit guard**: Before deletion, check `pet.getVisits().isEmpty()`. If visits exist, add an error flash attribute and redirect to `/owners/{ownerId}` without deleting.
- **Ownership check**: Confirm that `owner.getPets()` contains the target pet (by ID) before proceeding; return 404 otherwise.
- **JPA deletion strategy**: Implementation may use either orphanRemoval (remove pet from `owner.getPets()` and `ownerRepository.save(owner)`) or a `PetRepository.delete(pet)` call — whichever is cleanest. The `Pet` entity already has `CascadeType.ALL` from `Owner`; verify `orphanRemoval = true` is set or add it if using orphanRemoval strategy.
- **Modal JavaScript**: Thymeleaf renders a single shared modal element per page; the Delete button passes the pet name and the POST URL via `data-pet-name` and `data-action-url` attributes. A small `<script>` block in `ownerDetails.html` populates the modal before it opens (no additional JS libraries required; Bootstrap 5 modal JS is already loaded).
- **Flash attributes**: Use `RedirectAttributes.addFlashAttribute("successMessage", ...)` and `addFlashAttribute("errorMessage", ...)`, consistent with how other controllers in this project surface feedback.

## Security Considerations

- **Server-side ownership verification**: The controller must confirm the pet belongs to the specified owner before deleting. Client-side controls alone are not sufficient.
- **Server-side visit guard**: The visit check must occur server-side to prevent bypass via direct HTTP POST.
- **No CSRF issues**: Spring Boot auto-configures CSRF protection for form POSTs; the confirmation modal form must include the Thymeleaf CSRF token (`th:action` will handle this automatically).
- No API keys, credentials, or sensitive data are involved in this feature.

## Success Metrics

1. **All TDD tests pass**: Unit tests (MockMvc), integration tests (`@DataJpaTest`), and E2E Playwright tests all pass with zero failures.
2. **≥ 90% line coverage** on new production code; 100% branch coverage on the visit-guard logic.
3. **Screenshot artifact committed**: `05-delete-pet-confirmation-modal.png` exists in `e2e-tests/test-results/artifacts/` and clearly shows the modal dialog.
4. **Visit guard enforced end-to-end**: A pet with visits cannot be deleted via the UI or by direct POST; blocked attempts result in a visible error message and no data loss.
5. **i18n complete**: All new message keys are present in all 9 locale files.

## Open Questions

No open questions at this time.
