import { test, expect } from '@playwright/test';

// Mobile viewport (iPhone SE)
test.use({ viewport: { width: 375, height: 667 } });

test.describe('Mobile Layout', () => {
  test('home page renders correctly on mobile', async ({ page }) => {
    await page.goto('/');

    // Page should load
    await expect(page).toHaveTitle(/Roni Helppi/);

    // Content should be visible
    const heroTitle = page.locator('.hero-title');
    await expect(heroTitle).toBeVisible();

    // Sections should stack vertically
    const sections = page.locator('.section');
    await expect(sections.first()).toBeVisible();
  });

  test('navigation works on mobile', async ({ page }) => {
    await page.goto('/');

    // Click on a post link
    const postLink = page.locator('a[href^="/posts/"]').first();
    await postLink.click();

    // Should navigate to post page
    await expect(page).toHaveURL(/\/posts\//);

    // Back navigation should work
    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  test('about page renders correctly on mobile', async ({ page }) => {
    await page.goto('/about');

    // Page should load
    await expect(page).toHaveTitle(/About/);

    // About heading should be visible
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('work page grid adapts to mobile', async ({ page }) => {
    await page.goto('/work');

    // Grid items should be visible
    const gridItems = page.locator('.grid-item');
    await expect(gridItems.first()).toBeVisible();

    // On mobile, grid should be single column
    // Verify by checking that grid items stack vertically
    const firstItem = await gridItems.first().boundingBox();
    const count = await gridItems.count();

    if (count > 1) {
      const secondItem = await gridItems.nth(1).boundingBox();
      // Items should be below each other (not side by side)
      expect(secondItem!.y).toBeGreaterThan(firstItem!.y);
    }
  });

  test('contact page renders correctly on mobile', async ({ page }) => {
    await page.goto('/contact');

    // Contact heading should be visible
    const heading = page.locator('h1');
    await expect(heading).toContainText('Contact');

    // Contact methods should be visible
    const email = page.locator('a[href^="mailto:"]');
    await expect(email).toBeVisible();
  });

  test('post content is readable on mobile', async ({ page }) => {
    await page.goto('/');

    // Navigate to a post
    const postLink = page.locator('a[href^="/posts/"]').first();
    await postLink.click();

    // Post title should be visible
    const title = page.locator('h1');
    await expect(title).toBeVisible();

    // Content should not overflow
    const content = page.locator('.prose-content');
    if ((await content.count()) > 0) {
      const contentBox = await content.boundingBox();
      // Content width should not exceed viewport
      expect(contentBox!.width).toBeLessThanOrEqual(375);
    }
  });

  test('filter chips are usable on mobile', async ({ page }) => {
    await page.goto('/work');

    // Filter chips should be visible and tappable
    const filterChips = page.locator('.filter-chip');
    await expect(filterChips.first()).toBeVisible();

    // Click a filter chip
    const secondChip = filterChips.nth(1);
    if ((await secondChip.count()) > 0) {
      await secondChip.click();
      await expect(secondChip).toHaveAttribute('aria-pressed', 'true');
    }
  });
});

test.describe('Tablet Layout', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('work page grid shows 2 columns on tablet', async ({ page }) => {
    await page.goto('/work');

    // Grid items should be visible
    const gridItems = page.locator('.grid-item');
    await expect(gridItems.first()).toBeVisible();

    // On tablet, first item should span 2 columns
    // But subsequent items should be 2 per row
    const count = await gridItems.count();

    if (count >= 3) {
      const secondItem = await gridItems.nth(1).boundingBox();
      const thirdItem = await gridItems.nth(2).boundingBox();

      // Items 2 and 3 should be roughly on the same row
      // (difference in Y should be small)
      if (secondItem && thirdItem) {
        const yDifference = Math.abs(secondItem.y - thirdItem.y);
        expect(yDifference).toBeLessThan(50);
      }
    }
  });
});
