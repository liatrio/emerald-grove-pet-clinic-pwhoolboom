# 12-tasks-ai-chat-backend.md

## Relevant Files

- `pom.xml` — Add Spring AI BOM to `<dependencyManagement>` and Anthropic + Ollama starters to `<dependencies>`.
- `src/main/resources/application.properties` — Add Spring AI properties and `petclinic.chat.*` config keys.
- `src/main/java/org/springframework/samples/petclinic/chat/ChatConfig.java` — **NEW** `@Configuration` class exposing `ChatClient` and `InMemoryChatMemory` beans.
- `src/main/java/org/springframework/samples/petclinic/chat/ChatTools.java` — **NEW** `@Component` with six `@Tool`-annotated methods backed by existing repositories.
- `src/main/java/org/springframework/samples/petclinic/chat/VetSummary.java` — **NEW** Java record: `(String name, List<String> specialties)`.
- `src/main/java/org/springframework/samples/petclinic/chat/VisitSummary.java` — **NEW** Java record: `(String ownerName, String petName, LocalDate visitDate, String description)`.
- `src/main/java/org/springframework/samples/petclinic/chat/ChatService.java` — **NEW** `@Service` orchestrating `ChatClient`, `ChatMemory`, system prompt, and `MessageChatMemoryAdvisor`.
- `src/main/java/org/springframework/samples/petclinic/chat/ChatController.java` — **NEW** `@RestController` with `POST /api/chat` producing `text/event-stream`.
- `src/main/java/org/springframework/samples/petclinic/chat/ChatRequest.java` — **NEW** Java record: `(@NotBlank String message, @NotBlank String sessionId)`.
- `src/main/java/org/springframework/samples/petclinic/chat/ChatResponse.java` — **NEW** Java record: `(String token)`.
- `src/main/java/org/springframework/samples/petclinic/vet/VetRepository.java` — Referenced only; `findAll()` used by `ChatTools`.
- `src/main/java/org/springframework/samples/petclinic/owner/PetTypeRepository.java` — Referenced only; `findAll()` used by `ChatTools`.
- `src/main/java/org/springframework/samples/petclinic/owner/VisitRepository.java` — Referenced only; existing `findUpcomingVisits(LocalDate, LocalDate)` used by both visit tools.
- `src/test/java/org/springframework/samples/petclinic/chat/ChatConfigTest.java` — **NEW** `@SpringBootTest` context-load test that verifies `ChatClient` and `ChatMemory` beans exist (TDD RED for Task 1.0).
- `src/test/java/org/springframework/samples/petclinic/chat/ChatToolsTests.java` — **NEW** `@ExtendWith(MockitoExtension.class)` unit tests for all six tool methods.
- `src/test/java/org/springframework/samples/petclinic/chat/ChatControllerTests.java` — **NEW** `@WebMvcTest(ChatController.class)` tests for the HTTP contract.
- `src/test/java/org/springframework/samples/petclinic/chat/ChatIntegrationTests.java` — **NEW** `@SpringBootTest` + TestContainers Ollama end-to-end test.

### Notes

- Run Java unit tests with: `./mvnw test -Dtest=<TestClassName> -q`
- Run all tests with: `./mvnw test`
- Apply Spring Java Format before committing Java changes: `./mvnw spring-javaformat:apply`
- Follow the `@WebMvcTest` + `@MockitoBean` pattern used in `OwnerControllerTests.java`.
- Follow the `@Testcontainers(disabledWithoutDocker = true)` + `@SpringBootTest(webEnvironment = RANDOM_PORT)` pattern used in `MySqlIntegrationTests.java`.
- All new classes go in `org.springframework.samples.petclinic.chat` — do not add anything to existing packages.
- Constructor injection only — no `@Autowired` on fields.
- `VisitRepository.findUpcomingVisits(LocalDate, LocalDate)` already exists and returns `List<UpcomingVisit>` with fields `ownerName`, `petName`, `visitDate`, and `description`. Use it for both visit tools — no new repository method is needed.

---

## Tasks

### [x] 1.0 Spring AI Foundation — Dependencies, Beans, and Configuration

#### 1.0 Proof Artifact(s)

- CLI: `./mvnw compile -q` exits 0 with Spring AI on the classpath demonstrates the dependency setup and `ChatConfig` bean wiring compile without errors.
- CLI: `./mvnw spring-boot:run` starts and logs `Started PetClinicApplication` with no errors (requires `ANTHROPIC_API_KEY` set in the shell) demonstrates `ChatClient` and `InMemoryChatMemory` beans are initialised successfully at runtime.

#### 1.0 Tasks

