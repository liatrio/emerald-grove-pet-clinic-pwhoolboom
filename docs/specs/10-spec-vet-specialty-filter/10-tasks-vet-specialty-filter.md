# 10-tasks-vet-specialty-filter.md

## Relevant Files

- `src/main/java/org/springframework/samples/petclinic/vet/VetRepository.java` - Add two new `@Query` JPQL methods: filter by specialty name and filter for vets with no specialties.
- `src/main/java/org/springframework/samples/petclinic/vet/VetController.java` - Accept optional `specialty` query param, route to the correct repository method, and add `listSpecialties` and `specialty` model attributes.
- `src/main/resources/templates/vets/vetList.html` - Add specialty filter `<form>` with `<select>` dropdown and Filter button above the table; update pagination links to use Thymeleaf `@{}` URL builder with `specialty` param.
- `src/main/resources/messages/messages.properties` - Add 3 new i18n keys: `vets.filter.label`, `vets.filter.all`, `vets.filter.none`.
- `src/main/resources/messages/messages_de.properties` - German translations for the 3 new keys.
- `src/main/resources/messages/messages_es.properties` - Spanish translations for the 3 new keys.
- `src/main/resources/messages/messages_fa.properties` - Farsi translations for the 3 new keys.
- `src/main/resources/messages/messages_ko.properties` - Korean translations for the 3 new keys.
- `src/main/resources/messages/messages_pt.properties` - Portuguese translations for the 3 new keys.
- `src/main/resources/messages/messages_ru.properties` - Russian translations for the 3 new keys.
- `src/main/resources/messages/messages_tr.properties` - Turkish translations for the 3 new keys.
- `src/test/java/org/springframework/samples/petclinic/service/ClinicServiceTests.java` - Add 3 new `@DataJpaTest` tests covering all specialty filter query paths.
- `src/test/java/org/springframework/samples/petclinic/vet/VetControllerTests.java` - Add new `@WebMvcTest` tests for all specialty filter controller paths and model attributes.
- `src/test/java/org/springframework/samples/petclinic/system/I18nPropertiesSyncTest.java` - Referenced only; must continue to pass after adding new keys.
- `e2e-tests/tests/pages/vet-page.ts` - Extend `VetPage` with specialty filter dropdown helper methods.
- `e2e-tests/tests/features/vet-specialty-filter.spec.ts` - **NEW**: Playwright E2E tests for all specialty filter user journeys.
- `docs/specs/10-spec-vet-specialty-filter/10-proofs/` - **NEW**: Directory for proof artifact markdown files and screenshots.

### Notes

