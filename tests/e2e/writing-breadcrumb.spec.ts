import { test, expect } from '@playwright/test';

test('breadcrumb should show when directly visiting /writing', async ({ page }) => {
  await page.goto('/writing');

  // Wait for page to load and JavaScript to execute
  await page.waitForLoadState('networkidle');

  const breadcrumb = page.locator('#breadcrumb');
  const separator = page.locator('#breadcrumb-separator');

  // Allow time for the scramble animation
  await expect(breadcrumb).toHaveText('Writing', { timeout: 3000 });
  await expect(separator).toHaveText('/');
});

test('breadcrumb should show when navigating from post to /writing', async ({ page }) => {
  // Start at a post page
  await page.goto('/writing/digital-tangibleness');
  await page.waitForLoadState('networkidle');

  const breadcrumb = page.locator('#breadcrumb');
  const separator = page.locator('#breadcrumb-separator');

  // Verify breadcrumb shows "Writing"
  await expect(breadcrumb).toHaveText('Writing', { timeout: 3000 });

  // Click breadcrumb to navigate to /writing
  await breadcrumb.click();
  await page.waitForURL('/writing');

  // Breadcrumb should still show "Writing"
  await expect(breadcrumb).toHaveText('Writing', { timeout: 3000 });
  await expect(separator).toHaveText('/');
});

test('breadcrumb should show when clicking Writing nav link', async ({ page }) => {
  // Start at home
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Click Writing nav link
  await page.locator('a.nav-link', { hasText: 'Writing' }).click();
  await page.waitForURL('/writing');

  const breadcrumb = page.locator('#breadcrumb');
  const separator = page.locator('#breadcrumb-separator');

  // Breadcrumb should show "Writing"
  await expect(breadcrumb).toHaveText('Writing', { timeout: 3000 });
  await expect(separator).toHaveText('/');
});
