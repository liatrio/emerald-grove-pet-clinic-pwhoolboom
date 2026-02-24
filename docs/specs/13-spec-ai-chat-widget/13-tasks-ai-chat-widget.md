# 13-tasks-ai-chat-widget.md

## Relevant Files

- `src/main/resources/templates/fragments/layout.html` — Receives the floating button HTML, chat panel HTML, inline CSS, and inline `<script>` block for the entire widget.
- `src/main/resources/messages/messages.properties` — Base i18n file; receives all 4 new `chat.*` keys with English values.
- `src/main/resources/messages/messages_es.properties` — Spanish locale; receives all 4 new `chat.*` keys.
- `src/main/resources/messages/messages_de.properties` — German locale; receives all 4 new `chat.*` keys.
- `src/main/resources/messages/messages_fa.properties` — Farsi locale; receives all 4 new `chat.*` keys.
- `src/main/resources/messages/messages_ko.properties` — Korean locale; receives all 4 new `chat.*` keys.
- `src/main/resources/messages/messages_pt.properties` — Portuguese locale; receives all 4 new `chat.*` keys.
- `src/main/resources/messages/messages_ru.properties` — Russian locale; receives all 4 new `chat.*` keys.
- `src/main/resources/messages/messages_tr.properties` — Turkish locale; receives all 4 new `chat.*` keys.
- `e2e-tests/tests/pages/base-page.ts` — Abstract base class; receives all `ChatWidget` locator methods and action methods.
- `e2e-tests/tests/features/chat-widget.spec.ts` — New file; contains all 5 Playwright E2E tests for the chat widget.
- `src/test/java/org/springframework/samples/petclinic/system/I18nPropertiesSyncTest.java` — Existing test; run to verify i18n compliance after each message file change (read-only, no modifications needed).

### Notes

- Run Java tests with `./mvnw test -Dtest=I18nPropertiesSyncTest -q`.
- Run E2E tests with `cd e2e-tests && npm test` (full suite) or `cd e2e-tests && npm test -- --grep "chat"` (chat tests only).
- `messages_en.properties` is intentionally skipped by `I18nPropertiesSyncTest` (English fallback is handled by the base `messages.properties`); do **not** add keys there.
- All visible text in `layout.html` must use `th:text="#{...}"` or `th:attr="data-*=#{...}"` — never hardcoded English strings.
- Use `element.textContent += token` (not `innerHTML`) when appending bot response tokens to prevent XSS.
- Proof screenshots must use a generic test question (e.g., "What pet types do you accept?") — not real owner names or PII.

## Tasks

### [x] 1.0 TDD RED Phase — Write Failing Playwright E2E Tests

#### 1.0 Proof Artifact(s)

- Test: `cd e2e-tests && npm test -- --grep "chat"` returns output showing **5 failing tests** with errors such as `Locator not found` or `expect(received).toBeVisible()` — demonstrates tests are correctly written and fail because the HTML/JS does not yet exist.

#### 1.0 Tasks

