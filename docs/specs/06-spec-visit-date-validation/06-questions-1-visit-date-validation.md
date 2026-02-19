# 06 Questions Round 1 - Visit Date Validation

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

## 1. Validation Placement

Where should the past-date check live?

- [ ] (A) Controller-level validation — reject the value in `VisitController.processNewVisitForm()` using `result.rejectValue(...)`, similar to how `PetController` validates `birthDate` today
- [ ] (B) Custom `VisitValidator` class (implements `org.springframework.validation.Validator`) registered via `@InitBinder`, similar to the existing `PetValidator`
- [ ] (C) Bean Validation annotation — add or create a JSR-303 constraint annotation directly on `Visit.date` (e.g., `@FutureOrPresent`)
- [x] (D) No strong preference — use whatever fits best with the existing patterns
- [ ] (E) Other (describe)

## 2. "Today" Boundary

When the form is submitted with today's date, should it be accepted or rejected?

- [x] (A) Accept today — only dates strictly *before* today are invalid (i.e., `date < today` is rejected)
- [ ] (B) Reject today — only *future* dates are valid (i.e., `date <= today` is rejected; visits must be scheduled ahead)
- [ ] (C) Other (describe)

## 3. Validation Message Wording

What should the error message say? Examples:

- [ ] (A) `"Visit date must not be in the past"`
- [ ] (B) `"Visit date must be today or a future date"`
- [x] (C) `"Invalid date: please choose today or a future date"`
- [ ] (D) Other (describe your preferred wording)

## 4. Internationalization (i18n)

The project ships with `messages.properties`, `messages_en.properties`, and `messages_es.properties`.

- [x] (A) Add the error message key to all three files (English + Spanish translation needed)
- [ ] (B) Add to `messages.properties` and `messages_en.properties` only; use a placeholder string for Spanish
- [ ] (C) Add to `messages.properties` only (base fallback, no per-language files updated)
- [ ] (D) Other (describe)

## 5. Playwright Test Scope

How thorough should the Playwright E2E test be?

- [ ] (A) Minimal — one test: submit a past date, assert the validation error message appears
- [ ] (B) Standard — two tests: (1) submit a past date and assert error; (2) submit today's date and assert success redirect
- [x] (C) Comprehensive — three tests: (1) past date → error; (2) today → success; (3) future date → success
- [ ] (D) Other (describe)
