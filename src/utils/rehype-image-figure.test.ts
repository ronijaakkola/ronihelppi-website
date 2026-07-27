import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { remarkObsidianImages } from './remark-obsidian-images';
import { rehypeImageFigure } from './rehype-image-figure';

describe('rehypeImageFigure', () => {
  const createProcessor = () =>
    unified()
      .use(remarkParse)
      .use(remarkObsidianImages)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeImageFigure)
      .use(rehypeStringify, { allowDangerousHtml: true });

  it('wraps a captioned image in a figure with a figcaption', async () => {
    const processor = createProcessor();
    const result = await processor.process('![[photo.jpg|A simple caption]]');
    const html = result.toString();

    expect(html).toContain('<figure class="prose-figure">');
    expect(html).toContain('<figcaption>A simple caption</figcaption>');
    // The caption must not linger as a tooltip on the image itself.
    expect(html).not.toContain('title=');
  });

  it('leaves uncaptioned images unwrapped', async () => {
    const processor = createProcessor();
    const result = await processor.process('![[photo.jpg]]');
    const html = result.toString();

    expect(html).not.toContain('<figure');
  });

  it('renders a markdown link inside the caption as a real anchor', async () => {
    const processor = createProcessor();
    const result = await processor.process(
      '![[photo.jpg|Reading on the Kindle. ([Every feature](https://example.com/post) by Karri Saarinen)]]',
    );
    const html = result.toString();

    expect(html).toContain(
      '<figcaption>Reading on the Kindle. (<a href="https://example.com/post">Every feature</a> by Karri Saarinen)</figcaption>',
    );
    expect(html).not.toContain('](');
  });

  it('renders a markdown link inside a video caption as a real anchor', async () => {
    const processor = createProcessor();
    const result = await processor.process(
      '![[clip.mp4|A demo of [the tool](https://example.com/tool) in action|1280x720]]',
    );
    const html = result.toString();

    expect(html).toContain('<figure class="prose-figure">');
    expect(html).toContain(
      '<figcaption>A demo of <a href="https://example.com/tool">the tool</a> in action</figcaption>',
    );
  });
});
