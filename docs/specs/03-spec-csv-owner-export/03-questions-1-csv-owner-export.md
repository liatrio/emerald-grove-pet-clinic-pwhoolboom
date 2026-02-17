# 03 Questions Round 1 - CSV Owner Export

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

## 1. CSV Columns

You mentioned keeping columns minimal. Which fields should appear in the CSV output?

- [ ] (A) `id, firstName, lastName, city, telephone` — identity + contact essentials, no address
- [ ] (B) `firstName, lastName, city, telephone` — omit internal database ID
- [x] (C) `id, firstName, lastName, address, city, telephone` — all owner scalar fields
- [ ] (D) Other (describe)

## 2. Pagination Behavior

The existing `/owners` endpoint paginates results (5 per page). Should `/owners.csv` behave the same way?

- [x] (A) Return ALL matching results (no pagination) — typical for a data export
- [ ] (B) Respect the `page` parameter exactly like the HTML endpoint — consistent behavior
- [ ] (C) Other (describe)

## 3. Empty Results Behavior

If the search finds no matching owners, what should the CSV response contain?

- [x] (A) Just the header row, with no data rows — valid empty CSV, HTTP 200
- [ ] (B) HTTP 204 No Content with no body
- [ ] (C) Other (describe)

## 4. curl Proof Artifact

What specific scenario should the curl snippet in the proof docs demonstrate?

- [ ] (A) Search by last name — e.g., `curl "…/owners.csv?lastName=Davis"` showing matching rows
- [ ] (B) Unfiltered export — e.g., `curl "…/owners.csv"` showing all owners
- [x] (C) Both: one filtered and one unfiltered snippet
- [ ] (D) Other (describe)

## 5. Playwright Verification Depth

How thorough should the Playwright CSV download test be?

- [x] (A) Verify the file downloads, Content-Type is `text/csv`, and the header row is present
- [ ] (B) Also verify at least one data row exists with the correct column values for a known owner
- [ ] (C) Other (describe)
