# 08-tasks-duplicate-owner-prevention.md

## Relevant Files

- `src/main/java/org/springframework/samples/petclinic/owner/OwnerRepository.java` — Add the new `findByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndTelephone` query method declaration.
- `src/main/java/org/springframework/samples/petclinic/owner/OwnerController.java` — Add duplicate checks in `processCreationForm` and `processUpdateOwnerForm` before calling `owners.save()`.
- `src/main/resources/templates/owners/createOrUpdateOwnerForm.html` — Add the global error alert banner that displays when `#fields.hasGlobalErrors()` is true.
- `src/main/resources/messages/messages.properties` — Add the `duplicate.owner` message key (default/fallback locale).
- `src/main/resources/messages/messages_en.properties` — Add the `duplicate.owner` message key (English locale, following the pattern of other recent feature messages).
- `src/test/java/org/springframework/samples/petclinic/owner/OwnerControllerTests.java` — Add two new test methods and a default mock stub for the new repository method.
- `e2e-tests/tests/pages/owner-page.ts` — Add a `duplicateErrorBanner()` locator helper method.
- `e2e-tests/tests/features/owner-management.spec.ts` — Add a new `describe` block with two E2E tests covering the create and edit duplicate scenarios.

### Notes

- Run Java tests with: `./mvnw test -Dtest=OwnerControllerTests` from the project root.
- Run E2E tests with: `npm test -- --grep "Duplicate Owner"` from the `e2e-tests/` directory.
- The application must be running (`./mvnw spring-boot:run`) before executing E2E tests.
- Follow the Arrange-Act-Assert pattern for all JUnit tests, matching the style in the existing `OwnerControllerTests`.
- For proof screenshots, save them to `docs/specs/08-spec-duplicate-owner-prevention/08-proofs/` (create this directory).

---

## Tasks

### [x] 1.0 [RED] Write failing JUnit test for create duplicate detection

#### 1.0 Proof Artifact(s)

- Test run: `./mvnw test -Dtest="OwnerControllerTests#testProcessCreationFormDuplicateOwner"` exits non-zero with a test failure — demonstrates the test exists, is wired correctly, and fails for the right reason (controller logic not yet implemented).

#### 1.0 Tasks

- [x] 1.1 In `OwnerRepository.java`, declare the new query method signature (Spring Data will auto-implement it):

  ```java
  Optional<Owner> findByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndTelephone(
      String firstName, String lastName, String telephone);
  ```

  Place it after the existing `findById` method. Follow the Javadoc style of the existing methods.

- [x] 1.2 In `OwnerControllerTests.java`, inside the existing `@BeforeEach setup()` method, add a default stub for the new repository method so all existing tests continue to pass (no duplicate found by default):

  ```java
  given(this.owners.findByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndTelephone(
      anyString(), anyString(), anyString()))
      .willReturn(Optional.empty());
  ```

- [x] 1.3 In `OwnerControllerTests.java`, add the following new test method after `testProcessCreationFormHasErrors()`:

  ```java
  @Test
  void testProcessCreationFormDuplicateOwner() throws Exception {
      // Arrange
      given(this.owners.findByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndTelephone(
          "Joe", "Bloggs", "1316761638"))
          .willReturn(Optional.of(george()));

      // Act & Assert
      mockMvc.perform(post("/owners/new")
              .param("firstName", "Joe")
              .param("lastName", "Bloggs")
              .param("address", "123 Caramel Street")
              .param("city", "London")
              .param("telephone", "1316761638"))
          .andExpect(status().isOk())
          .andExpect(model().hasErrors())
          .andExpect(view().name("owners/createOrUpdateOwnerForm"));
  }
  ```

- [x] 1.4 Run the new test and confirm it fails (the controller currently saves without checking for duplicates, so it will redirect instead of returning HTTP 200):

  ```bash
  ./mvnw test -Dtest="OwnerControllerTests#testProcessCreationFormDuplicateOwner"
  ```

  Expected: test failure. If it passes, the stub or assertion is incorrect — review steps 1.2 and 1.3.

