import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Lab', () => {
  test('nav links to the lab and marks it current', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav[aria-label="Main"] a[href="/lab"]').click();
    await expect(page).toHaveURL(/\/lab\/?$/);
    await expect(page.locator('nav[aria-label="Main"] a[href="/lab"]')).toHaveAttribute('aria-current', 'page');
  });

  test('lists demos with a poster-backed looping preview', async ({ page }) => {
    await page.goto('/lab');
    await expect(page.locator('h1')).toContainText('Lab');

    const items = page.locator('.lab-item');
    expect(await items.count()).toBeGreaterThan(0);

    const video = items.first().locator('video');
    await expect(video).toHaveAttribute('poster', /\/lab\/[^/]+\/poster\.webp$/);
    await expect(video).toHaveAttribute('src', /\/lab\/[^/]+\/preview\.mp4$/);
    await expect(video).toHaveAttribute('loop', '');
    await expect(video).toHaveAttribute('muted', '');
    await expect(video).not.toHaveAttribute('autoplay');

    await expect(items.first().locator('time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
  });

  test('preview plays once in view and stays still under reduced motion', async ({ page }) => {
    await page.goto('/lab');
    const video = page.locator('.lab-video').first();
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused), { timeout: 5000 }).toBe(true);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.waitForTimeout(500);
    expect(await page.locator('.lab-video').first().evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  });

  test('demo page mounts the React demo and shows source and neighbours', async ({ page }) => {
    await page.goto('/lab');
    const demoCount = await page.locator('.lab-card').count();
    const href = await page.locator('.lab-card').first().getAttribute('href');
    expect(href).toMatch(/^\/lab\/.+/);
    await page.goto(href!);

    await expect(page.locator('article h1')).not.toBeEmpty();
    await expect(page.locator('article time')).toHaveAttribute('datetime');

    const stage = page.locator('[data-lab-stage]');
    await expect(stage).toBeVisible();
    // The demo hydrates client-only; wait for real content, not the poster.
    await expect(stage.locator('button, [role="button"], canvas, svg, div').first()).toBeVisible();

    const source = page.locator('a.meta-link', { hasText: 'Source' });
    await expect(source).toHaveAttribute('href', new RegExp(`github\\.com/.+/tree/master/src${href}$`));
    await expect(source).toHaveAttribute('target', '_blank');

    // Neighbour navigation only exists once there is something to navigate to.
    const nav = page.locator('nav[aria-label="Neighbouring demos"]');
    if (demoCount > 1) {
      await expect(nav).toBeVisible();
      expect(await nav.locator('a[rel="prev"], a[rel="next"]').count()).toBeGreaterThan(0);
    } else {
      await expect(nav).toHaveCount(0);
    }
  });

  test('demo page renders the markdown write-up as prose', async ({ page }) => {
    await page.goto('/lab/sliding-tabs');
    const writeup = page.locator('.lab-writeup.prose-content');
    await expect(writeup).toBeVisible();
    await expect(writeup.locator('p').first()).toBeVisible();
    // Markdown was processed, not dumped raw: inline code is an element.
    await expect(writeup.locator('code').first()).toBeVisible();
    await expect(writeup).not.toContainText('`');
  });

  test('ships no DialKit in production', async ({ page }) => {
    await page.goto('/lab');
    const href = await page.locator('.lab-card').first().getAttribute('href');
    const scripts: string[] = [];
    page.on('response', async (res) => {
      if (res.request().resourceType() === 'script') scripts.push(await res.text().catch(() => ''));
    });
    await page.goto(href!);
    await page.locator('[data-lab-stage]').waitFor();
    await page.waitForTimeout(1000);
    expect(scripts.length).toBeGreaterThan(0);
    // DialKit's panel registers this storage key prefix and renders these class names.
    expect(scripts.some((s) => /dialkit:|dialkit-panel|DialRoot/.test(s))).toBe(false);
  });
});

test.describe('Lab preview to demo handoff', () => {
  for (const viewport of [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'desktop', width: 1280, height: 800 },
  ]) {
    test(`${viewport.name}: the stage box is server-rendered and the poster only leaves once the demo is mounted`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/lab');
      const card = page.locator('.lab-card').first();
      const href = (await card.getAttribute('href'))!;
      const slug = href.split('/').pop()!;

      // The preview and the demo stage share a view-transition name so the router morphs one into the other.
      await expect(card.locator('.lab-preview')).toHaveCSS('view-transition-name', `lab-${slug}`);

      // Before any JavaScript runs, the demo page already reserves the stage box with the poster in it.
      const html = await (await page.request.get(href)).text();
      expect(html).toMatch(/<div[^>]*style="aspect-ratio: [^"]+"[^>]*data-lab-shell/);
      expect(html).toContain(`src="/lab/${slug}/poster.webp"`);

      await card.click();
      await expect(page).toHaveURL(new RegExp(`${href}/?$`));
      const shell = page.locator('[data-lab-shell]');
      await expect(shell).toHaveCSS('view-transition-name', `lab-${slug}`);

      // The preview video is gone and the demo has taken over; the poster fades out only after the demo mounts.
      await expect(page.locator('video')).toHaveCount(0);
      const poster = page.locator('[data-lab-stage] img[data-lab-poster]');
      await expect(poster).toHaveAttribute('data-ready', 'true');
      await expect(page.locator('[data-lab-stage] button, [data-lab-stage] input').first()).toBeVisible();

      // The React stage fills exactly the box the server reserved (inside the shell's border),
      // so nothing jumps when it hydrates.
      const shellInner = await shell.evaluate((el) => ({ width: el.clientWidth, height: el.clientHeight }));
      const stageBox = (await page.locator('[data-lab-stage]').boundingBox())!;
      expect(Math.abs(shellInner.width - stageBox.width)).toBeLessThan(1);
      expect(Math.abs(shellInner.height - stageBox.height)).toBeLessThan(1);
    });
  }
});

