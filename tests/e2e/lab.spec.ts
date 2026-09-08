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
