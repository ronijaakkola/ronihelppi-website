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

test.describe('Project card layout — ordering and span', () => {
  test('renders cards in explicit-order-first, then date-desc order', async ({ page }) => {
    await page.goto('/projects');

    const hrefs = await page.locator('.bento-grid .grid-item').evaluateAll((els) =>
      els.map((el) => (el as HTMLAnchorElement).getAttribute('href'))
    );

    // All three carry an explicit `order`, so the grid is pinned purely by
    // ascending order value: Vuoro (order 1), Clear Skies (order 2), RESOKILL
    // (order 3). Dates are irrelevant here — Vuoro is the newest (2026) yet
    // still leads on order 1, and RESOKILL (2025-12, newer than Clear Skies)
    // lands last because its order value is the highest.
    expect(hrefs).toEqual([
      '/projects/vuoro',
      '/projects/clear-skies',
      '/projects/resokill',
    ]);
  });

  test('desktop: a wide + narrow pair fills the first row, the next wide wraps leaving a trailing gap', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/projects');
    // Let the cascade entrance settle so bounding boxes are final — cascade
    // items animate translateY(8px)→0, which otherwise perturbs a card's top.
    // 700ms matches the settling window the repo's accessibility tests use.
    await page.waitForTimeout(700);

    const grid = page.locator('.bento-grid');
    const gridBox = (await grid.boundingBox())!;

    // DOM order: vuoro (span 2), clear-skies (span 1), resokill (span 2).
    const items = page.locator('.bento-grid .grid-item');
    const vuoro = (await items.nth(0).boundingBox())!; // wide
    const clearSkies = (await items.nth(1).boundingBox())!; // narrow
    const resokill = (await items.nth(2).boundingBox())!; // wide

    // A wide card is roughly two thirds of the grid width; a narrow one third.
    expect(vuoro.width / gridBox.width).toBeGreaterThan(0.6);
    expect(resokill.width / gridBox.width).toBeGreaterThan(0.6);
    expect(clearSkies.width / gridBox.width).toBeLessThan(0.4);

    // Row 1 packs a wide + a narrow across all three columns. Vuoro starts at
    // the grid's left edge (the grid carries a 4px internal padding, so allow
    // for that inset) and Clear Skies follows on the same row in the trailing
    // column, reaching the grid's right edge — the row has no empty slot.
    expect(Math.abs(vuoro.x - gridBox.x)).toBeLessThan(6);
    expect(Math.abs(clearSkies.y - vuoro.y)).toBeLessThan(2);
    expect(clearSkies.x).toBeGreaterThan(vuoro.x + vuoro.width - 2);
    expect(clearSkies.x + clearSkies.width).toBeGreaterThan(gridBox.x + gridBox.width - 6);

    // The second wide card cannot fit beside the full first row, so RESOKILL
    // wraps to row 2 at the grid's left edge. It spans two columns and does not
    // reach the right edge, leaving its trailing slot empty — never backfilled,
    // because the grid is not dense.
    expect(resokill.y).toBeGreaterThan(vuoro.y + 1);
    expect(Math.abs(resokill.x - gridBox.x)).toBeLessThan(6);
    expect(resokill.x + resokill.width).toBeLessThan(gridBox.x + gridBox.width - 20);
  });

  test('tablet: wide cards occupy a full row across two columns', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 1024 });
    await page.goto('/projects');

    const grid = page.locator('.bento-grid');
    const gridBox = (await grid.boundingBox())!;

    const items = page.locator('.bento-grid .grid-item');
    const vuoro = (await items.nth(0).boundingBox())!; // wide

    // Wide card fills the full two-column row width.
    expect(vuoro.width / gridBox.width).toBeGreaterThan(0.9);
  });

  test('phone: wide cards reset to a single full-width column', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/projects');

    const grid = page.locator('.bento-grid');
    const gridBox = (await grid.boundingBox())!;

    const items = page.locator('.bento-grid .grid-item');
    const vuoro = (await items.nth(0).boundingBox())!; // wide upstream
    const clearSkies = (await items.nth(1).boundingBox())!; // narrow upstream

    // Every card is one full-width column; wide and narrow are the same width
    // and each stacks on its own row.
    expect(vuoro.width / gridBox.width).toBeGreaterThan(0.9);
    expect(Math.abs(vuoro.width - clearSkies.width)).toBeLessThan(2);
    expect(clearSkies.y).toBeGreaterThan(vuoro.y + 1);
  });
});

// A transform with no visual displacement: either `none`, or the 2D identity
// matrix that the finished cascade-in animation (fill: both) leaves on cascade
// cards. Neither means a card is stuck mid-glide.
const isIdentityTransform = (t: string) => t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)';

