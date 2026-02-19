# 05-Task-02 Proofs — Implement Delete Pet Endpoint (GREEN + REFACTOR Phase)

## Summary

Task 2.0 complete. Added `orphanRemoval = true` to `Owner.pets`, a `removePet()` method to `Owner`, and the `processDeleteForm()` handler to `PetController`. Also fixed a pre-existing `I18nPropertiesSyncTest` failure in `notFound.html` (hardcoded strings) and added all required i18n keys — both the notFound keys and the deletePet keys — to all 9 locale files.

---

## Changes Made

### Owner.java

```java
// Before:
@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)

// After:
@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)

// New method added:
public void removePet(Pet pet) {
    this.pets.remove(pet);
}
```

### PetController.java

```java
@PostMapping("/pets/{petId}/delete")
public String processDeleteForm(Owner owner, Pet pet, RedirectAttributes redirectAttributes) {
    if (!pet.getVisits().isEmpty()) {
        redirectAttributes.addFlashAttribute("error",
                "Cannot delete " + pet.getName() + ": this pet has visit history.");
        return "redirect:/owners/{ownerId}";
    }
    owner.removePet(pet);
    this.owners.save(owner);
    redirectAttributes.addFlashAttribute("message",
            "Pet " + pet.getName() + " has been successfully deleted.");
    return "redirect:/owners/{ownerId}";
}
```

### Pre-existing fix: notFound.html

Replaced 3 hardcoded strings with `th:text="#{...}"` i18n references (pre-existing `I18nPropertiesSyncTest` failure unrelated to this feature).

### i18n keys added to all 9 locale files

```properties
notFound.heading=Oops! We couldn't find that pet or owner.
notFound.body=Let's help you search again.
notFound.findOwners=Find Owners
deletePet=Delete Pet
deletePet.confirm.title=Confirm Delete
deletePet.confirm.body=Are you sure you want to delete {0}? This action cannot be undone.
deletePet.confirm.cancel=Cancel
deletePet.confirm.button=Confirm Delete
deletePet.blocked.tooltip=Cannot delete: this pet has visit history.
```

---

## Test Run Output — GREEN Phase Evidence

### PetControllerTests (all 14 pass)

```text
./mvnw test -Dtest=PetControllerTests

Tests run: 14, Failures: 0, Errors: 0, Skipped: 0

BUILD SUCCESS
```

### Full Suite

```text
./mvnw test

Tests run: 76, Failures: 0, Errors: 0, Skipped: 5

BUILD SUCCESS
```

Skipped tests (5) are Docker-dependent integration tests (MySQL/Postgres containers not available in this environment) — pre-existing skip condition, not regressions.
