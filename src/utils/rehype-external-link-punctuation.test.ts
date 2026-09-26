import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeStringify from 'rehype-stringify';
import { rehypeExternalLinkPunctuation } from './rehype-external-link-punctuation';

// Same order as astro.config.mjs: rehype-external-links runs first, so the
// plugin sees the anchors as they are actually shipped (target, rel, hidden hint).
const createProcessor = () =>
  unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeExternalLinks, {
      target: '_blank',
      rel: ['noopener', 'noreferrer'],
      content: {
        type: 'element',
        tagName: 'span',
        properties: { className: ['visually-hidden'] },
        children: [{ type: 'text', value: ' (opens in new tab)' }],
      },
    })
    .use(rehypeExternalLinkPunctuation)
    .use(rehypeStringify);

const render = async (input: string) => (await createProcessor().process(input)).toString();

const GROUP = '<span class="external-link-group">';

describe('rehypeExternalLinkPunctuation', () => {
  it('pulls a trailing full stop into a nowrap group with the anchor', async () => {
    const html = await render('Read [the docs](https://example.com).');
    expect(html).toMatch(
      new RegExp(`Read ${GROUP}<a href="https://example.com"[^>]*>the docs.*?</a>\\.</span></p>`),
    );
  });

  it.each([',', ';', ':', '!', '?'])('groups a trailing "%s"', async (mark) => {
    const html = await render(`See [it](https://example.com)${mark} then go.`);
    expect(html).toContain(`</a>${mark}</span> then go.`);
  });

  it('groups a run of closing brackets, quotes and punctuation, and nothing after it', async () => {
    const html = await render('(see [it](https://example.com)).” Next word');
    expect(html).toContain(`(see ${GROUP}<a `);
    expect(html).toContain('</a>).”</span> Next word');
  });

  it.each([')', ']', '}', '"', "'", '”', '’', '»', '›'])(
    'treats "%s" as trailing punctuation',
    async (mark) => {
      const html = await render(`x [it](https://example.com)${mark} y`);
      expect(html).toContain(`</a>${mark}</span> y`);
    },
  );

  it('keeps the punctuation outside the anchor so the hit area is unchanged', async () => {
    const html = await render('[it](https://example.com).');
    const anchor = html.match(/<a [^>]*>(.*?)<\/a>/)![1];
    expect(anchor).not.toContain('.');
  });

  it('does not wrap when the link is followed by a space or the end of the block', async () => {
    expect(await render('Read [it](https://example.com) now.')).not.toContain('external-link-group');
    expect(await render('Read [it](https://example.com)')).not.toContain('external-link-group');
  });

  it('does not wrap when the next sibling is not text', async () => {
    const html = await render('[it](https://example.com)*emphasis*');
    expect(html).not.toContain('external-link-group');
  });

  it('leaves internal and relative links alone', async () => {
    expect(await render('See [about](/about).')).not.toContain('external-link-group');
    expect(await render('See [top](#top).')).not.toContain('external-link-group');
  });

  it('handles several external links in one paragraph', async () => {
    const html = await render('[a](https://a.example), [b](https://b.example).');
    expect(html.match(/external-link-group/g)).toHaveLength(2);
    expect(html).toContain('</a>,</span> ');
    expect(html).toContain('</a>.</span></p>');
  });

  it('does not touch a link whose following text starts with a letter', async () => {
    const html = await render('[it](https://example.com)s are fine');
    expect(html).not.toContain('external-link-group');
  });
});
