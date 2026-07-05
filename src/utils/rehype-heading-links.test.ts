import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { rehypeHeadingLinks } from './rehype-heading-links';

const createProcessor = () =>
  unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeHeadingLinks)
    .use(rehypeStringify);

const render = async (input: string) => {
  const result = await createProcessor().process(input);
  return result.toString();
};

describe('rehypeHeadingLinks', () => {
  it('assigns each heading an id derived from its text', async () => {
    const html = await render(`## Getting Started`);
    expect(html).toContain('<h2 id="getting-started"');
  });

  it('appends a heading anchor link that targets the heading id', async () => {
    const html = await render(`## Getting Started`);
    expect(html).toContain('class="heading-anchor"');
    expect(html).toContain('href="#getting-started"');
  });

  it('gives the anchor an accessible label referencing the heading', async () => {
    const html = await render(`## Getting Started`);
    // The visible icon is decorative, so the link itself must be labelled.
    expect(html).toMatch(/aria-label="[^"]*Getting Started[^"]*"/);
  });

  it('renders the Iconoir link icon matching site conventions', async () => {
    const html = await render(`## Getting Started`);
    // Decorative SVG using currentColor + the repo's 1.33333 stroke width.
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('stroke="currentColor"');
    expect(html).toContain('stroke-width="1.33333"');
    expect(html).toContain('viewBox="0 0 24 24"');
  });

  it('adds anchors to all heading levels present in the content', async () => {
    const html = await render(`# One\n\n## Two\n\n### Three`);
    expect(html).toContain('href="#one"');
    expect(html).toContain('href="#two"');
    expect(html).toContain('href="#three"');
  });

  it('de-duplicates repeated heading text the same way github-slugger does', async () => {
    const html = await render(`## Notes\n\n## Notes`);
    expect(html).toContain('id="notes"');
    expect(html).toContain('id="notes-1"');
    expect(html).toContain('href="#notes"');
    expect(html).toContain('href="#notes-1"');
  });

  it('respects an id that already exists on a heading', async () => {
    const html = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(() => (tree: any) => {
        // Simulate a heading that already has an explicit id.
        const h = tree.children.find((n: any) => n.tagName === 'h2');
        h.properties.id = 'custom-id';
      })
      .use(rehypeHeadingLinks)
      .use(rehypeStringify)
      .process(`## Getting Started`);
    const out = html.toString();
    expect(out).toContain('id="custom-id"');
    expect(out).toContain('href="#custom-id"');
    expect(out).not.toContain('id="getting-started"');
  });

  it('does not touch non-heading elements', async () => {
    const html = await render(`A paragraph with a [link](https://example.com).`);
    expect(html).not.toContain('heading-anchor');
  });
});