test.describe('Lab: expanding search', () => {
  const stage = (page: import('@playwright/test').Page) => page.locator('[data-lab-stage]');
  const card = (page: import('@playwright/test').Page) => page.locator('[data-search-card]');

  test('starts as a lone input and walks idle → expanding → loading → results on Enter', async ({ page }) => {
    await page.goto('/lab/expanding-search');
    const input = stage(page).getByRole('searchbox');
    await expect(input).toBeVisible();
    await expect(card(page)).toHaveAttribute('data-state', 'idle');
    await expect(stage(page).locator('[data-search-results] li')).toHaveCount(0);
    await expect(stage(page).getByRole('button', { name: 'Search', exact: true })).toHaveCount(0);

    const seen: string[] = [];
    await page.exposeFunction('__recordState', (s: string) => seen.push(s));
    await card(page).evaluate((el) => {
      new MutationObserver(() => (window as unknown as { __recordState: (s: string) => void }).__recordState(el.dataset.state!)).observe(el, {
        attributes: true,
        attributeFilter: ['data-state'],
      });
    });

    await input.fill('tabs');
    await input.press('Enter');

    await expect(card(page)).toHaveAttribute('data-state', 'results', { timeout: 5000 });
    expect(seen).toEqual(['expanding', 'loading', 'results']);

    const rows = stage(page).locator('[data-search-results] li');
    await expect(rows).toHaveCount(4);
    await expect(rows.first()).toContainText('Sliding tabs');
    await expect(stage(page).getByRole('button', { name: 'Search', exact: true })).toBeVisible();
    // The input is the anchor: it has not moved while the card grew above it.
    const box = await input.boundingBox();
    expect(box!.y).toBeGreaterThan(0);
  });

  test('the input stays put while the card grows above it', async ({ page }) => {
    await page.goto('/lab/expanding-search');
    const input = stage(page).getByRole('searchbox');
    const before = (await input.boundingBox())!;
    await input.fill('herdr');
    await input.press('Enter');
    await expect(card(page)).toHaveAttribute('data-state', 'results', { timeout: 5000 });
    const after = (await input.boundingBox())!;
    expect(Math.abs(after.y - before.y)).toBeLessThan(2);
    const cardBox = (await card(page).boundingBox())!;
    expect(cardBox.y).toBeLessThan(before.y - 50);
  });

  test('hovering a result moves the shared highlight behind that row', async ({ page }) => {
    await page.goto('/lab/expanding-search');
    const input = stage(page).getByRole('searchbox');
    await input.fill('about');
    await input.press('Enter');
    await expect(card(page)).toHaveAttribute('data-state', 'results', { timeout: 5000 });
    const rows = stage(page).locator('[data-search-results] li');
    const highlight = stage(page).locator('[data-search-highlight]');
    await rows.nth(2).hover();
    await expect.poll(async () => {
      const r = (await rows.nth(2).boundingBox())!;
      const h = (await highlight.boundingBox())!;
      return Math.abs(r.y - h.y) < 2 && Math.abs(r.height - h.height) < 2 && (await highlight.evaluate((el) => getComputedStyle(el).opacity)) === '1';
    }).toBe(true);
  });

  test('Escape collapses back to the lone input and a late response cannot reopen it', async ({ page }) => {
    await page.goto('/lab/expanding-search');
    const input = stage(page).getByRole('searchbox');
    await input.fill('tabs');
    await input.press('Enter');
    await expect(card(page)).toHaveAttribute('data-state', 'loading', { timeout: 5000 });
    await input.press('Escape');
    await expect(card(page)).toHaveAttribute('data-state', 'idle');
    await page.waitForTimeout(1500);
    await expect(card(page)).toHaveAttribute('data-state', 'idle');
    await expect(stage(page).locator('[data-search-results] li')).toHaveCount(0);
  });

  test('reaches results under reduced motion and passes axe in every state', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/lab/expanding-search');
    await expect(card(page)).toHaveAttribute('data-state', 'idle');
    await page.waitForTimeout(700);
    const idle = await new AxeBuilder({ page }).include('[data-lab-stage]').analyze();
    expect(idle.violations).toEqual([]);

    const input = stage(page).getByRole('searchbox');
    await input.fill('tabs');
    await input.press('Enter');
    await expect(card(page)).toHaveAttribute('data-state', 'results', { timeout: 5000 });
    const results = await new AxeBuilder({ page }).include('[data-lab-stage]').analyze();
    expect(results.violations).toEqual([]);
  });
});
