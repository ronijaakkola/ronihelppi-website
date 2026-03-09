import { test, expect } from '@playwright/test';

test.describe('About Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveTitle(/About — Roni Helppi/);
  });

  test('should display About heading', async ({ page }) => {
    await page.goto('/about');
    const heading = page.locator('h1', { hasText: 'About Roni Helppi' });
    await expect(heading).toBeVisible();
  });

  test('should display intro paragraph with Reaktor link', async ({ page }) => {
    await page.goto('/about');
    const intro = page.locator('.intro');
    await expect(intro).toBeVisible();
    await expect(intro).toContainText("I design things, build things");

    const reaktorLink = intro.locator('a', { hasText: 'Reaktor' });
    await expect(reaktorLink).toHaveAttribute('href', 'https://reaktor.com');
  });

  test('should display Experience section with table', async ({ page }) => {
    await page.goto('/about');

    const experienceHeading = page.locator('h2', { hasText: 'Experience' });
    await expect(experienceHeading).toBeVisible();

    const table = page.locator('.experience-table');
    await expect(table).toBeVisible();

    // Check table headers
    await expect(page.locator('th', { hasText: 'Date' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Company' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Role' })).toBeVisible();

    // Check at least one row of experience data
    await expect(page.locator('td', { hasText: 'Reaktor' })).toBeVisible();
    await expect(page.locator('td', { hasText: 'Senior Product Designer' })).toBeVisible();
  });

  test('should display How to reach me section', async ({ page }) => {
    await page.goto('/about');

    const heading = page.locator('h2', { hasText: 'How to reach me' });
    await expect(heading).toBeVisible();

    const contactText = page.locator('.contact-text');
    await expect(contactText).toBeVisible();

    // Check email and LinkedIn links
    const emailLink = contactText.locator('a', { hasText: 'email' });
    await expect(emailLink).toHaveAttribute('href', 'mailto:hello@ronihelppi.com');

    const linkedinLink = contactText.locator('a', { hasText: 'LinkedIn' });
    await expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/in/ronihelppi/');
  });

  test('should show breadcrumb on about page', async ({ page }) => {
    await page.goto('/about');

    const breadcrumb = page.locator('#breadcrumb');
    // Allow time for scramble animation
    await expect(breadcrumb).toHaveText('About', { timeout: 2000 });

    const separator = page.locator('#breadcrumb-separator');
    await expect(separator).toHaveText('/');
  });

  test('should navigate to about page from header link', async ({ page }) => {
    await page.goto('/');

    const aboutLink = page.locator('.nav-link', { hasText: 'About' });
    await aboutLink.click();

    await expect(page).toHaveURL('/about');
    await expect(page).toHaveTitle(/About — Roni Helppi/);
  });

  test('should have proper HTML structure', async ({ page }) => {
    await page.goto('/about');

    await expect(page.locator('main.main')).toBeVisible();
    await expect(page.locator('.layout')).toBeVisible();
    await expect(page.locator('.prose')).toBeVisible();
  });

  test('should display experience table in stacked layout on narrow mobile', async ({ page }) => {
    // Set narrow mobile viewport (below 400px breakpoint)
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/about');

    // Table headers should be visually hidden on mobile (but accessible to screen readers)
    const tableHeaders = page.locator('.experience-table thead');
    await expect(tableHeaders).toHaveCSS('position', 'absolute');
    await expect(tableHeaders).toHaveCSS('width', '1px');
    await expect(tableHeaders).toHaveCSS('height', '1px');

    // Experience data should still be visible
    await expect(page.locator('.company-cell', { hasText: 'Reaktor' })).toBeVisible();
    await expect(page.locator('.role-cell', { hasText: 'Senior Product Designer' })).toBeVisible();
    await expect(page.locator('.date-cell', { hasText: '2026-08' })).toBeVisible();
  });
});
