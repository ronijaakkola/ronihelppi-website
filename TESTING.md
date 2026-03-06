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

## Test Structure

```
├── src/
│   ├── utils/
│   │   ├── remark-obsidian-images.test.ts    # Remark plugin tests
│   │   ├── sortByDate.test.ts                # Date sorting tests
│   │   ├── readTime.test.ts                  # Read time calculation tests
│   │   └── title.test.ts                     # Title extraction tests
│   └── content/
│       └── config.test.ts                    # Content schema tests
└── tests/
    ├── build/
    │   └── output.test.ts                    # Build validation tests
    └── e2e/
        ├── home.spec.ts                      # Home page E2E tests
        ├── about.spec.ts                     # About page E2E tests
        ├── writing.spec.ts                    # Writing pages E2E tests
        ├── writing-breadcrumb.spec.ts        # Breadcrumb navigation tests
        ├── projects.spec.ts                   # Project pages E2E tests
        ├── 404.spec.ts                       # Error page tests
        ├── accessibility.spec.ts             # Accessibility tests (axe-core)
        └── mobile.spec.ts                    # Mobile/tablet viewport tests
```

## What's Tested

### Unit Tests (76 tests)
- **Remark Plugin** (16 tests): Obsidian image syntax transformation
- **Content Schemas** (31 tests): Zod schema validation for posts and projects collections
- **Utility Functions** (29 tests): sortByDate, readTime, title extraction

### Build Validation Tests (16 tests)
- HTML structure and file generation
- Dynamic route generation for posts and projects
- Image path validation
- DOCTYPE and tag closure validation

### E2E Tests (76 tests)
- **Home Page** (11 tests): Navigation, content display, breadcrumb behavior
- **About Page** (12 tests): Content sections, responsive table layout
- **Post Pages** (11 tests): Post rendering, dates, markdown, back navigation
- **Project Pages** (15 tests): Project rendering, images, tags, team info
- **404 Page** (9 tests): Error page display and navigation
- **Breadcrumb** (3 tests): Navigation state across pages
- **Accessibility** (8 tests): WCAG compliance via axe-core on all pages
- **Mobile/Tablet** (8 tests): Responsive layout validation at 375px and 768px viewports

## Testing Flow

| Stage | What Runs | Purpose |
|-------|-----------|---------|
| **Commit** | Type check + Unit tests | Fast feedback, catch obvious errors |
| **Push to master** | Full CI (type check, unit, build, E2E, Lighthouse) | Quality gate before deployment |

## CI/CD

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push to master:

1. **test** job: Type checking, unit tests, build, build validation tests, E2E tests
2. **lighthouse** job (after test passes): Lighthouse CI quality validation
3. **deploy** job (future, after lighthouse passes): GitHub Pages deployment

### Lighthouse CI

Lighthouse CI enforces quality standards on every push to master:

- **Performance**: >= 90/100 (threshold accommodates CI variance)
- **Accessibility**: 100/100
- **Best Practices**: 100/100
- **SEO**: 100/100

Configuration is in `lighthouserc.json`.

## Pre-commit Hook

The pre-commit hook (via Husky) runs before every commit:

```bash
npm run check && npm test
```

This ensures type errors and unit test failures are caught before commits.

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

## Notes

- E2E tests require the project to be built first (`npm run build`)
- Playwright tests run against the preview server (`npm run preview`)
- Vitest excludes the `tests/e2e/` directory to avoid conflicts with Playwright
- Accessibility tests wait 700ms for cascade animations to complete
- Mobile tests use viewport sizes: 375x667 (phone), 768x1024 (tablet)
- All tests run in CI before deployment
- CI only runs on pushes to master (pre-commit hook handles local validation)
