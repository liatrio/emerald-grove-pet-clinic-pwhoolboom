# 07 Questions Round 1 - Preserve Filter Parameters in Pagination

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

## 1. Active Filter Display in UI

When a user is viewing a filtered owner list (e.g., searching for "Franklin"), the "UI should continue to reflect the active filter." What does this mean for the search input field?

- [ ] (A) The last-name search input field on the Owner list page should be pre-populated with the active filter value (e.g., "Franklin" appears in the input box while paginating)
- [ ] (B) No change to the search input — the filter is only preserved in the pagination link URLs (the input field is only on the separate Find Owners page)
- [x] (C) Display a visible "Active filter: Franklin" badge/label near the pagination controls on the list page
- [ ] (D) Other (describe)

## 2. Empty / No Filter Behavior

When there is no active filter (i.e., the user browsed to all owners without typing a last name), should the pagination links include `lastName` in the URL?

- [x] (A) Omit `lastName` entirely — pagination links should be clean: `/owners?page=2` (not `/owners?page=2&lastName=`)
- [ ] (B) Include `lastName` as an empty string — always keep the parameter consistent: `/owners?page=2&lastName=`
- [ ] (C) Other (describe)

## 3. Vet List Scope

The Vet list (`/vets.html`) currently has no search/filter — all vets are always shown. Is the vet list in scope for this feature?

- [x] (A) Out of scope — only the Owner list needs filter-preservation (vets have no filter today)
- [ ] (B) In scope — add a vet name filter to the Vet list as part of this feature, then preserve it in pagination
- [ ] (C) Other (describe)

## 4. Screenshot Proof Artifact

The prompt requests "a screenshot of the pagination URLs that include query parameters." What should the screenshot capture?

- [ ] (A) A browser screenshot showing the pagination controls with the URL visible in the browser's address bar (showing the current page URL with `?lastName=...&page=N`)
- [ ] (B) A browser screenshot showing the pagination links in the page with the link `href` attributes visible (e.g., via browser DevTools or hovered link preview in the status bar)
- [] (C) Both: one screenshot of the address bar URL and one of the pagination link hrefs
- [ ] (D) Other (describe)
