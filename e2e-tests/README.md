# E2E Tests (Playwright)

This folder contains end-to-end browser tests for Spring PetClinic using Playwright + TypeScript.

## Prerequisites

- Java 17+
- Node.js + npm
- (Recommended) Docker if you run DB profiles, though default H2 works fine

## Running Locally

1. Start the app (optional)

The Playwright config is set to start Spring Boot automatically via Maven:

```bash
./mvnw spring-boot:run
```

If you already have the app running, Playwright will reuse it.

1. Install dependencies

```bash
cd e2e-tests
npm ci
npx playwright install
```

Note: On some Linux distros Playwright may require additional system libraries. If browsers fail to launch, install deps via:

```bash
sudo npx playwright install-deps
```

1. Run tests

```bash
npm test
```

### Targeted runs

```bash
npm test -- --grep "Owner Management"
npm test -- --grep "Pet Management"
npm test -- --grep "Vet Directory|Visit Scheduling"
```

### Debugging

```bash
npm run test:headed
npm run test:debug
```

## Reports & Artifacts

- HTML report: `test-results/html-report/index.html`
- JUnit: `test-results/junit.xml`
- JSON: `test-results/results.json`
- Artifacts (traces/videos/screenshots on failure): `test-results/artifacts/`

Open the report:

```bash
npm run report
```

## Accessibility

A lightweight accessibility scan is available in `tests/a11y/` and uses `axe-core` injected into the page.

## CI

GitHub Actions workflow: `.github/workflows/e2e-tests.yml`

CI uploads the Playwright HTML report and artifacts as workflow run artifacts.
