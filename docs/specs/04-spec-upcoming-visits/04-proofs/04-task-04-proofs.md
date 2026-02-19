# Task 4.0 Proof — Seed Data Update and Playwright E2E Tests

## Command

```shell
source ~/.nvm/nvm.sh && nvm use 20.18.2
cd e2e-tests && npm test -- --grep "Upcoming Visits"
```

## Output

```text
Now using node v20.18.2 (npm v10.8.2)

Running 2 tests using 2 workers

  2 passed (3.2s)
```

## Tests Passed

- `Upcoming Visits > navigates to page via nav link and shows heading` — PASS
- `Upcoming Visits > displays at least one visit row from seed data` — PASS

## Seed Data Change

Two visit dates in `src/main/resources/db/h2/data.sql` updated from hard-coded 2013 dates
to H2-relative expressions so they reliably fall within the default 7-day window:

```sql
-- Before
INSERT INTO visits VALUES (default, 7, '2013-01-01', 'rabies shot');
INSERT INTO visits VALUES (default, 8, '2013-01-02', 'rabies shot');

-- After
INSERT INTO visits VALUES (default, 7, DATEADD('DAY', 1, CURRENT_DATE), 'rabies shot');
INSERT INTO visits VALUES (default, 8, DATEADD('DAY', 3, CURRENT_DATE), 'rabies shot');
```

Pet 7 = Samantha, Pet 8 = Max — both owned by Jean Coleman (owner_id=6).

## Screenshot

Screenshot saved: `04-proofs/upcoming-visits-screenshot.png`

The screenshot shows the `/visits/upcoming` page with:

- "Upcoming Visits" nav item highlighted as active
- Visits table with Owner (linked), Pet (linked), Date, and Description columns
- At least one visit row from seed data (Jean Coleman / Samantha / today+1 / "rabies shot")

## Verification

| Check | Result |
|---|---|
| 2 E2E tests pass in Chromium | PASS |
| Nav link navigates to `/visits/upcoming` | PASS |
| Page heading "Upcoming Visits" visible | PASS |
| At least 1 data row rendered from seed data | PASS |
| First row has owner link, pet link, date, description | PASS |
| Seed data uses `DATEADD` for reliable relative dates | PASS |
| Screenshot captured as proof | PASS |
