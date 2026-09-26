import { test, expect } from '@playwright/test';

const PAGES = [
  '/writing/every-monday-my-agent-ships-me-a-magazine',
  '/writing/a-practical-guide-to-writing-your-own-obsidian-skills',
  '/projects/vuoro',
  '/projects/resokill',
  '/projects/clear-skies',
];

test.describe('External link punctuation', () => {
  // A prose external link is an atomic inline box, so the punctuation that
  // follows it (outside the anchor, to keep the hit area) is a separate text
  // run the browser may break away from the link. Sweeping the paragraph width
  // one pixel at a time visits every possible break position, so any width at
  // which the punctuation starts a line is caught without depending on a
  // particular viewport.
  for (const path of PAGES) {
    test(`punctuation never wraps away from its link on ${path}`, async ({ page }) => {
      await page.goto(path);

      const result = await page.evaluate(() => {
        const PUNCT = /^[.,;:!?)\]}"'”’»›]/;
        const candidates: { anchor: HTMLAnchorElement; punct: Text; block: HTMLElement }[] = [];
        document
          .querySelectorAll<HTMLAnchorElement>('.prose-content a[href^="http"]')
          .forEach((anchor) => {
            const next = anchor.nextSibling;
            const block = anchor.closest<HTMLElement>('p, li');
            if (next?.nodeType === Node.TEXT_NODE && PUNCT.test((next as Text).data) && block) {
              candidates.push({ anchor, punct: next as Text, block });
            }
          });

        const splits: string[] = [];
        for (const { anchor, punct, block } of candidates) {
          const range = document.createRange();
          range.setStart(punct, 0);
          range.setEnd(punct, 1);
          const lineHeight = parseFloat(getComputedStyle(block).lineHeight);
          const original = block.style.width;
          for (let width = 200; width <= 750; width++) {
            block.style.width = `${width}px`;
            const a = anchor.getBoundingClientRect();
            const p = range.getBoundingClientRect();
            // Same line: punctuation sits right after the anchor, not below it.
            const sameLine = p.left >= a.right - 1 && p.top < a.top + lineHeight / 2;
            if (!sameLine) {
              splits.push(`"${anchor.textContent?.trim()}" + "${punct.data[0]}" at ${width}px`);
              break;
            }
          }
          block.style.width = original;
        }
        return { count: candidates.length, splits };
      });

      expect(result.count, 'page should contain external links followed by punctuation').toBeGreaterThan(0);
      expect(result.splits).toEqual([]);
    });
  }
});

test.describe('text-wrap scope', () => {
  const style = (page: import('@playwright/test').Page, selector: string) =>
    page.locator(selector).first().evaluate((el) => getComputedStyle(el).textWrapStyle);

  test.beforeEach(async ({ page }) => {
    await page.goto('/writing/a-practical-guide-to-writing-your-own-obsidian-skills');
  });

  test('body prose paragraphs and list items use pretty', async ({ page }) => {
    expect(await style(page, '.prose-content > p')).toBe('pretty');
    expect(await style(page, '.prose-content li:not(.toc-row)')).toBe('pretty');
  });

  test('headings stay balanced', async ({ page }) => {
    expect(await style(page, 'h1')).toBe('balance');
    expect(await style(page, '.prose-content h2')).toBe('balance');
  });

  test('body, navigation, buttons, table of contents and code blocks do not inherit pretty', async ({
    page,
  }) => {
    expect(await style(page, 'body')).not.toBe('pretty');
    expect(await style(page, '.nav-links a')).not.toBe('pretty');
    expect(await style(page, 'button')).not.toBe('pretty');
    expect(await style(page, '.toc-row')).not.toBe('pretty');
    expect(await style(page, '.heading-rail-item')).not.toBe('pretty');
    expect(await style(page, '.prose-content pre')).not.toBe('pretty');
    expect(await style(page, '.prose-content pre code')).not.toBe('pretty');
  });

  test('a code block nested in a list item does not inherit pretty', async ({ page }) => {
    await page.evaluate(() => {
      const li = document.querySelector('.prose-content li:not(.toc-row)')!;
      li.insertAdjacentHTML('beforeend', '<pre data-probe><code>x</code></pre>');
    });
    expect(await style(page, '[data-probe]')).not.toBe('pretty');
  });
});