---

### [x] 2.0 [GREEN] Implement owner create duplicate detection (repository + controller + UI + i18n)

#### 2.0 Proof Artifact(s)

- Test run: `./mvnw test -Dtest=OwnerControllerTests` exits zero with all tests passing — demonstrates create duplicate check is implemented and all existing tests are unaffected.
- Screenshot: `08-proofs/02-create-duplicate-error-banner.png` — browser showing the create form with the red `alert-danger` banner reading "An owner with this name already exists. Please search for the existing owner." — demonstrates the UI error renders correctly.

#### 2.0 Tasks

- [x] 2.1 In `OwnerController.java`, inside `processCreationForm()`, add the duplicate check **before** the `this.owners.save(owner)` call. After the `if (result.hasErrors())` block, insert:

  ```java
  Optional<Owner> existingOwner = this.owners
      .findByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndTelephone(
          owner.getFirstName(), owner.getLastName(), owner.getTelephone());
  if (existingOwner.isPresent()) {
      result.reject("duplicate.owner",
          "An owner with this name already exists. Please search for the existing owner.");
      return VIEWS_OWNER_CREATE_OR_UPDATE_FORM;
  }
  ```

  Add `import java.util.Optional;` if not already present at the top of the file.

- [x] 2.2 In `src/main/resources/messages/messages.properties`, add the new message key at the end of the file:

  ```properties
  duplicate.owner=An owner with this name already exists. Please search for the existing owner.
  ```

- [x] 2.3 In `src/main/resources/messages/messages_en.properties`, add the same key at the end of the file (this file already contains English overrides for recent features):

  ```properties
  duplicate.owner=An owner with this name already exists. Please search for the existing owner.
  ```

- [x] 2.4 In `src/main/resources/templates/owners/createOrUpdateOwnerForm.html`, add a global error banner **inside `<body>`**, immediately before the `<h2>` heading tag:

  ```html
  <div th:if="${#fields.hasGlobalErrors()}" class="alert alert-danger" role="alert">
    <ul class="list-unstyled mb-0">
      <li th:each="error : ${#fields.globalErrors()}" th:text="${error}"></li>
    </ul>
  </div>
  ```

- [x] 2.5 Run the full `OwnerControllerTests` suite to confirm the new test now passes and no existing tests broke:

  ```bash
  ./mvnw test -Dtest=OwnerControllerTests
  ```

  Expected: all tests pass (including `testProcessCreationFormDuplicateOwner` and all pre-existing tests).

- [x] 2.6 Start the application (`./mvnw spring-boot:run`) and manually verify in a browser:
  - Navigate to `http://localhost:8080/owners/new`
  - Create an owner (e.g., firstName=Test, lastName=Duplicate, telephone=5555555555)
  - Navigate back to `http://localhost:8080/owners/new` and submit the same first name, last name, and telephone
  - Confirm the red alert banner appears with the expected message
  - Save a screenshot to `docs/specs/08-spec-duplicate-owner-prevention/08-proofs/02-create-duplicate-error-banner.png`

---

### [x] 3.0 [RED] Write failing JUnit test for edit duplicate detection

#### 3.0 Proof Artifact(s)

- Test run: `./mvnw test -Dtest="OwnerControllerTests#testProcessUpdateOwnerFormDuplicateOwner"` exits non-zero with a test failure — demonstrates the test exists and fails because the edit path has no duplicate check yet.

#### 3.0 Tasks

