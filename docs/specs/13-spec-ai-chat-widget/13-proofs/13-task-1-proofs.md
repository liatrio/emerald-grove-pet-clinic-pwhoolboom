# Task 1.0 Proof — TDD RED Phase: Failing Playwright E2E Tests

## Summary

All 5 Playwright chat widget tests were written and confirmed failing because the chat widget HTML does not yet exist in `layout.html`. The tests fail with `locator('[data-testid="chat-toggle"]') not found` (timeout) — the correct RED phase failure reason.

## Files Created / Modified

- `e2e-tests/tests/pages/base-page.ts` — Added 5 locator methods (`chatToggle`, `chatPanel`, `chatMessages`, `chatInput`, `chatSend`) and 3 action methods (`openChat`, `sendMessage`, `lastBotMessage`).
- `e2e-tests/tests/features/chat-widget.spec.ts` — New file with `mockChatApi` helper and 5 tests inside `test.describe('Chat Widget')`.

## CLI Output — 5 Tests Failing (RED Phase)

```text
> e2e-tests@1.0.0 test
> playwright test --pass-with-no-tests --grep Chat Widget

  5 failed
  [chromium] › tests/features/chat-widget.spec.ts:43:3 › Chat Widget › chat toggle shows and hides the panel
  [chromium] › tests/features/chat-widget.spec.ts:59:3 › Chat Widget › sending a message shows user message in panel
  [chromium] › tests/features/chat-widget.spec.ts:72:3 › Chat Widget › bot response streams into panel
  [chromium] › tests/features/chat-widget.spec.ts:88:3 › Chat Widget › input is disabled during streaming and re-enabled after
  [chromium] › tests/features/chat-widget.spec.ts:125:3 › Chat Widget › session ID persists across page navigation
```

## Failure Reason (Representative Sample)

```text
  5) [chromium] › tests/features/chat-widget.spec.ts:125:3 › Chat Widget › session ID persists across page navigation

    Test timeout of 30000ms exceeded.

    Error: locator.click: Test timeout of 30000ms exceeded.
    Call log:
      - waiting for locator('[data-testid="chat-toggle"]')

       at pages/base-page.ts:84

      82 |
      83 |   async openChat(): Promise<void> {
    > 84 |     await this.chatToggle().click();
         |                             ^
      85 |     await this.chatPanel().waitFor({ state: 'visible' });
```

## Verification

- Failure is caused by missing HTML (`data-testid="chat-toggle"` not present in DOM) — not a TypeScript compile error or import error.
- TypeScript compilation succeeds: no errors reported before test execution.
- All 5 tests are present and correctly target the chat widget elements.
