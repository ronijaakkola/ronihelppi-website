import { test, expect } from '@playwright/test';

test.describe('Post Pages', () => {
  test('should load a post page successfully', async ({ page }) => {
    // Navigate to home first
    await page.goto('/');

    // Click on a post link
    const firstPostLink = page.locator('a[href^="/writing/"]').first();
    await firstPostLink.click();

    // Should be on a post page
    await expect(page).toHaveURL(/\/writing\/.+/);
  });

  test('should display post title', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/writing/"]').first().click();

    // Should have an h1 title
    const title = page.locator('h1.page-title');
    await expect(title).toBeVisible();
    await expect(title).not.toBeEmpty();
  });

  test('should display post date', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/writing/"]').first().click();

    // Should have a time element
    const time = page.locator('.post-meta time');
    await expect(time).toBeVisible();
    await expect(time).toHaveAttribute('datetime');
  });

  test('should display post content', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/writing/"]').first().click();

    // Should have content in the body
    const body = page.locator('body');
    const textContent = await body.textContent();
    expect(textContent).toBeTruthy();
    expect(textContent!.length).toBeGreaterThan(100);
  });

  test('should have back navigation link', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/writing/"]').first().click();

    // Should have the logo link back to home
    const backLink = page.locator('.logo');
    await expect(backLink).toBeVisible();
  });

  test('should navigate back to home when clicking back link', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/writing/"]').first().click();

    // Click logo to go back home
    const backLink = page.locator('.logo');
    await backLink.click();

    // Should be back on home page
    await expect(page).toHaveURL('/');
  });

  test('should render markdown content as HTML', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/writing/"]').first().click();

    // Check for HTML elements that indicate markdown was rendered
    // (paragraphs, headings, etc.)
    const paragraphs = page.locator('p');
    const count = await paragraphs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/writing/"]').first().click();

    // Check for basic meta tags
    await expect(page.locator('meta[charset]')).toBeAttached();
    await expect(page.locator('meta[name="viewport"]')).toBeAttached();
  });

  test('should format date correctly', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/writing/"]').first().click();

    // Check that datetime attribute is a valid ISO date
    const time = page.locator('.post-meta time');
    const datetime = await time.getAttribute('datetime');
    expect(datetime).toBeTruthy();

    // Should be a valid date format
    const dateObj = new Date(datetime!);
    expect(dateObj.toString()).not.toBe('Invalid Date');
  });

  test('should be accessible via direct URL', async ({ page }) => {
    // Directly navigate to a known post URL
    await page.goto('/writing/a-practical-guide-to-writing-your-own-obsidian-skills/');

    // Should load successfully
    await expect(page.locator('h1.page-title')).toBeVisible();
    await expect(page.locator('.post-meta time')).toBeVisible();
  });

  test('should display post ingress when description exists', async ({ page }) => {
    await page.goto('/writing/a-practical-guide-to-writing-your-own-obsidian-skills/');

    const ingress = page.locator('.post-ingress');
    await expect(ingress).toBeVisible();
    await expect(ingress).not.toBeEmpty();
  });
});

test.describe('Post heading anchor links', () => {
  const POST = '/writing/a-practical-guide-to-writing-your-own-obsidian-skills/';

  test('every content heading has an anchor link matching its id', async ({ page }) => {
    await page.goto(POST);

    const headings = page.locator('.prose-content :is(h1, h2, h3, h4, h5, h6)');
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const heading = headings.nth(i);
      const id = await heading.getAttribute('id');
      expect(id).toBeTruthy();

      const anchor = heading.locator('a.heading-anchor');
      await expect(anchor).toHaveAttribute('href', `#${id}`);
      // The icon is decorative, so the link must carry an accessible name.
      await expect(anchor).toHaveAttribute('aria-label', /.+/);
    }
  });

  test('anchor is hidden until the heading is hovered', async ({ page }) => {
    await page.goto(POST);

    const heading = page.locator('.prose-content h2').first();
    const anchor = heading.locator('a.heading-anchor');

    await expect(anchor).toHaveCSS('opacity', '0');
    await heading.hover();
    await expect(anchor).toHaveCSS('opacity', '1');
  });

  test('anchor is keyboard focusable and revealed on focus', async ({ page }) => {
    await page.goto(POST);

    const anchor = page.locator('.prose-content h2').first().locator('a.heading-anchor');
    await anchor.focus();

    await expect(anchor).toBeFocused();
    await expect(anchor).toHaveCSS('opacity', '1');
  });

  test('clicking an anchor updates the URL hash and scrolls to the heading', async ({ page }) => {
    await page.goto(POST);

    const heading = page.locator('.prose-content h2').nth(1);
    const id = await heading.getAttribute('id');
    await heading.locator('a.heading-anchor').click();

    await expect(page).toHaveURL(new RegExp(`#${id}$`));

    // Heading should be scrolled into view, clear of the sticky header.
    const topInViewport = await heading.evaluate(
      (el) => el.getBoundingClientRect().top,
    );
    expect(topInViewport).toBeGreaterThanOrEqual(0);
    expect(topInViewport).toBeLessThan(200);
  });

  test('clicking an anchor does not write to the clipboard', async ({ page }) => {
    await page.goto(POST);

    // Track any clipboard writes; heading anchors must never trigger one.
    await page.addInitScript(() => {
      (window as unknown as { __clipboardWrites: number }).__clipboardWrites = 0;
      if (navigator.clipboard) {
        navigator.clipboard.writeText = () => {
          (window as unknown as { __clipboardWrites: number }).__clipboardWrites++;
          return Promise.resolve();
        };
      }
    });
    await page.reload();

    await page.locator('.prose-content h2').first().locator('a.heading-anchor').click();

    const writes = await page.evaluate(
      () => (window as unknown as { __clipboardWrites: number }).__clipboardWrites,
    );
    expect(writes).toBe(0);
  });

  test('table-of-contents links resolve to real heading ids', async ({ page }) => {
    await page.goto(POST);

    const tocLinks = page.locator('.toc-link');
    const count = await tocLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const href = await tocLinks.nth(i).getAttribute('href');
      expect(href).toMatch(/^#.+/);
      await expect(page.locator(`[id="${href!.slice(1)}"]`)).toHaveCount(1);
    }
  });
});