- All production code changes must follow strict TDD: write a failing test first, then implement the minimum code to make it pass.
- Run Java tests with: `./mvnw test -Dtest=<TestClassName> -q`
- Run E2E tests with: `cd e2e-tests && npm test`
- Follow the `@WebMvcTest` + `@MockitoBean` pattern used in `VetControllerTests.java` and `OwnerControllerTests.java`.
- Follow the `@DataJpaTest` pattern used in `ClinicServiceTests.java`.
- Do **not** add `@Cacheable` to the new repository query methods.
- Use Thymeleaf `@{/vets.html(page=${i}, specialty=${specialty})}` URL builder (not string interpolation) for all pagination links.
- All fenced code blocks in proof markdown files must include a language specifier (e.g., ` ```bash `, ` ```text `, ` ```java `) to pass the markdownlint pre-commit hook.

---

## Tasks

### [x] 1.0 Repository: Add Specialty Filter Query Methods

#### 1.0 Proof Artifact(s)

- Test: `ClinicServiceTests` — `./mvnw test -Dtest=ClinicServiceTests -q` returns `BUILD SUCCESS` with 3 new tests passing: filter by specialty name, filter by no specialties, and unknown specialty returning empty demonstrates all repository query paths work against H2 sample data

#### 1.0 Tasks

- [ ] 1.1 In `ClinicServiceTests.java`, write a failing `@DataJpaTest` test `shouldFindVetsBySpecialtyName`: call `vets.findBySpecialtyName("radiology", pageable)` and assert the page contains 2 results (Helen Leary and Henry Stevens). Run `./mvnw test -Dtest=ClinicServiceTests -q` and confirm it fails with a compilation error (method not yet defined).
- [ ] 1.2 In `ClinicServiceTests.java`, write a failing `@DataJpaTest` test `shouldFindVetsWithNoSpecialties`: call `vets.findWithNoSpecialties(pageable)` and assert the page contains 2 results (James Carter and Sharon Jenkins). Confirm compilation still fails.
- [ ] 1.3 In `ClinicServiceTests.java`, write a failing `@DataJpaTest` test `shouldReturnEmptyPageForUnknownSpecialty`: call `vets.findBySpecialtyName("unknownXYZ", pageable)` and assert the page is empty. Confirm compilation fails.
- [ ] 1.4 Add `findBySpecialtyName(@Param("specialty") String specialty, Pageable pageable)` to `VetRepository` with `@Query("SELECT v FROM Vet v JOIN v.specialties s WHERE LOWER(s.name) = LOWER(:specialty)")`. Do **not** add `@Cacheable`.
- [ ] 1.5 Add `findWithNoSpecialties(Pageable pageable)` to `VetRepository` with `@Query("SELECT v FROM Vet v WHERE v.specialties IS EMPTY")`. Do **not** add `@Cacheable`.
- [ ] 1.6 Run `./mvnw test -Dtest=ClinicServiceTests -q` and verify all 3 new tests and all pre-existing `ClinicServiceTests` tests pass.

---

### [x] 2.0 Controller: Accept `specialty` Param and Route to Filtered Queries

#### 2.0 Proof Artifact(s)

- Test: `VetControllerTests` — `./mvnw test -Dtest=VetControllerTests -q` returns `BUILD SUCCESS` with all new tests passing: no filter returns all vets with correct model attributes, filter by specialty name returns only matching vets, filter by "none" returns only unassigned vets, unknown specialty returns an empty list demonstrates all four controller filter paths

#### 2.0 Tasks

- [ ] 2.1 In `VetControllerTests.java`, write a failing test `testShowVetListHtmlNoFilter`: GET `/vets.html` with no `specialty` param, assert model has attribute `listSpecialties` (a non-empty collection of specialty names) and attribute `specialty` equal to `""`. Confirm it fails.
- [ ] 2.2 Write a failing test `testShowVetListHtmlFilterBySpecialty`: GET `/vets.html?specialty=radiology`, mock `vets.findBySpecialtyName("radiology", any())` to return a page with Helen only, assert model `specialty` equals `"radiology"` and the vet list contains only Helen. Confirm it fails.
- [ ] 2.3 Write a failing test `testShowVetListHtmlFilterByNone`: GET `/vets.html?specialty=none`, mock `vets.findWithNoSpecialties(any())` to return a page with James only, assert model `specialty` equals `"none"` and the vet list contains only James. Confirm it fails.
- [ ] 2.4 Write a failing test `testShowVetListHtmlFilterByUnknownSpecialty`: GET `/vets.html?specialty=unknownXYZ`, mock `vets.findBySpecialtyName("unknownXYZ", any())` to return an empty page, assert the vet list is empty and model `specialty` equals `"unknownXYZ"`. Confirm it fails.
- [ ] 2.5 Add `@RequestParam(defaultValue = "") String specialty` to `showVetList()` in `VetController`.
- [ ] 2.6 Update the body of `showVetList()` and `findPaginated()` to route based on the `specialty` value: empty string → `vets.findAll(pageable)` (existing behavior); `"none"` → `vets.findWithNoSpecialties(pageable)`; anything else → `vets.findBySpecialtyName(specialty, pageable)`.
- [ ] 2.7 Populate the `listSpecialties` model attribute by streaming `vets.findAll()` (cached), flat-mapping each vet's specialties, collecting distinct names, and sorting alphabetically.
- [ ] 2.8 Populate the `specialty` model attribute by adding `model.addAttribute("specialty", specialty)` so the template can mark the active selection and build pagination links.
- [ ] 2.9 Run `./mvnw test -Dtest=VetControllerTests -q` and verify all new and pre-existing controller tests pass.

---

### [ ] 3.0 Template and i18n: Filter Dropdown, Pagination Links, and Message Keys

#### 3.0 Proof Artifact(s)

- Test: `I18nPropertiesSyncTest` — `./mvnw test -Dtest=I18nPropertiesSyncTest -q` returns `BUILD SUCCESS` demonstrates all 3 new keys are present in all 8 locale files
- Screenshot: `vets-filter-dropdown.png` — Vet Directory at `http://localhost:8080/vets.html?specialty=radiology` showing the dropdown with "radiology" selected and only Helen Leary and Henry Stevens in the table demonstrates filter UI and shareable URL

#### 3.0 Tasks

- [ ] 3.1 Add the following 3 keys to `messages.properties` (base English): `vets.filter.label=Filter by specialty:`, `vets.filter.all=All`, `vets.filter.none=None`.
- [ ] 3.2 Add translated values for the 3 keys to `messages_de.properties`: `vets.filter.label=Nach Fachgebiet filtern:`, `vets.filter.all=Alle`, `vets.filter.none=Keine`.
- [ ] 3.3 Add translated values for the 3 keys to `messages_es.properties`: `vets.filter.label=Filtrar por especialidad:`, `vets.filter.all=Todos`, `vets.filter.none=Ninguno`.
- [ ] 3.4 Add translated values for the 3 keys to `messages_fa.properties`: `vets.filter.label=فیلتر بر اساس تخصص:`, `vets.filter.all=همه`, `vets.filter.none=هیچکدام`.
- [ ] 3.5 Add translated values for the 3 keys to `messages_ko.properties`: `vets.filter.label=전문 분야별 필터:`, `vets.filter.all=전체`, `vets.filter.none=없음`.
- [ ] 3.6 Add translated values for the 3 keys to `messages_pt.properties`: `vets.filter.label=Filtrar por especialidade:`, `vets.filter.all=Todos`, `vets.filter.none=Nenhum`.
- [ ] 3.7 Add translated values for the 3 keys to `messages_ru.properties`: `vets.filter.label=Фильтр по специализации:`, `vets.filter.all=Все`, `vets.filter.none=Нет`.
- [ ] 3.8 Add translated values for the 3 keys to `messages_tr.properties`: `vets.filter.label=Uzmanlığa göre filtrele:`, `vets.filter.all=Tümü`, `vets.filter.none=Hiçbiri`.
- [ ] 3.9 Run `./mvnw test -Dtest=I18nPropertiesSyncTest -q` and verify it passes (both sync tests pass, confirming all 8 locale files now contain the 3 new keys).
- [ ] 3.10 In `vetList.html`, add a `<form method="get" action="/vets.html">` block inside `liatrio-card-header` (below the subtitle paragraph, above the table). The form should contain: a `<label>` using `th:text="#{vets.filter.label}"`, a `<select name="specialty">` with a first `<option value="" th:text="#{vets.filter.all}">`, then `<option th:each="s : ${listSpecialties}" th:value="${s}" th:text="${s}" th:selected="${s == specialty}">`, then a final `<option value="none" th:text="#{vets.filter.none}" th:selected="${specialty == 'none'}">`, and a `<button type="submit">` Filter button. Follow the `form-group` / `form-control` Bootstrap structure used elsewhere in the app.
- [ ] 3.11 In `vetList.html`, replace all 6 pagination link `href` expressions (currently using string interpolation like `'/vets.html?page=__${i}__'`) with Thymeleaf URL builder syntax: `@{/vets.html(page=${i}, specialty=${specialty})}`. Apply this to the page number links, First, Previous, Next, and Last links.
- [ ] 3.12 With the app running, use `agent-browser` to navigate to `http://localhost:8080/vets.html?specialty=radiology`, take a full-page screenshot, and save it to `docs/specs/10-spec-vet-specialty-filter/10-proofs/vets-filter-dropdown.png`.

---

### [ ] 4.0 E2E Playwright Tests: Specialty Filter User Journeys

#### 4.0 Proof Artifact(s)

- Test: `vet-specialty-filter.spec.ts` — `npm test` (full E2E suite) passes with all 4 new specialty filter tests and all pre-existing tests demonstrates end-to-end filter behavior including filter by specialty, filter by None, direct URL navigation, and select All
- Screenshot: `e2e-vet-filter-by-specialty.png` — captured during the test showing the filtered vet table

#### 4.0 Tasks

- [ ] 4.1 In `e2e-tests/tests/pages/vet-page.ts`, add the following helpers to `VetPage`: `specialtyFilter()` returning `this.page.locator('select[name="specialty"]')`; `filterBySpecialty(value: string)` that selects the given option value in the dropdown and clicks the Filter submit button; `selectedFilter()` returning the current value of the `<select>` element.
- [ ] 4.2 Create `e2e-tests/tests/features/vet-specialty-filter.spec.ts` with `import { test, expect } from '@fixtures/base-test'`, import `VetPage`, and open a `test.describe('Vet Specialty Filter', ...)` block following the same structure as `vet-directory.spec.ts`.
- [ ] 4.3 Add test `can filter vets by a named specialty`: open Vet Directory via `VetPage.open()`, call `filterBySpecialty("radiology")`, verify the table contains rows for "Helen Leary" and "Henry Stevens" and does not contain rows for "James Carter", "Linda Douglas", "Rafael Ortega", or "Sharon Jenkins".
- [ ] 4.4 Add test `can filter vets to show only those with no specialties`: call `filterBySpecialty("none")`, verify the table contains only "James Carter" and "Sharon Jenkins".
- [ ] 4.5 Add test `can navigate directly to a filtered URL and see correct results`: navigate directly to `http://localhost:8080/vets.html?specialty=radiology` without using the dropdown, verify the table shows Helen Leary and Henry Stevens, and verify `selectedFilter()` resolves to `"radiology"` — demonstrating the URL is shareable and the dropdown reflects the active filter.
- [ ] 4.6 Add test `can clear the filter to show all vets`: call `filterBySpecialty("")` (the "All" option with empty string value), verify all 6 seeded vets are visible in the table. Capture a screenshot using `testInfo.outputPath('e2e-vet-filter-by-specialty.png')`.
- [ ] 4.7 Run `cd e2e-tests && npm test` and verify all 4 new tests pass and all pre-existing E2E tests continue to pass. Confirm the screenshot was captured.
