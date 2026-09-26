import { visit } from 'unist-util-visit';
import type { Root, Element, Text } from 'hast';

/** Punctuation, closing brackets and closing quotes that may trail a link. */
const TRAILING = /^[.,;:!?)\]}"'”’»›]+/;

/** Same test the CSS uses (`a[href^="http"]`) to decide an anchor gets the arrow icon. */
const isExternalHref = (href: unknown) => typeof href === 'string' && /^https?:\/\//.test(href);

/**
 * Rehype plugin that keeps an external link glued to the punctuation that
 * immediately follows it.
 *
 * Prose external links are `inline-flex` (so the arrow icon sits beside the
 * text), which makes the anchor an atomic inline box. The browser is free to
 * break the line between an atomic inline and the text after it, so a `.` or
 * `)` outside the anchor can land alone at the start of the next line. The
 * punctuation has to stay outside the anchor (pulling it in would enlarge the
 * hit area), so instead the anchor and its trailing punctuation are wrapped in
 * `<span class="external-link-group">`, which is `white-space: nowrap`.
 *
 * Must run after rehype-external-links so it sees the final anchors.
 */
export function rehypeExternalLinkPunctuation() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'a' || !parent || index === undefined) return;
      if (!isExternalHref(node.properties?.href)) return;

      const next = parent.children[index + 1];
      if (next?.type !== 'text') return;
      const match = TRAILING.exec(next.value);
      if (!match) return;

      const punctuation: Text = { type: 'text', value: match[0] };
      const group: Element = {
        type: 'element',
        tagName: 'span',
        properties: { className: ['external-link-group'] },
        children: [node, punctuation],
      };

      const rest = next.value.slice(match[0].length);
      const replacement: (Element | Text)[] = [group];
      if (rest) replacement.push({ type: 'text', value: rest });
      parent.children.splice(index, 2, ...replacement);

      // Resume after the group; the anchor is now inside it.
      return index + 1;
    });
  };
}
