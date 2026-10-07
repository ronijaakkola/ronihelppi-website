// Only rules that enforce CODING_STANDARDS.md patterns; no presets.
import tsParser from '@typescript-eslint/parser';
import reactRefresh from 'eslint-plugin-react-refresh';
import vitest from '@vitest/eslint-plugin';
import playwright from 'eslint-plugin-playwright';

export default [
  { ignores: ['.claude/', 'dist/', '.astro/', 'test-results/', 'playwright-report/'] },
  {
    // Component modules export only components; helpers live in a sibling .ts (#134).
    files: ['**/*.tsx'],
    languageOptions: { parser: tsParser },
    plugins: { 'react-refresh': reactRefresh },
    rules: { 'react-refresh/only-export-components': 'error' },
  },
  // Assertions hold regardless of how much content exists (#117).
  {
    files: ['**/*.test.ts'],
    languageOptions: { parser: tsParser },
    plugins: { vitest },
    rules: { 'vitest/no-conditional-expect': 'error' },
  },
  {
    files: ['tests/e2e/**/*.spec.ts'],
    languageOptions: { parser: tsParser },
    plugins: { playwright },
    rules: { 'playwright/no-conditional-expect': 'error' },
  },
];