- [x] 3.1 In `OwnerControllerTests.java`, add the following new test method after `testProcessUpdateOwnerFormHasErrors()`:

  ```java
  @Test
  void testProcessUpdateOwnerFormDuplicateOwner() throws Exception {
      // Arrange: a second, different owner already has the target name+telephone
      Owner conflicting = new Owner();
      conflicting.setId(2);
      conflicting.setFirstName("Joe");
      conflicting.setLastName("Bloggs");
      conflicting.setAddress("99 Other St.");
      conflicting.setCity("London");
      conflicting.setTelephone("1616291589");

      given(this.owners.findByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndTelephone(
          "Joe", "Bloggs", "1616291589"))
          .willReturn(Optional.of(conflicting));

      // Act & Assert: editing owner with TEST_OWNER_ID (1) to a name+telephone owned by id=2 must be blocked
      mockMvc.perform(post("/owners/{ownerId}/edit", TEST_OWNER_ID)
              .param("firstName", "Joe")
              .param("lastName", "Bloggs")
              .param("address", "123 Caramel Street")
              .param("city", "London")
              .param("telephone", "1616291589"))
          .andExpect(status().isOk())
          .andExpect(model().hasErrors())
          .andExpect(view().name("owners/createOrUpdateOwnerForm"));
  }
  ```

- [x] 3.2 Run the new test and confirm it fails (the edit controller currently saves without checking, so it redirects instead of returning HTTP 200):

  ```bash
  ./mvnw test -Dtest="OwnerControllerTests#testProcessUpdateOwnerFormDuplicateOwner"
  ```

  Expected: test failure. If it passes, review step 3.1.

---

### [x] 4.0 [GREEN] Implement owner edit duplicate detection (controller only)

#### 4.0 Proof Artifact(s)

- Test run: `./mvnw test -Dtest=OwnerControllerTests` exits zero with all tests passing — demonstrates the edit duplicate check works and saving an owner with unchanged details is still allowed.
- Test run: `./mvnw test` exits zero — demonstrates no regressions across the full test suite.

#### 4.0 Tasks

- [x] 4.1 In `OwnerController.java`, inside `processUpdateOwnerForm()`, add the duplicate check **after** the ID mismatch check and **before** the `owner.setId(ownerId)` call:

  ```java
  Optional<Owner> existingOwner = this.owners
      .findByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndTelephone(
          owner.getFirstName(), owner.getLastName(), owner.getTelephone());
  if (existingOwner.isPresent() && !Objects.equals(existingOwner.get().getId(), ownerId)) {
      result.reject("duplicate.owner",
          "An owner with this name already exists. Please search for the existing owner.");
      return VIEWS_OWNER_CREATE_OR_UPDATE_FORM;
  }
  ```

  Note: `Objects.equals` is already imported in the file.

- [x] 4.2 Run the full `OwnerControllerTests` suite to confirm the new test now passes and no existing tests broke:

  ```bash
  ./mvnw test -Dtest=OwnerControllerTests
  ```

  Expected: all tests pass, including `testProcessUpdateOwnerFormDuplicateOwner`, `testProcessUpdateOwnerFormSuccess`, and `testProcessUpdateOwnerFormUnchangedSuccess`.

- [x] 4.3 Run the complete test suite to confirm no regressions:

  ```bash
  ./mvnw test
  ```

  Expected: all tests pass.

---

### [ ] 5.0 Add Playwright E2E tests for create and edit duplicate prevention

#### 5.0 Proof Artifact(s)

- Test run: `npm test -- --grep "Duplicate Owner"` (from `e2e-tests/`) exits zero — demonstrates both E2E scenarios pass against a running application.
- Screenshot: `08-proofs/05-e2e-create-duplicate.png` — Playwright screenshot of the create form showing the red alert banner after a duplicate submission.
- Screenshot: `08-proofs/05-e2e-edit-duplicate.png` — Playwright screenshot of the edit form showing the red alert banner after a duplicate rename attempt.

#### 5.0 Tasks

- [ ] 5.1 In `e2e-tests/tests/pages/owner-page.ts`, add a locator helper method at the end of the `OwnerPage` class (before the closing `}`):

  ```typescript
  duplicateErrorBanner(): Locator {
    return this.page.locator('.alert.alert-danger');
  }
  ```

