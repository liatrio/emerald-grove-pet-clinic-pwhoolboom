# 02-spec-friendly-404-pages.md

## Introduction/Overview

This feature improves the user experience when accessing missing resources (owners, pets, vets) by providing friendly, branded 404 error pages instead of exposing stack traces or internal exception details. When a user navigates to a non-existent resource URL, they will see a helpful message with a link back to the search functionality, making it easy to recover from errors.

## Goals

- Display user-friendly 404 pages when resources (owners, pets, vets) are not found
- Prevent exposure of stack traces, exception details, or internal system information to end users
- Provide clear navigation path back to search functionality via "Find Owners" link
- Maintain consistent Liatrio branding and visual design across error pages
- Ensure comprehensive test coverage at both unit (JUnit) and end-to-end (Playwright) levels

## User Stories

**As a clinic staff member**, I want to see a friendly error message when I navigate to an invalid owner or pet URL, so that I can understand what went wrong and easily return to my search without being confused by technical errors.

**As an application user**, I want the system to hide technical details when something goes wrong, so that I feel confident the application is professionally maintained and secure.

**As a developer**, I want a reusable exception handling mechanism for resource-not-found scenarios, so that all controllers can provide consistent 404 responses without duplicating error handling code.

## Demoable Units of Work

### Unit 1: Custom Exception and Handler Infrastructure

**Purpose:** Create the foundational exception handling infrastructure that all controllers can use to throw and handle resource-not-found scenarios consistently.

**Functional Requirements:**

- The system shall define a custom `ResourceNotFoundException` exception class that extends `RuntimeException`
- The system shall create a `@ControllerAdvice` exception handler that catches `ResourceNotFoundException` and returns HTTP 404 status
- The exception handler shall set the appropriate view name (`notFound`) and provide user-friendly error context to the template
- The system shall not expose stack traces, exception class names, or internal system details in the error response

**Proof Artifacts:**

- Java files: `ResourceNotFoundException.java` and `ResourceNotFoundExceptionHandler.java` created demonstrates infrastructure exists
- Unit test: `ResourceNotFoundExceptionHandlerTests.java` passes demonstrates exception handling works correctly
- Code review: Exception handler code shows no sensitive information is passed to view demonstrates security requirement met

### Unit 2: Friendly 404 View Template

**Purpose:** Create a visually consistent, branded 404 error page that provides clear messaging and navigation options for users who encounter missing resources.

**Functional Requirements:**

- The system shall create a `notFound.html` Thymeleaf template following Liatrio branding guidelines
- The template shall display the friendly message: "Oops! We couldn't find that pet or owner. Let's help you search again."
- The template shall include a "Find Owners" button/link that navigates to `/owners/find`
- The template shall use the existing layout fragments and styling patterns (dark theme, green accent colors)
- The template shall not display any technical error details, stack traces, or exception messages

**Proof Artifacts:**

- Template file: `src/main/resources/templates/notFound.html` created demonstrates view exists
- Screenshot: Rendered 404 page showing branded design and "Find Owners" link demonstrates user experience
- Visual inspection: Page follows Liatrio design system (dark theme, green accents, consistent navigation) demonstrates branding compliance

### Unit 3: Controller Updates for Owner and Pet Not Found

**Purpose:** Update Owner, Pet, and Visit controllers to throw `ResourceNotFoundException` instead of `IllegalArgumentException` when resources are not found, ensuring consistent 404 responses.

**Functional Requirements:**

- The system shall replace all `IllegalArgumentException` throws in `OwnerController`, `PetController`, and `VisitController` with `ResourceNotFoundException`
- When an owner ID is not found, the system shall throw `ResourceNotFoundException` with a user-friendly message
- When a pet ID is not found for an owner, the system shall throw `ResourceNotFoundException` with a user-friendly message
- The user shall be redirected to the 404 page with HTTP status code 404 for all resource-not-found scenarios

**Proof Artifacts:**

- JUnit test: `OwnerControllerTests.testShowNonExistentOwner()` returns 404 status demonstrates owner-not-found handling
- JUnit test: `PetControllerTests.testEditNonExistentPet()` returns 404 status demonstrates pet-not-found handling
- Test output: All controller tests pass demonstrates no regressions introduced
- Code diff: Controllers show `ResourceNotFoundException` instead of `IllegalArgumentException` demonstrates implementation complete

### Unit 4: End-to-End Playwright Tests

