# 10 Questions Round 1 - Vet Specialty Filter

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

---

## 1. Filter Control Type

What kind of UI control should display the specialty filter on the Vet Directory page?

The page currently has a heading, a subtitle, and the vets table. The filter control would appear above the table.

- [x] (A) **Dropdown `<select>`** — A single-select dropdown labeled "Filter by specialty:" with options for All, each specialty, and optionally None. Simple and compact.
- [ ] (B) **Link tabs / pill buttons** — Horizontal row of clickable buttons (All | radiology | surgery | dentistry | None). Visually prominent; easy to see the active selection.
- [ ] (C) **Radio button group** — Inline radio inputs similar to option B but rendered as form radio buttons. Accessible, familiar form pattern.
- [ ] (D) Other (describe)

---

## 2. "None" as a Selectable Filter

The args say "None is handled sensibly." What should happen when a user filters by "None"?

The sample data has 2 vets with no specialties (James Carter, Sharon Jenkins).

- [x] (A) **"None" is a selectable filter option** — Clicking/selecting "None" shows only vets who have no specialties assigned. URL becomes `?specialty=none` (or similar).
- [ ] (B) **"None" is not a filter option** — The filter only lists named specialties (radiology, surgery, dentistry) plus "All." Vets with no specialties are always shown when "All" is selected; they simply disappear from view when any specific specialty is selected (expected, not a bug).
- [ ] (C) Other (describe)

---

## 3. Specialty Identifier in Query Parameter

How should the active specialty filter be represented in the URL query string? The args say filtered URLs should be shareable.

- [x] (A) **Specialty name** — `?specialty=radiology`. Human-readable and stable (specialty names don't change often). Example: `/vets.html?specialty=radiology`
- [ ] (B) **Specialty ID** — `?specialty=1`. Database-stable but opaque to the user. Example: `/vets.html?specialty=1`
- [ ] (C) Other (describe)

---

## 4. Filter + Pagination Interaction

The vet list supports pagination (currently 5 vets per page, so with 6 seeded vets there are 2 pages). How should filtering interact with pagination?

- [x] (A) **Filter resets to page 1, specialty persists across pages** — Applying a filter always navigates to page 1. Pagination links carry the `specialty` param so users can page through filtered results. Example: page 2 URL becomes `/vets.html?page=2&specialty=radiology`.
- [ ] (B) **No pagination for filtered results** — When a specialty filter is active, show all matching vets on one page (no pagination). Pagination only applies when "All" is selected. Since most specialties have ≤ 5 vets this is practical.
- [ ] (C) Other (describe)

---
