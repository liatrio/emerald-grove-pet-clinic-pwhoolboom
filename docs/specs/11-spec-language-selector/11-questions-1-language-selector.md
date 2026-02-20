# 11 Questions Round 1 - Language Selector

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

## 1. UI Control Style

What should the language selector look like in the navbar?

- [x] (A) Bootstrap dropdown button — a button labeled with the current language code (e.g., "EN ▾") that opens a dropdown list of options; matches the Bootstrap 5 pattern already used in the app
- [ ] (B) Inline button group — three small buttons side-by-side ("EN" | "ES" | "DE"); always visible, no dropdown; simple and scannable
- [ ] (C) Plain text links — minimal, space-efficient links separated by "|" (e.g., "EN | ES | DE")
- [ ] (D) Other (describe)

## 2. Language Label Format

How should each language option be labeled in the selector?

- [x] (A) Short codes only — "EN", "ES", "DE"; compact and language-agnostic
- [ ] (B) Native names — "English", "Español", "Deutsch"; more descriptive and user-friendly
- [ ] (C) Short code + native name — "EN – English", "ES – Español", "DE – Deutsch"; most informative
- [ ] (D) Other (describe)

## 3. Active / Selected Language Highlighting

Should the currently active language be visually distinguished from the other options?

- [x] (A) Yes — highlight the active language (e.g., bold text, different button state, or Bootstrap "active" class)
- [ ] (B) No — all options look the same; the page content itself is the indicator
- [ ] (C) Other (describe)

## 4. Navigation Behavior After Language Change

When a user selects a language, where should they land?

- [x] (A) Stay on the current page — navigate to the same URL with `?lang=xx` appended; most seamless experience
- [ ] (B) Go to the home page — always redirect to `/` with `?lang=xx`; simpler to implement but interrupts the user's current context
- [ ] (C) Other (describe)

## 5. Mobile / Responsive Behavior

The navbar collapses into a hamburger menu on small screens. Where should the language selector live on mobile?

- [x] (A) Inside the hamburger menu — language options appear in the collapsible nav list alongside Home, Find Owners, etc.
- [ ] (B) Always visible outside the hamburger — language selector stays in the navbar header area regardless of screen size; may need to be compact (short codes)
- [ ] (C) Other (describe)
