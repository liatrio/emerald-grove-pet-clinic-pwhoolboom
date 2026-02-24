# AI Chatbot Architecture

## Overview

This document describes the architecture for an AI-powered chatbot embedded in the Emerald Grove Veterinary Clinic application. The chatbot answers questions about pets, appointments, and clinic services by combining a large-language model (LLM) with real-time access to clinic data via tool calling.

---

## Goals

- Answer natural-language questions about veterinarians, specialties, upcoming visits, and pet care
- Access live clinic data (vets, appointments, pet types) rather than relying on static training knowledge
- Stream responses token-by-token for a responsive user experience
- Integrate without requiring authentication changes, a new database schema, or a frontend build pipeline
- Be provider-agnostic so the LLM backend (Anthropic, OpenAI, Ollama) can be swapped via configuration

---

## Technology Choices

### Spring AI

Spring AI (the Spring ecosystem's LLM integration library) is the natural fit for a Spring Boot 4 application. It provides:

- A uniform `ChatClient` abstraction that works with Anthropic Claude, OpenAI GPT, Ollama (local), and others — the provider is selected entirely through application properties, requiring no code changes to switch
- Built-in **tool calling** support, allowing the LLM to invoke annotated Java methods that query the existing repositories
- `ChatMemory` implementations for managing per-session conversation history
- First-class support for **streaming** responses via reactive `Flux<String>` or SSE

### Server-Sent Events (SSE)

The chatbot UI sends an HTTP POST with the user's message and receives a streaming `text/event-stream` response. SSE is preferred over WebSocket because:

- The communication is inherently unidirectional during a response (server pushes tokens, client listens)
- It works over plain HTTP/1.1 with no upgrade handshake
- No additional Spring WebSocket configuration is required
- The browser `EventSource` API (or `fetch()` with streaming body reading) provides a straightforward client implementation

### Vanilla JavaScript

No frontend build tools are introduced. A self-contained chat widget is added to `layout.html` using Bootstrap 5 components already present in the project and plain ES6 `fetch()` with readable-stream processing.

---

## High-Level Architecture

```text
Browser
│
│  1. User types message, JS sends POST /api/chat
│  2. Response arrives as text/event-stream tokens
│  3. JS appends tokens to chat panel in real time
│
└──► ChatController  (new @RestController in chat package)
         │
         ▼
     ChatService     (new @Service — AI orchestration)
         │
         ├──► Spring AI ChatClient  ──► LLM Provider
         │         │                    (Anthropic / OpenAI / Ollama)
         │         │  (tool calls)
         │         ▼
         └──► ChatTools              (new @Component)
                   │
                   ├──► VetRepository         (existing)
                   ├──► OwnerRepository       (existing)
                   ├──► VisitRepository       (existing)
                   └──► PetTypeRepository     (existing)
```

---

## New Package: `chat`

All new classes live in a dedicated package following the project's feature-package convention:

```text
src/main/java/org/springframework/samples/petclinic/chat/
├── ChatController.java      REST endpoint — accepts user messages, returns SSE stream
├── ChatService.java         Orchestrates ChatClient, memory, and tool resolution
├── ChatTools.java           @Tool-annotated methods the LLM can invoke
├── ChatRequest.java         Inbound DTO  { message: String, sessionId: String }
└── ChatResponse.java        Outbound DTO { token: String } (per SSE event)
```

### ChatController

```java
@RestController
@RequestMapping("/api/chat")
class ChatController {

    private final ChatService chatService;

    @PostMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    Flux<ChatResponse> chat(@RequestBody ChatRequest request) {
        return chatService.chat(request.sessionId(), request.message());
    }
}
```

- Accepts `application/json`, produces `text/event-stream`
- Returns `Flux<ChatResponse>` — Spring MVC with WebFlux reactor support handles SSE serialisation automatically in Spring Boot 4
- No session/auth binding; the `sessionId` field is a browser-generated UUID that scopes conversation memory

### ChatService

```java
@Service
class ChatService {

    private final ChatClient chatClient;
    private final ChatMemory memory;

    Flux<ChatResponse> chat(String sessionId, String message) {
        return chatClient.prompt()
            .system(SYSTEM_PROMPT)
            .user(message)
            .advisors(new MessageChatMemoryAdvisor(memory, sessionId, 20))
            .stream()
            .content()
            .map(token -> new ChatResponse(token));
    }
}
```

Key responsibilities:

- Builds the prompt with the system message, user message, and memory advisor
- Configures tool calling via the `ChatClient` builder (registered in `@Bean` configuration)
- Returns a `Flux<ChatResponse>` that the controller streams to the browser

### ChatTools

```java
@Component
class ChatTools {

    // Repositories injected via constructor

    @Tool(description = "List all veterinarians and their specialties")
    List<VetSummary> getVeterinarians() { ... }

    @Tool(description = "Find veterinarians by specialty name")
    List<VetSummary> getVetsBySpecialty(String specialty) { ... }

    @Tool(description = "List all available pet types the clinic accepts")
    List<String> getPetTypes() { ... }

    @Tool(description = "Get upcoming scheduled visits for a named owner")
    List<VisitSummary> getUpcomingVisitsForOwner(String ownerLastName) { ... }

    @Tool(description = "Get clinic service information and operating details")
    ClinicInfo getClinicInfo() { ... }
}
```

- Each method is a read-only call into the existing repositories — no write operations
- Return types are purpose-built summary records (not JPA entities) to control exactly what data the LLM receives. Phone numbers and addresses are excluded.
- The `ChatClient` is configured with `chatTools` as a bean so Spring AI registers them automatically

---

## System Prompt

The system prompt shapes the chatbot's persona and guards:

```text
You are the Emerald Grove Veterinary Clinic's virtual assistant.
You help visitors with questions about our veterinarians, clinic services,
pet care, and appointment scheduling.

Use the provided tools to look up current information — do not guess or
invent clinic data. If you need an owner's name to look up appointments,
ask the user politely.

Do not share personal contact details such as phone numbers or home
addresses. Limit responses to topics relevant to the clinic.

When a question is outside your scope, suggest the visitor call the clinic
directly or use the Find Owners page to manage their account.
```

---

## Conversation Memory

Spring AI's `InMemoryChatMemory` stores the last N message pairs per session:

- **Session ID**: a UUID generated by the browser on first page load and stored in `sessionStorage`; sent with every POST to `/api/chat`
- **Window size**: 20 messages (10 turns) — configurable via `application.properties`
- **Lifecycle**: in-process only; memory clears on application restart
- **Future enhancement**: swap `InMemoryChatMemory` for a `JdbcChatMemory` backed by a new `chat_messages` table if persistence across restarts is needed

---

## Frontend Integration

A floating chat button and slide-in panel are added to `layout.html`. No new JavaScript files or build steps are required.

```text
┌─────────────────────────────────────────────────┐
│  Emerald Grove Veterinary Clinic                │
│  ┌──────────────────────────────────────────┐   │
│  │  Chat with us                            │   │
│  ├──────────────────────────────────────────┤   │
│  │  Bot: Hello! How can I help you today?  │   │
│  │  You: What vets do you have?            │   │
│  │  Bot: We have 6 veterinarians...        │   │
│  ├──────────────────────────────────────────┤   │
│  │  [Type a message...]        [Send]      │   │
│  └──────────────────────────────────────────┘   │
│                                    [💬]          │
└─────────────────────────────────────────────────┘
```

**Implementation sketch:**

```html
<!-- Floating toggle button (bottom-right) -->
<button id="chat-toggle" class="btn btn-primary rounded-circle ...">💬</button>

<!-- Chat panel (Bootstrap offcanvas or fixed div) -->
<div id="chat-panel" class="...">
  <div id="chat-messages"></div>
  <form id="chat-form">
    <input id="chat-input" type="text" placeholder="Ask a question...">
    <button type="submit">Send</button>
  </form>
</div>
```

```javascript
// Vanilla JS — no library required
const sessionId = sessionStorage.getItem('chatSessionId')
  ?? crypto.randomUUID();
sessionStorage.setItem('chatSessionId', sessionId);

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  appendUserMessage(message);
  chatInput.value = '';

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
    body: JSON.stringify({ message, sessionId })
  });

  const reader = response.body.getReader();
  const botMsg = appendBotMessage('');
  for await (const chunk of readStream(reader)) {
    botMsg.textContent += JSON.parse(chunk.data).token;
  }
});
```

The `chat-toggle` button and panel are rendered by Thymeleaf as part of `layout.html` so the chatbot appears on every page automatically.

---

## API Contract

### Request

```text
POST /api/chat
Content-Type: application/json
Accept: text/event-stream

{
  "message": "Which vets specialise in surgery?",
  "sessionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

### Response (SSE stream)

```text
data: {"token":"We"}
data: {"token":" have"}
data: {"token":" two"}
data: {"token":" surgeons"}
data: {"token":":"}
...
data: [DONE]
```

Each `data:` line carries a single JSON object with a `token` field. The browser appends each token to the current bot message as it arrives. `[DONE]` signals the end of the response.

---

## Configuration

New entries in `application.properties`:

```properties
# AI provider selection (one of: anthropic, openai, ollama)
spring.ai.model.chat=anthropic

# Anthropic (Claude) — activate when spring.ai.model.chat=anthropic
spring.ai.anthropic.api-key=${ANTHROPIC_API_KEY}
spring.ai.anthropic.chat.model=claude-opus-4-6
spring.ai.anthropic.chat.max-tokens=1024

# OpenAI — activate when spring.ai.model.chat=openai
# spring.ai.openai.api-key=${OPENAI_API_KEY}
# spring.ai.openai.chat.model=gpt-4o

# Ollama (local, no API key) — activate when spring.ai.model.chat=ollama
# spring.ai.ollama.chat.model=llama3.2

# Chat memory
petclinic.chat.memory.window-size=20
```

API keys are read from environment variables, never committed.

---

## Dependencies Added to `pom.xml`

```xml
<!-- Spring AI BOM — controls all spring-ai artifact versions -->
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.ai</groupId>
      <artifactId>spring-ai-bom</artifactId>
      <version>1.0.0</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>

<!-- Anthropic (Claude) starter — swap for openai or ollama as needed -->
<dependency>
  <groupId>org.springframework.ai</groupId>
  <artifactId>spring-ai-starter-model-anthropic</artifactId>
</dependency>

<!-- Reactor Core — for Flux<> SSE streaming (already on classpath via
     Spring Boot's webflux support, but listed explicitly for clarity) -->
<dependency>
  <groupId>io.projectreactor</groupId>
  <artifactId>reactor-core</artifactId>
</dependency>
```

---

## Data Access & Privacy

The `ChatTools` component has read-only access to the existing repositories. The following data is available to the LLM:

| Tool | Data Exposed | Data Withheld |
|---|---|---|
| `getVeterinarians()` | Name, specialties | — |
| `getVetsBySpecialty()` | Name, specialties | — |
| `getPetTypes()` | Pet type names | — |
| `getUpcomingVisitsForOwner()` | Date, description, pet name | Owner address, phone |
| `getClinicInfo()` | Static clinic text | — |

Owner telephone numbers and addresses are never included in tool return values. The system prompt additionally instructs the model not to repeat any personal details it may infer.

---

## Testing Strategy

Following the project's existing TDD approach:

| Layer | Test Type | Tool |
|---|---|---|
| `ChatTools` | Unit — mock repositories, assert correct data shaping and field exclusions | JUnit 5 + Mockito |
| `ChatService` | Unit — mock `ChatClient`, assert prompt construction and memory advisor wiring | JUnit 5 + Mockito |
| `ChatController` | Web layer — mock `ChatService`, assert SSE stream serialisation and HTTP contract | `@WebMvcTest` + `MockMvc` |
| End-to-end chat flow | Integration — use an Ollama local model (no API key required) with `@SpringBootTest` | TestContainers Ollama module |

---

## Out of Scope (Initial Release)

- **Appointment booking**: the chatbot answers questions only; creating or modifying appointments remains the responsibility of the existing form-based UI
- **Owner authentication**: the chatbot operates without login; owners who want visit-specific information must provide their name, which the tool uses to query the database
- **Persistent chat history**: conversation memory is in-process and resets on restart
- **Multi-language chatbot responses**: the LLM responds in the language of the user's message regardless of the active UI locale; aligning this with `SessionLocaleResolver` is a future enhancement
- **Moderation / content filtering**: a Spring AI `ContentGuardAdvisor` or similar can be layered in without architectural changes

---

## Future Considerations

- **Retrieval-Augmented Generation (RAG)**: if the clinic adds a knowledge base (care guides, FAQ articles, medication sheets), a vector store (Spring AI supports PGVector, Redis, Chroma, and others) can be added behind the `ChatService` to retrieve relevant context before each LLM call, without changing the controller or frontend
- **Persistent memory**: replacing `InMemoryChatMemory` with a `JdbcChatMemory` backed by a `chat_messages` table provides continuity across sessions and enables conversation analytics
- **Usage metering**: Spring AI's `TokenUsage` metadata can be intercepted in an `Advisor` to log per-session token counts to a metrics store
- **Streaming fallback**: for clients that do not support SSE, a non-streaming `POST /api/chat/sync` endpoint returning a single JSON object can be added alongside the streaming endpoint with no changes to `ChatService`
