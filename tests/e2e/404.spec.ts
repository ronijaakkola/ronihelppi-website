import { test, expect } from '@playwright/test';

test.describe('404 Page', () => {
  test('should load successfully for non-existent routes', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await expect(page).toHaveTitle(/Page not found – Roni Helppi/);
  });

  test('should display the error heading', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    const heading = page.locator('h1', { hasText: 'Sorry, that page was not found.' });
    await expect(heading).toBeVisible();
  });

  test('should display helpful description', async ({ page }) => {
    await page.goto('/random-404-url');
    const description = page.locator('.description p');
    await expect(description).toBeVisible();
    await expect(description).toContainText('Maybe the link was incorrect');
    await expect(description).toContainText('Were you looking for one of these pages?');
  });

  test('should display navigation links with icons', async ({ page }) => {
    await page.goto('/unknown-page');

    const links = page.locator('.links');
    await expect(links).toBeVisible();

    // Check for all three links
    await expect(page.locator('.link-item a', { hasText: 'Home' })).toBeVisible();
    await expect(page.locator('.link-item a', { hasText: 'About me' })).toBeVisible();
    await expect(page.locator('.link-item a', { hasText: 'My writing' })).toBeVisible();

    // Each link should have an icon (rendered via CSS ::before pseudo-element)
    const linkItems = page.locator('.link-item');
    await expect(linkItems).toHaveCount(3);
  });

  test('should have correct link destinations', async ({ page }) => {
    await page.goto('/not-found-test');

    const homeLink = page.locator('.link-item a', { hasText: 'Home' });
    await expect(homeLink).toHaveAttribute('href', '/');

    const aboutLink = page.locator('.link-item a', { hasText: 'About me' });
    await expect(aboutLink).toHaveAttribute('href', '/about');

    const writingLink = page.locator('.link-item a', { hasText: 'My writing' });
    await expect(writingLink).toHaveAttribute('href', '/posts');
  });

  test('should navigate to home when clicking Home link', async ({ page }) => {
    await page.goto('/404-test-page');

    const homeLink = page.locator('.link-item a', { hasText: 'Home' });
    await homeLink.click();

    await expect(page).toHaveURL('/');
    await expect(page).toHaveTitle(/Roni Helppi/);
  });

  test('should navigate to about when clicking About me link', async ({ page }) => {
    await page.goto('/some-missing-page');

    const aboutLink = page.locator('.link-item a', { hasText: 'About me' });
    await aboutLink.click();

    await expect(page).toHaveURL('/about');
    await expect(page).toHaveTitle(/About – Roni Helppi/);
  });

  test('should navigate to posts when clicking My writing link', async ({ page }) => {
    await page.goto('/another-404');

    const writingLink = page.locator('.link-item a', { hasText: 'My writing' });
    await writingLink.click();

    await expect(page).toHaveURL('/posts');
    await expect(page).toHaveTitle(/Posts.*Roni Helppi/);
  });

  test('should have proper HTML structure', async ({ page }) => {
    await page.goto('/test-404');

    await expect(page.locator('main.main')).toBeVisible();
    await expect(page.locator('.layout')).toBeVisible();
    await expect(page.locator('.prose')).toBeVisible();
  });

  test('should display header navigation', async ({ page }) => {
    await page.goto('/missing-page');

    // Header should be visible with navigation links
    await expect(page.locator('.nav-link', { hasText: 'About' })).toBeVisible();
    await expect(page.locator('.nav-link', { hasText: 'Posts' })).toBeVisible();
  });

  test('should NOT show breadcrumb on 404 page', async ({ page }) => {
    await page.goto('/some-path-that-does-not-exist');

    const breadcrumb = page.locator('#breadcrumb');
    // Breadcrumb should be empty for unknown paths
    await expect(breadcrumb).toBeEmpty();

    const separator = page.locator('#breadcrumb-separator');
    await expect(separator).toBeEmpty();
  });
});
