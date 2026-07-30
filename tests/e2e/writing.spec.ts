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

test.describe('Inline video embeds', () => {
  const POST = '/writing/every-monday-my-agent-ships-me-a-magazine/';
  // In document order.
  const VIDEOS = [
    { src: '/images/hermes-issue.mp4', poster: '/images/hermes-issue-poster.webp' },
    { src: '/images/hermes-chat.mp4', poster: '/images/hermes-chat-poster.webp' },
  ];

  const videoBySrc = (page: import('@playwright/test').Page, src: string) =>
    page.locator(`.prose-content video:has(source[src="${src}"])`);

  test('renders each clip as a looping muted video with native playback controls', async ({ page }) => {
    await page.goto(POST);

    for (const { src } of VIDEOS) {
      const video = videoBySrc(page, src);
      await expect(video).toBeVisible();
      await expect(video).toHaveJSProperty('controls', true);
      await expect(video).toHaveJSProperty('loop', true);
      await expect(video).toHaveJSProperty('muted', true);
    }
  });

  test('serves each video from the public /images path and it loads', async ({ page }) => {
    await page.goto(POST);

    for (const { src } of VIDEOS) {
      await expect(page.locator(`.prose-content video source[src="${src}"]`)).toBeAttached();

      // The referenced file must actually exist and be served as a video.
      const response = await page.request.get(src);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('video');
    }
  });

  test('each has a poster still that exists, so it never paints blank when paused', async ({ page }) => {
    await page.goto(POST);

    for (const { src, poster } of VIDEOS) {
      await expect(videoBySrc(page, src)).toHaveAttribute('poster', poster);

      // The poster must actually be served (otherwise the box is blank when paused).
      const response = await page.request.get(poster);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('image');
    }
  });

  test('image caption renders its markdown link as a real anchor', async ({ page }) => {
    await page.goto(POST);

    const caption = page.locator('figure.prose-figure figcaption', {
      hasText: 'Karri Saarinen',
    });
    const link = caption.locator(
      'a[href="https://x.com/karrisaarinen/status/2043378194938777813"]',
    );
    await expect(link).toBeVisible();
    // No raw markdown syntax may leak into the rendered caption or body.
    await expect(caption).not.toContainText('](');
    await expect(page.locator('.prose-content')).not.toContainText('![[');
  });

  test('captioned videos are wrapped in figures with figcaptions', async ({ page }) => {
    await page.goto(POST);

    const figures = page.locator('.prose-content figure.prose-figure', {
      has: page.locator('video'),
    });
    await expect(figures).toHaveCount(VIDEOS.length);
    for (let i = 0; i < VIDEOS.length; i++) {
      await expect(figures.nth(i).locator('figcaption')).not.toBeEmpty();
    }
  });

  test('plays only while in view: paused off-screen, plays once scrolled to', async ({ page }) => {
    await page.goto(POST);

    const isPaused = (src: string) =>
      videoBySrc(page, src).evaluate((v: HTMLVideoElement) => v.paused);

    // Every clip sits well below the fold, so none may be playing on load —
    // they should not decode off-screen.
    for (const { src } of VIDEOS) {
      await expect.poll(() => isPaused(src)).toBe(true);
    }

    // Scrolling each clip into view starts its playback from the
    // (still-at-start) loop.
    for (const { src } of VIDEOS) {
      await videoBySrc(page, src).scrollIntoViewIfNeeded();
      await expect.poll(() => isPaused(src)).toBe(false);
    }

    // Scrolling away again pauses.
    await page.evaluate(() => window.scrollTo(0, 0));
    for (const { src } of VIDEOS) {
      await expect.poll(() => isPaused(src)).toBe(true);
    }
  });
});

test.describe('Pull quote', () => {
  const POST = '/writing/every-monday-my-agent-ships-me-a-magazine/';
  const SENTENCE = 'I am the only consumer of this magazine';

  test('repeats a body sentence print-style, hidden from assistive tech', async ({ page }) => {
    await page.goto(POST);

    // The decorative pull quote renders visibly but is aria-hidden — the
    // same words are read from the body paragraph, not twice.
    const pull = page.locator('.prose-content .pull-quote');
    await expect(pull).toBeVisible();
    await expect(pull).toHaveAttribute('aria-hidden', 'true');
    await expect(pull).toContainText(SENTENCE);

    // The original sentence still lives in its body paragraph.
    await expect(
      page.locator('.prose-content p', { hasText: SENTENCE }),
    ).toHaveCount(1);
  });

  test('sits far from the source sentence, in an earlier section', async ({ page }) => {
    await page.goto(POST);

    // The pull quote must precede the paragraph that owns the sentence —
    // print-style pull quotes tease content the reader has not hit yet.
    const positions = await page.evaluate((sentence) => {
      const pull = document.querySelector('.prose-content .pull-quote');
      const para = Array.from(
        document.querySelectorAll('.prose-content p'),
      ).find((p) => p.textContent?.includes(sentence));
      if (!pull || !para) return null;
      return {
        pullTop: pull.getBoundingClientRect().top + window.scrollY,
        paraTop: para.getBoundingClientRect().top + window.scrollY,
      };
    }, SENTENCE);

    expect(positions).not.toBeNull();
    // "Far" = at least a viewport of reading between the two.
    expect(positions!.paraTop - positions!.pullTop).toBeGreaterThan(800);
  });
});

test.describe('You might also enjoy', () => {
  // The two posts cross-link each other via relatedPosts frontmatter.
  const POSTS = [
    {
      url: '/writing/every-monday-my-agent-ships-me-a-magazine/',
      relatedHref: '/writing/a-practical-guide-to-writing-your-own-obsidian-skills',
    },
    {
      url: '/writing/a-practical-guide-to-writing-your-own-obsidian-skills/',
      relatedHref: '/writing/every-monday-my-agent-ships-me-a-magazine',
    },
  ];

  for (const { url, relatedHref } of POSTS) {
    test(`${url} ends with a divider and a link to the other post`, async ({ page }) => {
      await page.goto(url);

      // A divider separates the post body from the section.
      await expect(page.locator('.prose .divider')).toBeAttached();

      const section = page.locator('.related-posts');
      await expect(section.locator('.section-heading')).toHaveText('You might also enjoy');

      // A single plain link to the other post — no bullet/icon decoration.
      const link = section.locator(`a[href="${relatedHref}"]`);
      await expect(link).toBeVisible();
      await expect(section.locator('.related-post-icon')).toHaveCount(0);
    });
  }
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

    // Heading should end up scrolled into view, clear of the sticky header.
    // In-page jumps animate (CSS scroll-behavior: smooth), so poll until the
    // scroll settles instead of sampling mid-animation. The scroll approaches
    // from below toward a positive offset (scroll-margin-top), so once the
    // top is under 200px it is also non-negative.
    await expect
      .poll(
        () => heading.evaluate((el) => el.getBoundingClientRect().top),
        { timeout: 5000 },
      )
      .toBeLessThan(200);
    const topInViewport = await heading.evaluate(
      (el) => el.getBoundingClientRect().top,
    );
    expect(topInViewport).toBeGreaterThanOrEqual(0);
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
