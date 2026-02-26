# 13-spec-ai-chat-widget.md

## Introduction/Overview

Spec 12 delivers a working `POST /api/chat` SSE endpoint. This spec adds the user-facing chat panel that consumes it: a floating button and slide-in chat panel embedded in `layout.html`, a vanilla-JavaScript SSE client that streams tokens into the panel in real time, and Playwright E2E tests that verify the full browser experience. No new JavaScript build tools or files outside `layout.html` are introduced.

## Goals

- Provide a persistent, accessible chat interface on every page of the application via the shared `layout.html` template.
- Stream LLM tokens into the chat panel progressively so users see the response building word-by-word.
- Maintain the user's conversation session across page navigations using `sessionStorage`.
- Disable input during streaming and show a visual loading state so users understand the bot is working.
- Cover the feature with Playwright E2E tests that verify UI behaviour using a mocked backend, ensuring tests never require a live API key.

## User Stories

**As a clinic visitor**, I want a chat button available on every page so that I can ask questions without navigating away from what I am doing.

**As a clinic visitor**, I want to see the bot's response appear word-by-word so that the interface feels responsive even for longer answers.

**As a clinic visitor**, I want my conversation to continue where I left off when I navigate between pages so that I do not have to repeat context.

---

## Demoable Units of Work

### Unit 1 — Chat Panel HTML and Toggle

**Purpose:** Add the static HTML structure for the floating button and chat panel to `layout.html` and verify it renders correctly on every page, before any JavaScript is written (TDD RED phase: E2E test written first asserting the button is visible, which fails until the HTML is added).

**Functional Requirements:**

- FR-1.1 A circular floating action button with `data-testid="chat-toggle"` shall be added to the bottom of the `<body>` section of `layout.html`. It shall use Bootstrap 5 utility classes and appear fixed in the bottom-right corner of the viewport on all screen sizes.
- FR-1.2 A chat panel element with `data-testid="chat-panel"` shall be added to `layout.html`. It shall contain: a header with the text bound to a new i18n key `chat.panel.title` (e.g., "Chat with us"), a scrollable message display area with `data-testid="chat-messages"`, a text input with `data-testid="chat-input"` and placeholder bound to `chat.input.placeholder`, and a submit button with `data-testid="chat-send"` and label bound to `chat.send.label`.
- FR-1.3 The chat panel shall be hidden by default (`display: none` or equivalent) and shown only after the toggle button is clicked.
- FR-1.4 Three new i18n message keys shall be added to `messages.properties` (base) and all 8 locale override files: `chat.panel.title`, `chat.input.placeholder`, and `chat.send.label`. English values: "Chat with us", "Ask a question…", "Send".
- FR-1.5 `I18nPropertiesSyncTest` (both `checkNonInternationalizedStrings` and `checkI18nPropertyFilesAreInSync`) shall pass after the template and message file changes, confirming no hardcoded visible text was introduced.
- FR-1.6 The chat panel HTML shall not include any `<script>` tags in this unit; JavaScript is added in Unit 2.

**Proof Artifacts:**

- Test: `I18nPropertiesSyncTest` — `./mvnw test -Dtest=I18nPropertiesSyncTest -q` returns `BUILD SUCCESS` demonstrates no hardcoded visible text and all locale files are in sync.
- Screenshot: `chat-panel-visible.png` — Home page with the chat panel open demonstrates the widget renders correctly and the i18n keys resolve to the correct English strings.

---

### Unit 2 — JavaScript SSE Client and Streaming

**Purpose:** Add the inline `<script>` block to `layout.html` that handles the toggle interaction, session ID management, message submission, SSE streaming, loading states, and input disabling. At the end of this unit the chatbot is fully functional in the browser.

**Functional Requirements:**

