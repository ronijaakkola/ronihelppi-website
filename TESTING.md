# Testing Documentation

This project uses a comprehensive test setup to ensure code quality and reliability.

## Test Stack

- **Vitest** - Unit and integration tests
- **Playwright** - End-to-end browser tests
- **@astrojs/check** - TypeScript validation for Astro files

## Running Tests

```bash
# Run all unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with UI
npm run test:ui

# Run type checking
npm run check

# Build the project
npm run build

# Run E2E tests (requires build first)
npx playwright test

# Run E2E tests in UI mode
npx playwright test --ui
```

## Test Structure

```
kampala/
├── src/
│   ├── utils/
│   │   └── remark-obsidian-images.test.ts    # Remark plugin tests
│   └── content/
│       └── config.test.ts                     # Content schema tests
└── tests/
    ├── build/
    │   └── output.test.ts                     # Build validation tests
    └── e2e/
        ├── home.spec.ts                       # Home page E2E tests
        ├── posts.spec.ts                      # Post pages E2E tests
        └── work.spec.ts                       # Work pages E2E tests
```

## What's Tested

### Unit Tests (56 tests)
- **Remark Plugin** (16 tests): Obsidian image syntax transformation
- **Content Schemas** (24 tests): Zod schema validation for posts and work collections
- **Build Output** (16 tests): Verifies correct HTML generation and file structure

### E2E Tests (33 tests)
- **Home Page** (9 tests): Navigation, content display, links
- **Post Pages** (10 tests): Post rendering, dates, back navigation
- **Work Pages** (14 tests): Work item rendering, images, tags, team info

## CI/CD

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and pull request:

1. Type checking (`npm run check`)
2. Unit tests (`npm test`)
3. Build (`npm run build`)
4. E2E tests (`npx playwright test`)

Tests must pass before code can be merged.

## Test Coverage

Current test coverage focuses on:
- ✅ Custom remark plugin logic (80%+ coverage)
- ✅ Content collection schemas (100% coverage)
- ✅ Build output validation
- ✅ Critical user paths in E2E tests

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

## Notes

- E2E tests require the project to be built first (`npm run build`)
- Playwright tests run against the preview server (`npm run preview`)
- Vitest excludes the `tests/e2e/` directory to avoid conflicts with Playwright
- All tests run in CI before deployment
