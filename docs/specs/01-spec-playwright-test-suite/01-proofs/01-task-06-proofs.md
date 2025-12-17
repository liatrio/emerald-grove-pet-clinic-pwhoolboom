# 01 Proofs - Task 6.0 CI/CD Integration and Advanced Features

## CI Workflow

- Workflow file: `.github/workflows/e2e-tests.yml`
- Uploads artifacts:
  - Playwright HTML report: `e2e-tests/test-results/html-report`
  - Playwright artifacts: `e2e-tests/test-results/artifacts`
  - JUnit + JSON: `e2e-tests/test-results/junit.xml`, `e2e-tests/test-results/results.json`

## Reporting

- Generate report locally:

```bash
cd e2e-tests
npm test
npm run report
```

## Headed Mode

```bash
cd e2e-tests
npm run test:headed
```

## Accessibility

- Test: `e2e-tests/tests/a11y/home-page.a11y.test.ts`

## Documentation

- `e2e-tests/README.md`
