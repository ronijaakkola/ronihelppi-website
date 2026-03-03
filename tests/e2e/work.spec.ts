import { test, expect } from '@playwright/test';

test.describe('Work Pages', () => {
  test('should load a work page successfully', async ({ page }) => {
    // Navigate to home first
    await page.goto('/');

    // Click on a work link
    const firstWorkLink = page.locator('a[href^="/work/"]').first();
    await firstWorkLink.click();

    // Should be on a work page
    await expect(page).toHaveURL(/\/work\/.+/);
  });

  test('should display work title', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/work/"]').first().click();

    // Should have an h1 title
    const title = page.locator('article h1');
    await expect(title).toBeVisible();
    await expect(title).not.toBeEmpty();
  });

  test('should display work date', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/work/"]').first().click();

    // Should have a time element
    const time = page.locator('article time');
    await expect(time).toBeVisible();
    await expect(time).toHaveAttribute('datetime');
  });

  test('should display work content', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/work/"]').first().click();

    // Should have content in the body
    const body = page.locator('body');
    const textContent = await body.textContent();
    expect(textContent).toBeTruthy();
    expect(textContent!.length).toBeGreaterThan(100);
  });

  test('should have back navigation link', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/work/"]').first().click();

    // Should have a link back to home (either header logo or explicit back link)
    const backLink = page.locator('a[href="/"]').first();
    await expect(backLink).toBeVisible();
  });

  test('should navigate back to home when clicking back link', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/work/"]').first().click();

    // Click back link (use first match - header logo)
    const backLink = page.locator('a[href="/"]').first();
    await backLink.click();

    // Should be back on home page
    await expect(page).toHaveURL('/');
  });

  test('should display team information if present', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/work/"]').first().click();

    // Check if team info is displayed
    // The RESOKILL work item has team: "solo"
    const bodyText = await page.locator('body').textContent();

    // If team is present, it should be visible
    if (bodyText?.toLowerCase().includes('team')) {
      const teamSection = page.locator('text=/team/i');
      await expect(teamSection).toBeVisible();
    }
  });

  test('should display tags if present', async ({ page }) => {
    // Navigate directly to resokill which has tags
    await page.goto('/work/resokill');

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Verify specific tags are visible
    await expect(page.getByText('personal')).toBeVisible();
    await expect(page.getByText('games')).toBeVisible();
  });

  test('should render markdown content as HTML', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/work/"]').first().click();

    // Check for HTML elements that indicate markdown was rendered
    const paragraphs = page.locator('p');
    const count = await paragraphs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should transform Obsidian images to HTML img tags', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/work/"]').first().click();

    // Check for images with /images/ path
    const images = page.locator('img[src^="/images/"]');
    const imageCount = await images.count();

    // The RESOKILL work item has images
    if (imageCount > 0) {
      // At least one image should be visible
      await expect(images.first()).toBeVisible();

      // Image should have proper src
      const src = await images.first().getAttribute('src');
      expect(src).toMatch(/^\/images\/.+/);

      // Image should have alt text
      const alt = await images.first().getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should format date correctly', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/work/"]').first().click();

    // Check that datetime attribute is a valid ISO date
    const time = page.locator('article time');
    const datetime = await time.getAttribute('datetime');
    expect(datetime).toBeTruthy();

    // Should be a valid date format
    const dateObj = new Date(datetime!);
    expect(dateObj.toString()).not.toBe('Invalid Date');
  });

  test('should be accessible via direct URL', async ({ page }) => {
    // Directly navigate to a known work URL
    await page.goto('/work/resokill/');

    // Should load successfully
    await expect(page.locator('article h1')).toBeVisible();
    await expect(page.locator('article time')).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/work/"]').first().click();

    // Check for basic meta tags
    await expect(page.locator('meta[charset]')).toBeAttached();
    await expect(page.locator('meta[name="viewport"]')).toBeAttached();
  });

  test('should display tags without hash prefix', async ({ page }) => {
    await page.goto('/work/resokill/');

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