- [x] 1.1 **TDD RED phase**: Create `ChatConfigTest.java` in `src/test/java/org/springframework/samples/petclinic/chat/`. Annotate it with `@SpringBootTest` and `@DisabledInAotMode`. Add one test method that `@Autowired`-injects both a `ChatClient` field and a `ChatMemory` field and asserts neither is null. Run `./mvnw test -Dtest=ChatConfigTest -q` and confirm it fails with a compilation or context error (Spring AI is not yet on the classpath). This is the TDD RED phase.
- [x] 1.2 In `pom.xml`, add a `<dependencyManagement>` block (after the existing `<dependencies>` closing tag, inside `<project>`) importing the Spring AI BOM: `groupId=org.springframework.ai`, `artifactId=spring-ai-bom`, `version=1.0.0`, `type=pom`, `scope=import`.
- [x] 1.3 In `pom.xml` `<dependencies>`, add `org.springframework.ai:spring-ai-starter-model-anthropic` (no `<version>` — managed by BOM).
- [x] 1.4 In `pom.xml` `<dependencies>`, add `org.springframework.ai:spring-ai-starter-model-ollama` with `<scope>test</scope>`, and `org.testcontainers:ollama` with `<scope>test</scope>` (no version — managed by the existing TestContainers BOM).
- [x] 1.5 Add the following entries to `src/main/resources/application.properties`: `spring.ai.anthropic.api-key=${ANTHROPIC_API_KEY}`, `spring.ai.anthropic.chat.model=claude-opus-4-6`, `spring.ai.anthropic.chat.max-tokens=1024`, `petclinic.chat.memory.window-size=20`, and `petclinic.chat.clinic-info=Emerald Grove Veterinary Clinic. Open Monday through Friday 8am to 6pm and Saturday 9am to 1pm. We accept dogs, cats, birds, hamsters, lizards, snakes, and other pets.`
- [x] 1.6 Create `ChatConfig.java` in `src/main/java/org/springframework/samples/petclinic/chat/`. Annotate with `@Configuration`. Add two `@Bean` methods: (a) `ChatClient chatClient(ChatClient.Builder builder)` that returns `builder.build()`, and (b) `InMemoryChatMemory chatMemory()` that returns `new InMemoryChatMemory()`. (Tools will be registered in task 2.11 once `ChatTools` exists.)
- [x] 1.7 Run `./mvnw compile -q` and verify it exits 0 (GREEN for compilation).
- [x] 1.8 Run `./mvnw test -Dtest=ChatConfigTest -q` and verify `Tests run: 1, Failures: 0` — both beans are resolved from the Spring context (GREEN for the test).
- [x] 1.9 With `ANTHROPIC_API_KEY` exported in your shell, run `./mvnw spring-boot:run`, wait for `Started PetClinicApplication`, then stop it with Ctrl+C. Capture the startup log line as proof.

---

### [x] 2.0 Clinic Data Tools — ChatTools with Unit Tests

#### 2.0 Proof Artifact(s)

- Test: `ChatToolsTests` — `./mvnw test -Dtest=ChatToolsTests -q` returns `BUILD SUCCESS` demonstrates all six tool methods correctly shape repository data, return the right fields, and exclude owner telephone and address.

#### 2.0 Tasks

