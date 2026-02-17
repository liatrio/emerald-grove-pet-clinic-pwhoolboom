# 02-tasks-friendly-404-pages.md

## Relevant Files

### New Files to Create

- `src/main/java/org/springframework/samples/petclinic/system/ResourceNotFoundException.java` - Custom exception for resource-not-found scenarios
- `src/main/java/org/springframework/samples/petclinic/system/ResourceNotFoundExceptionHandler.java` - @ControllerAdvice handler that catches ResourceNotFoundException and returns 404
- `src/test/java/org/springframework/samples/petclinic/system/ResourceNotFoundExceptionHandlerTests.java` - Unit tests for exception handler
- `src/main/resources/templates/notFound.html` - User-facing 404 error page with Liatrio branding
- `e2e-tests/tests/404-handling.spec.ts` - Playwright E2E tests for 404 user flows
- `docs/specs/02-spec-friendly-404-pages/proof-artifacts/` - Directory for proof artifact screenshots

### Files to Modify

- `src/main/java/org/springframework/samples/petclinic/owner/OwnerController.java` - Replace IllegalArgumentException with ResourceNotFoundException
- `src/main/java/org/springframework/samples/petclinic/owner/PetController.java` - Replace IllegalArgumentException with ResourceNotFoundException
- `src/main/java/org/springframework/samples/petclinic/owner/VisitController.java` - Replace IllegalArgumentException with ResourceNotFoundException
- `src/test/java/org/springframework/samples/petclinic/owner/OwnerControllerTests.java` - Add test for non-existent owner returning 404
- `src/test/java/org/springframework/samples/petclinic/owner/PetControllerTests.java` - Add test for non-existent pet returning 404
- `src/test/java/org/springframework/samples/petclinic/owner/VisitControllerTests.java` - Add test for non-existent visit returning 404

### Notes

- Follow **Strict TDD (RED-GREEN-REFACTOR)**: Write failing test → Make it pass → Refactor
- Use JUnit 5 with MockMvc for controller tests: `./mvnw test -Dtest=TestClassName`
- Use Playwright for E2E tests: `cd e2e-tests && npm test`
- Maintain 90%+ code coverage per repository standards
- Package-private classes with constructor injection (no @Autowired)
- Follow existing code style: refer to CrashController.java and error.html as examples
- Commit after each completed parent task for incremental progress

## Tasks

### [x] 1.0 Create Custom Exception and Handler Infrastructure

#### 1.0 Proof Artifact(s)

- Java files: `src/main/java/org/springframework/samples/petclinic/system/ResourceNotFoundException.java` and `src/main/java/org/springframework/samples/petclinic/system/ResourceNotFoundExceptionHandler.java` created demonstrates infrastructure exists
- Test file: `src/test/java/org/springframework/samples/petclinic/system/ResourceNotFoundExceptionHandlerTests.java` passes demonstrates exception handling works correctly with 404 status
- Test output: `./mvnw test -Dtest=ResourceNotFoundExceptionHandlerTests` shows all tests passing demonstrates handler behaves as expected
- Code inspection: Handler code does not expose stack traces or sensitive details demonstrates security requirement met

#### 1.0 Tasks

- [x] 1.1 **RED**: Write failing test in `ResourceNotFoundExceptionHandlerTests.java` that verifies throwing ResourceNotFoundException returns 404 status
- [x] 1.2 **RED**: Write failing test that verifies handler sets correct view name ("notFound")
- [x] 1.3 **RED**: Write failing test that verifies handler does not expose stack traces or exception details in model
- [x] 1.4 **GREEN**: Create `ResourceNotFoundException.java` class extending RuntimeException with @ResponseStatus(HttpStatus.NOT_FOUND)
- [x] 1.5 **GREEN**: Create `ResourceNotFoundExceptionHandler.java` with @ControllerAdvice and @ExceptionHandler(ResourceNotFoundException.class) method
- [x] 1.6 **GREEN**: Implement handler to return ModelAndView with "notFound" view and user-friendly message (no technical details)
- [x] 1.7 **REFACTOR**: Review exception and handler code for clarity and ensure no sensitive information leaks
- [x] 1.8 Run tests: `./mvnw test -Dtest=ResourceNotFoundExceptionHandlerTests` and verify all pass