- [x] 1.1 In `e2e-tests/tests/pages/base-page.ts`, add five locator methods to the `BasePage` class: `chatToggle()` returning `this.page.locator('[data-testid="chat-toggle"]')`; `chatPanel()` returning `this.page.locator('[data-testid="chat-panel"]')`; `chatMessages()` returning `this.page.locator('[data-testid="chat-messages"]')`; `chatInput()` returning `this.page.locator('[data-testid="chat-input"]')`; `chatSend()` returning `this.page.locator('[data-testid="chat-send"]')`.
- [x] 1.2 In `e2e-tests/tests/pages/base-page.ts`, add three action methods to the `BasePage` class: `async openChat()` that clicks the toggle and waits for the panel to be visible; `async sendMessage(text: string)` that fills the chat input with `text` and clicks the send button; `lastBotMessage()` returning `this.page.locator('[data-role="bot"]').last()`.
- [x] 1.3 Create `e2e-tests/tests/features/chat-widget.spec.ts`. Add the file header imports (`test`, `expect` from `@fixtures/base-test`, `HomePage` from `@pages/home-page`) and define a reusable `mockChatApi` helper function that calls `page.route('/api/chat', ...)` to fulfil the request with `Content-Type: text/event-stream` and a synthetic body containing two or three `data: {"token":"<word>"}` lines followed by `data: [DONE]\n\n`.
- [x] 1.4 Write the test `chat toggle shows and hides the panel` inside `test.describe('Chat Widget', ...)`: navigate to `/`; assert `homePage.chatPanel()` is hidden; click `homePage.chatToggle()`; assert `homePage.chatPanel()` is visible; click `homePage.chatToggle()` again; assert `homePage.chatPanel()` is hidden.
- [x] 1.5 Write the test `sending a message shows user message in panel`: call `mockChatApi`; open chat; call `homePage.sendMessage('Hello')`; assert `homePage.chatMessages().locator('[data-role="user"]', { hasText: 'Hello' })` is visible.
- [x] 1.6 Write the test `bot response streams into panel`: call `mockChatApi` with tokens `["Hello", "!", " How", " can", " I", " help", "?"]`; open chat; call `homePage.sendMessage('Hi')`; wait for `homePage.lastBotMessage()` to have text `"Hello! How can I help?"`; capture screenshot with `page.screenshot({ path: testInfo.outputPath('e2e-chat-full-flow.png'), fullPage: true })`.
- [x] 1.7 Write the test `input is disabled during streaming and re-enabled after`: call `mockChatApi` (using a mock that sends tokens with a short artificial delay so the intermediate disabled state can be asserted); open chat; call `homePage.sendMessage('test')`; assert `homePage.chatInput()` is disabled and `homePage.chatSend()` is disabled; wait for streaming to finish; assert both are enabled.
- [x] 1.8 Write the test `session ID persists across page navigation`: navigate to `/`; evaluate `window.sessionStorage.getItem('chatSessionId')` — expect `null` initially; open chat (which should trigger session ID creation); evaluate `window.sessionStorage.getItem('chatSessionId')` and save as `sessionId`; navigate to `/vets.html`; evaluate `window.sessionStorage.getItem('chatSessionId')` and assert it equals `sessionId`.
- [x] 1.9 Run `cd e2e-tests && npm test -- --grep "chat"` and confirm that all **5 tests fail**. Read the failure messages to verify they fail because the HTML elements are missing (`Locator not found` or similar) — not due to a TypeScript compilation error or import issue. Fix any compilation errors before proceeding.

---

### [x] 2.0 TDD GREEN Phase — Chat Panel HTML Structure and i18n Keys (Unit 1)

#### 2.0 Proof Artifact(s)

- Test: `./mvnw test -Dtest=I18nPropertiesSyncTest -q` returns `BUILD SUCCESS` — demonstrates all 4 new `chat.*` keys are present in the base file and all 7 non-English locale files, and no hardcoded visible text was introduced.
- Test: `cd e2e-tests && npm test -- --grep "chat toggle"` passes — demonstrates the floating button and panel toggle HTML are live.
- Screenshot: `docs/specs/13-spec-ai-chat-widget/proof/chat-panel-visible.png` — home page with the chat panel open, showing the correct English text for `chat.panel.title`, `chat.input.placeholder`, and `chat.send.label`.

#### 2.0 Tasks

