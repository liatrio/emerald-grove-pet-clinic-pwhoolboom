# 12 Questions Round 1 - AI Chat Backend

Please answer each question below (select one or more options, or add your own
notes). Feel free to add additional context under any question.

---

## 1. Spec Structure

The chatbot feature as described in the architecture document is larger than any
single existing spec in this project. I recommend splitting it into two specs:
**Spec 12** for the backend API and **Spec 13** for the frontend widget, so each
has a clear, independently-testable demo milestone.

Is a two-spec split acceptable?

- [x] (A) Yes — two specs as described (backend API first, then widget UI)
- [ ] (B) No — keep it as a single spec (one larger spec is fine)
- [ ] (C) Other (describe)

---

## 2. Primary LLM Provider for Development and Tests

The architecture document lists Anthropic Claude, OpenAI, and Ollama as options.
For automated tests the project cannot require a live API key. Which provider
should be the **default** in `application.properties`, and which should be used
for integration tests?

- [x] (A) Anthropic Claude (claude-opus-4-6) as default; Ollama via TestContainers for integration tests
- [ ] (B) OpenAI (gpt-4o) as default; Ollama via TestContainers for integration tests
- [ ] (C) Ollama as the default for everything (no API key needed anywhere, fully local)
- [ ] (D) Other (describe)

---

## 3. Clinic Info Content

The architecture document includes a `getClinicInfo()` tool that returns static
information about the clinic. What should that information contain?

- [ ] (A) Hardcoded placeholder text (e.g., "Open Mon–Fri 8am–6pm, Sat 9am–1pm") — replace with real values before go-live
- [x] (B) Read from a new `application.properties` key so it can be changed without recompiling
- [ ] (C) Skip this tool for the initial release — focus only on the data-driven tools (vets, pets, visits)
- [ ] (D) Other (describe)

---

## 4. Upcoming Visits Tool — Scope

The `getUpcomingVisitsForOwner(ownerLastName)` tool looks up visits by the
owner's last name. What should it return?

- [ ] (A) All future visits for any owner matching that last name (may return multiple owners)
- [ ] (B) The next N upcoming visits across all owners (no owner filter — useful for general "what's the clinic schedule?" questions)
- [x] (C) Both — implement as two separate tools: one owner-scoped, one clinic-wide
- [ ] (D) Other (describe)

---

## 5. Sensitive Data — Visit Descriptions

Visit records include a free-text `description` field entered by clinic staff
(e.g., "Annual vaccination", "Follow-up for knee surgery"). Should the chatbot
be allowed to include visit descriptions in its responses?

- [x] (A) Yes — descriptions are general clinical notes, not personally sensitive
- [ ] (B) No — omit descriptions; only expose date and pet name
- [ ] (C) Other (describe)
