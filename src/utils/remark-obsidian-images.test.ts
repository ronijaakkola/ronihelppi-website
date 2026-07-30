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

  it('transforms a video embed into a <video> element, not an <img>', async () => {
    const processor = createProcessor();
    const result = await processor.process('![[clip.mp4]]');
    const html = result.toString();

    expect(html).toContain('<video');
    expect(html).not.toContain('<img');
  });

  it('serves videos from the public /images path (not the ../images asset path)', async () => {
    const processor = createProcessor();
    const result = await processor.process('![[clip.mp4]]');
    const html = result.toString();

    expect(html).toContain('<source src="/images/clip.mp4"');
    expect(html).toContain('type="video/mp4"');
    expect(html).not.toContain('../images/clip.mp4');
  });

  it('gives looping videos playback controls and loops muted inline', async () => {
    const processor = createProcessor();
    const result = await processor.process('![[clip.mp4]]');
    const html = result.toString();

    expect(html).toContain('controls');
    expect(html).toContain('loop');
    expect(html).toContain('muted');
    expect(html).toContain('playsinline');
  });

  it('marks the video for JS-driven autoplay but does not ship the autoplay attribute', async () => {
    const processor = createProcessor();
    const result = await processor.process('![[clip.mp4]]');
    const html = result.toString();

    // Playback is started from JS only when motion is allowed, so the bare
    // `autoplay` attribute must not be present (it would ignore reduced motion).
    expect(html).toContain('data-autoplay');
    expect(html).not.toMatch(/\sautoplay(?![-\w])/);
  });

  it('supports webm and ogv video extensions with correct MIME types', async () => {
    const processor = createProcessor();

    const webm = (await processor.process('![[clip.webm]]')).toString();
    expect(webm).toContain('<source src="/images/clip.webm"');
    expect(webm).toContain('type="video/webm"');

    const ogv = (await processor.process('![[clip.ogv]]')).toString();
    expect(ogv).toContain('<source src="/images/clip.ogv"');
    expect(ogv).toContain('type="video/ogg"');
  });

  it('uses the pipe caption as the video title and reserves space via width/height', async () => {
    const processor = createProcessor();
    const result = await processor.process('![[clip.mp4|A short demo clip|1280x720]]');
    const html = result.toString();

    expect(html).toContain('title="A short demo clip"');
    expect(html).toContain('width="1280"');
    expect(html).toContain('height="720"');
  });

  it('derives a matching -poster.webp still so the video never paints blank', async () => {
    const processor = createProcessor();
    const result = await processor.process('![[clip.mp4]]');
    const html = result.toString();

    expect(html).toContain('poster="/images/clip-poster.webp"');
  });

  it('reassembles an embed whose caption contains a markdown link', async () => {
    // remark parses `[text](url)` inside `![[...]]` into a real link node
    // before this plugin runs, splitting the embed across sibling nodes —
    // the plugin must stitch them back together.
    const processor = createProcessor();
    const input =
      '![[photo.jpg|Reading on the Kindle. ([Every feature](https://example.com/post) by Karri Saarinen)]]';
    const result = await processor.process(input);
    const html = result.toString();

    expect(html).toContain('<img src="../images/photo.jpg"');
    // Alt text is plain — markdown link syntax stripped to its label.
    expect(html).toContain(
      'alt="Reading on the Kindle. (Every feature by Karri Saarinen)"',
    );
    // The raw caption (link syntax intact) rides on `title` for
    // rehype-image-figure to render into the figcaption.
    expect(html).toContain(
      'title="Reading on the Kindle. ([Every feature](https://example.com/post) by Karri Saarinen)"',
    );
    expect(html).not.toContain('![[');
  });

  it('leaves links outside embeds untouched while reassembling captions', async () => {
    const processor = createProcessor();
    const input =
      'See [docs](https://example.com) and ![[a.png|cap with [link](https://example.com/b)]] after';
    const result = await processor.process(input);
    const html = result.toString();

    expect(html).toContain('<a href="https://example.com">docs</a>');
    expect(html).toContain('<img src="../images/a.png"');
    expect(html).toContain('alt="cap with link"');
    expect(html).toContain(' after');
    expect(html).not.toContain('![[');
  });

  it('does not swallow following nodes when an embed never closes', async () => {
    const processor = createProcessor();
    const input = '![[broken and [link](https://example.com) more text';
    const result = await processor.process(input);
    const html = result.toString();

    expect(html).toContain('![[broken and');
    expect(html).toContain('<a href="https://example.com">link</a>');
    expect(html).toContain('more text');
    expect(html).not.toContain('<img');
  });

  it('still renders images (not videos) for image extensions', async () => {
    const processor = createProcessor();
    const result = await processor.process('![[still.png]]');
    const html = result.toString();

    expect(html).toContain('<img src="../images/still.png"');
    expect(html).not.toContain('<video');
  });
});
