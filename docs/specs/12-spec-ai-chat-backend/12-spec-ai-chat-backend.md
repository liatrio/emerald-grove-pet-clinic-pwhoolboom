# 12-spec-ai-chat-backend.md

## Introduction/Overview

The Emerald Grove Veterinary Clinic application has no way to answer natural-language questions from visitors. This spec introduces the backend half of an AI-powered chatbot: a `POST /api/chat` SSE endpoint powered by Spring AI and Anthropic Claude that answers questions about veterinarians, clinic services, pet types, and upcoming appointments by calling read-only tools backed by the existing JPA repositories. The frontend widget that consumes this endpoint is specified separately in Spec 13.

## Goals

- Add Spring AI (Anthropic Claude) to the project without requiring code changes to switch to a different LLM provider.
- Implement five tool methods that give the LLM read-only access to live clinic data while excluding sensitive personal fields (owner phone numbers and addresses).
- Expose a single `POST /api/chat` endpoint that accepts a user message and streams back token-by-token SSE responses.
- Maintain per-session conversation memory (last 20 messages) using an in-process store.
- Achieve full unit and web-layer test coverage, plus a provider-agnostic integration test using a local Ollama model via TestContainers.

## User Stories

**As a clinic visitor**, I want to ask questions in plain English so that I can find out which vets are available, what pets the clinic accepts, and when upcoming appointments are without navigating multiple pages.

**As a clinic administrator**, I want the chatbot to read from the live database so that answers about veterinarians and appointments are always current.

**As a developer**, I want the LLM provider to be swappable via configuration so that I can run integration tests locally without an API key and swap to a production model in deployment.

---

## Demoable Units of Work

### Unit 1 — Spring AI Foundation

**Purpose:** Prove that Spring AI is correctly wired into the project — the application compiles, starts, and has a configured `ChatClient` and `MessageWindowChatMemory` bean — before writing any business logic.

**Functional Requirements:**

- FR-1.1 The `spring-ai-bom` (version `2.0.0-M2`) shall be added to `<dependencyManagement>` in `pom.xml` to control all Spring AI artifact versions. Spring AI 2.0.0-M2 is required for compatibility with Spring Boot 4.0.0; the earlier 1.0.0 release targets Spring Boot 3.x only.
- FR-1.2 The `spring-ai-starter-model-anthropic` dependency shall be added to `pom.xml` as the default LLM provider.
- FR-1.3 The `spring-ai-starter-model-ollama` dependency shall be added to `pom.xml` with `<scope>test</scope>` so that the Ollama provider is available for integration tests without being included in production builds.
- FR-1.4 A `ChatConfig` class annotated with `@Configuration` in the new `chat` package shall expose a `ChatClient` bean; the bean shall be built from the auto-configured `ChatClient.Builder` and registered with the `ChatTools` component so tool calling is available on every request.
- FR-1.5 `ChatConfig` shall also expose a `MessageWindowChatMemory` bean (configured via `MessageWindowChatMemory.builder()` with an `InMemoryChatMemoryRepository` and the window size from `petclinic.chat.memory.window-size`). Note: `InMemoryChatMemory` was removed in Spring AI 2.0.0; `MessageWindowChatMemory` is the direct replacement and implements the `ChatMemory` interface.
- FR-1.6 `application.properties` shall be updated with the following entries: `spring.ai.anthropic.api-key=${ANTHROPIC_API_KEY}`, `spring.ai.anthropic.chat.model=claude-opus-4-6`, `spring.ai.anthropic.chat.max-tokens=1024`, `petclinic.chat.memory.window-size=20`, and `petclinic.chat.clinic-info=<placeholder text>`.
- FR-1.7 The application shall compile (`./mvnw compile`) and start (`./mvnw spring-boot:run`) without errors when `ANTHROPIC_API_KEY` is set in the environment.

**Proof Artifacts:**

- CLI: `./mvnw compile -q` exits 0 with Spring AI on the classpath demonstrates the dependency setup is valid.
- CLI: `./mvnw spring-boot:run` starts and logs `Started PetClinicApplication` with no errors demonstrates the `ChatClient` and `ChatMemory` beans are initialised successfully (requires `ANTHROPIC_API_KEY` set in env).

---

### Unit 2 — Clinic Data Tools

**Purpose:** Implement and unit-test the six `@Tool`-annotated methods that give the LLM structured, privacy-safe access to live clinic data.

**Functional Requirements:**

