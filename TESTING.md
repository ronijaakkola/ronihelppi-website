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
| **Push** | Full CI (type check, unit, build, E2E) | Comprehensive validation |
| **PR to master** | Full CI + Lighthouse CI | Quality gate with 100/100 score enforcement |
| **Merge to master** | Full CI | Final validation |

## CI/CD

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and pull request:

1. Type checking (`npm run check`)
2. Unit tests (`npm test`)
3. Build (`npm run build`)
4. Build validation tests (`npm run test:build`)
5. E2E tests (`npx playwright test`)

### Lighthouse CI (PRs to master only)

On pull requests to master, Lighthouse CI runs additionally to enforce quality standards:

- **Performance**: 100/100
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
