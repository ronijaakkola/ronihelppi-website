import { test, expect } from '@playwright/test';

const html = (page: import('@playwright/test').Page) => page.locator('html');
const themeColor = (page: import('@playwright/test').Page) =>
  page.locator('meta[name="theme-color"]');

test.describe('Theme switching', () => {
  test('defaults to dark when no choice has been made', async ({ page }) => {
    await page.goto('/');
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');
    await expect(themeColor(page)).toHaveAttribute('content', '#0b0b0b');
  });

  test('toggle switches to light and updates browser theme-color', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('#theme-toggle');
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme');

    await toggle.click();

    await expect(html(page)).toHaveAttribute('data-theme', 'light');
    await expect(themeColor(page)).toHaveAttribute('content', '#f6f4f3');
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to dark theme');

    // The light background token should be applied.
    const bg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    );
    expect(bg).toBe('rgb(246, 244, 243)');
  });

  test('circular-reveal wipe stamps click-point vars and flips without errors', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');

    const toggle = page.locator('#theme-toggle');
    await toggle.click();

    // Theme still flips.
    await expect(html(page)).toHaveAttribute('data-theme', 'light');

    // The click handler stamped the reveal geometry on <html> for the CSS wipe.
    const vars = await page.evaluate(() => {
      const s = document.documentElement.style;
      return {
        x: s.getPropertyValue('--reveal-x').trim(),
        y: s.getPropertyValue('--reveal-y').trim(),
        r: s.getPropertyValue('--reveal-r').trim(),
      };
    });
    expect(vars.x).toMatch(/^[\d.]+px$/);
    expect(vars.y).toMatch(/^[\d.]+px$/);
    expect(vars.r).toMatch(/^[\d.]+px$/);
    expect(parseFloat(vars.r)).toBeGreaterThan(0);

    // The transient transition class is cleaned up once the wipe finishes.
    await expect(html(page)).not.toHaveClass(/theme-transition/);

    expect(errors).toEqual([]);
  });

  test('does not animate the theme flip under reduced motion', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();

    await page.goto('/');
    await page.locator('#theme-toggle').click();

    await expect(html(page)).toHaveAttribute('data-theme', 'light');
    // No view transition is started, so the transient class is never added.
    await expect(html(page)).not.toHaveClass(/theme-transition/);

    await context.close();
  });

  test('persists the choice across a full reload without flashing', async ({ page }) => {
    await page.goto('/');
    await page.locator('#theme-toggle').click();
    await expect(html(page)).toHaveAttribute('data-theme', 'light');

    await page.reload();

    // Applied before first paint by the inline init script.
    await expect(html(page)).toHaveAttribute('data-theme', 'light');
    await expect(themeColor(page)).toHaveAttribute('content', '#f6f4f3');
  });

  test('persists across Astro View Transitions navigation', async ({ page }) => {
    await page.goto('/');
    await page.locator('#theme-toggle').click();
    await expect(html(page)).toHaveAttribute('data-theme', 'light');

    // Client-side navigation via the header link (uses View Transitions).
    await page.locator('.nav-link', { hasText: 'About' }).click();
    await expect(page).toHaveURL(/\/about\/?$/);

    await expect(html(page)).toHaveAttribute('data-theme', 'light');
    await expect(themeColor(page)).toHaveAttribute('content', '#f6f4f3');
    // Label stays in sync after the swap.
    await expect(page.locator('#theme-toggle')).toHaveAttribute(
      'aria-label',
      'Switch to dark theme'
    );
  });
});