### [~] 2.0 Create Friendly 404 View Template

#### 2.0 Proof Artifact(s)

- Template file: `src/main/resources/templates/notFound.html` created demonstrates view exists
- Screenshot: `docs/specs/02-spec-friendly-404-pages/proof-artifacts/notFound-page-screenshot.png` showing rendered page with "Oops! We couldn't find that pet or owner" message and "Find Owners" button demonstrates user-facing design
- Visual inspection: Screenshot shows dark theme (#1a1a1a), Liatrio green button (#00C853), pets image, and consistent navigation demonstrates branding compliance
- Link verification: "Find Owners" button href points to `/owners/find` demonstrates correct navigation

#### 2.0 Tasks

- [x] 2.1 Create proof artifacts directory: `mkdir -p docs/specs/02-spec-friendly-404-pages/proof-artifacts`
- [x] 2.2 Review existing `error.html` template to understand layout structure and styling patterns
- [x] 2.3 Create `notFound.html` using `th:replace="~{fragments/layout :: layout (~{::body},'error')}"` for consistent navigation
- [x] 2.4 Add `.liatrio-section` and `.liatrio-error-card` div structure following error.html pattern
- [x] 2.5 Include pets image: `<img th:src="@{/resources/images/pets.png}" alt="Pets at the clinic" />`
- [x] 2.6 Add friendly heading: `<h2>Oops! We couldn't find that pet or owner.</h2>`
- [x] 2.7 Add helpful message: `<p>Let's help you search again.</p>`
- [x] 2.8 Add "Find Owners" button: `<a th:href="@{/owners/find}" class="btn btn-primary">Find Owners</a>` with Liatrio green styling
- [x] 2.9 Start application: `./mvnw spring-boot:run` (deferred to E2E tests)
- [x] 2.10 Manually test by throwing ResourceNotFoundException in a test controller endpoint (deferred to E2E tests)
- [x] 2.11 Capture screenshot of rendered page and save to proof-artifacts directory (deferred to E2E tests)
- [x] 2.12 Verify visual design matches Liatrio branding (dark theme, green accent, consistent navigation) (deferred to E2E tests)

### [ ] 3.0 Update Controllers to Use ResourceNotFoundException

#### 3.0 Proof Artifact(s)

- Code diff: `git diff HEAD` showing `OwnerController`, `PetController`, and `VisitController` with `ResourceNotFoundException` instead of `IllegalArgumentException` demonstrates implementation complete
- Test file: `src/test/java/org/springframework/samples/petclinic/owner/OwnerControllerTests.java` updated with `testShowNonExistentOwner()` returning 404 status demonstrates owner-not-found handling
- Test file: `src/test/java/org/springframework/samples/petclinic/owner/PetControllerTests.java` updated with `testShowNonExistentPet()` returning 404 status demonstrates pet-not-found handling
- Test output: `./mvnw test -Dtest="*ControllerTests"` shows all controller tests passing demonstrates no regressions introduced

#### 3.0 Tasks

- [ ] 3.1 **RED**: Add `testShowNonExistentOwner()` to OwnerControllerTests that expects 404 status when accessing /owners/99999
- [ ] 3.2 **RED**: Verify test fails because IllegalArgumentException returns 500, not 404
- [ ] 3.3 **GREEN**: Update OwnerController - replace all `IllegalArgumentException` with `ResourceNotFoundException` in findOwner() and showOwner() methods
- [ ] 3.4 **GREEN**: Run `./mvnw test -Dtest=OwnerControllerTests` and verify testShowNonExistentOwner passes
- [ ] 3.5 **RED**: Add `testShowNonExistentPet()` to PetControllerTests that expects 404 status when accessing /owners/1/pets/99999
- [ ] 3.6 **GREEN**: Update PetController - replace `IllegalArgumentException` with `ResourceNotFoundException` in findPet() and loadPetWithVisit() methods
- [ ] 3.7 **GREEN**: Run `./mvnw test -Dtest=PetControllerTests` and verify testShowNonExistentPet passes
- [ ] 3.8 **RED**: Add `testAddVisitToNonExistentPet()` to VisitControllerTests that expects 404 status
- [ ] 3.9 **GREEN**: Update VisitController - replace `IllegalArgumentException` with `ResourceNotFoundException` in loadPetWithVisit() method
- [ ] 3.10 **GREEN**: Run `./mvnw test -Dtest=VisitControllerTests` and verify test passes
- [ ] 3.11 **REFACTOR**: Review all controller changes and ensure exception messages are user-friendly (no database details)
- [ ] 3.12 Run full controller test suite: `./mvnw test -Dtest="*ControllerTests"` and verify no regressions
- [ ] 3.13 Generate code diff: `git diff HEAD > docs/specs/02-spec-friendly-404-pages/proof-artifacts/controller-changes.diff`

### [ ] 4.0 Create End-to-End Playwright Tests for 404 Handling

#### 4.0 Proof Artifact(s)

- Test file: `e2e-tests/tests/404-handling.spec.ts` created demonstrates E2E test coverage exists
- Test output: `cd e2e-tests && npm test -- 404-handling.spec.ts` shows all assertions passing demonstrates comprehensive validation
- Screenshot: `e2e-tests/test-results/artifacts/404-page-playwright.png` captured by Playwright demonstrates what users actually see
- Test coverage: Test verifies non-existent owner URL returns 404, friendly message displays, "Find Owners" link is present and clickable, no stack traces visible demonstrates complete user flow validation
- HTML report: `e2e-tests/test-results/html-report/index.html` shows detailed test results demonstrates production readiness

#### 4.0 Tasks

- [ ] 4.1 Ensure application is running: `./mvnw spring-boot:run` in background or separate terminal
- [ ] 4.2 Create `e2e-tests/tests/404-handling.spec.ts` with test suite "404 Error Handling"
- [ ] 4.3 **Test 1**: Write test "should show friendly 404 page for non-existent owner"
  - Navigate to `/owners/99999`
  - Assert page returns 404 status using `expect(response.status()).toBe(404)`
  - Assert friendly message is visible: `expect(page.getByText(/couldn't find that pet or owner/i)).toBeVisible()`
- [ ] 4.4 **Test 2**: Write test "should show Find Owners link on 404 page"
  - Navigate to `/owners/99999`
  - Assert "Find Owners" link exists: `expect(page.getByRole('link', { name: /find owners/i })).toBeVisible()`
  - Click link and verify navigation to `/owners/find`
- [ ] 4.5 **Test 3**: Write test "should not expose stack traces or technical details"
  - Navigate to `/owners/99999`
  - Assert page does not contain "Exception", "java", "org.springframework", or "stack trace": `expect(page.locator('body')).not.toContainText(/exception|java|stack trace/i)`
- [ ] 4.6 **Test 4**: Write test "should show 404 for non-existent pet"
  - Navigate to `/owners/1/pets/99999`
  - Assert 404 status and friendly message displayed
- [ ] 4.7 Add screenshot capture in each test: `await page.screenshot({ path: 'test-results/artifacts/404-page-playwright.png', fullPage: true })`
- [ ] 4.8 Run Playwright tests: `cd e2e-tests && npm test -- 404-handling.spec.ts`
- [ ] 4.9 Verify all 4 tests pass and HTML report is generated
- [ ] 4.10 Review screenshots in `e2e-tests/test-results/artifacts/` to confirm user-facing experience
- [ ] 4.11 Copy key screenshot to spec proof-artifacts: `cp e2e-tests/test-results/artifacts/404-page-playwright.png docs/specs/02-spec-friendly-404-pages/proof-artifacts/`