- FR-2.1 The JavaScript shall generate a `sessionId` UUID via `crypto.randomUUID()` on first load and store it in `sessionStorage` under the key `chatSessionId`. On subsequent page loads the existing value shall be reused, so conversation memory persists across navigation.
- FR-2.2 Clicking the toggle button (`data-testid="chat-toggle"`) shall show the panel if it is hidden and hide it if it is visible. The toggle button's `aria-expanded` attribute shall be updated to match the panel's visibility state.
- FR-2.3 Submitting the chat form shall: (a) append the user's message as a new element with `data-role="user"` inside the messages area, (b) clear the input field, (c) disable the input and send button, (d) append a new empty element with `data-role="bot"` and a loading indicator.
- FR-2.4 The form submission shall send `POST /api/chat` with `Content-Type: application/json`, `Accept: text/event-stream`, and body `{"message": "<text>", "sessionId": "<uuid>"}`.
- FR-2.5 The JavaScript shall read the response body as a `ReadableStream`. For each `data:` line, it shall parse the JSON payload and append the `token` value to the current bot message element. When `data: [DONE]` is received, the stream shall be closed.
- FR-2.6 After the stream ends (or on any network error), the input and send button shall be re-enabled and focus returned to the input field.
- FR-2.7 On network error or a non-200 HTTP response, an error message bound to a new i18n key `chat.error.message` (English: "Sorry, something went wrong. Please try again.") shall be displayed in the bot message element.
- FR-2.8 The `chat.error.message` key shall be rendered into a `data-chat-error` attribute on the panel container by Thymeleaf (e.g., `th:data-chat-error="#{chat.error.message}"`) so the JavaScript can read it without hardcoding English text.
- FR-2.9 The messages area shall scroll to the bottom automatically after each new message is appended and after each token is added during streaming.
- FR-2.10 The `chat.error.message` key shall be added to `messages.properties` (base) and all 8 locale override files. `I18nPropertiesSyncTest` shall pass after this change.

**Proof Artifacts:**

- Screenshot: `chat-streaming-response.png` — Chat panel mid-stream (bot response partially visible, input disabled) demonstrates token-by-token rendering and the loading/disabled state.
- Screenshot: `chat-completed-response.png` — Chat panel after a full exchange (user message + complete bot response, input re-enabled) demonstrates the end-to-end flow.

---

### Unit 3 — Playwright E2E Tests

**Purpose:** Cover all chat widget user journeys with reliable, API-key-free E2E tests using Playwright's route interception to mock the `POST /api/chat` backend.

**Functional Requirements:**

- FR-3.1 A new `chat-widget.spec.ts` file shall be created under `e2e-tests/tests/features/` following the `test.describe` / page-object pattern used by other spec files.
- FR-3.2 A `ChatWidget` helper class or set of methods shall be added to `BasePage` (in `e2e-tests/tests/pages/base-page.ts`) exposing: `chatToggle()` locator, `chatPanel()` locator, `chatInput()` locator, `chatSend()` locator, `chatMessages()` locator, `openChat()` action, `sendMessage(text)` action, and `lastBotMessage()` locator.
- FR-3.3 Before each test that exercises the SSE endpoint, Playwright route interception (`page.route('/api/chat', ...)`) shall mock the backend to return a valid `text/event-stream` response with two or three token events followed by `data: [DONE]`, without requiring the Spring application to call a real LLM.
- FR-3.4 Test: `chat toggle shows and hides the panel` — assert the panel is hidden by default; click toggle; assert panel is visible; click toggle again; assert panel is hidden.
- FR-3.5 Test: `sending a message shows user message in panel` — open chat, send "Hello", assert a `[data-role="user"]` element with text "Hello" is visible in the panel.
- FR-3.6 Test: `bot response streams into panel` — mock `/api/chat` to return tokens `["Hello", "!", " How", " can", " I", " help", "?"]`; open chat, send a message; assert the bot message element contains the assembled text `"Hello! How can I help?"`.
- FR-3.7 Test: `input is disabled during streaming and re-enabled after` — mock a slow stream; after submission assert the input and send button are disabled; after `[DONE]` assert they are re-enabled.
- FR-3.8 Test: `session ID persists across page navigation` — open chat on home page, capture `sessionStorage.chatSessionId`; navigate to `/vets.html`; assert `sessionStorage.chatSessionId` is unchanged.
- FR-3.9 The full E2E suite (`cd e2e-tests && npm test`) shall pass with 0 failures including all pre-existing tests.

**Proof Artifacts:**

- Test: `chat-widget.spec.ts` — `cd e2e-tests && npm test` passes all 5 new chat widget tests and all pre-existing tests with 0 failures demonstrates complete widget behaviour.
- Screenshot: `e2e-chat-full-flow.png` — Captured by the `bot response streams into panel` test showing the assembled response in the panel demonstrates end-to-end rendering via the mocked backend.

---

## Non-Goals (Out of Scope)

1. **Backend Chat API**: all Java classes (`ChatController`, `ChatService`, `ChatTools`, etc.) are specified in Spec 12.
2. **Persistent conversation history across browser sessions**: `sessionStorage` is cleared when the tab is closed; this is intentional.
3. **Mobile-specific gestures or native app integration**: the widget uses standard Bootstrap 5 responsive layout and works in any modern browser.
4. **Markdown rendering in chat messages**: bot responses are inserted as plain text; Markdown syntax in responses will appear as raw characters. Rendering Markdown is a future enhancement.
5. **Accessibility beyond `aria-expanded`**: comprehensive ARIA roles and screen-reader testing are future work; the `aria-expanded` attribute on the toggle is the minimum required for this spec.
6. **Chat widget translations beyond the four new keys**: full translation of `chat.panel.title`, `chat.input.placeholder`, `chat.send.label`, and `chat.error.message` into all 8 locale override files is required, but the English values are the authoritative source — locale-specific teams supply the actual translations.