**Purpose:** Verify the complete user experience for 404 scenarios through browser automation, ensuring users see friendly messages and can navigate back to search functionality.

**Functional Requirements:**

- The test shall navigate to a non-existent owner URL (e.g., `/owners/99999`) and verify HTTP 404 status is returned
- The test shall verify the friendly error message is displayed on the page
- The test shall verify the "Find Owners" link is present and clickable
- The test shall verify no stack traces, exception details, or technical information is visible in the rendered page
- The test shall also verify non-existent pet URLs return 404 with friendly messaging

**Proof Artifacts:**

- Playwright test: `e2e-tests/tests/404-handling.spec.ts` passes demonstrates end-to-end functionality
- Screenshot: Playwright-captured 404 page demonstrates what users see
- Test report: HTML test report shows all assertions passed demonstrates comprehensive validation
- CI output: Playwright tests pass in automated pipeline demonstrates production readiness

## Non-Goals (Out of Scope)

1. **Custom 403 (Forbidden) or 401 (Unauthorized) pages**: This spec focuses only on 404 resource-not-found scenarios
2. **Logging or monitoring of 404 errors**: Error tracking/analytics integration is not included
3. **Internationalization (i18n) of error messages**: Error messages will be English-only in this iteration
4. **Custom 500 (Server Error) page improvements**: The existing `error.html` template will handle server errors
5. **API endpoint 404 responses**: This spec focuses on web UI pages; JSON API error responses are out of scope

## Design Considerations

The `notFound.html` template should follow these design guidelines:

- **Layout**: Use the existing `fragments/layout.html` for consistent navigation and footer
- **Color Scheme**: Dark theme (#1a1a1a background) with Liatrio green (#00C853) accent for primary button
- **Typography**: Use existing font hierarchy (h2 for heading, p for body text)
- **Imagery**: Include the pets image or Emerald Grove logo for visual consistency
- **CTA Button**: "Find Owners" button styled as primary action (green background, white text, rounded corners)
- **Spacing**: Use existing `.liatrio-section` and `.liatrio-error-card` classes for consistent padding and margins

The design should be visually similar to the existing `error.html` but specifically optimized for the 404 not-found scenario.

## Repository Standards

Implementation should follow these established patterns:

- **Package Structure**: Exception and handler classes go in `org.springframework.samples.petclinic.system` package
- **Testing Conventions**:
  - JUnit 5 with MockMvc for controller tests
  - Playwright for E2E tests in `e2e-tests/tests/` directory
  - Maintain 90%+ code coverage per TDD requirements
- **Code Style**: Package-private classes with constructor injection, no @Autowired annotations
- **Thymeleaf Templates**: Use `th:replace` for layouts, `th:href` for URLs, follow existing template structure
- **Commit Conventions**: Descriptive commit messages following project standards

## Technical Considerations

- **Spring Boot Exception Handling**: Use `@ControllerAdvice` with `@ExceptionHandler` to centralize 404 handling
- **HTTP Status Codes**: Set response status to 404 using `@ResponseStatus(HttpStatus.NOT_FOUND)` on custom exception
- **View Resolution**: Return view name `"notFound"` which resolves to `templates/notFound.html`
- **Backward Compatibility**: Existing `error.html` template remains for other error scenarios (500, etc.)
- **Controller Changes**: Minimal impact - just swap exception type from `IllegalArgumentException` to `ResourceNotFoundException`

## Security Considerations

This feature specifically addresses security concerns around information disclosure:

- **No Stack Traces**: Exception handler must not pass stack trace information to the view
- **No Implementation Details**: Error messages should not reveal database structure, query details, or internal IDs
- **User-Friendly Messages Only**: Only display high-level, friendly messages like "resource not found"
- **Sanitized Inputs**: Even though not rendered, ensure any user input in URLs doesn't appear in error messages
- **Test Data Security**: Playwright and JUnit tests should use non-existent IDs (like 99999) that don't expose real data

## Success Metrics

1. **Zero Stack Trace Exposures**: No production 404 errors display stack traces or exception details to end users
2. **Test Coverage**: 100% of resource-not-found code paths covered by automated tests (JUnit + Playwright)
3. **User Navigation**: "Find Owners" link has 100% functionality - always redirects to `/owners/find`
4. **Response Time**: 404 pages render in <200ms (same performance as existing error pages)

## Open Questions

No open questions at this time. All clarifying questions have been answered and incorporated into this specification.
