import { test, expect } from '@playwright/test';

test.describe('Post Pages', () => {
  test('should load a post page successfully', async ({ page }) => {
    // Navigate to home first
    await page.goto('/');

    // Click on a post link
    const firstPostLink = page.locator('a[href^="/posts/"]').first();
    await firstPostLink.click();

    // Should be on a post page
    await expect(page).toHaveURL(/\/posts\/.+/);
  });

  test('should display post title', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/posts/"]').first().click();

    // Should have an h1 title
    const title = page.locator('h1.post-title');
    await expect(title).toBeVisible();
    await expect(title).not.toBeEmpty();
  });

  test('should display post date', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/posts/"]').first().click();

    // Should have a time element
    const time = page.locator('time');
    await expect(time).toBeVisible();
    await expect(time).toHaveAttribute('datetime');
  });

  test('should display post content', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/posts/"]').first().click();

    // Should have content in the body
    const body = page.locator('body');
    const textContent = await body.textContent();
    expect(textContent).toBeTruthy();
    expect(textContent!.length).toBeGreaterThan(100);
  });

  test('should have back navigation link', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/posts/"]').first().click();

    // Should have the logo link back to home
    const backLink = page.locator('.logo');
    await expect(backLink).toBeVisible();
  });

  test('should navigate back to home when clicking back link', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/posts/"]').first().click();

    // Click logo to go back home
    const backLink = page.locator('.logo');
    await backLink.click();

    // Should be back on home page
    await expect(page).toHaveURL('/');
  });

  test('should render markdown content as HTML', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/posts/"]').first().click();

    // Check for HTML elements that indicate markdown was rendered
    // (paragraphs, headings, etc.)
    const paragraphs = page.locator('p');
    const count = await paragraphs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/posts/"]').first().click();

    // Check for basic meta tags
    await expect(page.locator('meta[charset]')).toBeAttached();
    await expect(page.locator('meta[name="viewport"]')).toBeAttached();
  });

  test('should format date correctly', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/posts/"]').first().click();

    // Check that datetime attribute is a valid ISO date
    const time = page.locator('time');
    const datetime = await time.getAttribute('datetime');
    expect(datetime).toBeTruthy();

    // Should be a valid date format
    const dateObj = new Date(datetime!);
    expect(dateObj.toString()).not.toBe('Invalid Date');
  });

  test('should be accessible via direct URL', async ({ page }) => {
    // Directly navigate to a known post URL
    await page.goto('/posts/digital-tangibleness/');

    // Should load successfully
    await expect(page.locator('h1.post-title')).toBeVisible();
    await expect(page.locator('time.post-meta')).toBeVisible();
  });
});
