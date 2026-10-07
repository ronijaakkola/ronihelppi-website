import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/e2e/**', // Exclude Playwright E2E tests
      '**/tests/build/**', // Exclude build tests (run separately after build)
      '**/.{idea,git,cache,output,temp}/**',
      '**/.claude/**', // Agent worktrees hold full copies of the repo
      '**/scratch/**', // Throwaway probe scripts (see TESTING.md)
      '**/test-results/**', // Playwright output
    ],
  },
});
