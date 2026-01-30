import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    // Check that page has a title (actual title is "Roni Helppi")
    await expect(page).toHaveTitle(/Roni Helppi/);
  });

  test('should display posts section', async ({ page }) => {
    await page.goto('/');

    // Check for posts heading
    const postsHeading = page.locator('h2', { hasText: /posts?/i });
    await expect(postsHeading).toBeVisible();
  });

  test('should display work section', async ({ page }) => {
    await page.goto('/');

    // Check for work heading
    const workHeading = page.locator('h2', { hasText: /work/i });
    await expect(workHeading).toBeVisible();
  });

  test('should have links to post pages', async ({ page }) => {
    await page.goto('/');

    // Should have at least one link to posts
    const postLinks = page.locator('a[href^="/posts/"]');
    await expect(postLinks.first()).toBeVisible();
    const count = await postLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have links to work pages', async ({ page }) => {
    await page.goto('/');

    // Should have at least one link to work
    const workLinks = page.locator('a[href^="/work/"]');
    await expect(workLinks.first()).toBeVisible();
    const count = await workLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to post page when clicking post link', async ({ page }) => {
    await page.goto('/');

    // Click the first post link
    const firstPostLink = page.locator('a[href^="/posts/"]').first();
    await firstPostLink.click();

    // Should navigate to post page
    await expect(page).toHaveURL(/\/posts\//);
  });

  test('should navigate to work page when clicking work link', async ({ page }) => {
    await page.goto('/');

    // Click the first work link
    const firstWorkLink = page.locator('a[href^="/work/"]').first();
    await firstWorkLink.click();

    // Should navigate to work page
    await expect(page).toHaveURL(/\/work\//);
  });

  test('should have proper HTML structure', async ({ page }) => {
    await page.goto('/');

    // Check for basic HTML elements
    await expect(page.locator('html')).toBeVisible();
    await expect(page.locator('head')).toBeAttached();
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have favicon', async ({ page }) => {
    await page.goto('/');

    // Check for favicon link
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toBeAttached();
  });
});
