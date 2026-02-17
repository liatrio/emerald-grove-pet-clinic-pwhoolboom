# Task 3.0 Proof — Playwright E2E CSV Download Verification

## Summary

A new Playwright test `owner-csv-export.spec.ts` was created. It uses the `request` API
fixture to make a real HTTP GET to `/owners.csv` against the running Spring Boot application
and asserts that the response status is 200, the `Content-Type` header contains `text/csv`,
and the body contains the expected header row.

## Test File

`e2e-tests/tests/features/owner-csv-export.spec.ts`

## Test Run

Command: `cd e2e-tests && npm test -- --grep "Owner CSV Export"`

```text
> e2e-tests@1.0.0 test
> playwright test --pass-with-no-tests --grep Owner CSV Export

Running 1 test using 1 worker

[chromium] › tests/features/owner-csv-export.spec.ts:4:3
  › Owner CSV Export
    › GET /owners.csv returns text/csv with header row

  1 passed (3.7s)
```

## Assertions Validated

| Assertion | Result |
|---|---|
| `response.status()` equals 200 | PASS |
| `content-type` header contains `text/csv` | PASS |
| Body contains `id,firstName,lastName,address,city,telephone` | PASS |

## Node.js Version Note

The E2E suite requires Node.js ≥ 18.19. Tests were run with Node v20.18.2 (via nvm).
The system default is v18.18.2 (one patch below the minimum). This is a local environment
detail and does not affect the test result or the endpoint correctness.
