import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Wait for cascade animations to complete (max 640ms: 400ms duration + 240ms delay)
const ANIMATION_WAIT = 700;

test.describe('Accessibility', () => {
  test('home page should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    // Wait for cascade animations to complete to avoid false contrast failures
    await page.waitForTimeout(ANIMATION_WAIT);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('about page should have no accessibility violations', async ({ page }) => {
    await page.goto('/about');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('posts listing should have no accessibility violations', async ({ page }) => {
    await page.goto('/posts');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('work listing should have no accessibility violations', async ({ page }) => {
    await page.goto('/work');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('individual post page should have no accessibility violations', async ({
    page,
  }) => {
    // Navigate to posts and get a real post URL
    await page.goto('/');
    const postLink = page.locator('a[href^="/posts/"]').first();
    const href = await postLink.getAttribute('href');
    expect(href).toBeTruthy();

    await page.goto(href!);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('individual work page should have no accessibility violations', async ({
    page,
  }) => {
    // Navigate to work and get a real work URL
    await page.goto('/');
    const workLink = page.locator('a[href^="/work/"]').first();
    const href = await workLink.getAttribute('href');
    expect(href).toBeTruthy();

    await page.goto(href!);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('404 page should have no accessibility violations', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('contact page should have no accessibility violations', async ({
    page,
  }) => {
    await page.goto('/contact');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