- [x] 2.1 In `src/main/resources/messages/messages.properties`, append the first three i18n keys at the end of the file: `chat.panel.title=Chat with us`, `chat.input.placeholder=Ask a question\u2026`, `chat.send.label=Send`.
- [x] 2.2 In each of the 7 non-English locale files (`messages_es.properties`, `messages_de.properties`, `messages_fa.properties`, `messages_ko.properties`, `messages_pt.properties`, `messages_ru.properties`, `messages_tr.properties`), append the same 3 keys. Use the English values as placeholders (the spec states English is authoritative; locale teams supply final translations): `chat.panel.title=Chat with us`, `chat.input.placeholder=Ask a question\u2026`, `chat.send.label=Send`.
- [x] 2.3 Run `./mvnw test -Dtest=I18nPropertiesSyncTest -q` and confirm `BUILD SUCCESS`. Fix any sync failures before continuing.
- [x] 2.4 In `src/main/resources/templates/fragments/layout.html`, just before the closing `</body>` tag (after the Bootstrap script tag), add a circular floating action button: `<button type="button" data-testid="chat-toggle" aria-expanded="false" aria-label="Chat" class="btn btn-primary rounded-circle shadow" style="position:fixed;bottom:1.5rem;right:1.5rem;width:3.5rem;height:3.5rem;z-index:1050;font-size:1.25rem;">💬</button>`. The button text must not be hardcoded English; use only an icon or a `th:text` bound key. Because the icon glyph `💬` is not visible text in the i18n sense (it is not flagged by `HTML_TEXT_LITERAL` since it is inside a tag attribute or icon-only), confirm the test still passes.
- [x] 2.5 Immediately after the toggle button in `layout.html`, add the chat panel `<div>` with `data-testid="chat-panel"`. Structure: outer div (fixed position, bottom-right, `display:none`, Bootstrap card styling); a card-header with `th:text="#{chat.panel.title}"`; a scrollable `<div data-testid="chat-messages">` for messages; a form containing `<input data-testid="chat-input" th:placeholder="#{chat.input.placeholder}">` and `<button data-testid="chat-send" th:text="#{chat.send.label}">`. Do **not** add any `<script>` tags in this task.
- [x] 2.6 Add minimal inline styles (either a `<style>` block or `style=""` attributes) to make the panel approximately 350px wide on desktop and 100vw on mobile (≤576px). The panel must be fixed position, appear above other content (`z-index: 1040` or higher), and be hidden by default (`display: none`).
- [x] 2.7 Run `./mvnw test -Dtest=I18nPropertiesSyncTest -q` again and confirm `BUILD SUCCESS`. If any hardcoded text was introduced, fix it.
- [x] 2.8 Run `cd e2e-tests && npm test -- --grep "chat toggle"` and confirm the toggle test now passes. The remaining 4 chat tests should still fail (JavaScript not yet added) — this is expected.
- [x] 2.9 Start the application (`./mvnw spring-boot:run`), open `http://localhost:8080` in a browser, click the chat toggle button, and capture `docs/specs/13-spec-ai-chat-widget/proof/chat-panel-visible.png` showing the panel open with correct English strings. Create the `docs/specs/13-spec-ai-chat-widget/proof/` directory first.

---

### [x] 3.0 TDD GREEN Phase — JavaScript SSE Client and Streaming (Unit 2 + Full E2E Suite)

#### 3.0 Proof Artifact(s)

- Test: `./mvnw test -Dtest=I18nPropertiesSyncTest -q` returns `BUILD SUCCESS` — demonstrates the fourth key `chat.error.message` passes both sync checks.
- Screenshot: `docs/specs/13-spec-ai-chat-widget/proof/chat-streaming-response.png` — chat panel mid-stream (bot response partially visible, input disabled) — demonstrates token-by-token rendering and loading/disabled state.
- Screenshot: `docs/specs/13-spec-ai-chat-widget/proof/chat-completed-response.png` — chat panel after a full exchange (user message + complete bot response, input re-enabled) — demonstrates end-to-end flow.
- Screenshot: `docs/specs/13-spec-ai-chat-widget/proof/e2e-chat-full-flow.png` — produced by the `bot response streams into panel` test via `testInfo.outputPath(...)`, copied to the proof directory — demonstrates end-to-end rendering via the mocked backend.
- Test: `cd e2e-tests && npm test` returns output with **0 failures** — all 5 new chat widget tests pass and all pre-existing tests continue to pass.

