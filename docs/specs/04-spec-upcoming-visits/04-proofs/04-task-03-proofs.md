# Task 3.0 Proof — Template, i18n Keys, and Navigation Link

## Full Test Suite Run

```shell
./mvnw test
```

## Key Results

```text
[INFO] Tests run: 5,  Failures: 0, Errors: 0 -- UpcomingVisitsControllerTests
[INFO] Tests run: 2,  Failures: 0, Errors: 0 -- I18nPropertiesSyncTest (checkI18nPropertyFilesAreInSync passes)
[INFO] Tests run: 17, Failures: 0, Errors: 0 -- OwnerControllerTests
[INFO] Tests run: 10, Failures: 0, Errors: 0 -- ClinicServiceTests
[ERROR] Tests run: 2, Failures: 1, Errors: 0  -- I18nPropertiesSyncTest.checkNonInternationalizedStrings (PRE-EXISTING)
```

## I18nPropertiesSyncTest Detail

The single failure in `checkNonInternationalizedStrings` is the **pre-existing** issue in `notFound.html`
(hardcoded English text from spec 02, tracked separately). No new hardcoded strings were introduced
by the `upcomingVisits.html` template.

```text
Hardcoded (non-internationalized) strings found:
HTML: src/main/resources/templates/notFound.html Line 10: ...  (pre-existing)
HTML: src/main/resources/templates/notFound.html Line 12: ...  (pre-existing)
HTML: src/main/resources/templates/notFound.html Line 14: ...  (pre-existing)
```

The `checkI18nPropertyFilesAreInSync` test **passes** — all 4 new keys are present in every locale file.

## Files Created / Modified

- `src/main/resources/templates/visits/upcomingVisits.html` — full template: layout wrapper
  `fragments/layout :: layout (~{::body},'visits')`, liatrio CSS classes, i18n keys only, table
  with Owner (linked) / Pet (linked) / Date / Description columns, empty-state row, error-state div
- `src/main/resources/templates/fragments/layout.html` — added "Upcoming Visits" nav item
  (`/visits/upcoming`, active key `visits`, icon `calendar`)
- `src/main/resources/messages/messages.properties` — 4 new keys added
- `src/main/resources/messages/messages_de.properties` — 4 new keys added
- `src/main/resources/messages/messages_es.properties` — 4 new keys added
- `src/main/resources/messages/messages_fa.properties` — 4 new keys added
- `src/main/resources/messages/messages_ko.properties` — 4 new keys added
- `src/main/resources/messages/messages_pt.properties` — 4 new keys added
- `src/main/resources/messages/messages_ru.properties` — 4 new keys added
- `src/main/resources/messages/messages_tr.properties` — 4 new keys added

## New i18n Keys

```properties
upcomingVisits=Upcoming Visits
upcomingVisits.subtitle=Appointments scheduled within the next {0} days.
upcomingVisits.empty=No upcoming visits in the next {0} days.
upcomingVisits.daysError=days must be between 1 and 365.
```

## Verification

| Check | Result |
|---|---|
| No new hardcoded strings in `upcomingVisits.html` | PASS |
| `checkI18nPropertyFilesAreInSync` — all 4 keys in all locale files | PASS |
| Nav item added to `layout.html` (active key `visits`, icon `calendar`) | PASS |
| Template uses `fragments/layout` wrapper with `'visits'` active key | PASS |
| All `upcomingVisitsControllerTests` still GREEN | PASS |
| Pre-existing `notFound.html` I18n failure — not caused by this task | PRE-EXISTING |
