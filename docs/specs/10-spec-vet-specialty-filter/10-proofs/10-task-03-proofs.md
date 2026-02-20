# Spec 10 — Task 3.0 Proof Artifacts

## Task: Template and i18n: Filter Dropdown, Pagination Links, and Message Keys

---

## New i18n Keys (4 keys × 8 locale files)

Keys added to `messages.properties` and all 7 locale files:

| Key | English |
|---|---|
| `vets.filter.label` | Filter by specialty: |
| `vets.filter.all` | All |
| `vets.filter.none` | None |
| `vets.filter.button` | Filter |

Note: `vets.filter.button` was added in addition to the 3 spec-specified keys because
`I18nPropertiesSyncTest.checkNonInternationalizedStrings` enforces that all button text
in templates must be referenced via `th:text="#{...}"`.

---

## Template Changes

Filter form added to `vetList.html` inside `liatrio-card-header`, below the subtitle:

```html
<form method="get" action="/vets.html" class="form-inline mt-2">
  <div class="form-group">
    <label for="specialty" th:text="#{vets.filter.label}" class="mr-2">Filter by specialty:</label>
    <select id="specialty" name="specialty" class="form-control form-control-sm mr-2">
      <option value="" th:text="#{vets.filter.all}" th:selected="${specialty == ''}">All</option>
      <option th:each="s : ${listSpecialties}" th:value="${s}" th:text="${s}"
        th:selected="${s == specialty}"></option>
      <option value="none" th:text="#{vets.filter.none}" th:selected="${specialty == 'none'}">None</option>
    </select>
    <button type="submit" class="btn btn-primary btn-sm" th:text="#{vets.filter.button}">Filter</button>
  </div>
</form>
```

Pagination links updated to Thymeleaf `@{}` URL builder (was string interpolation):

```html
<!-- Before -->
<a th:href="@{'/vets.html?page=__${i}__'}">

<!-- After -->
<a th:href="@{/vets.html(page=${i}, specialty=${specialty})}">
```

All 6 pagination link expressions (page numbers, First, Previous, Next, Last) updated.

---

## Screenshot

`vets-filter-dropdown.png` — `http://localhost:8080/vets.html?specialty=radiology`

Shows: "Filter by specialty:" label, dropdown with "radiology" selected, Filter button,
and table filtered to Helen Leary and Henry Stevens only.

---

## CLI Output

```bash
./mvnw test -Dtest="VetControllerTests,ClinicServiceTests,I18nPropertiesSyncTest"
```

```text
Tests run: 6, Failures: 0, Errors: 0, Skipped: 0  -- VetControllerTests
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0  -- I18nPropertiesSyncTest
Tests run: 18, Failures: 0, Errors: 0, Skipped: 0  -- ClinicServiceTests

Tests run: 26, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```
