import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    // Check that page has a title (actual title is "Roni Helppi")
    await expect(page).toHaveTitle(/Roni Helppi/);
  });

  test('should display writing section', async ({ page }) => {
    await page.goto('/');

    // Check for writing heading
    const writingHeading = page.locator('h2', { hasText: /writing/i });
    await expect(writingHeading).toBeVisible();
  });

  test('should display projects section', async ({ page }) => {
    await page.goto('/');

    // Check for projects heading
    const projectsHeading = page.locator('h2', { hasText: /projects/i });
    await expect(projectsHeading).toBeVisible();
  });

  test('should have links to post pages', async ({ page }) => {
    await page.goto('/');

    // Should have at least one link to posts
    const postLinks = page.locator('a[href^="/writing/"]');
    await expect(postLinks.first()).toBeVisible();
    const count = await postLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have links to project pages', async ({ page }) => {
    await page.goto('/');

    // Should have at least one link to projects
    const projectLinks = page.locator('a[href^="/projects/"]');
    await expect(projectLinks.first()).toBeVisible();
    const count = await projectLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to post page when clicking post link', async ({ page }) => {
    await page.goto('/');

    // Click the first post link
    const firstPostLink = page.locator('a[href^="/writing/"]').first();
    await firstPostLink.click();

    // Should navigate to post page
    await expect(page).toHaveURL(/\/writing\//);
  });

  test('should navigate to project page when clicking project link', async ({ page }) => {
    await page.goto('/');

    // Click the first project link
    const firstProjectLink = page.locator('a[href^="/projects/"]').first();
    await firstProjectLink.click();

    // Should navigate to project page
    await expect(page).toHaveURL(/\/projects\//);
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

  test('should show breadcrumb when navigating to section page', async ({ page }) => {
    await page.goto('/');

    // No breadcrumb on home
    const breadcrumb = page.locator('#breadcrumb');
    await expect(breadcrumb).toBeEmpty();

    // Navigate to posts section
    const firstPostLink = page.locator('a[href^="/writing/"]').first();
    await firstPostLink.click();

    // Wait for navigation and animation
    await page.waitForURL(/\/writing\//);

    // Breadcrumb should show "Posts" (allow time for scramble animation)
    await expect(breadcrumb).toHaveText('Writing', { timeout: 2000 });

    // Separator should be visible
    const separator = page.locator('#breadcrumb-separator');
    await expect(separator).toHaveText('/');
  });

  test('should hide breadcrumb when navigating back to home', async ({ page }) => {
    // Start on home and navigate to a post first
    await page.goto('/');

    // Navigate to a post
    const firstPostLink = page.locator('a[href^="/writing/"]').first();
    await firstPostLink.click();
    await page.waitForURL(/\/writing\//);

    const breadcrumb = page.locator('#breadcrumb');
    await expect(breadcrumb).toHaveText('Writing', { timeout: 2000 });

    // Navigate home via logo
    await page.locator('.logo').click();
    await page.waitForURL('/');

    // Breadcrumb should be empty (allow time for animation)
    await expect(breadcrumb).toBeEmpty({ timeout: 2000 });
  });
});
