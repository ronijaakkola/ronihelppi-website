import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import { remarkToc } from './remark-toc';

describe('remarkToc', () => {
  const createProcessor = () =>
    unified()
      .use(remarkParse)
      .use(remarkToc)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeStringify);

  it('replaces [toc] marker with table of contents', async () => {
    const input = `# Title

Some intro text.

[toc]

## First Section

Content here.

## Second Section

More content.`;

    const result = await createProcessor().process(input);
    const html = result.toString();

    expect(html).toContain('class="toc-card"');
    expect(html).toContain('aria-label="Table of contents"');
    expect(html).toContain('2 sections');
    expect(html).toContain('First Section');
    expect(html).toContain('Second Section');
  });

  it('generates zero-padded numbers', async () => {
    const input = `[toc]

## Section One

## Section Two`;

    const result = await createProcessor().process(input);
    const html = result.toString();

    expect(html).toContain('01');
    expect(html).toContain('02');
  });

  it('generates correct anchor links from heading text', async () => {
    const input = `[toc]

## Getting Started

## What's next?`;

    const result = await createProcessor().process(input);
    const html = result.toString();

    expect(html).toContain('href="#getting-started"');
    expect(html).toContain('href="#whats-next"');
  });

  it('only includes h2 headings, not h3 or h1', async () => {
    const input = `[toc]

# H1 Title

## Included Section

### Not Included

## Another Included`;

    const result = await createProcessor().process(input);
    const html = result.toString();

    expect(html).toContain('<span class="toc-text">Included Section</span>');
    expect(html).toContain('<span class="toc-text">Another Included</span>');
    expect(html).not.toContain('toc-text">H1 Title');
    expect(html).not.toContain('toc-text">Not Included');
    expect(html).toContain('2 sections');
  });

  it('removes [toc] marker when there are no h2 headings', async () => {
    const input = `Some text.

[toc]

More text.`;

    const result = await createProcessor().process(input);
    const html = result.toString();

    expect(html).not.toContain('toc-card');
    expect(html).not.toContain('[toc]');
  });

  it('does not affect content without [toc] marker', async () => {
    const input = `## Section One

Some text.

## Section Two`;

    const result = await createProcessor().process(input);
    const html = result.toString();

    expect(html).not.toContain('toc-card');
    expect(html).toContain('Section One');
    expect(html).toContain('Section Two');
  });

  it('uses singular "section" for one heading', async () => {
    const input = `[toc]

## Only Section`;

    const result = await createProcessor().process(input);
    const html = result.toString();

    expect(html).toContain('1 section');
    expect(html).not.toContain('1 sections');
  });

  it('does not replace [toc] when inside a sentence', async () => {
    const input = `The [toc] marker should only work as a standalone paragraph.

## Section`;

    const result = await createProcessor().process(input);
    const html = result.toString();

    expect(html).not.toContain('toc-card');
    expect(html).toContain('[toc]');
  });
});
