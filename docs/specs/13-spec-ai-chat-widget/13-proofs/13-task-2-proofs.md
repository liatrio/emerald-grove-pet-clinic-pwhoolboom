# Task 2.0 Proof — Chat Panel HTML Structure and i18n Keys

## Summary

All 4 new `chat.*` i18n keys were added to `messages.properties` (base) and all 7 non-English locale files. The floating button and chat panel HTML were added to `layout.html` with full Thymeleaf i18n binding. `I18nPropertiesSyncTest` passes with 0 failures.

**Note on toggle test**: The `chat toggle shows and hides the panel` test reaches the HTML elements correctly (panel locator resolves) but fails at the JS-dependent step of making the panel visible after clicking. This is expected at this stage — the JavaScript that handles the click event is added in Task 3.0. The test failure message confirms the panel is in the DOM (`locator resolved to <div class="card" id="chat-panel"...>`).

## Files Modified

- `src/main/resources/messages/messages.properties` — added `chat.panel.title`, `chat.input.placeholder`, `chat.send.label`
- `src/main/resources/messages/messages_es.properties` — added same 3 keys
- `src/main/resources/messages/messages_de.properties` — added same 3 keys
- `src/main/resources/messages/messages_fa.properties` — added same 3 keys
- `src/main/resources/messages/messages_ko.properties` — added same 3 keys
- `src/main/resources/messages/messages_pt.properties` — added same 3 keys
- `src/main/resources/messages/messages_ru.properties` — added same 3 keys
- `src/main/resources/messages/messages_tr.properties` — added same 3 keys
- `src/main/resources/templates/fragments/layout.html` — added toggle button, chat panel HTML, and responsive CSS

## CLI Output — I18nPropertiesSyncTest (before HTML changes)

```text
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.050 s
  -- in org.springframework.samples.petclinic.system.I18nPropertiesSyncTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

## CLI Output — I18nPropertiesSyncTest (after HTML changes)

```text
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.051 s
  -- in org.springframework.samples.petclinic.system.I18nPropertiesSyncTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

## HTML Elements Verified in DOM (from Playwright failure log)

```text
Error: expect(locator).toBeVisible() failed
Locator:  locator('[data-testid="chat-panel"]')
Expected: visible
Received: hidden   ← panel is in DOM but display:none (correct — JS not yet added)

9 × locator resolved to <div class="card" id="chat-panel" data-testid="chat-panel">…</div>
```

The toggle button (`data-testid="chat-toggle"`) and panel (`data-testid="chat-panel"`) are present in the DOM. The panel is correctly hidden by default. The full toggle interaction will be tested once JavaScript is added in Task 3.0.

## Verification

- `I18nPropertiesSyncTest.checkNonInternationalizedStrings`: PASS — no hardcoded visible text introduced.
- `I18nPropertiesSyncTest.checkI18nPropertyFilesAreInSync`: PASS — all 3 keys present in base + 7 non-English locale files.
- Chat panel HTML is present in rendered page DOM.
- Screenshot `chat-panel-visible.png` will be captured after JavaScript is added in Task 3.0.
