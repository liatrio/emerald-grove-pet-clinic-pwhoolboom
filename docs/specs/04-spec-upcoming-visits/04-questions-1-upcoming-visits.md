# 04 Questions Round 1 - Upcoming Visits

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

## 1. Sort Order

How should the upcoming visits be ordered on the page?

- [x] (A) Date ascending (earliest visit first) — most useful for planning
- [ ] (B) Date ascending, then owner last name alphabetically as a tiebreaker
- [ ] (C) Other (describe)

## 2. Empty State

What should the page show when no visits fall within the requested window?

- [x] (A) A simple message such as "No upcoming visits in the next N days" — clean and clear
- [ ] (B) The table with headers but no rows, with no extra message
- [ ] (C) Other (describe)

## 3. Navigation Menu

Should a link to `/visits/upcoming` appear in the top navigation bar?

- [x] (A) Yes — add a nav item (e.g. "Upcoming Visits") alongside Find Owners, Vets, etc.
- [ ] (B) No — the page is accessible by URL only, no nav link needed
- [ ] (C) Other (describe)

## 4. Owner / Pet Links

Should the owner name and/or pet name displayed in the table be clickable links to their detail pages?

- [x] (A) Yes — owner name links to `/owners/{id}` and pet name links to the same owner detail page
- [ ] (B) No — display as plain text only; this is a read-only summary view
- [ ] (C) Other (describe)

## 5. Days Parameter Bounds

Should the `days` query parameter be validated or capped?

- [x] (A) Validate: reject values ≤ 0 or > 365 with a user-visible error message on the page
- [ ] (B) Silently clamp: values ≤ 0 default to 7; values > 365 cap at 365
- [ ] (C) No validation — accept any positive integer the caller provides
- [ ] (D) Other (describe)

## 6. Proof Artifacts

What should the Playwright E2E test verify?

- [x] (A) Navigate to `/visits/upcoming`, assert the page loads (HTTP 200) and the table/heading is visible
- [x] (B) Also seed or rely on existing data to assert at least one visit row appears with correct owner, pet, date, and description
- [ ] (C) Other (describe)
