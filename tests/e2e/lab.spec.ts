import { test, expect } from '@playwright/test';

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

  test('demo page renders a markdown write-up with headings and code', async ({ page }) => {
    await page.goto('/lab/sliding-tabs');
    const writeup = page.locator('.lab-writeup');
    await expect(writeup).toBeVisible();
    await expect(writeup.locator('h2').first()).toBeVisible();
    await expect(writeup.locator('pre code').first()).toBeVisible();
    // Runs through the same pipeline as posts: headings get anchor links.
    await expect(writeup.locator('h2 .heading-anchor').first()).toHaveAttribute('href', /^#/);
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
      await expect(page.locator('[data-lab-stage] button').first()).toBeVisible();

      // The React stage fills exactly the box the server reserved (inside the shell's border),
      // so nothing jumps when it hydrates.
      const shellInner = await shell.evaluate((el) => ({ width: el.clientWidth, height: el.clientHeight }));
      const stageBox = (await page.locator('[data-lab-stage]').boundingBox())!;
      expect(Math.abs(shellInner.width - stageBox.width)).toBeLessThan(1);
      expect(Math.abs(shellInner.height - stageBox.height)).toBeLessThan(1);
    });
  }
});
