import { test, expect } from '@playwright/test';

test.describe('Lightbox', () => {
  test('opens when clicking cover image on project page', async ({ page }) => {
    await page.goto('/projects/resokill');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    const coverImage = page.locator('.cover-image');
    await expect(coverImage).toBeVisible();

    await coverImage.click();

    const lightbox = page.locator('#lightbox');
    await expect(lightbox).toHaveAttribute('open');
  });

  test('closes when clicking X button', async ({ page }) => {
    await page.goto('/projects/resokill');
    await page.waitForLoadState('networkidle');

    await page.locator('.cover-image').click();
    await expect(page.locator('#lightbox')).toHaveAttribute('open');

    await page.locator('.lightbox-close').click();
    await expect(page.locator('#lightbox')).not.toHaveAttribute('open');
  });

  test('closes when pressing Escape key', async ({ page }) => {
    await page.goto('/projects/resokill');
    await page.waitForLoadState('networkidle');

    await page.locator('.cover-image').click();
    await expect(page.locator('#lightbox')).toHaveAttribute('open');

    await page.keyboard.press('Escape');
    await expect(page.locator('#lightbox')).not.toHaveAttribute('open');
  });

  test('closes when clicking backdrop', async ({ page }) => {
    await page.goto('/projects/resokill');
    await page.waitForLoadState('networkidle');

    await page.locator('.cover-image').click();
    await expect(page.locator('#lightbox')).toHaveAttribute('open');

    // Click on the dialog backdrop (the dialog element itself, not content)
    const lightbox = page.locator('#lightbox');
    const box = await lightbox.boundingBox();
    if (box) {
      // Click near the edge (on backdrop)
      await page.mouse.click(box.x + 5, box.y + 5);
    }
    await expect(page.locator('#lightbox')).not.toHaveAttribute('open');
  });

  test('closes when clicking the image', async ({ page }) => {
    await page.goto('/projects/resokill');
    await page.waitForLoadState('networkidle');

    await page.locator('.cover-image').click();
    await expect(page.locator('#lightbox')).toHaveAttribute('open');

    await page.locator('.lightbox-image').click();
    await expect(page.locator('#lightbox')).not.toHaveAttribute('open');
  });

  test('image has zoom-out cursor', async ({ page }) => {
    await page.goto('/projects/resokill');
    await page.waitForLoadState('networkidle');

    await page.locator('.cover-image').click();
    await expect(page.locator('#lightbox')).toHaveAttribute('open');

    const lightboxImage = page.locator('.lightbox-image');
    await expect(lightboxImage).toHaveCSS('cursor', 'zoom-out');
  });

  test('displays image and caption', async ({ page }) => {
    await page.goto('/projects/resokill');
    await page.waitForLoadState('networkidle');

    const coverImage = page.locator('.cover-image');
    const altText = await coverImage.getAttribute('alt');

    await coverImage.click();
    await expect(page.locator('#lightbox')).toHaveAttribute('open');

    // Image should be displayed
    const lightboxImage = page.locator('.lightbox-image');
    await expect(lightboxImage).toBeVisible();
    await expect(lightboxImage).toHaveAttribute('src', /.+/);

    // Caption should show the alt text
    const caption = page.locator('.lightbox-caption');
    if (altText) {
      await expect(caption).toHaveText(altText);
    }
  });
});

test.describe('Lightbox Keyboard Accessibility', () => {
  test('opens with Enter key when trigger button is focused', async ({ page }) => {
    await page.goto('/projects/resokill');
    await page.waitForLoadState('networkidle');

    const triggerButton = page.locator('.lightbox-trigger').first();
    await triggerButton.focus();
    await page.keyboard.press('Enter');

    await expect(page.locator('#lightbox')).toHaveAttribute('open');
  });

  test('opens with Space key when trigger button is focused', async ({ page }) => {
    await page.goto('/projects/resokill');
    await page.waitForLoadState('networkidle');

    const triggerButton = page.locator('.lightbox-trigger').first();
    await triggerButton.focus();
    await page.keyboard.press(' ');

    await expect(page.locator('#lightbox')).toHaveAttribute('open');
  });

  test('focus moves to close button on open', async ({ page }) => {
    await page.goto('/projects/resokill');
    await page.waitForLoadState('networkidle');

    await page.locator('.cover-image').click();
    await expect(page.locator('#lightbox')).toHaveAttribute('open');

    // Wait for animation to complete and focus to be set
    await page.waitForTimeout(350);
    await expect(page.locator('.lightbox-close')).toBeFocused();
  });

  test('returns focus to trigger element on close', async ({ page }) => {
    await page.goto('/projects/resokill');
    await page.waitForLoadState('networkidle');

    const triggerButton = page.locator('.lightbox-trigger').first();
    await triggerButton.click();
    await expect(page.locator('#lightbox')).toHaveAttribute('open');

    await page.keyboard.press('Escape');
    await expect(page.locator('#lightbox')).not.toHaveAttribute('open');
    await expect(triggerButton).toBeFocused();
  });

  test('image is wrapped in a button element', async ({ page }) => {
    await page.goto('/projects/resokill');
    await page.waitForLoadState('networkidle');

    const triggerButton = page.locator('.lightbox-trigger').first();
    await expect(triggerButton).toBeVisible();
    // The trigger should be a button element
    const tagName = await triggerButton.evaluate(el => el.tagName.toLowerCase());
    expect(tagName).toBe('button');
  });

  test('trigger button has aria-label', async ({ page }) => {
    await page.goto('/projects/resokill');
    await page.waitForLoadState('networkidle');

    const triggerButton = page.locator('.lightbox-trigger').first();
    const ariaLabel = await triggerButton.getAttribute('aria-label');
    expect(ariaLabel).toMatch(/View .* in fullscreen/);
  });
});

test.describe('Lightbox Navigation', () => {
  // These tests require a page with multiple images
  // Testing navigation controls visibility

  test('navigation buttons exist', async ({ page }) => {
    await page.goto('/projects/resokill');
    await page.waitForLoadState('networkidle');

    await page.locator('.cover-image').click();
    await expect(page.locator('#lightbox')).toHaveAttribute('open');

    await expect(page.locator('.lightbox-prev')).toBeVisible();
    await expect(page.locator('.lightbox-next')).toBeVisible();
    await expect(page.locator('.lightbox-close')).toBeVisible();
  });

  test('prev button is disabled on first image', async ({ page }) => {
    await page.goto('/projects/resokill');
    await page.waitForLoadState('networkidle');

    await page.locator('.cover-image').click();
    await expect(page.locator('#lightbox')).toHaveAttribute('open');

    const prevBtn = page.locator('.lightbox-prev');
    await expect(prevBtn).toBeDisabled();
  });
});

test.describe('Lightbox Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('opens on mobile viewport', async ({ page }) => {
    await page.goto('/projects/resokill');
    await page.waitForLoadState('networkidle');

    const coverImage = page.locator('.cover-image');
    await coverImage.click();

    await expect(page.locator('#lightbox')).toHaveAttribute('open');
  });

  test('close button is accessible on mobile', async ({ page }) => {
    await page.goto('/projects/resokill');
    await page.waitForLoadState('networkidle');

    await page.locator('.cover-image').click();
    await expect(page.locator('#lightbox')).toHaveAttribute('open');

    const closeBtn = page.locator('.lightbox-close');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    await expect(page.locator('#lightbox')).not.toHaveAttribute('open');
  });
});
