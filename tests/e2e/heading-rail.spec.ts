import { test, expect } from '@playwright/test';

const WIDE = { width: 1440, height: 900 };
const NARROW = { width: 800, height: 900 };

/** Navigate to the first post from the home page. */
async function gotoFirstPost(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.locator('a[href^="/writing/"]').first().click();
  await expect(page).toHaveURL(/\/writing\/.+/);
}

/** Navigate to the first project from the projects index. */
async function gotoFirstProject(page: import('@playwright/test').Page) {
  await page.goto('/projects');
  await page.locator('a[href^="/projects/"]').first().click();
  await expect(page).toHaveURL(/\/projects\/.+/);
}

test.describe('Heading navigator rail', () => {
  test('shows on a wide viewport with one link per h2 section', async ({
    page,
  }) => {
    await page.setViewportSize(WIDE);
    await gotoFirstPost(page);

    // The rail is visible from the top of the article (it supplements the inline
    // TOC rather than replacing it).
    const rail = page.locator('[data-heading-rail]');
    await expect(rail).toBeVisible();

    const headingCount = await page.locator('.prose-content h2').count();
    expect(headingCount).toBeGreaterThan(1);
    await expect(rail.locator('.heading-rail-link')).toHaveCount(headingCount);
  });

  test('keeps the inline TOC card visible (supplements, not replaces)', async ({
    page,
  }) => {
    await page.setViewportSize(WIDE);
    await gotoFirstPost(page);

    // This fixture post uses the [toc] marker: the card and the rail coexist on
    // wide screens.
    const tocCard = page.locator('.toc-card');
    await expect(tocCard).toHaveCount(1);
    await expect(tocCard).toBeVisible();
    await expect(page.locator('[data-heading-rail]')).toBeVisible();
  });

  test('rail links resolve to real heading ids', async ({ page }) => {
    await page.setViewportSize(WIDE);
    await gotoFirstPost(page);

    const hrefs = await page
      .locator('.heading-rail-link')
      .evaluateAll((links) =>
        links.map((l) => (l as HTMLAnchorElement).getAttribute('href') ?? '')
      );

    expect(hrefs.length).toBeGreaterThan(1);
    for (const href of hrefs) {
      expect(href.startsWith('#')).toBe(true);
      const target = page.locator(`.prose-content ${href}`);
      await expect(target).toHaveCount(1);
    }
  });

  test('falls back to the inline TOC on a narrow viewport', async ({ page }) => {
    await page.setViewportSize(NARROW);
    await gotoFirstPost(page);

    await expect(page.locator('[data-heading-rail]')).toBeHidden();
    await expect(page.locator('.toc-card')).toBeVisible();
  });

  test('highlights the section currently in view', async ({ page }) => {
    await page.setViewportSize(WIDE);
    await gotoFirstPost(page);

    const links = page.locator('.heading-rail-link');

    // At the top of the article, the first section is current.
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(links.first()).toHaveAttribute('aria-current', 'location');

    // Scroll a mid-article heading just past the activation line: it becomes the
    // current section and is the only link with aria-current.
    const targetId = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('.prose-content h2'));
      const target = headings[2] as HTMLElement; // a section in the middle
      window.scrollTo(0, window.scrollY + target.getBoundingClientRect().top - 100);
      return target.id;
    });

    await expect(page.locator(`.heading-rail-link[aria-current="location"]`)).toHaveCount(1);
    await expect(page.locator(`[data-rail-link="${targetId}"]`)).toHaveAttribute(
      'aria-current',
      'location'
    );
  });

  test('activates the last section when scrolled to the bottom of the page', async ({
    page,
  }) => {
    await page.setViewportSize(WIDE);
    await gotoFirstPost(page);

    // Scroll all the way to the bottom. Even if the final section is short and
    // its heading never reaches the activation line, it must become current.
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight)
    );

    const links = page.locator('.heading-rail-link');
    await expect(links.last()).toHaveAttribute('aria-current', 'location');
    await expect(
      page.locator('.heading-rail-link[aria-current="location"]')
    ).toHaveCount(1);
  });

  test('comes after the "Copy post" button in tab order', async ({ page }) => {
    await page.setViewportSize(WIDE);
    await gotoFirstPost(page);

    // Tabbing forward from the Copy post button should reach the rail's jump
    // links, not before it.
    await page.locator('.copy-markdown-btn').focus();
    await page.keyboard.press('Tab');

    await expect(page.locator('.heading-rail-link').first()).toBeFocused();
  });

  test('expands heading text on keyboard focus (no hover required)', async ({
    page,
  }) => {
    await page.setViewportSize(WIDE);
    await gotoFirstPost(page);

    const firstText = page.locator('.heading-rail-text').first();
    // Collapsed by default: the label is clipped to zero width.
    await expect(firstText).toBeHidden();

    await page.locator('.heading-rail-link').first().focus();
    await expect(firstText).toBeVisible();
  });

  test('jumping to a section updates the URL hash', async ({ page }) => {
    await page.setViewportSize(WIDE);
    await gotoFirstPost(page);

    const secondLink = page.locator('.heading-rail-link').nth(1);
    const href = await secondLink.getAttribute('href');
    await secondLink.click();

    await expect(page).toHaveURL(new RegExp(`${href!.replace('#', '#')}$`));
    const targetId = href!.slice(1);
    await expect(page.locator(`#${targetId}`)).toBeInViewport();
  });

  test('does not render on project case studies', async ({ page }) => {
    await page.setViewportSize(WIDE);
    await gotoFirstProject(page);

    await expect(page.locator('[data-heading-rail]')).toHaveCount(0);
  });
});
