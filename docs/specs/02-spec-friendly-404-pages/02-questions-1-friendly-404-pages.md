# 02 Questions Round 1 - Friendly 404 Pages

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

## 1. Error Page Content and Messaging

What specific message should users see when they encounter a missing owner or pet?

- [ ] (A) Generic message: "The requested resource was not found. Please return to Find Owners to search again."
- [ ] (B) Specific messages: "Owner not found" vs "Pet not found" with contextual guidance for each
- [x] (C) Friendly, branded message: "Oops! We couldn't find that pet or owner. Let's help you search again."
- [ ] (D) Minimal message: "Not found" with just a link back
- [ ] (E) Other (describe)

**Additional context:**

## 2. Link Back Behavior

What should the "link back to find owners" do?

- [x] (A) Navigate to `/owners/find` (the search form, empty state)
- [ ] (B) Navigate to `/owners?page=1` (the list of all owners, paginated)
- [ ] (C) Navigate to homepage `/`
- [ ] (D) Include multiple options (e.g., "Find Owners" and "Go Home" buttons)
- [ ] (E) Other (describe)

**Additional context:**

## 3. HTTP Status Code Handling

Should the 404 handling differ for missing owners vs missing pets?

- [ ] (A) Same 404 response for both (simpler, consistent)
- [x] (B) Different status codes: 404 for owner, 404 for pet but with different view/message
- [ ] (C) Use 404 for owner, but pet-not-found stays as-is (only fix owner)
- [ ] (D) Other (describe)

**Additional context:**

## 4. Visual Design

Should the 404 page match the existing `error.html` design?

- [ ] (A) Yes, use the existing error.html template and just customize messaging
- [x] (B) Create a dedicated `notFound.html` template with custom styling
- [ ] (C) Enhance the existing error.html to better differentiate 404 from other errors
- [ ] (D) Other (describe)

**Additional context:**

## 5. Exception Handling Strategy

How should we implement the 404 handling?

- [x] (A) Create a custom `ResourceNotFoundException` and throw it instead of `IllegalArgumentException`
- [ ] (B) Create a `@ControllerAdvice` class to catch `IllegalArgumentException` and convert to 404
- [ ] (C) Change controller methods to return `ResponseEntity` with 404 status on not found
- [ ] (D) Modify controllers to return error view directly when resource not found
- [ ] (E) Other (describe)

**Additional context:**

## 6. Scope of Changes

Which scenarios should return friendly 404 pages?

- [ ] (A) Missing owner ID only (e.g., `/owners/99999`)
- [ ] (B) Missing owner ID and missing pet ID (e.g., `/owners/1/pets/99999`)
- [ ] (C) Also include missing vet scenarios (e.g., `/vets/99999`)
- [x] (D) All resource-not-found scenarios across the entire application
- [ ] (E) Other (describe)

**Additional context:**

## 7. Playwright Test Coverage

What should the Playwright E2E test verify?

- [ ] (A) Navigate to non-existent owner URL, verify 404 status and user-friendly message
- [ ] (B) Also test non-existent pet URL and verify 404
- [ ] (C) Also verify "Find Owners" link is present and clickable
- [ ] (D) Verify no stack traces or technical details are visible in the page
- [x] (E) All of the above
- [ ] (F) Other (describe)

**Additional context:**

## 8. JUnit Test Coverage

What should the JUnit MVC tests verify?

- [ ] (A) Test that accessing `/owners/99999` returns 404 status
- [ ] (B) Test that the returned view name is correct (e.g., "error" or "notFound")
- [ ] (C) Test that model attributes don't contain sensitive exception details
- [ ] (D) Test both owner-not-found and pet-not-found scenarios
- [x] (E) All of the above
- [ ] (F) Other (describe)

**Additional context:**
