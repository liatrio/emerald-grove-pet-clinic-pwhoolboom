# Task 3.0 Proof Artifacts — Chat API Endpoint

## CLI Output

### ChatControllerTests — 4/4 Pass

```text
./mvnw test -Dtest=ChatControllerTests -q

Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 2.551 s
  -- in org.springframework.samples.petclinic.chat.ChatControllerTests

BUILD SUCCESS
```

### ChatIntegrationTests — Skipped (Docker unavailable, as expected)

```text
./mvnw test -Dtest=ChatIntegrationTests -q

Tests run: 1, Failures: 0, Errors: 0, Skipped: 1, Time elapsed: 0.002 s
  -- in org.springframework.samples.petclinic.chat.ChatIntegrationTests
  [Skipped: Docker environment not available]

BUILD SUCCESS
```

Skipped via `@Testcontainers(disabledWithoutDocker = true)` — correct graceful behaviour.

### All Chat* Tests Combined

```text
./mvnw test -Dtest="Chat*" -q

Tests run: 13, Failures: 0, Errors: 0, Skipped: 1
BUILD SUCCESS
```

## Files Created

```text
src/main/java/.../chat/ChatRequest.java      — inbound DTO record
src/main/java/.../chat/ChatResponse.java     — outbound SSE token DTO record
src/main/java/.../chat/ChatService.java      — orchestrates LLM streaming Flux<String>
src/main/java/.../chat/ChatController.java   — POST /api/chat → Flux<ChatResponse> SSE
src/test/java/.../chat/ChatControllerTests.java    — 4 @WebMvcTest tests
src/test/java/.../chat/ChatIntegrationTests.java   — 1 OllamaContainer E2E test
```

## ChatControllerTests Coverage

| Test | Assertion | Result |
| --- | --- | --- |
| `validRequest_returns200` | HTTP 200 on valid POST | PASS |
| `validRequest_responseIsTextEventStream` | Content-Type: text/event-stream | PASS |
| `blankMessage_returns400` | HTTP 400 when message blank | PASS |
| `blankSessionId_returns400` | HTTP 400 when sessionId blank | PASS |

## Endpoint Contract

```text
POST /api/chat
Content-Type: application/json

{"message":"What pet types do you accept?","sessionId":"abc-123"}

→ HTTP 200
→ Content-Type: text/event-stream
→ data: {"token":"We"}
→ data: {"token":" accept"}
...
```

## ChatIntegrationTests Design

The integration test uses a real Ollama container (via TestContainers) with the `tinyllama`
model to exercise the full `POST /api/chat` SSE endpoint without requiring an Anthropic API key:

```text
@Container
static OllamaContainer ollama = new OllamaContainer("ollama/ollama:latest");

@DynamicPropertySource  →  spring.ai.model.chat=ollama
                            spring.ai.ollama.base-url=<container endpoint>
                            spring.ai.ollama.chat.model=tinyllama
```

The test is skipped gracefully when Docker is unavailable (`@Testcontainers(disabledWithoutDocker = true)`).
