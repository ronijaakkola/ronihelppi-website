import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Astro 7 moves `astro preview` to the background when it detects an AI agent,
  // so the command exits at once and Playwright reports "exited early". The env
  // var keeps it in the foreground, owned by Playwright. A server Playwright did
  // not start may be serving an old dist/ (or another worktree's), so it is
  // never reused: a busy port fails the run instead.
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    env: { ASTRO_PREVIEW_BACKGROUND: '1' },
    reuseExistingServer: false,
  },
});
