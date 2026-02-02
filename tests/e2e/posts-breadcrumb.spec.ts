import { test, expect } from '@playwright/test';

test('breadcrumb should show when directly visiting /posts', async ({ page }) => {
  await page.goto('/posts');

  // Wait for page to load and JavaScript to execute
  await page.waitForLoadState('networkidle');

  const breadcrumb = page.locator('#breadcrumb');
  const separator = page.locator('#breadcrumb-separator');

  // Allow time for the scramble animation
  await expect(breadcrumb).toHaveText('Posts', { timeout: 3000 });
  await expect(separator).toHaveText('/');
});

test('breadcrumb should show when navigating from post to /posts', async ({ page }) => {
  // Start at a post page
  await page.goto('/posts/digital-tangibleness');
  await page.waitForLoadState('networkidle');

  const breadcrumb = page.locator('#breadcrumb');
  const separator = page.locator('#breadcrumb-separator');

  // Verify breadcrumb shows "Posts"
  await expect(breadcrumb).toHaveText('Posts', { timeout: 3000 });

  // Click breadcrumb to navigate to /posts
  await breadcrumb.click();
  await page.waitForURL('/posts');

  // Breadcrumb should still show "Posts"
  await expect(breadcrumb).toHaveText('Posts', { timeout: 3000 });
  await expect(separator).toHaveText('/');
});

test('breadcrumb should show when clicking Posts nav link', async ({ page }) => {
  // Start at home
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Click Posts nav link
  await page.locator('a.nav-link', { hasText: 'Posts' }).click();
  await page.waitForURL('/posts');

  const breadcrumb = page.locator('#breadcrumb');
  const separator = page.locator('#breadcrumb-separator');

  // Breadcrumb should show "Posts"
  await expect(breadcrumb).toHaveText('Posts', { timeout: 3000 });
  await expect(separator).toHaveText('/');
});