- [ ] 5.2 In `e2e-tests/tests/features/owner-management.spec.ts`, add a new `describe` block at the end of the file (after the closing `}` of the existing `Owner Management` block):

  ```typescript
  test.describe('Duplicate Owner Prevention', () => {
    test('blocks creating an owner with the same name and telephone as an existing owner', async ({ page }, testInfo) => {
      const ownerPage = new OwnerPage(page);
      // Use a fixed owner so the second attempt matches exactly
      const owner = createOwner({
        firstName: 'Duplicate',
        lastName: 'DetectionTest',
        telephone: '8005550100',
      });

      // Create the owner for the first time
      await ownerPage.openFindOwners();
      await ownerPage.clickAddOwner();
      await ownerPage.fillOwnerForm(owner);
      await ownerPage.submitOwnerForm();
      await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();

      // Attempt to create the same owner again
      await ownerPage.openFindOwners();
      await ownerPage.clickAddOwner();
      await ownerPage.fillOwnerForm(owner);
      await ownerPage.submitOwnerForm();

      // Assert the duplicate error banner is shown
      await expect(ownerPage.duplicateErrorBanner()).toBeVisible();
      await expect(ownerPage.duplicateErrorBanner()).toContainText(
        'An owner with this name already exists. Please search for the existing owner.'
      );

      await page.screenshot({ path: testInfo.outputPath('create-duplicate-error.png'), fullPage: true });
    });

    test('blocks renaming an owner to a name and telephone that already belongs to another owner', async ({ page }, testInfo) => {
      const ownerPage = new OwnerPage(page);
      const firstOwner = createOwner({
        firstName: 'Original',
        lastName: 'OwnerRecord',
        telephone: '8005550101',
      });
      const secondOwner = createOwner({
        firstName: 'Another',
        lastName: 'PersonRecord',
        telephone: '8005550102',
      });

      // Create both owners
      await ownerPage.openFindOwners();
      await ownerPage.clickAddOwner();
      await ownerPage.fillOwnerForm(firstOwner);
      await ownerPage.submitOwnerForm();
      await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();

      await ownerPage.openFindOwners();
      await ownerPage.clickAddOwner();
      await ownerPage.fillOwnerForm(secondOwner);
      await ownerPage.submitOwnerForm();
      await expect(page.getByRole('heading', { name: /Owner Information/i })).toBeVisible();

      // Edit the second owner and rename to match the first owner's name + telephone
      await ownerPage.clickEditOwner();
      await ownerPage.fillOwnerForm({
        ...secondOwner,
        firstName: firstOwner.firstName,
        lastName: firstOwner.lastName,
        telephone: firstOwner.telephone,
      });
      await ownerPage.submitOwnerForm();

      // Assert the duplicate error banner is shown
      await expect(ownerPage.duplicateErrorBanner()).toBeVisible();
      await expect(ownerPage.duplicateErrorBanner()).toContainText(
        'An owner with this name already exists. Please search for the existing owner.'
      );

      await page.screenshot({ path: testInfo.outputPath('edit-duplicate-error.png'), fullPage: true });
    });
  });
  ```

- [ ] 5.3 Create the proof artifacts directory:

  ```bash
  mkdir -p docs/specs/08-spec-duplicate-owner-prevention/08-proofs
  ```

- [ ] 5.4 Start the application if it isn't already running:

  ```bash
  ./mvnw spring-boot:run
  ```

- [ ] 5.5 Run only the duplicate E2E tests from the `e2e-tests/` directory:

  ```bash
  cd e2e-tests && npm test -- --grep "Duplicate Owner"
  ```

  Expected: both tests pass.

- [ ] 5.6 Copy the Playwright-generated screenshots to the proofs directory. Playwright saves test screenshots to `e2e-tests/test-results/`. Locate the two screenshots and copy them:

  ```bash
  cp e2e-tests/test-results/**/create-duplicate-error.png \
     docs/specs/08-spec-duplicate-owner-prevention/08-proofs/05-e2e-create-duplicate.png
  cp e2e-tests/test-results/**/edit-duplicate-error.png \
     docs/specs/08-spec-duplicate-owner-prevention/08-proofs/05-e2e-edit-duplicate.png
  ```

- [ ] 5.7 Run the full E2E suite to confirm no regressions in existing tests:

  ```bash
  cd e2e-tests && npm test
  ```

  Expected: all tests pass.