- FR-2.1 A `ChatTools` class annotated with `@Component` shall be created in the `chat` package. It shall inject `VetRepository`, `OwnerRepository`, `VisitRepository`, and `PetTypeRepository` via constructor injection.
- FR-2.2 `ChatTools` shall expose `getVeterinarians()` annotated with `@Tool(description = "List all veterinarians and their specialties")`. It shall return a `List<VetSummary>` where `VetSummary` is a record containing the vet's full name and a list of specialty names. No other vet fields are exposed.
- FR-2.3 `ChatTools` shall expose `getVetsBySpecialty(String specialty)` annotated with `@Tool(description = "Find veterinarians by specialty name")`. It shall filter the result of `getVeterinarians()` to vets whose specialties list contains the given name (case-insensitive).
- FR-2.4 `ChatTools` shall expose `getPetTypes()` annotated with `@Tool(description = "List all pet types the clinic accepts")`. It shall return a `List<String>` of pet type names sourced from `PetTypeRepository`.
- FR-2.5 `ChatTools` shall expose `getUpcomingVisitsForOwner(String ownerLastName)` annotated with `@Tool(description = "Get upcoming scheduled visits for a named owner")`. It shall return a `List<VisitSummary>` where `VisitSummary` is a record containing visit date, visit description, and pet name. Owner address and telephone shall not be included.
- FR-2.6 `ChatTools` shall expose `getUpcomingVisits()` (no parameters) annotated with `@Tool(description = "Get the next upcoming clinic visits across all owners")`. It shall return the next 10 visits (by date) across all owners as a `List<VisitSummary>`.
- FR-2.7 `ChatTools` shall expose `getClinicInfo()` annotated with `@Tool(description = "Get general clinic information such as hours and services")`. It shall return the string value of the `petclinic.chat.clinic-info` property injected via `@Value`.
- FR-2.8 All tool return types (`VetSummary`, `VisitSummary`) shall be Java records defined in the `chat` package. They must not extend or expose JPA entity types.
- FR-2.9 A `ChatToolsTests` test class using `@ExtendWith(MockitoExtension.class)` shall verify each tool method: mock repositories return controlled data; assertions confirm correct field mapping and that excluded fields (address, telephone) are absent.

**Proof Artifacts:**

- Test: `ChatToolsTests` — `./mvnw test -Dtest=ChatToolsTests -q` returns `BUILD SUCCESS` demonstrates all six tools correctly shape repository data and exclude sensitive fields.

---

### Unit 3 — Chat API Endpoint

**Purpose:** Implement `ChatService` and `ChatController` to expose the working SSE endpoint, and verify it with web-layer tests and a live Ollama integration test.

**Functional Requirements:**

- FR-3.1 A `ChatRequest` record with fields `String message` and `String sessionId` shall be created in the `chat` package as the inbound DTO.
- FR-3.2 A `ChatResponse` record with field `String token` shall be created as the per-SSE-event outbound DTO.
- FR-3.3 A `ChatService` class annotated with `@Service` shall be created. It shall inject `ChatClient` and `ChatMemory` via constructor injection. Its `chat(String sessionId, String message)` method shall return `Flux<String>` by building a prompt with: (a) the system prompt defined as a constant, (b) the user message, (c) a `MessageChatMemoryAdvisor` scoped to the session ID with window size read from `petclinic.chat.memory.window-size`.
- FR-3.4 The system prompt constant shall instruct the model to: use tools for all clinic data lookups; not reveal owner phone numbers or addresses; stay on topics relevant to the clinic; suggest the Find Owners page or a direct call for questions outside its scope.
- FR-3.5 A `ChatController` class annotated with `@RestController` and `@RequestMapping("/api/chat")` shall be created. Its `chat(@RequestBody ChatRequest request)` method shall be mapped to `@PostMapping` with `produces = MediaType.TEXT_EVENT_STREAM_VALUE` and shall return `Flux<ChatResponse>` by mapping each token from `ChatService.chat()` to a `new ChatResponse(token)`.
- FR-3.6 A `ChatControllerTests` class using `@WebMvcTest(ChatController.class)` shall mock `ChatService` and verify: the endpoint returns HTTP 200 with `Content-Type: text/event-stream`; each SSE event deserialises to a `ChatResponse`; an empty `sessionId` is rejected with HTTP 400.
- FR-3.7 A `ChatIntegrationTests` class annotated with `@SpringBootTest` and `@Testcontainers` shall use the TestContainers Ollama module with a small local model (e.g., `tinyllama`) to send a real question (`"What pet types do you accept?"`) and assert that the streamed response is non-empty and contains at least one token.

**Proof Artifacts:**

- Test: `ChatControllerTests` — `./mvnw test -Dtest=ChatControllerTests -q` returns `BUILD SUCCESS` demonstrates the HTTP contract (SSE media type, token structure, session validation).
- Test: `ChatIntegrationTests` — `./mvnw test -Dtest=ChatIntegrationTests -q` returns `BUILD SUCCESS` demonstrates an end-to-end stream from real LLM → tools → SSE without requiring an external API key.
- CLI: `curl -s -X POST http://localhost:8080/api/chat -H "Content-Type: application/json" -H "Accept: text/event-stream" -d '{"message":"Which vets do you have?","sessionId":"test-123"}'` produces a stream of `data: {"token":"..."}` lines demonstrates the live endpoint works.

---

## Non-Goals (Out of Scope)