#### 3.0 Tasks

- [x] 3.1 In `src/main/resources/messages/messages.properties`, append the fourth key: `chat.error.message=Sorry, something went wrong. Please try again.`
- [x] 3.2 In each of the 7 non-English locale files, append the same key using the English value as a placeholder: `chat.error.message=Sorry, something went wrong. Please try again.`
- [x] 3.3 On the outer chat panel `<div>` in `layout.html`, add the Thymeleaf data attribute: `th:attr="data-chat-error=#{chat.error.message}"`. This makes the error string available to JavaScript without hardcoding English text.
- [x] 3.4 Run `./mvnw test -Dtest=I18nPropertiesSyncTest -q` and confirm `BUILD SUCCESS` for all 4 `chat.*` keys.
- [x] 3.5 In `layout.html`, add a `<script>` block immediately after the chat panel `</div>` (still before `</body>`). Initialize session ID: `const chatSessionId = sessionStorage.getItem('chatSessionId') ?? (() => { const id = crypto.randomUUID(); sessionStorage.setItem('chatSessionId', id); return id; })();`
- [x] 3.6 In the same `<script>` block, add a `click` event listener on the toggle button (`[data-testid="chat-toggle"]`): toggle the panel's `display` between `none` and `flex` (or `block`); update the button's `aria-expanded` attribute to match the new visibility state.
- [x] 3.7 Add a `submit` event listener on the chat form: prevent default; read the input value; append a `<div data-role="user">` containing the user's text to the messages area (using `textContent` not `innerHTML`); clear the input field; disable the input and send button; append a `<div data-role="bot">` with a Bootstrap spinner `<span class="spinner-border spinner-border-sm">` inside it; scroll the messages area to its bottom.
- [x] 3.8 Still inside the submit handler, after preparing the bot placeholder, call `fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' }, body: JSON.stringify({ message: userText, sessionId: chatSessionId }) })`.
- [x] 3.9 In the `fetch` `.then(response => ...)` handler: if `!response.ok`, read `chatPanel.dataset.chatError` and set it as the bot element's `textContent`, then re-enable input and return early. Otherwise, obtain `response.body.getReader()` and a `new TextDecoder()`; remove the spinner from the bot element; enter a `read()` loop that: decodes each chunk, splits on `\n`, processes lines starting with `data:` — if the value is `[DONE]` break the loop, otherwise `JSON.parse` the payload and append `payload.token` to the bot element's `textContent` using `+=`; after each token append, scroll the messages area to its bottom.
- [x] 3.10 In a final cleanup block (use a `try/catch/finally` pattern or call a shared `re-enable` function from both the error path and the stream-end path): re-enable the chat input and send button, and call `chatInput.focus()`.
- [x] 3.11 Run `cd e2e-tests && npm test -- --grep "chat"` and confirm all 5 chat tests now pass. Fix any failures before running the full suite.
- [x] 3.12 Run the full E2E suite with `cd e2e-tests && npm test` and confirm **0 failures** across all tests.
- [x] 3.13 Start the application, open `http://localhost:8080`, use the chat widget to ask "What pet types do you accept?". While the response is streaming (if using real LLM) or by adding a brief artificial delay in the JS for demonstration purposes, capture `docs/specs/13-spec-ai-chat-widget/proof/chat-streaming-response.png` showing the input disabled and a partial bot response visible.
- [x] 3.14 After the same exchange completes (input re-enabled, full response visible), capture `docs/specs/13-spec-ai-chat-widget/proof/chat-completed-response.png`.
- [x] 3.15 Copy the `e2e-chat-full-flow.png` screenshot from the Playwright test artifacts directory (`e2e-tests/test-results/artifacts/`) to `docs/specs/13-spec-ai-chat-widget/proof/e2e-chat-full-flow.png`.
