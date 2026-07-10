import { test, expect } from '@playwright/test';

// Mobile viewport (iPhone SE)
test.use({ viewport: { width: 375, height: 667 } });

test.describe('Mobile Menu', () => {
  test('menu button is visible on mobile', async ({ page }) => {
    await page.goto('/');
    const menuButton = page.locator('#menu-button');
    await expect(menuButton).toBeVisible();
  });

  test('theme toggle is visible in the top row next to the menu button', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('#theme-toggle');
    const menuButton = page.locator('#menu-button');

    // Both live in the top header row without opening the menu.
    await expect(toggle).toBeVisible();
    await expect(menuButton).toBeVisible();

    // The toggle sits immediately to the left of the menu button on the same row.
    const toggleBox = await toggle.boundingBox();
    const menuBox = await menuButton.boundingBox();
    expect(toggleBox).not.toBeNull();
    expect(menuBox).not.toBeNull();
    // Same row (vertical centres roughly aligned).
    expect(Math.abs(
      (toggleBox!.y + toggleBox!.height / 2) - (menuBox!.y + menuBox!.height / 2)
    )).toBeLessThan(8);
    // Toggle is left of the menu button.
    expect(toggleBox!.x).toBeLessThan(menuBox!.x);
  });

  test('top-row theme toggle switches the theme on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('opens when clicking menu button', async ({ page }) => {
    await page.goto('/');
    await page.click('#menu-button');
    await expect(page.locator('#mobile-menu')).toHaveClass(/open/);
  });

  test('closes when clicking close button', async ({ page }) => {
    await page.goto('/');
    await page.click('#menu-button');
    await expect(page.locator('#mobile-menu')).toHaveClass(/open/);
    await page.click('#menu-button');
    await expect(page.locator('#mobile-menu')).not.toHaveClass(/open/);
  });

  test('closes when pressing Escape', async ({ page }) => {
    await page.goto('/');
    await page.click('#menu-button');
    await expect(page.locator('#mobile-menu')).toHaveClass(/open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-menu')).not.toHaveClass(/open/);
  });

  test('navigates and closes when clicking link', async ({ page }) => {
    await page.goto('/');
    await page.click('#menu-button');
    await page.click('.mobile-menu-link >> text=About');
    await expect(page).toHaveURL('/about');
    await expect(page.locator('#mobile-menu')).not.toHaveClass(/open/);
  });

  test('all navigation links are visible when open', async ({ page }) => {
    await page.goto('/');
    await page.click('#menu-button');

    await expect(page.locator('.mobile-menu-link >> text=About')).toBeVisible();
    await expect(page.locator('.mobile-menu-link >> text=Projects')).toBeVisible();
    await expect(page.locator('.mobile-menu-link >> text=Writing')).toBeVisible();
    await expect(page.locator('.mobile-menu-link >> text=Contact')).toBeVisible();
  });

  test('header has menu-open class when menu is open', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('.header');

    await expect(header).not.toHaveClass(/menu-open/);
    await page.click('#menu-button');
    await expect(header).toHaveClass(/menu-open/);
  });
});

test.describe('Mobile Menu Accessibility', () => {
  test('has correct aria-expanded state', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('#menu-button');

    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  test('menu has correct aria-hidden state', async ({ page }) => {
    await page.goto('/');
    const menu = page.locator('#mobile-menu');

    await expect(menu).toHaveAttribute('aria-hidden', 'true');
    await page.click('#menu-button');
    await expect(menu).toHaveAttribute('aria-hidden', 'false');
  });

  test('returns focus to button on Escape', async ({ page }) => {
    await page.goto('/');
    await page.click('#menu-button');
    await page.keyboard.press('Escape');
    await expect(page.locator('#menu-button')).toBeFocused();
  });

  test('has correct aria-label on button', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('#menu-button');

    await expect(button).toHaveAttribute('aria-label', 'Open menu');
    await button.click();
    await expect(button).toHaveAttribute('aria-label', 'Close menu');
  });
});

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
    const postLink = page.locator('a[href^="/writing/"]').first();
    await postLink.click();

    // Should navigate to post page
    await expect(page).toHaveURL(/\/writing\//);

    // Back navigation should work
    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  test('about page renders correctly on mobile', async ({ page }) => {
    await page.goto('/about');

    // Page should load
    await expect(page).toHaveTitle(/About/);

    // About heading should be visible
    const heading = page.locator('.page-title');
    await expect(heading).toBeVisible();
  });

  test('projects page grid adapts to mobile', async ({ page }) => {
    await page.goto('/projects');

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
    const heading = page.locator('.page-title');
    await expect(heading).toContainText('Contact');

    // Contact methods should be visible (email is commented out, check LinkedIn instead)
    const linkedin = page.locator('.contact-link[href*="linkedin.com"]');
    await expect(linkedin).toBeVisible();
  });

  test('post content is readable on mobile', async ({ page }) => {
    await page.goto('/');

    // Navigate to a post
    const postLink = page.locator('a[href^="/writing/"]').first();
    await postLink.click();

    // Post title should be visible
    const title = page.locator('.page-title');
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
    await page.goto('/projects');

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

  test('projects page grid is 2 columns on tablet: wide cards fill a row, narrow cards take one column', async ({ page }) => {
    await page.goto('/projects');

    const grid = page.locator('.bento-grid');
    const gridBox = (await grid.boundingBox())!;

    const gridItems = page.locator('.bento-grid .grid-item');
    await expect(gridItems.first()).toBeVisible();

    // DOM order: resokill (span 2), vuoro (span 2), clear-skies (span 1).
    const resokill = (await gridItems.nth(0).boundingBox())!; // wide
    const vuoro = (await gridItems.nth(1).boundingBox())!; // wide
    const clearSkies = (await gridItems.nth(2).boundingBox())!; // narrow

    // Each wide card fills its own full-width row and stacks vertically.
    expect(resokill.width / gridBox.width).toBeGreaterThan(0.9);
    expect(vuoro.width / gridBox.width).toBeGreaterThan(0.9);
    expect(vuoro.y).toBeGreaterThan(resokill.y + 1);

    // A narrow card occupies a single column — roughly half the grid — which is
    // the slot two narrow cards would pair into on a 2-column tablet grid.
    expect(clearSkies.width / gridBox.width).toBeLessThan(0.6);
    expect(clearSkies.width / gridBox.width).toBeGreaterThan(0.3);
  });
});

test.describe('Desktop - No Mobile Menu', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('menu button is hidden on desktop', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#menu-button')).not.toBeVisible();
  });

  test('desktop nav links are visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-links')).toBeVisible();
    await expect(page.locator('.contact-button')).toBeVisible();
  });
});
