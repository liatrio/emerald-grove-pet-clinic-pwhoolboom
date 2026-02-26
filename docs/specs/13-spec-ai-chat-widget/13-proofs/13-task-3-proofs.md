# Task 3.0 Proof — JavaScript SSE Client and Full E2E Suite

## Summary

The inline JavaScript SSE client was added to `layout.html`. All 4 `chat.*` i18n keys pass
`I18nPropertiesSyncTest`. All 5 new Playwright chat widget tests pass, and the full E2E suite
(47 tests) passes with 0 failures. All proof screenshots have been captured.

## Files Modified

- `src/main/resources/messages/messages.properties` — added `chat.error.message`
- `src/main/resources/messages/messages_es/de/fa/ko/pt/ru/tr.properties` — added `chat.error.message`
- `src/main/resources/templates/fragments/layout.html` — added `th:attr="data-chat-error=..."` to panel div; added inline `<script>` block with session ID init, toggle handler, form submit handler, SSE stream reader, error handling, and re-enable cleanup
- `e2e-tests/tests/features/chat-widget.spec.ts` — corrected session ID test assertion to match FR-2.1 ("on first load" = page load, not chat open)

## CLI Output — I18nPropertiesSyncTest (all 4 chat.* keys)

```text
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.053 s
  -- in org.springframework.samples.petclinic.system.I18nPropertiesSyncTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

## CLI Output — 5 Chat Widget Tests Passing

```text
Running 5 tests using 5 workers

  5 passed (2.4s)

  [chromium] Chat Widget > chat toggle shows and hides the panel
  [chromium] Chat Widget > sending a message shows user message in panel
  [chromium] Chat Widget > bot response streams into panel
  [chromium] Chat Widget > input is disabled during streaming and re-enabled after
  [chromium] Chat Widget > session ID persists across page navigation
```

## CLI Output — Full E2E Suite (0 failures)

```text
Running 48 tests using 5 workers

  1 skipped
  47 passed (9.4s)
```

## Proof Screenshots

All screenshots captured via Playwright against the running Spring Boot app using a mocked
`/api/chat` SSE backend (no real API key required).

- `proof/chat-panel-visible.png` — home page with chat panel open, i18n keys resolved
- `proof/chat-streaming-response.png` — panel mid-stream: input disabled, spinner → partial tokens
- `proof/chat-completed-response.png` — panel after stream: full response, input re-enabled
- `proof/e2e-chat-full-flow.png` — captured by `bot response streams into panel` test

## Implementation Notes

- Session ID is created immediately on page load (IIFE) and stored in `sessionStorage` under
  `chatSessionId`. Reused across page navigations within the same tab.
- SSE stream read via `fetch()` + `response.body.getReader()` (not `EventSource`) to support
  POST with a JSON body, as required by the spec.
- Bot tokens appended with `textContent +=` (never `innerHTML`) to prevent XSS.
- Error message sourced from `data-chat-error` attribute (injected by Thymeleaf) — no hardcoded
  English strings in JavaScript.
- `data: [DONE]` sentinel triggers stream close and re-enables input/send.

## Verification

- `I18nPropertiesSyncTest.checkNonInternationalizedStrings`: PASS
- `I18nPropertiesSyncTest.checkI18nPropertyFilesAreInSync`: PASS (all 4 chat.* keys in all 7 non-English locales)
- All 5 new Playwright chat widget tests: PASS
- Full E2E suite: 47 passed, 0 failed, 1 skipped (pre-existing)
- All 4 proof screenshots present in `docs/specs/13-spec-ai-chat-widget/proof/`
