import { visit } from 'unist-util-visit';
import type { Root, Paragraph, PhrasingContent, Image, Text } from 'mdast';

// Video extensions handled by the `![[file.ext]]` embed syntax, mapped to the
// MIME type used on the <source> element. Anything not listed here is treated
// as an image and routed through Astro's asset pipeline.
const VIDEO_MIME: Record<string, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogv: 'video/ogg',
  ogg: 'video/ogg',
  mov: 'video/quicktime',
};

// A complete `![[...]]` embed. The inner part may contain single `]`
// characters — a serialized `[text](url)` link inside a caption — so only a
// double `]]` closes the embed.
const EMBED_REGEX = /!\[\[((?:[^\]]|\](?!\]))+)\]\]/g;

/** True while the last `![[` opener in `value` has no `]]` closer after it. */
function hasUnclosedEmbed(value: string): boolean {
  const start = value.lastIndexOf('![[');
  return start !== -1 && !value.includes(']]', start + 3);
}

/** Reduces `[text](url)` markdown links in a caption to their plain text. */
function stripMarkdownLinks(caption: string): string {
  return caption.replace(/\[([^\]]*)\]\(([^)]*)\)/g, '$1');
}

/**
 * Serializes a phrasing node back to its markdown source, for reassembling an
 * embed that remark split apart: a `[text](url)` link inside a `![[...]]`
 * caption is parsed into a real link node before this plugin runs. Returns
 * null for node types that cannot be reconstructed.
 */
function serializeInline(node: PhrasingContent): string | null {
  if (node.type === 'text') return node.value;
  if (node.type === 'link') {
    let label = '';
    for (const child of node.children) {
      if (child.type !== 'text') return null;
      label += child.value;
    }
    return `[${label}](${node.url})`;
  }
  return null;
}

/**
 * Builds an mdast node that `mdast-util-to-hast` renders as a looping,
 * muted, inline <video> with native playback controls — the "animated image"
 * treatment. Videos are served statically from `/images/` (the public symlink)
 * rather than the `../images/` asset path, since Astro's image optimizer only
 * handles still images.
 *
 * A caption (the pipe segment) becomes the element `title`, which
 * `rehype-image-figure` later lifts into a <figcaption> — exactly like images.
 * An optional `WxH` segment sets intrinsic width/height so the browser reserves
 * space before metadata loads, avoiding layout shift.
 *
 * Every video is paired with a `<name>-poster.webp` still (same folder) that is
 * shown before playback and whenever the clip is paused — so it never paints as
 * a blank box if autoplay is blocked or the reader prefers reduced motion.
 *
 * The clip is marked `data-autoplay` but ships WITHOUT the `autoplay` attribute:
 * playback is started from JS only when the reader allows motion (see
 * writing/[...slug].astro). This is reduced-motion-safe by default — the poster
 * simply stays put — and avoids the race where the browser starts autoplay
 * before a "pause it" script can run.
 */
function createVideoNode(
  filename: string,
  caption: string | null,
  width: number | null,
  height: number | null,
): PhrasingContent {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const src = `/images/${filename}`;
  const poster = `/images/${filename.replace(/\.[^.]+$/, '')}-poster.webp`;
  return {
    type: 'obsidianVideo',
    data: {
      hName: 'video',
      hProperties: {
        controls: true,
        loop: true,
        muted: true,
        playsInline: true,
        preload: 'metadata',
        poster,
        dataAutoplay: true,
        ...(width && height ? { width, height } : {}),
        ...(caption ? { title: caption } : {}),
      },
      hChildren: [
        {
          type: 'element',
          tagName: 'source',
          properties: { src, type: VIDEO_MIME[ext] },
          children: [],
        },
        {
          type: 'element',
          tagName: 'a',
          properties: { href: src },
          children: [{ type: 'text', value: 'Download the video' }],
        },
      ],
    },
  } as unknown as PhrasingContent;
}

/**
 * Expands every complete `![[...]]` embed in `value` into image/video nodes,
 * keeping surrounding text. Returns null when `value` contains no embed.
 */
function transformEmbeds(value: string): PhrasingContent[] | null {
  const out: PhrasingContent[] = [];
  let lastIndex = 0;
  let match;

  EMBED_REGEX.lastIndex = 0;
  while ((match = EMBED_REGEX.exec(value)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      out.push({
        type: 'text',
        value: value.slice(lastIndex, match.index),
      } as Text);
    }

    // Parse ![[file|caption|WxH]] — caption and the optional WxH
    // dimensions can appear in either order; only videos use dims.
    const parts = match[1].split('|');
    const filename = parts[0].trim();
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';

    if (VIDEO_MIME[ext]) {
      const rest = parts.slice(1).map((p) => p.trim()).filter(Boolean);
      const dimToken = rest.find((p) => /^\d+x\d+$/i.test(p));
      const caption = rest.find((p) => p !== dimToken) ?? null;
      let width: number | null = null;
      let height: number | null = null;
      if (dimToken) {
        const [w, h] = dimToken.toLowerCase().split('x');
        width = Number(w);
        height = Number(h);
      }
      out.push(createVideoNode(filename, caption, width, height));
    } else {
      // Add image node — support ![[file.png|alt text]] syntax. The alt is
      // plain text (link syntax stripped); the raw caption rides on `title`
      // for rehype-image-figure to render into the figcaption.
      const caption = parts[1]?.trim() || null;
      const imageNode: Image = {
        type: 'image',
        url: `../images/${filename}`,
        alt: caption ? stripMarkdownLinks(caption) : filename,
        title: caption,
      };
      out.push(imageNode as unknown as PhrasingContent);
    }
    lastIndex = EMBED_REGEX.lastIndex;
  }

  if (lastIndex === 0) return null;
  if (lastIndex < value.length) {
    out.push({
      type: 'text',
      value: value.slice(lastIndex),
    } as Text);
  }
  return out;
}

export function remarkObsidianImages() {
  return (tree: Root) => {
    visit(tree, 'paragraph', (node: Paragraph) => {
      const children = node.children;
      const newChildren: PhrasingContent[] = [];
      let i = 0;

      while (i < children.length) {
        const child = children[i];
        if (child.type !== 'text' || !child.value.includes('![[')) {
          newChildren.push(child);
          i++;
          continue;
        }

        // Reassemble an embed remark split apart: while the `![[` opener is
        // unclosed, fold in following siblings (links serialized back to
        // `[text](url)` source) until the `]]` closer appears.
        let value = child.value;
        let end = i;
        while (hasUnclosedEmbed(value) && end + 1 < children.length) {
          const serialized = serializeInline(children[end + 1]);
          if (serialized === null) break;
          value += serialized;
          end++;
        }

        const transformed = hasUnclosedEmbed(value)
          ? null
          : transformEmbeds(value);
        if (transformed === null) {
          // No complete embed — leave this node (and its siblings) untouched.
          newChildren.push(child);
          i++;
          continue;
        }

        newChildren.push(...transformed);
        i = end + 1;
      }

      node.children = newChildren;
    });
  };
}
