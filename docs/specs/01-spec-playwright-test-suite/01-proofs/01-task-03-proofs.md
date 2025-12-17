# 01 Proofs - Task 3.0 Owner Management Workflow Tests

## CLI - Targeted Owner Tests

```text
> e2e-tests@1.0.0 test
> playwright test --pass-with-no-tests --grep Owner Management

Running 4 tests using 4 workers

  4 passed (2.2s)
```

## Test

- `e2e-tests/tests/features/owner-management.spec.ts`

## Screenshots

- Owner search results
  - `docs/specs/01-spec-playwright-test-suite/01-proofs/artifacts/owner-search-results.png`
- New owner form filled
  - `docs/specs/01-spec-playwright-test-suite/01-proofs/artifacts/new-owner-form-filled.png`
- Owner details after edit
  - `docs/specs/01-spec-playwright-test-suite/01-proofs/artifacts/owner-details-after-edit.png`
