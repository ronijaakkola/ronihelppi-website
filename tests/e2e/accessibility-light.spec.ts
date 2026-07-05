import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Wait for cascade animations to complete (max 640ms: 400ms duration + 240ms delay)
const ANIMATION_WAIT = 700;

// Force the light theme before any page script runs, so the inline theme init
// applies it before first paint — exactly as it would for a returning visitor.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('theme', 'light');
    } catch (e) {
      /* ignore */
    }
  });
});

test.describe('Accessibility (light theme)', () => {
  test('home page should have no violations in light mode', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.waitForTimeout(ANIMATION_WAIT);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('about page should have no violations in light mode', async ({ page }) => {
    await page.goto('/about');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('projects listing should have no violations in light mode', async ({ page }) => {
    await page.goto('/projects');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('post page (with code block) should have no violations in light mode', async ({ page }) => {
    await page.goto('/');
    const postLink = page.locator('a[href^="/writing/"]').first();
    const href = await postLink.getAttribute('href');
    expect(href).toBeTruthy();

    await page.goto(href!);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('contact page should have no violations in light mode', async ({ page }) => {
    await page.goto('/contact');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
