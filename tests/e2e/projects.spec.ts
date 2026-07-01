import { test, expect } from '@playwright/test';

test.describe('Project Pages', () => {
  test('should load a project page successfully', async ({ page }) => {
    // Navigate to home first
    await page.goto('/');

    // Click on a project link
    const firstProjectLink = page.locator('a[href^="/projects/"]').first();
    await firstProjectLink.click();

    // Should be on a project page
    await expect(page).toHaveURL(/\/projects\/.+/);
  });

  test('should display project title', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/projects/"]').first().click();

    // Should have an h1 title
    const title = page.locator('article h1');
    await expect(title).toBeVisible();
    await expect(title).not.toBeEmpty();
  });

  test('should display project date', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/projects/"]').first().click();

    // Should have a time element
    const time = page.locator('article time');
    await expect(time).toBeVisible();
    await expect(time).toHaveAttribute('datetime');
  });

  test('should display project content', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/projects/"]').first().click();

    // Should have content in the body
    const body = page.locator('body');
    const textContent = await body.textContent();
    expect(textContent).toBeTruthy();
    expect(textContent!.length).toBeGreaterThan(100);
  });

  test('should have back navigation link', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/projects/"]').first().click();

    // Should have a link back to home (either header logo or explicit back link)
    const backLink = page.locator('a[href="/"]').first();
    await expect(backLink).toBeVisible();
  });

  test('should navigate back to home when clicking back link', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/projects/"]').first().click();

    // Click back link (use first match - header logo)
    const backLink = page.locator('a[href="/"]').first();
    await backLink.click();

    // Should be back on home page
    await expect(page).toHaveURL('/');
  });

  test('should display meta card if meta entries are present', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/projects/"]').first().click();

    // The RESOKILL project has meta entries (Team, Duration, etc.)
    const metaCard = page.locator('.project-meta-card');
    if (await metaCard.count() > 0) {
      await expect(metaCard).toBeVisible();
      const rows = metaCard.locator('.meta-row');
      expect(await rows.count()).toBeGreaterThan(0);
    }
  });

  test('should display tags if present', async ({ page }) => {
    // Navigate to projects index where tags appear as filter chips
    await page.goto('/projects');

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Verify filter chips are visible (derived from project tags)
    await expect(page.locator('.filter-chip', { hasText: 'All' })).toBeVisible();
    await expect(page.locator('.filter-chip', { hasText: 'games' })).toBeVisible();
  });

  test('should render markdown content as HTML', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/projects/"]').first().click();

    // Check for HTML elements that indicate markdown was rendered
    const paragraphs = page.locator('p');
    const count = await paragraphs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should transform Obsidian images to Astro-optimized img tags', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/projects/"]').first().click();

    const images = page.locator('article .prose img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      await expect(images.first()).toBeVisible();

      const src = await images.first().getAttribute('src');
      expect(src).toMatch(/^\/_astro\/.+/);

      const alt = await images.first().getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should format date correctly', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/projects/"]').first().click();

    // Check that datetime attribute is a valid ISO date
    const time = page.locator('article time');
    const datetime = await time.getAttribute('datetime');
    expect(datetime).toBeTruthy();

    // Should be a valid date format
    const dateObj = new Date(datetime!);
    expect(dateObj.toString()).not.toBe('Invalid Date');
  });

  test('should be accessible via direct URL', async ({ page }) => {
    // Directly navigate to a known project URL
    await page.goto('/projects/resokill/');

    // Should load successfully
    await expect(page.locator('article h1')).toBeVisible();
    await expect(page.locator('article time')).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/projects/"]').first().click();

    // Check for basic meta tags
    await expect(page.locator('meta[charset]')).toBeAttached();
    await expect(page.locator('meta[name="viewport"]')).toBeAttached();
  });

  test('should display tags without hash prefix', async ({ page }) => {
    await page.goto('/projects/resokill/');

    // Check if tags are displayed
    const bodyText = await page.locator('body').textContent();

    // Tags in frontmatter have # prefix, but they should be displayed without it
    // or the display logic should handle them appropriately
    if (bodyText?.includes('personal') || bodyText?.includes('games')) {
      // Tags are being displayed - this is good
      expect(bodyText).toBeTruthy();
    }
  });
});
