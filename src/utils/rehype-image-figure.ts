import { visit } from 'unist-util-visit';
import type { Root, Element, ElementContent } from 'hast';

/**
 * Renders `[text](url)` occurrences in a caption as real links. Captions are
 * authored inside `![[...]]` embeds, where remark cannot parse them itself —
 * remarkObsidianImages passes the raw caption through on `title`. External
 * link attributes (target, rel) are added by rehype-external-links, which
 * runs after this plugin.
 */
function parseCaption(caption: string): ElementContent[] {
  const out: ElementContent[] = [];
  const regex = /\[([^\]]+)\]\(([^()\s]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(caption)) !== null) {
    if (match.index > lastIndex) {
      out.push({ type: 'text', value: caption.slice(lastIndex, match.index) });
    }
    out.push({
      type: 'element',
      tagName: 'a',
      properties: { href: match[2] },
      children: [{ type: 'text', value: match[1] }],
    });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < caption.length) {
    out.push({ type: 'text', value: caption.slice(lastIndex) });
  }
  return out;
}

export function rehypeImageFigure() {
  return (tree: Root) => {
    visit(
      tree,
      'element',
      (node: Element, index: number | null | undefined, parent: Element | Root | null | undefined) => {
        // Images and videos share the same captioned <figure> treatment; the
        // caption rides in on the element's `title` (set by remarkObsidianImages).
        if (node.tagName !== 'img' && node.tagName !== 'video') return;
        if (index == null || !parent || !('children' in parent)) return;

        const title = node.properties?.title as string | undefined;
        if (!title) return;

        // Remove title from the element to avoid a browser tooltip
        delete node.properties.title;

        const figure: Element = {
          type: 'element',
          tagName: 'figure',
          properties: { className: ['prose-figure'] },
          children: [
            node,
            {
              type: 'element',
              tagName: 'figcaption',
              properties: {},
              children: parseCaption(title),
            },
          ],
        };

        parent.children[index] = figure;
      },
    );
  };
}
