import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { remarkObsidianImages } from './remark-obsidian-images';

describe('remarkObsidianImages', () => {
  const createProcessor = () =>
    unified()
      .use(remarkParse)
      .use(remarkObsidianImages)
      .use(remarkRehype)
      .use(rehypeStringify);

  it('transforms basic Obsidian image syntax to HTML img tag', async () => {
    const processor = createProcessor();
    const result = await processor.process('![[test.png]]');
    const html = result.toString();

    expect(html).toContain('<img src="../images/test.png"');
    expect(html).toContain('alt="test.png"');
  });

  it('transforms multiple images in the same paragraph', async () => {
    const processor = createProcessor();
    const input = '![[image1.png]] and ![[image2.jpg]]';
    const result = await processor.process(input);
    const html = result.toString();

    expect(html).toContain('<img src="../images/image1.png"');
    expect(html).toContain('alt="image1.png"');
    expect(html).toContain('<img src="../images/image2.jpg"');
    expect(html).toContain('alt="image2.jpg"');
    expect(html).toContain(' and ');
  });

  it('preserves text before the image', async () => {
    const processor = createProcessor();
    const input = 'Some text before ![[image.png]]';
    const result = await processor.process(input);
    const html = result.toString();

    expect(html).toContain('Some text before');
    expect(html).toContain('<img src="../images/image.png"');
  });

  it('preserves text after the image', async () => {
    const processor = createProcessor();
    const input = '![[image.png]] some text after';
    const result = await processor.process(input);
    const html = result.toString();

    expect(html).toContain('<img src="../images/image.png"');
    expect(html).toContain('some text after');
  });

  it('preserves text before and after the image', async () => {
    const processor = createProcessor();
    const input = 'Text before ![[image.png]] text after';
    const result = await processor.process(input);
    const html = result.toString();

    expect(html).toContain('Text before');
    expect(html).toContain('<img src="../images/image.png"');
    expect(html).toContain('text after');
  });

  it('does not transform when no Obsidian syntax is present', async () => {
    const processor = createProcessor();
    const input = 'Just regular text without images';
    const result = await processor.process(input);
    const html = result.toString();

    expect(html).toContain('Just regular text without images');
    expect(html).not.toContain('<img');
  });

  it('handles images with special characters in filename', async () => {
    const processor = createProcessor();
    const input = '![[my-image_test.png]]';
    const result = await processor.process(input);
    const html = result.toString();

    expect(html).toContain('<img src="../images/my-image_test.png"');
    expect(html).toContain('alt="my-image_test.png"');
  });

  it('handles images with spaces in filename', async () => {
    const processor = createProcessor();
    const input = '![[image with spaces.png]]';
    const result = await processor.process(input);
    const html = result.toString();

    // URLs are encoded in HTML, so spaces become %20
    expect(html).toContain('<img src="../images/image%20with%20spaces.png"');
    expect(html).toContain('alt="image with spaces.png"');
  });

  it('handles various image file extensions', async () => {
    const processor = createProcessor();
    const extensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];

    for (const ext of extensions) {
      const input = `![[test.${ext}]]`;
      const result = await processor.process(input);
      const html = result.toString();

      expect(html).toContain(`<img src="../images/test.${ext}"`);
      expect(html).toContain(`alt="test.${ext}"`);
    }
  });

  it('does not transform standard markdown image syntax', async () => {
    const processor = createProcessor();
    const input = '![alt text](image.png)';
    const result = await processor.process(input);
    const html = result.toString();

    // Should still produce an img tag, but with original path
    expect(html).toContain('<img');
    expect(html).toContain('alt="alt text"');
    expect(html).toContain('src="image.png"');
    expect(html).not.toContain('../images/image.png');
  });

  it('handles empty paragraph', async () => {
    const processor = createProcessor();
    const input = '';
    const result = await processor.process(input);
    const html = result.toString();

    expect(html).toBe('');
  });

  it('handles multiple paragraphs with images', async () => {
    const processor = createProcessor();
    const input = 'First paragraph ![[image1.png]]\n\nSecond paragraph ![[image2.png]]';
    const result = await processor.process(input);
    const html = result.toString();

    expect(html).toContain('First paragraph');
    expect(html).toContain('<img src="../images/image1.png"');
    expect(html).toContain('Second paragraph');
    expect(html).toContain('<img src="../images/image2.png"');
  });

  it('handles consecutive images without text between them', async () => {
    const processor = createProcessor();
    const input = '![[image1.png]]![[image2.png]]';
    const result = await processor.process(input);
    const html = result.toString();

    expect(html).toContain('<img src="../images/image1.png"');
    expect(html).toContain('<img src="../images/image2.png"');
  });

  it('handles images at the start of a paragraph', async () => {
    const processor = createProcessor();
    const input = '![[image.png]] at the start';
    const result = await processor.process(input);
    const html = result.toString();

    expect(html).toContain('<img src="../images/image.png"');
    expect(html).toContain('at the start');
  });

  it('handles images at the end of a paragraph', async () => {
    const processor = createProcessor();
    const input = 'At the end ![[image.png]]';
    const result = await processor.process(input);
    const html = result.toString();

    expect(html).toContain('At the end');
    expect(html).toContain('<img src="../images/image.png"');
  });

  it('supports pipe-separated alt text', async () => {
    const processor = createProcessor();
    const input = '![[screenshot.png|A gameplay screenshot]]';
    const result = await processor.process(input);
    const html = result.toString();

    expect(html).toContain('<img src="../images/screenshot.png"');
    expect(html).toContain('alt="A gameplay screenshot"');
  });

  it('uses filename as alt when no pipe description given', async () => {
    const processor = createProcessor();
    const input = '![[photo.jpg]]';
    const result = await processor.process(input);
    const html = result.toString();

    expect(html).toContain('alt="photo.jpg"');
  });

  it('does not transform nested brackets without image syntax', async () => {
    const processor = createProcessor();
    const input = 'Some [[link]] without image syntax';
    const result = await processor.process(input);
    const html = result.toString();

    expect(html).toContain('[[link]]');
    expect(html).not.toContain('<img');
  });
});
