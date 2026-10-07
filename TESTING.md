# Testing Documentation

This project uses a comprehensive test setup to ensure code quality, accessibility, and performance.

## Test Stack

- **Vitest** - Unit and integration tests
- **Playwright** - End-to-end browser tests
- **axe-core** - Accessibility testing
- **Lighthouse CI** - Performance, accessibility, SEO, and best practices validation
- **@astrojs/check** - TypeScript validation for Astro files

## Running Tests

```bash
# Run unit tests (excludes build validation tests)
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with UI
npm run test:ui

# Build the project
npm run build

# Run build validation tests (requires build first)
npm run test:build

# Run E2E tests (requires build first)
npx playwright test

# Run E2E tests in UI mode
npx playwright test --ui

# Run type checking
npm run check
```

**Note:** Build validation tests are excluded from the main `npm test` command because they require the project to be built first. Run them separately after building with `npm run test:build`.

## Test types

| Type | Where | Needs |
|------|-------|-------|
| Unit (Vitest) | `*.test.ts` beside the code under `src/` | nothing |
| Build validation (Vitest) | `tests/build/` | `npm run build` first; reads `dist/` |
| E2E (Playwright), incl. axe-core accessibility | `tests/e2e/*.spec.ts` | `npm run build`; Playwright starts the preview server itself (`playwright.config.ts`) |

Counts and file lists are not kept here: `git ls-files '*.test.ts' '*.spec.ts'`, `npx vitest list` and `npx playwright test --list` give the current ones.

Collection schemas (`src/content.config.ts`) have no unit tests; `astro build` and `astro check` validate them against the real content. Lab demos are covered by tests that discover every demo (`src/lab/README.md`).

## Testing Flow

| Stage | What Runs | Purpose |
|-------|-----------|---------|
| **Commit** | Type check + Unit tests | Fast feedback, catch obvious errors |
| **Pull request to master** | Type check, unit, build, build validation, E2E | Required CI gate before merge |
| **Pull request to master (optional)** | Lighthouse CI | Early signal for performance/accessibility/SEO regressions without blocking merge on flaky runs |
| **Push to master** | Type check, unit, build, build validation, E2E, deploy | Final verification before GitHub Pages deployment |

## CI/CD

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on pull requests and pushes to `master`:

1. **test** job: Type checking, unit tests, build, build validation tests, E2E tests
2. **lighthouse** job (pull requests only, optional): Lighthouse CI quality validation
3. **deploy** job (pushes to `master` only, after test passes): GitHub Pages deployment

### Branch protection

To actually stop broken E2E suites from landing on `master`, require the `test` job in GitHub branch protection for `master`. The workflow now exposes that same required test job on pull requests before merge and on pushes before deploy.

### Lighthouse CI

Lighthouse CI now runs during PR validation instead of deploy-time verification:

- **Performance**: >= 90/100 (threshold accommodates CI variance)
- **Accessibility**: 100/100
- **Best Practices**: 100/100
- **SEO**: 100/100

Configuration is in `lighthouserc.json`. Assert category scores only; the `lighthouse:recommended` preset adds strict per-audit assertions that fail on CI variance.

## Pre-commit Hook

The pre-commit hook (via Husky) runs before every commit:

```bash
npm run check && npm test
```

This ensures type errors and unit test failures are caught before commits.

## Local Gotchas

- **Preview server.** Astro 7's `astro preview` runs as a daemon and Playwright reuses it locally, so a stale or stray daemon serves old `dist/` or leaves nothing on 4321 (it may sit on 4322). After every build, run `npx astro preview stop` before `npx playwright test`; "webServer exited early" on a first run is the daemon starting, so re-run once. If your element is in `dist/*.html` but missing in the test DOM, the server is stale.
- **Markdown plugin edits** need a clean build, because the content layer caches rendered entries: `rm -rf .astro dist node_modules/.astro && npm run build`. The plugin's unit tests turn green while the built page still lags.
- **Reading results.** Judge a run by its exit code or by grepping `passed|failed|flaky`, and check that the count went up after adding a test. Chain a push after tests with `&&`, never `;`.
- **Fresh worktrees** need a real `npm ci` (Astro will not build through a symlinked `node_modules`) and `npx playwright install chromium`. Run the install again after a pull bumps Playwright.
- **Scratch scripts** that import repo dependencies (`@playwright/test`, `sharp`, `motion`) only resolve from inside the repo. Put them in `test-results/` (gitignored; the next Playwright run clears it).
- **Measure motion in headless Playwright.** A background Chrome tab is hidden, so transitions finish instantly there.
- **Vitest 5 `--reporter=json`** writes to `.vitest/json/output.json` instead of stdout; pass `--outputFile` to choose the path.

## When Tests Fail

When a test fails, **think before you act**:

1. **Diagnose first** - Read the failure message and understand what the test is asserting. Is the test catching a real bug, or is the test outdated?
2. **Fix the implementation, not the test** - The default assumption should be that the test is correct and the implementation is broken. Only update a test if:
   - You are intentionally changing behavior as part of a feature
   - The test is genuinely wrong (testing the wrong thing, flawed assertion)
   - The test is testing implementation details that legitimately changed
3. **Never silently weaken tests** - Do not lower thresholds, remove assertions, or broaden expected values just to make tests pass. If a threshold needs changing, justify it explicitly.

### Red/Green Testing for New Features

When building new features, follow the red/green approach where applicable:

1. **Red** - Write or update tests that describe the expected behavior. Run them and confirm they fail.
2. **Green** - Implement the feature until the tests pass.
3. **Refactor** - Clean up the implementation while keeping tests green.

This applies naturally to unit tests and E2E tests for well-defined behavior. Skip this for exploratory or visual work where the behavior isn't known upfront.

## Adding New Tests

### Unit Tests
Create `.test.ts` files next to the code you're testing:
```typescript
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
});
```

### E2E Tests
Create `.spec.ts` files in `tests/e2e/`:
```typescript
import { test, expect } from '@playwright/test';

test('my test', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

### Accessibility Tests
Add axe-core assertions to E2E tests:
```typescript
import AxeBuilder from '@axe-core/playwright';

test('should have no accessibility violations', async ({ page }) => {
  await page.goto('/my-page');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```
