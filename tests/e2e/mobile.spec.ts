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

  test('every menu link, including the last, joins the entrance cascade', async ({ page }) => {
    await page.goto('/');
    await page.click('#menu-button');
    await expect(page.locator('#mobile-menu')).toHaveClass(/open/);

    const links = page.locator('.mobile-menu-link');
    const count = await links.count();
    expect(count).toBeGreaterThan(1);
    await expect(links.last()).toHaveText('Contact');

    const delays: number[] = [];
    for (let i = 0; i < count; i++) {
      delays.push(await links.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).transitionDelay)
      ));
    }

    // Every link uses the same transition, and the delays strictly increase
    // so each item lands after the one above it — Contact last of all.
    for (let i = 1; i < count; i++) {
      expect(delays[i], `link ${i} (${await links.nth(i).textContent()}) delay`).toBeGreaterThan(delays[i - 1]);
    }
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

  test('projects grid balances so no narrow card sits alone in a one-slot row', async ({ page }) => {
    await page.goto('/projects');

    const grid = page.locator('.bento-grid');
    const gridBox = (await grid.boundingBox())!;

    const gridItems = page.locator('.bento-grid .grid-item:not(.hidden)');
    await expect(gridItems.first()).toBeVisible();

    // DOM order: vuoro (wide), clear-skies (narrow), resokill (wide). The narrow
    // clear-skies card is sandwiched between two full-row wide cards, so on the
    // 2-column tablet grid it would otherwise be left alone in a one-slot row.
    // Balancing must promote it to fill the whole row while preserving order.
    const vuoro = (await gridItems.nth(0).boundingBox())!;
    const clearSkies = (await gridItems.nth(1).boundingBox())!;
    const resokill = (await gridItems.nth(2).boundingBox())!;

    // Author order is preserved: each card stacks below the previous one.
    expect(clearSkies.y).toBeGreaterThan(vuoro.y + 1);
    expect(resokill.y).toBeGreaterThan(clearSkies.y + 1);

    // Every visible card fills the full two-column row width — no one-slot row.
    expect(vuoro.width / gridBox.width).toBeGreaterThan(0.9);
    expect(clearSkies.width / gridBox.width).toBeGreaterThan(0.9);
    expect(resokill.width / gridBox.width).toBeGreaterThan(0.9);

    // The balance-promoted narrow card renders full width at tablet, so its
    // responsive `sizes` must advertise the full-width tablet clause — otherwise
    // the browser picks an undersized source for the half-width value it was
    // authored with. Clear Skies is promoted here (SSR initial render).
    const clearSkiesSizes = await gridItems.nth(1).locator('.grid-item-image').getAttribute('sizes');
    expect(clearSkiesSizes).toContain('(max-width: 960px) calc(100vw - 40px)');
    expect(clearSkiesSizes).not.toContain('calc(50vw - 32px)');
  });

  test('filtering recomputes balance so a category never strands a narrow card in a one-slot row', async ({ page }) => {
    await page.goto('/projects');

    // The "games" category shows clear-skies (narrow) followed by resokill
    // (wide). Without recomputing the balance on filter, clear-skies would sit
    // alone in a single-column row. Filtering must re-balance the visible cards.
    await page.getByRole('button', { name: /Games/ }).click();

    const visible = page.locator('.bento-grid .grid-item:not(.hidden)');
    await expect(visible).toHaveCount(2);
    // Let the filter fade/display transition settle before measuring geometry.
    await page.waitForTimeout(400);

    const grid = page.locator('.bento-grid');
    const gridBox = (await grid.boundingBox())!;

    const clearSkies = (await visible.nth(0).boundingBox())!; // narrow, now balanced
    const resokill = (await visible.nth(1).boundingBox())!; // wide

    // Both remaining cards fill the full row width; the narrow card is balanced.
    expect(clearSkies.width / gridBox.width).toBeGreaterThan(0.9);
    expect(resokill.width / gridBox.width).toBeGreaterThan(0.9);
    expect(resokill.y).toBeGreaterThan(clearSkies.y + 1);

    // The rebalanced narrow card is promoted to full width, so its tablet `sizes`
    // must be updated to the full-width clause after the filter-driven rebalance.
    const clearSkiesSizes = await visible.nth(0).locator('.grid-item-image').getAttribute('sizes');
    expect(clearSkiesSizes).toContain('(max-width: 960px) calc(100vw - 40px)');
    expect(clearSkiesSizes).not.toContain('calc(50vw - 32px)');
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

// Media cards (projects grid, Lab previews, the Lab demo stage) share one border
// strategy: the host clips the media (overflow: hidden + border-radius) and a
// dedicated `::after` overlay draws the hairline ABOVE it. Drawing the border on
// the clipping element itself let WebKit blend the media's anti-aliased clip
// edge over the 1-device-pixel stroke on high-DPR phones, so corner arcs
// vanished and fractional edges read as a doubled line.
test.describe('Card border frame', () => {
  const cards = [
    { url: '/projects', selector: '.grid-item' },
    { url: '/lab', selector: '.lab-preview' },
    { url: '/lab/sliding-tabs', selector: '.lab-shell' },
  ];

  for (const { url, selector } of cards) {
    test(`${selector} on ${url} draws exactly one border, on a non-clipping overlay`, async ({ page }) => {
      await page.goto(url);
      const card = page.locator(selector).first();
      await expect(card).toBeVisible();

      const frame = await card.evaluate((el) => {
        const host = getComputedStyle(el);
        const after = getComputedStyle(el, '::after');
        const painted = (cs: CSSStyleDeclaration) =>
          [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].some((w) => parseFloat(w) > 0) ||
          (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) ||
          cs.boxShadow.includes('inset');
        const descendantsWithEdges = Array.from(el.querySelectorAll('*')).filter((child) =>
          painted(getComputedStyle(child)),
        ).length;
        const rect = el.getBoundingClientRect();
        return {
          hostClips: host.overflow === 'hidden',
          hostPainted: painted(host),
          afterPosition: after.position,
          afterBorderWidth: parseFloat(after.borderTopWidth),
          afterRadius: after.borderTopLeftRadius,
          hostRadius: host.borderTopLeftRadius,
          afterPointerEvents: after.pointerEvents,
          descendantsWithEdges,
          x: rect.x,
          width: rect.width,
        };
      });

      // The host clips, the overlay draws — never both, and nothing inside draws an edge of its own.
      expect(frame.hostClips).toBe(true);
      expect(frame.hostPainted).toBe(false);
      expect(frame.afterPosition).toBe('absolute');
      expect(frame.afterPointerEvents).toBe('none');
      expect(frame.afterRadius).toBe(frame.hostRadius);
      expect(frame.descendantsWithEdges).toBe(0);
      // Below 960px the hairline is a whole CSS pixel (3 device pixels on a 3× phone),
      // the same rule the article boxes already follow, so a fractional edge cannot
      // thin it away.
      expect(frame.afterBorderWidth).toBe(1);
      // The card sits on whole CSS pixels horizontally, so the vertical strokes land on the device grid.
      expect(Number.isInteger(frame.x)).toBe(true);
      expect(Number.isInteger(frame.width)).toBe(true);
    });
  }
});
