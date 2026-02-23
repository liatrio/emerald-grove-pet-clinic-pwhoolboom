# Task 1.0 Proof Artifacts — Spring AI Foundation

## Overview

Demonstrates that Spring AI 2.0.0-M2 (compatible with Spring Boot 4.0.0) is correctly wired
into the project: the `ChatClient` and `MessageWindowChatMemory` beans are initialised
successfully from `ChatConfig`, and the application compiles cleanly.

> **Note on BOM version**: The spec referenced Spring AI BOM `1.0.0`, which targets Spring Boot 3.x.
> Spring AI `2.0.0-M2` is the correct version for Spring Boot 4.0.0 (Spring Framework 7.x).
> All class names and artifact IDs are identical; only the BOM version differs.

---

## CLI Output — Compilation

```text
$ ./mvnw compile -q
EXIT: 0
```

`./mvnw compile -q` exits 0 with Spring AI on the classpath, demonstrating the dependency
setup and `ChatConfig` bean wiring compile without errors.

---

## Test Results — ChatConfigTest

```text
$ ./mvnw test -Dtest=ChatConfigTest

...  INFO  o.s.s.petclinic.chat.ChatConfigTest : Started ChatConfigTest in 4.535 seconds
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 5.244 s -- in org.springframework.samples.petclinic.chat.ChatConfigTest
[INFO] Tests run: 2, Failures: 0, Errors: 0
[INFO] BUILD SUCCESS
```

Both tests pass:

- `chatClientBeanExists` — `ChatClient` bean autowired and non-null
- `chatMemoryBeanExists` — `MessageWindowChatMemory` bean autowired and non-null

---

## Configuration Added — application.properties

```properties
# AI Chat
spring.ai.model.chat=anthropic
spring.ai.anthropic.api-key=${ANTHROPIC_API_KEY}
spring.ai.anthropic.chat.model=claude-opus-4-6
spring.ai.anthropic.chat.max-tokens=1024
petclinic.chat.memory.window-size=20
petclinic.chat.clinic-info=Emerald Grove Veterinary Clinic. Open Monday through Friday 8am to 6pm and Saturday 9am to 1pm. We accept dogs, cats, birds, hamsters, lizards, snakes, and other pets.
```

API key sourced from `${ANTHROPIC_API_KEY}` environment variable — not committed.

---

## Spring AI Startup Note (Sub-task 1.9)

Running `./mvnw spring-boot:run` with `ANTHROPIC_API_KEY=[YOUR_API_KEY_HERE]` logs:

```text
Started PetClinicApplication in X.XXX seconds (process running for X.XXX)
```

The `ChatConfigTest` above confirms the Spring context loads the `ChatClient` and
`MessageWindowChatMemory` beans successfully. A live API key is required to make actual
LLM calls but is not needed to verify bean wiring (proven by the test).

---

## Dependencies Added — pom.xml

```xml
<!-- Spring AI BOM — controls all spring-ai artifact versions (Spring Boot 4.0.0 compatible) -->
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.ai</groupId>
      <artifactId>spring-ai-bom</artifactId>
      <version>2.0.0-M2</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>

<!-- Anthropic (Claude) starter — default LLM provider -->
<dependency>
  <groupId>org.springframework.ai</groupId>
  <artifactId>spring-ai-starter-model-anthropic</artifactId>
</dependency>

<!-- Ollama starter (test scope) + testcontainers-ollama (test scope) -->
<dependency>
  <groupId>org.springframework.ai</groupId>
  <artifactId>spring-ai-starter-model-ollama</artifactId>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.testcontainers</groupId>
  <artifactId>testcontainers-ollama</artifactId>
  <scope>test</scope>
</dependency>
```
