# 05 Questions Round 1 - Delete Pet

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

## 1. Confirmation UI Pattern

How should the delete confirmation step be presented to the user?

- [x] (A) Bootstrap modal dialog — a pop-up overlay appears on the owner details page asking "Are you sure you want to delete [Pet Name]?" with Cancel and Confirm Delete buttons. No page navigation until confirmed.
- [ ] (B) Dedicated confirmation page — clicking Delete navigates to a separate `/owners/{ownerId}/pets/{petId}/delete` GET page showing pet details and a confirm form. Submitting the form performs the deletion.
- [ ] (C) Inline confirmation — the Delete button expands in-place on the owner details page to reveal "Are you sure?" with Yes/No options (no modal, no page navigation).
- [ ] (D) Other (describe)

## 2. Blocked Deletion — Visit Guard UX

When a pet has existing visits and deletion is blocked, what should the user see?

- [ ] (A) The Delete button is hidden entirely — pets with visits simply have no delete option visible.
- [x] (B) The Delete button is visible but disabled (grayed out) with a tooltip explaining "Cannot delete: this pet has visit history."
- [ ] (C) The Delete button is visible and clickable, but clicking it shows a blocking message (modal or page) explaining that deletion is not allowed and listing the reason (pet has visits).
- [ ] (D) Other (describe)

## 3. Success Feedback After Deletion

After a pet is successfully deleted, how should the user be informed?

- [x] (A) Flash success message on the owner details page — redirect back to `/owners/{ownerId}` with a green "Pet [Name] has been deleted." banner (auto-dismisses after 3s, consistent with existing pattern).
- [ ] (B) Inline removal with no message — the pet row simply disappears from the page.
- [ ] (C) Other (describe)

## 4. Delete Button Placement & Styling

Where and how should the Delete button appear for each pet on the owner details page?

- [x] (A) Alongside the existing "Edit Pet" link in the pet row actions — styled as a `btn-danger` (red) button to signal destructive action, matching Bootstrap conventions.
- [ ] (B) As a standalone icon button (trash icon) with no label text, positioned in the same action column as Edit.
- [ ] (C) At the bottom of each pet's expanded section, separated from the Edit link.
- [ ] (D) Other (describe)

## 5. Playwright Screenshot Artifact

The spec requires a screenshot of the confirmation UI as a proof artifact. How should this be captured?

- [x] (A) The Playwright E2E test captures a screenshot automatically at the confirmation step and saves it to `e2e-tests/test-results/artifacts/` using `page.screenshot()`.
- [ ] (B) A dedicated Playwright test exists solely for the screenshot (separate from the create-delete-verify flow test).
- [ ] (C) Both the create-delete-verify flow AND a screenshot of the confirmation step are captured in the same test run.
- [ ] (D) Other (describe)

## 6. i18n / Internationalization

The codebase supports 8 languages (English, German, Spanish, etc.). For this feature:

- [ ] (A) Add message keys only for English (messages.properties) — other locale files are updated separately / out of scope.
- [x] (B) Add message keys to ALL supported locale files (messages.properties, messages_en, messages_de, messages_es, messages_fa, messages_ko, messages_pt, messages_ru, messages_tr). Use English text as placeholder for non-English locales.
- [ ] (C) Other (describe)

## 7. Cascade Behavior

The codebase uses `CascadeType.ALL` on the `Owner → Pet` relationship. Pets are currently only deleted when an Owner is deleted. For this feature, we need to delete individual pets. When a pet is deleted:

- [ ] (A) The pet is removed from the Owner's pets collection and saved — Spring Data JPA handles the cascade (no direct `PetRepository.delete()` needed, use orphanRemoval pattern).
- [ ] (B) A `PetRepository` with an explicit `delete(Pet)` method is added and called directly from the controller.
- [x] (C) Either approach works — let the implementation choose the cleanest option.
- [ ] (D) Other (describe)
