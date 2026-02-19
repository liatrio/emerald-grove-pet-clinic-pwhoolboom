# 05-Task-04 Proofs — Playwright E2E Test: Delete Pet Flow

## Summary

Task 4.0 complete. Added the Playwright E2E test that creates a pet, opens the delete confirmation modal, captures a screenshot proof artifact, confirms deletion, and asserts the pet is no longer visible on the owner details page. All 24 E2E tests pass. All 76 Java tests pass.

---

## Changes Made

### e2e-tests/tests/pages/pet-page.ts — New PetPage helper methods

```typescript
async clickDeletePetButton(petName: string): Promise<void> {
  const petRow = this.page.locator('tr').filter({
    has: this.page.locator('dd', { hasText: petName })
  });
  await petRow.getByRole('button', { name: /Delete Pet/i }).first().click();
}

async confirmDeletion(): Promise<void> {
  const modal = this.page.locator('#deletePetModal');
  await expect(modal).toBeVisible();
  await modal.getByRole('button', { name: /Confirm Delete/i }).click();
}
```

### e2e-tests/tests/features/pet-management.spec.ts — New delete flow test

Added `can delete a pet with no visit history and verify it is removed` test that:

1. Navigates to Betty Davis's owner details page
2. Creates a new pet with no visit history via the Add New Pet form
3. Clicks the Delete Pet button → asserts the confirmation modal is visible
4. Captures a screenshot to `docs/specs/05-spec-delete-pet/05-proofs/05-delete-pet-confirmation-modal.png`
5. Confirms deletion via the modal's Confirm Delete button
6. Asserts redirect back to owner details with `#success-message` visible
7. Asserts the deleted pet name is no longer visible on the page

### src/main/java/org/springframework/samples/petclinic/owner/Owner.java — Bug fix

Fixed `removePet()` to compare by ID rather than object identity, since `BaseEntity` has no `equals()` override:

```java
public void removePet(Pet pet) {
    this.pets.removeIf(p -> p.getId() != null && p.getId().equals(pet.getId()));
}
```

---

## E2E Test Run Output

```text
Running 3 tests using 3 workers

  3 passed (2.5s)

Pet Management:
  ✓ can add a pet to an existing owner and see it on owner details
  ✓ can delete a pet with no visit history and verify it is removed
  ✓ validates pet type selection and birth date format
```

### Full E2E Suite

```text
Running 25 tests using 5 workers

  1 skipped
  24 passed (4.8s)
```

---

## Java Test Suite

```text
./mvnw test

Tests run: 76, Failures: 0, Errors: 0, Skipped: 5
BUILD SUCCESS
```

---

## Screenshot Proof Artifact

Screenshot of the delete confirmation modal captured during the E2E test:

`docs/specs/05-spec-delete-pet/05-proofs/05-delete-pet-confirmation-modal.png`

The screenshot shows:

- The owner details page with the Bootstrap 5 confirmation modal overlaid
- Modal title: "Confirm Delete"
- Modal body: "Are you sure you want to delete [pet name]? This action cannot be undone."
- Cancel and Confirm Delete buttons visible
