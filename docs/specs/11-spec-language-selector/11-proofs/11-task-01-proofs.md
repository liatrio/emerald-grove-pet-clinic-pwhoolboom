# Spec 11 — Task 1.0 Proof Artifacts

## Task: i18n — Add Language Selector Message Keys to All Locale Files

---

## New Keys Added

Three new keys added to `messages.properties` (base) and all 7 locale override files (de, es, fa, ko, pt, ru, tr). `messages_en.properties` is intentionally excluded (it falls back to the base file per `I18nPropertiesSyncTest` design).

```text
lang.en=EN
lang.es=ES
lang.de=DE
```

---

## Key Presence Verification

```bash
grep "lang\." src/main/resources/messages/messages.properties
```

```text
lang.en=EN
lang.es=ES
lang.de=DE
```

```bash
grep "lang\." src/main/resources/messages/messages_de.properties
```

```text
lang.en=EN
lang.es=ES
lang.de=DE
```

(Confirmed in es, fa, ko, pt, ru, tr via I18nPropertiesSyncTest passage)

---

## CLI Output — I18nPropertiesSyncTest

```bash
./mvnw test -Dtest=I18nPropertiesSyncTest -q
```

```text
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0  -- I18nPropertiesSyncTest
BUILD SUCCESS
```

Both `checkNonInternationalizedStrings` and `checkI18nPropertyFilesAreInSync` pass,
confirming all 3 new keys are present in all 9 locale files and the base file is in sync
with every locale override.