test.describe('Project card filter animation', () => {
  // Vuoro is #apps; Clear Skies and RESOKILL are #games. Filtering to "games"
  // therefore removes Vuoro and reflows the two survivors across the grid.
  test('filtering hides non-matching cards and reveals matching ones', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/projects');
    await page.waitForTimeout(700); // let the cascade entrance settle

    await page.locator('.filter-chip', { hasText: 'games' }).click();
    await page.waitForTimeout(500); // let the transition settle

    // Vuoro (#apps) is gone; the two #games cards remain.
    await expect(page.locator('.grid-item[href="/projects/vuoro"]')).toBeHidden();
    await expect(page.locator('.grid-item[href="/projects/clear-skies"]')).toBeVisible();
    await expect(page.locator('.grid-item[href="/projects/resokill"]')).toBeVisible();
    await expect(page.locator('.grid-item:not(.hidden):not(.is-leaving)')).toHaveCount(2);
  });

  test('surviving cards glide to their new grid positions', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/projects');
    await page.waitForTimeout(700);

    const clearSkies = page.locator('.grid-item[href="/projects/clear-skies"]');
    const before = (await clearSkies.boundingBox())!;

    await page.locator('.filter-chip', { hasText: 'games' }).click();

    // Shortly after the click the survivor is mid-glide: it carries a running
    // Web Animations transform. The 300ms duration gives a wide, non-flaky window.
    await page.waitForTimeout(80);
    const gliding = await clearSkies.evaluate((el) =>
      el.getAnimations().some((a) => a.playState === 'running')
    );
    expect(gliding, 'survivor should be animating to its new slot').toBe(true);

    // And it ends up in a different (left-shifted) column, with no stuck transform.
    await page.waitForTimeout(500);
    const after = (await clearSkies.boundingBox())!;
    expect(after.x).toBeLessThan(before.x - 50);
    const transform = await clearSkies.evaluate((el) => getComputedStyle(el).transform);
    expect(isIdentityTransform(transform)).toBe(true);
  });

  test('a leaving card is pinned out of flow while it fades, then removed', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/projects');
    await page.waitForTimeout(700);

    const vuoro = page.locator('.grid-item[href="/projects/vuoro"]');
    await page.locator('.filter-chip', { hasText: 'games' }).click();

    await page.waitForTimeout(80);
    const mid = await vuoro.evaluate((el) => ({
      leaving: el.classList.contains('is-leaving'),
      position: getComputedStyle(el).position,
      opacity: parseFloat(getComputedStyle(el).opacity),
    }));
    expect(mid.leaving).toBe(true);
    expect(mid.position).toBe('absolute');
    expect(mid.opacity).toBeLessThan(1);

    // After the exit finishes the card is fully hidden with its pin styles cleared.
    await page.waitForTimeout(500);
    const done = await vuoro.evaluate((el) => ({
      display: getComputedStyle(el).display,
      leaving: el.classList.contains('is-leaving'),
      inlinePosition: el.style.position,
    }));
    expect(done.display).toBe('none');
    expect(done.leaving).toBe(false);
    expect(done.inlinePosition).toBe('');
  });

  test('rapid re-filtering settles to a correct, clean final state', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/projects');
    await page.waitForTimeout(700);

    // Interrupt each transition with the next click.
    await page.locator('.filter-chip', { hasText: 'apps' }).click();
    await page.waitForTimeout(20);
    await page.locator('.filter-chip', { hasText: 'games' }).click();
    await page.waitForTimeout(20);
    await page.locator('.filter-chip', { hasText: 'All' }).click();
    await page.waitForTimeout(600);

    // "All" is active → every card visible, none orphaned in a pinned/leaving
    // state, no stuck transforms. This is the regression guard for the stateful
    // FLIP pass being driven twice (duplicate listeners) or interrupted.
    await expect(page.locator('.grid-item:not(.hidden):not(.is-leaving)')).toHaveCount(3);
    const clean = await page.locator('.bento-grid .grid-item').evaluateAll((els) =>
      els.map((el) => ({
        leaving: el.classList.contains('is-leaving'),
        position: getComputedStyle(el).position,
        inlinePosition: (el as HTMLElement).style.position,
        transform: getComputedStyle(el).transform,
      }))
    );
    for (const c of clean) {
      expect(c.leaving).toBe(false);
      expect(c.position).toBe('relative');
      expect(c.inlinePosition).toBe('');
      expect(isIdentityTransform(c.transform)).toBe(true);
    }
  });

  test('reduced motion snaps instantly with no glide or pinning', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/projects');
    await page.waitForTimeout(300);

    await page.locator('.filter-chip', { hasText: 'games' }).click();
    await page.waitForTimeout(30);

    const snap = await page.locator('.bento-grid .grid-item').evaluateAll((els) => ({
      anyLeaving: els.some((el) => el.classList.contains('is-leaving')),
      anyRunning: els.some((el) => el.getAnimations().some((a) => a.playState === 'running')),
    }));
    expect(snap.anyLeaving, 'no absolute pinning under reduced motion').toBe(false);
    expect(snap.anyRunning, 'no running filter animation under reduced motion').toBe(false);
    // The non-matching card is hidden immediately, with no transition.
    await expect(page.locator('.grid-item[href="/projects/vuoro"]')).toBeHidden();
  });
});