- [x] 2.1 **TDD RED phase**: Create `ChatToolsTests.java` in `src/test/java/org/springframework/samples/petclinic/chat/`. Annotate with `@ExtendWith(MockitoExtension.class)`. Add `@Mock`-annotated fields for `VetRepository`, `PetTypeRepository`, and `VisitRepository`, and an `@InjectMocks ChatTools chatTools` field. Add one test `getVeterinarians_returnsMappedVetSummaries` that calls `chatTools.getVeterinarians()` and asserts the list is not null. Run `./mvnw test -Dtest=ChatToolsTests -q` and confirm compilation failure (`ChatTools` does not exist yet). This is the TDD RED phase.
- [x] 2.2 Create `VetSummary.java` as a Java record in `src/main/java/org/springframework/samples/petclinic/chat/`: `public record VetSummary(String name, List<String> specialties) {}`.
- [x] 2.3 Create `VisitSummary.java` as a Java record in `src/main/java/org/springframework/samples/petclinic/chat/`: `public record VisitSummary(String ownerName, String petName, LocalDate visitDate, String description) {}`.
- [x] 2.4 Create `ChatTools.java` as a `@Component` in `src/main/java/org/springframework/samples/petclinic/chat/`. Add a constructor injecting `VetRepository vetRepository`, `PetTypeRepository petTypeRepository`, and `VisitRepository visitRepository`. Add a `@Value("${petclinic.chat.clinic-info}") String clinicInfo` field. Leave all tool method bodies as `return List.of();` / `return "";` stubs for now.
- [x] 2.5 Implement `getVeterinarians()` in `ChatTools`. Annotate with `@Tool(description = "List all veterinarians and their specialties")`. Body: call `vetRepository.findAll()`, then for each `Vet` create a `new VetSummary(vet.getFirstName() + " " + vet.getLastName(), vet.getSpecialties().stream().map(Specialty::getName).toList())`. Return the resulting `List<VetSummary>`.
- [x] 2.6 Implement `getVetsBySpecialty(String specialty)` in `ChatTools`. Annotate with `@Tool(description = "Find veterinarians by specialty name")`. Body: call `getVeterinarians()` and filter where `vs.specialties().stream().anyMatch(s -> s.equalsIgnoreCase(specialty))`. Return the filtered list.
- [x] 2.7 Implement `getPetTypes()` in `ChatTools`. Annotate with `@Tool(description = "List all pet types the clinic accepts")`. Body: call `petTypeRepository.findAll()` and map each `PetType` to `pt.getName()`. Return `List<String>`.
- [x] 2.8 Implement `getUpcomingVisitsForOwner(String ownerLastName)` in `ChatTools`. Annotate with `@Tool(description = "Get upcoming scheduled visits for a named owner")`. Body: call `visitRepository.findUpcomingVisits(LocalDate.now(), LocalDate.now().plusYears(1))`, filter where `uv.ownerName().toLowerCase().contains(ownerLastName.toLowerCase())`, then map each `UpcomingVisit uv` to `new VisitSummary(uv.ownerName(), uv.petName(), uv.visitDate(), uv.description())`. Return `List<VisitSummary>`.
- [x] 2.9 Implement `getUpcomingVisits()` in `ChatTools`. Annotate with `@Tool(description = "Get the next upcoming clinic visits across all owners")`. Body: call `visitRepository.findUpcomingVisits(LocalDate.now(), LocalDate.now().plusYears(1))`, take the first 10 entries using `.stream().limit(10)`, map to `VisitSummary` using the same mapping as 2.8. Return `List<VisitSummary>`.
- [x] 2.10 Implement `getClinicInfo()` in `ChatTools`. Annotate with `@Tool(description = "Get general clinic information such as hours and services")`. Body: `return clinicInfo;`.
- [x] 2.11 Update `ChatConfig.chatClient(...)` bean: change the signature to `ChatClient chatClient(ChatClient.Builder builder, ChatTools chatTools)` and update the body to `return builder.defaultTools(chatTools).build();`.
- [x] 2.12 Complete all remaining test methods in `ChatToolsTests`. For each test, use `given(...)` / `when(...)` to configure the mocked repositories, call the tool method, and assert: correct field values are present; sensitive fields `address` and `telephone` never appear (these fields simply do not exist on `VetSummary` or `VisitSummary`, so compile-time type safety provides the proof — add a comment to this effect in the test). Cover: `getVeterinarians_returnsMappedVetSummaries`, `getVetsBySpecialty_filtersCorrectly`, `getPetTypes_returnsTypeNames`, `getUpcomingVisitsForOwner_returnsMatchingVisits`, `getUpcomingVisits_returnsAtMostTen`, `getClinicInfo_returnsInjectedString`. Run `./mvnw spring-javaformat:apply` then `./mvnw test -Dtest=ChatToolsTests -q` and verify `BUILD SUCCESS`.

---

### [x] 3.0 Chat API Endpoint — ChatService, ChatController, and Integration Tests

#### 3.0 Proof Artifact(s)

- Test: `ChatControllerTests` — `./mvnw test -Dtest=ChatControllerTests -q` returns `BUILD SUCCESS` demonstrates the HTTP contract: `POST /api/chat` returns HTTP 200 with `Content-Type: text/event-stream`, each SSE event deserialises to `{"token":"..."}`, and a blank `sessionId` returns HTTP 400.
- Test: `ChatIntegrationTests` — `./mvnw test -Dtest=ChatIntegrationTests -q` returns `BUILD SUCCESS` (requires Docker; skipped gracefully without it) demonstrates an end-to-end stream from a real Ollama model through tools to SSE, with no external API key.
- CLI: `curl -s -N -X POST http://localhost:8080/api/chat -H "Content-Type: application/json" -H "Accept: text/event-stream" -d '{"message":"What pet types do you accept?","sessionId":"demo-123"}'` produces a stream of `data: {"token":"..."}` lines and then `data: [DONE]` demonstrates the live endpoint works end-to-end with Claude.

#### 3.0 Tasks

