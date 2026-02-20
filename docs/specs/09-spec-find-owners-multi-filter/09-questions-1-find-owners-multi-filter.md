# 09 Questions Round 1 - Find Owners Multi-Filter

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

## 1. Multi-Field Filter Logic

When a user fills in more than one field (e.g., last name AND city), how should the results be filtered?

- [x] (A) AND logic — the owner must match ALL provided fields (e.g., last name starts with "Smith" AND city starts with "London")
- [ ] (B) OR logic — the owner must match ANY of the provided fields
- [ ] (C) Other (describe)

## 2. Matching Strategy for Telephone in Search

The creation form requires a strict 10-digit telephone. For the **search** field, what matching rule should apply?

- [x] (A) Exact full 10-digit match only — must be exactly 10 digits to return results; otherwise show a validation error
- [ ] (B) Prefix/starts-with match — partial telephone input is allowed (e.g., "608" matches any number starting with "608")
- [ ] (C) Other (describe)

## 3. Telephone Validation on the Search Form

If an invalid telephone is entered in the search field (e.g., letters or wrong length), how should the error be surfaced?

- [x] (A) Inline field validation error shown on the Find Owners form (same page, same style as other field errors)
- [ ] (B) No validation — just return zero results silently
- [ ] (C) Other (describe)

## 4. Matching Strategy for City in Search

How should the city search field match owner records?

- [x] (A) Starts-with / prefix match (case-insensitive) — "Lon" matches "London"
- [ ] (B) Exact match (case-insensitive) — "London" only matches "London"
- [ ] (C) Contains / substring match — "don" matches "London"
- [ ] (D) Other (describe)

## 5. "No Results" Error Behavior

When no owners are found for the combined criteria, how should the error be displayed?

- [ ] (A) Show an error on the **last name** field only (current behavior), regardless of which fields were filled
- [x] (B) Show a general error message at the top of the form (not tied to a specific field)
- [ ] (C) Show an error on whichever field(s) were filled in
- [ ] (D) Other (describe)

## 6. Pagination Filter Preservation

Spec 07 added filter preservation in pagination links for last name. Should telephone and city filters also be preserved in pagination links when results span multiple pages?

- [x] (A) Yes — carry all active filter values (lastName, telephone, city) in pagination links
- [ ] (B) No — telephone/city search always shows only the first page of results; pagination filter preservation is last-name only
- [ ] (C) Other (describe)

## 7. i18n / Internationalization

The app has 8 locale files (en, de, es, fa, ko, pt, ru, tr). What is the expectation for new message keys (e.g., placeholder text, field labels, validation messages)?

- [x] (A) Add new keys to all 8 locale files (same pattern as the `duplicate.owner` key from spec 08)
- [ ] (B) Add new keys only to the default `messages.properties` file; other locales can be left blank or inherit
- [ ] (C) Other (describe)

## 8. Screenshot Proof Artifact

The request mentions a screenshot of the "updated Find Owners form." What state should the screenshot capture?

- [ ] (A) The empty Find Owners form showing the three input fields (lastName, telephone, city)
- [ ] (B) The form with fields filled in, showing a list of matching results below
- [x] (C) Both — one screenshot of the empty form, one of results
- [ ] (D) Other (describe)