---

## Design Considerations

The chat widget uses Bootstrap 5 components and utility classes already loaded by `layout.html`. No new CSS files are added. Key layout decisions:

- **Floating button**: fixed position, bottom-right corner, circular, uses Bootstrap `btn-primary` colour to match the existing CTA style.
- **Chat panel**: a fixed-position container overlaying the page content (not an offcanvas, to avoid requiring a Bootstrap JS import beyond the existing bundle). Width approximately 350px on desktop; 100vw on mobile (≤ 576px breakpoint).
- **Message bubbles**: user messages right-aligned with a light background; bot messages left-aligned with a white background and subtle border. Both use Bootstrap card or alert classes.
- **Loading indicator**: a Bootstrap spinner (`<span class="spinner-border spinner-border-sm">`) displayed inside the bot message element while awaiting the first token.
- All visible text uses `th:text="#{...}"` or `th:attr="data-*=#{...}"` — no hardcoded English strings in the template.

---

## Repository Standards

- **Strict TDD**: a failing E2E test (`chat toggle shows and hides the panel`) must be written and confirmed failing before the HTML is added to `layout.html`.
- **No new files outside `layout.html`**: all HTML, inline CSS overrides, and the `<script>` block live in the existing template. No new `.js` or `.css` files are created.
- **i18n compliance**: all visible text uses `th:text="#{...}"` or Thymeleaf attribute binding; `I18nPropertiesSyncTest` enforces this.
- **Playwright page-object model**: new helper methods belong in `BasePage`; tests belong in `e2e-tests/tests/features/`.
- **Conventional commits**: `feat:` for HTML/JS additions, `test:` for Playwright-only commits, `fix:` for corrections.
- **Markdownlint**: all fenced code blocks in proof markdown files must include a language specifier.
- **Pre-commit hooks**: Maven compile check and whitespace trim run on every commit.

---

## Technical Considerations

- **Spec 12 prerequisite**: the `POST /api/chat` endpoint (Spec 12) must be merged before this spec begins development. The Playwright tests mock the endpoint, so local development can proceed with a stub, but a real integration requires the Spec 12 backend.
- **`text/event-stream` reading**: the JavaScript uses `response.body.getReader()` and a `TextDecoder` to process the stream. `EventSource` is **not** used because `EventSource` only supports GET requests; the SSE stream is initiated via `fetch()` with a POST body.
- **`data: [DONE]` sentinel**: the JavaScript shall treat any line that is exactly `data: [DONE]` as the end-of-stream signal. All other `data:` lines are parsed as JSON.
- **Route interception in Playwright**: `page.route('/api/chat', async route => { ... })` intercepts the request and fulfils it with a synthetic SSE body. The mock response must set `Content-Type: text/event-stream` and `Transfer-Encoding: chunked`.
- **`crypto.randomUUID()`** is available in all modern browsers and is present in the jsdom environment used by Playwright. No polyfill is needed.
- **Spring `th:data-*` attribute binding**: Thymeleaf supports `th:attr="data-chat-error=#{chat.error.message}"` or the equivalent `th:data-chat-error="#{chat.error.message}"` to inject i18n values into data attributes for JavaScript consumption.

---

## Security Considerations

- **No API keys in the frontend**: the `sessionId` is a random UUID with no authentication value; the `/api/chat` endpoint is intentionally unauthenticated.
- **XSS**: bot response tokens must be inserted using `element.textContent += token` (not `innerHTML`) to prevent script injection from a malicious or misconfigured LLM response.
- **Proof artifact security**: screenshots must not capture real owner names, visit descriptions, or other PII from the sample dataset. Use generic test questions ("What pet types do you accept?") in all proof screenshots.

---

## Success Metrics

1. **`I18nPropertiesSyncTest` green**: all four new `chat.*` keys pass both sync tests — 0 failures.
2. **Full E2E suite green**: all 5 new chat widget tests pass with 0 failures; all pre-existing E2E tests continue to pass.
3. **Widget visible on all pages**: the chat toggle button is present in the DOM on the home page, the vet list page, and the find owners page.
4. **Streaming renders correctly**: the `bot response streams into panel` Playwright test confirms tokens are assembled in order and the completed text matches the mocked response.

---

## Open Questions

No open questions at this time.
