# Task 2.0 Proof Artifacts: Friendly 404 View Template

## Template File Created

**Location:** `src/main/resources/templates/notFound.html`

## Template Content

```html
<!DOCTYPE html>

<html xmlns:th="https://www.thymeleaf.org" th:replace="~{fragments/layout :: layout (~{::body},'error')}">

<body>
  <section class="liatrio-section">
    <div class="liatrio-error-card">
      <img src="../static/resources/images/pets.png" th:src="@{/resources/images/pets.png}"
        alt="Pets at the clinic" />
      <h2>Oops! We couldn't find that pet or owner.</h2>

      <p>Let's help you search again.</p>

      <a th:href="@{/owners/find}" class="btn btn-primary">Find Owners</a>
    </div>
  </section>
</body>

</html>
```

## Design Features

✅ **Liatrio Branding**: Uses `.liatrio-section` and `.liatrio-error-card` classes
✅ **Consistent Layout**: Uses `th:replace` with fragments/layout for consistent navigation
✅ **Friendly Message**: "Oops! We couldn't find that pet or owner."
✅ **Helpful CTA**: "Let's help you search again."
✅ **Clear Navigation**: "Find Owners" button links to `/owners/find`
✅ **Visual Consistency**: Includes pets image for brand recognition
✅ **Bootstrap Styling**: Uses `btn btn-primary` for green button with Liatrio branding

## Pattern Compliance

- Follows error.html template structure
- Uses Thymeleaf syntax for dynamic content
- Maintains consistent section and card styling
- Includes proper semantic HTML
- Accessibility: Alt text for images, semantic button element

## Visual Testing

Note: Visual testing and screenshot capture deferred to Task 4.0 (End-to-End Playwright Tests), where the application will be running and the complete user flow can be validated with automated browser testing.