1. **Frontend chat widget**: the HTML panel, JavaScript SSE client, and Playwright E2E tests are covered in Spec 13.
2. **Appointment booking or modification**: the chatbot is read-only; creating or updating visits remains the responsibility of the existing form-based UI.
3. **User authentication**: the chatbot operates without a login requirement; owners identify themselves by name when querying visit data.
4. **Persistent conversation history**: `MessageWindowChatMemory` (backed by `InMemoryChatMemoryRepository`) resets on application restart; a persistent `ChatMemoryRepository` implementation is a future enhancement.
5. **Content moderation**: a `ContentGuardAdvisor` can be layered in without architectural changes but is not part of this spec.
6. **Multi-language LLM responses**: the model responds in the language of the user's message; aligning this with the app's `SessionLocaleResolver` is a future enhancement.

---

## Design Considerations

No UI changes are made in this spec. The only user-facing surface is the `POST /api/chat` HTTP endpoint. API contract:

```text
POST /api/chat
Content-Type: application/json
Accept: text/event-stream

{ "message": "Which vets do you have?", "sessionId": "<uuid>" }

→  data: {"token":"We"}
   data: {"token":" have"}
   ...
   data: [DONE]
```

The `sessionId` is a UUID generated by the browser (Spec 13). Any string value is accepted by the backend; an empty or blank value shall return HTTP 400.

---

## Repository Standards

- **Strict TDD**: each sub-task must have a failing test before the implementation is written (RED → GREEN → REFACTOR).
- **Feature package**: all new classes live in `org.springframework.samples.petclinic.chat`; no new classes are placed in existing packages.
- **Constructor injection**: all Spring beans use constructor injection, consistent with every existing controller and repository in the project.
- **No service layer exists** in the current codebase — `ChatService` is the first service class and sets the pattern for future services.
- **Conventional commits**: `feat:` for new classes, `test:` for test-only commits, `chore:` for dependency and configuration changes.
- **Spring Java Format**: run `./mvnw spring-javaformat:apply` before committing Java changes; the Maven build enforces it.
- **Pre-commit hooks**: Maven compile check runs on every commit; ensure no compilation errors.

---

## Technical Considerations

- **Spring AI BOM version `2.0.0-M2`** is required for Spring Boot 4.0.0 compatibility. Spring AI 1.0.0 targets Spring Boot 3.x and will fail to load (`RestClientAutoConfiguration` not found) under Spring Boot 4. All Spring AI artifact versions are managed via the BOM; no individual versions need to be specified. The `InMemoryChatMemory` class from 1.0.x was replaced by `MessageWindowChatMemory` + `InMemoryChatMemoryRepository` in 2.0.0.
- **Flux streaming with Spring MVC**: Spring Boot 4 + Reactor Core on the classpath enables `Flux<>` return types from `@RestController` methods without requiring the full Spring WebFlux starter. The `text/event-stream` media type triggers Spring's SSE serialiser automatically.
- **Ollama TestContainers**: the `org.testcontainers:ollama` module pulls a Docker image at test time. Tests annotated `@Testcontainers(disabledWithoutDocker = true)` are skipped gracefully in environments without Docker, matching the pattern used by `MySqlIntegrationTests`.
- **`ANTHROPIC_API_KEY` in CI**: the integration test uses Ollama (not Anthropic), so no API key is required in CI. The Anthropic key is only needed when running the app locally with the live Claude model.
- **`petclinic.chat.clinic-info`** shall be a single-line string in `application.properties`. Example default value: `Emerald Grove Veterinary Clinic. Open Monday through Friday 8am to 6pm and Saturday 9am to 1pm. We accept dogs, cats, birds, hamsters, lizards, snakes, and other pets.`
- **`VisitRepository` query for upcoming visits**: the existing `VisitRepository` does not have a "future visits" query. A new derived query method `findByDateGreaterThanEqualOrderByDate(LocalDate date, Pageable pageable)` shall be added to `VisitRepository` for the `getUpcomingVisits()` tool.

---

## Security Considerations

- **`ANTHROPIC_API_KEY`** must be supplied via environment variable (`${ANTHROPIC_API_KEY}` in `application.properties`). It must never be committed to the repository. The `application.properties` entry shall reference the environment variable placeholder only.
- **Sensitive field exclusion**: `VetSummary` and `VisitSummary` records must not include owner telephone, address, or city. This must be verified by the `ChatToolsTests` unit tests.
- **Proof artifact security**: CLI output captured in proof markdown files must not include real API keys or personal data from the sample dataset. Use the placeholder `sessionId` value `"test-123"` in all curl examples.
- **No write access**: `ChatTools` uses only `findBy*` repository methods. No `save()`, `delete()`, or modifying operations are permitted in the `chat` package.

---

## Success Metrics

1. **All tests pass**: `./mvnw test` completes with 0 failures, including `ChatToolsTests`, `ChatControllerTests`, and `ChatIntegrationTests`.
2. **Live endpoint works**: `curl` against the running app returns a well-formed SSE stream for a question about vets or pet types.
3. **No API key required for tests**: the full test suite passes in a clean CI environment with no `ANTHROPIC_API_KEY` set (Ollama integration test is the only live-model test, and it uses Docker).
4. **Sensitive data excluded**: `ChatToolsTests` explicitly asserts that no `VetSummary` or `VisitSummary` contains telephone or address fields.

---

## Open Questions

No open questions at this time.