- [x] 3.1 **TDD RED phase**: Create `ChatControllerTests.java` in `src/test/java/org/springframework/samples/petclinic/chat/`. Annotate with `@WebMvcTest(ChatController.class)`, `@DisabledInNativeImage`, and `@DisabledInAotMode`. Add `@Autowired MockMvc mockMvc` and `@MockitoBean ChatService chatService`. Add one test that performs `mockMvc.perform(post("/api/chat").contentType(APPLICATION_JSON).content("{\"message\":\"hi\",\"sessionId\":\"s1\"}"))` and expects `status().isOk()`. Run `./mvnw test -Dtest=ChatControllerTests -q` and confirm compilation failure (`ChatController` does not exist). This is the TDD RED phase.
- [x] 3.2 Create `ChatRequest.java` as a Java record in `src/main/java/org/springframework/samples/petclinic/chat/`: `public record ChatRequest(@NotBlank String message, @NotBlank String sessionId) {}`. Import `jakarta.validation.constraints.NotBlank`.
- [x] 3.3 Create `ChatResponse.java` as a Java record in the same package: `public record ChatResponse(String token) {}`.
- [x] 3.4 Create `ChatService.java` as a `@Service` in `src/main/java/org/springframework/samples/petclinic/chat/`. Inject `ChatClient chatClient` and `ChatMemory chatMemory` via constructor. Inject `@Value("${petclinic.chat.memory.window-size}") int windowSize`. Define a `private static final String SYSTEM_PROMPT` constant containing the system prompt text from the spec (instruct model to use tools, not reveal phone/address, stay on topic, suggest the Find Owners page for out-of-scope questions). Implement `public Flux<String> chat(String sessionId, String message)`: return `chatClient.prompt().system(SYSTEM_PROMPT).user(message).advisors(new MessageChatMemoryAdvisor(chatMemory, sessionId, windowSize)).stream().content()`.
- [x] 3.5 Create `ChatController.java` as a `@RestController` + `@RequestMapping("/api/chat")` in `src/main/java/org/springframework/samples/petclinic/chat/`. Inject `ChatService chatService` via constructor. Add one method: `@PostMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE) public Flux<ChatResponse> chat(@Valid @RequestBody ChatRequest request)` that returns `chatService.chat(request.sessionId(), request.message()).map(ChatResponse::new)`.
- [x] 3.6 Complete all test cases in `ChatControllerTests`. Configure the mock: `given(chatService.chat(anyString(), anyString())).willReturn(Flux.just("Hello", " world"))`. Write tests: (a) valid request returns `status().isOk()` and `content().contentTypeCompatibleWith(TEXT_EVENT_STREAM)`; (b) the response body contains a `token` field (check with `jsonPath`); (c) request with blank `message` field returns `status().isBadRequest()`; (d) request with blank `sessionId` returns `status().isBadRequest()`.
- [x] 3.7 Run `./mvnw spring-javaformat:apply` then `./mvnw test -Dtest=ChatControllerTests -q` and verify `BUILD SUCCESS`.
- [x] 3.8 Create `ChatIntegrationTests.java` in `src/test/java/org/springframework/samples/petclinic/chat/`. Annotate with `@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)`, `@Testcontainers(disabledWithoutDocker = true)`, `@DisabledInNativeImage`, and `@DisabledInAotMode`. Declare `@Container static OllamaContainer ollama = new OllamaContainer("ollama/ollama:latest")`. Add a `@BeforeAll static void pullModel()` that calls `ollama.execInContainer("ollama", "pull", "tinyllama")` to fetch the model. Add a `@DynamicPropertySource static void ollamaProperties(DynamicPropertyRegistry registry)` that sets `spring.ai.ollama.base-url` to `ollama.getEndpoint()`, `spring.ai.model.chat` to `"ollama"`, `spring.ai.ollama.chat.model` to `"tinyllama"`, and `spring.ai.anthropic.api-key` to `"test"` (to suppress the missing-key startup check). Add one test that sends `POST /api/chat` via `RestTemplate` with body `{"message":"What pet types do you accept?","sessionId":"it-test-1"}` and asserts the response status is 200 and the body is non-blank.
- [x] 3.9 Run `./mvnw test -Dtest=ChatIntegrationTests -q` and verify `BUILD SUCCESS` (Docker required; if Docker is unavailable the test shows `SKIPPED` — that is acceptable).
- [x] 3.10 With the app running (`./mvnw spring-boot:run` with `ANTHROPIC_API_KEY` exported), execute the curl command from the proof artifact above and capture the streaming output. Record a representative excerpt (first 5–10 `data:` lines) in the proof markdown file for this task.
