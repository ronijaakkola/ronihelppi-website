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

    // Tab into the rail (a real keyboard interaction, so :focus-visible applies).
    // Focus alone must expand the label — no hover required.
    await page.locator('.copy-markdown-btn').focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('.heading-rail-link').first()).toBeFocused();
    await expect(firstText).toBeVisible();
  });

  test('collapses back to the tick lines shortly after the mouse leaves', async ({
    page,
  }) => {
    await page.setViewportSize(WIDE);
    await gotoFirstPost(page);

    const rail = page.locator('[data-heading-rail]');
    const firstText = page.locator('.heading-rail-text').first();

    // Collapsed by default.
    await expect(firstText).toBeHidden();

    // Hover the rail: it expands and the label becomes visible.
    await rail.hover();
    await expect(firstText).toBeVisible();

    // Move the pointer well away from the rail. It must collapse promptly, not
    // linger until the next click.
    await page.mouse.move(1200, 450);
    await expect(firstText).toBeHidden();
  });

  test('collapses after a mouse click on a rail link once the pointer leaves', async ({
    page,
  }) => {
    await page.setViewportSize(WIDE);
    await gotoFirstPost(page);

    const firstText = page.locator('.heading-rail-text').first();
    const secondLink = page.locator('.heading-rail-link').nth(1);

    // Expand via hover, then click a link to jump to its section (a mouse
    // interaction, so no keyboard focus ring should apply).
    await secondLink.hover();
    await expect(firstText).toBeVisible();
    await secondLink.click();

    // Pointer leaves the rail. Because the click was mouse-driven, the rail must
    // collapse rather than stay pinned open by lingering focus.
    await page.mouse.move(1200, 450);
    await expect(firstText).toBeHidden();
  });

  test('clicking a rail link activates only the target — no intermediate slide', async ({
    page,
  }) => {
    await page.setViewportSize(WIDE);
    // Force smooth scrolling on so the programmatic jump passes through the
    // intermediate sections — this is precisely the case the fix must not slide
    // the highlight through.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await gotoFirstPost(page);

    const links = page.locator('.heading-rail-link');
    const count = await links.count();
    expect(count).toBeGreaterThan(2);

    // Jump to the last section, the furthest target: a naive scroll-spy would
    // light up every heading between the top and the bottom on the way there.
    const targetIndex = count - 1;
    const targetId = await links
      .nth(targetIndex)
      .evaluate((l) => (l as HTMLElement).dataset.railLink ?? '');

    // Record every heading id that ever receives aria-current from this point on.
    await page.evaluate(() => {
      const w = window as unknown as { __activeLog: string[] };
      w.__activeLog = [];
      const rail = document.querySelector('[data-heading-rail]');
      if (!rail) return;
      const observer = new MutationObserver((records) => {
        for (const record of records) {
          const el = record.target as HTMLElement;
          if (el.getAttribute('aria-current') === 'location') {
            const id = el.getAttribute('data-rail-link');
            if (id) w.__activeLog.push(id);
          }
        }
      });
      observer.observe(rail, {
        attributes: true,
        attributeFilter: ['aria-current'],
        subtree: true,
      });
    });

    await links.nth(targetIndex).click();

    // The clicked heading becomes current immediately and remains the sole
    // active link once the smooth scroll settles.
    await expect(
      page.locator(`[data-rail-link="${targetId}"]`)
    ).toHaveAttribute('aria-current', 'location');
    await expect(
      page.locator('.heading-rail-link[aria-current="location"]')
    ).toHaveCount(1);

    // Let any (suppressed) scroll frames flush before reading the log.
    await page.waitForTimeout(600);

    const activatedOthers = await page.evaluate(() => {
      const w = window as unknown as { __activeLog: string[] };
      return [...new Set(w.__activeLog)];
    });

    // The only heading ever activated after the click is the target — no
    // intermediate section lit up during the programmatic scroll.
    expect(activatedOthers).toEqual([targetId]);
  });

  test('manual scrolling still updates the active heading after a click', async ({
    page,
  }) => {
    await page.setViewportSize(WIDE);
    await gotoFirstPost(page);

    const links = page.locator('.heading-rail-link');

    // Click a mid-article link, then let the scroll settle so suppression lifts.
    await links.nth(1).click();
    await page.waitForTimeout(600);

    // Now scroll by hand to a different section: the scroll-spy must resume.
    const targetId = await page.evaluate(() => {
      const headings = Array.from(
        document.querySelectorAll('.prose-content h2')
      );
      const target = headings[2] as HTMLElement;
      window.scrollTo(
        0,
        window.scrollY + target.getBoundingClientRect().top - 100
      );
      return target.id;
    });

    await expect(page.locator(`[data-rail-link="${targetId}"]`)).toHaveAttribute(
      'aria-current',
      'location'
    );
    await expect(
      page.locator('.heading-rail-link[aria-current="location"]')
    ).toHaveCount(1);
  });

  test('a manual scroll gesture after a click resumes the scroll-spy immediately', async ({
    page,
  }) => {
    await page.setViewportSize(WIDE);
    // Instant scrolls so the click-scroll can't fight the scroll below; the
    // suppression under test is independent of motion preference.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoFirstPost(page);

    // The reported bug: after clicking a nav link, scrolling by hand doesn't move
    // the highlight until the very bottom, because the reader's own scroll events
    // keep the click-suppression armed. The fix keys off the reader's intent — a
    // wheel/touch/scroll-key gesture must lift suppression at once — while the
    // programmatic click-scroll (which emits no such events) stays suppressed.
    //
    // Everything below runs in one synchronous pass — no rAF or timers between
    // the mutations and the reads — so the result hinges purely on whether a
    // manual-scroll gesture resumes the spy, never on idle-timeout timing.
    const result = await page.evaluate(() => {
      const activeId = () =>
        document
          .querySelector('.heading-rail-link[aria-current="location"]')
          ?.getAttribute('data-rail-link') ?? '';

      const rail = document.querySelector('[data-heading-rail]');
      const links = Array.from(
        rail?.querySelectorAll<HTMLElement>('.heading-rail-link') ?? []
      );
      const clicked = links[1];
      const clickedId = clicked.dataset.railLink ?? '';

      // Click the second section: the highlight jumps there and the scroll-spy is
      // suppressed for the click-scroll.
      clicked.click();
      const activeAfterClick = activeId();

      // Jump elsewhere the way a programmatic scroll would (no wheel/touch/key).
      // The scroll-spy update is throttled to a frame, so synchronously the
      // highlight is still on the clicked heading — suppression has had no chance
      // to be tested yet.
      const headings = Array.from(
        document.querySelectorAll<HTMLElement>('.prose-content h2')
      );
      const target = headings[3];
      const targetId = target.id;
      window.scrollTo(
        0,
        window.scrollY + target.getBoundingClientRect().top - 100
      );

      // The reader takes over with a real wheel gesture. The fix handles this
      // synchronously — lift suppression and re-evaluate the active heading — so
      // immediately afterwards the highlight tracks the section now in view.
      // Without a wheel handler the highlight stays frozen on the clicked one.
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: 20 }));
      const activeAfterGesture = activeId();

      return { clickedId, targetId, activeAfterClick, activeAfterGesture };
    });

    // The click marked its own heading active…
    expect(result.activeAfterClick).toBe(result.clickedId);
    // …and the manual gesture resumed tracking immediately, landing on the
    // section actually in view rather than freezing on the clicked heading.
    expect(result.activeAfterGesture).toBe(result.targetId);
    expect(result.activeAfterGesture).not.toBe(result.clickedId);
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
