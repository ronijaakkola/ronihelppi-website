import { visit } from 'unist-util-visit';
import type { Root, Element, RootContent } from 'hast';
import { createHeadingSlugger } from './heading-slug';

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

/**
 * Iconoir "link" icon.
 * Rendered with the repo's icon conventions: 24x24 viewBox, `currentColor`,
 * and 1.33333 stroke width (matching Header/Lightbox/related-post icons).
 */
function linkIcon(): Element {
  const strokeProps = {
    stroke: 'currentColor',
    strokeWidth: '1.33333',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  return {
    type: 'element',
    tagName: 'svg',
    properties: {
      className: ['heading-anchor-icon'],
      width: '24',
      height: '24',
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      ariaHidden: 'true',
    },
    children: [
      {
        type: 'element',
        tagName: 'path',
        properties: {
          d: 'M14 11.9976C14 9.5059 11.683 7 8.85714 7C8.52241 7 7.41904 7.00001 7.14286 7.00001C4.30254 7.00001 2 9.23752 2 11.9976C2 14.376 3.70973 16.3664 6 16.8714C6.36756 16.9525 6.75006 16.9952 7.14286 16.9952',
          ...strokeProps,
        },
        children: [],
      },
      {
        type: 'element',
        tagName: 'path',
        properties: {
          d: 'M10 11.9976C10 14.4893 12.317 16.9952 15.1429 16.9952C15.4776 16.9952 16.581 16.9952 16.8571 16.9952C19.6975 16.9952 22 14.7577 22 11.9976C22 9.6192 20.2903 7.62884 18 7.12383C17.6324 7.04278 17.2499 6.99999 16.8571 6.99999',
          ...strokeProps,
        },
        children: [],
      },
    ],
  };
}

/** Concatenate the visible text of a hast node (mirrors github-slugger input). */
function textContent(node: Root | RootContent): string {
  if (node.type === 'text') return node.value;
  if ('children' in node) {
    return node.children.map(textContent).join('');
  }
  return '';
}

/**
 * Rehype plugin that turns post content headings into linkable anchors.
 *
 * For every heading it:
 *  1. Ensures the heading has an `id`, slugged with the same `github-slugger`
 *     Astro's `rehypeHeadingIds` uses — so the id, the anchor `href`, and the
 *     table-of-contents links all agree. (Astro's plugin runs afterwards and
 *     preserves an already-present id, so ours wins without conflict.)
 *  2. Appends an anchor `<a href="#id">` containing the Iconoir link icon.
 *     A plain fragment link natively updates the URL hash and scrolls to the
 *     heading on click — no clipboard side effects, works without JS, and
 *     survives Astro View Transitions since it is baked into the HTML.
 */
export function rehypeHeadingLinks() {
  return (tree: Root) => {
    const slugger = createHeadingSlugger();

    visit(tree, 'element', (node: Element) => {
      if (!HEADING_TAGS.has(node.tagName)) return;

      node.properties = node.properties || {};

      // Advance the slugger for every heading in document order so the
      // de-duplication counter matches rehypeHeadingIds exactly.
      const slug = slugger.slug(textContent(node));
      const id =
        typeof node.properties.id === 'string' && node.properties.id
          ? node.properties.id
          : slug;
      node.properties.id = id;

      const headingText = textContent(node).trim();
      const anchor: Element = {
        type: 'element',
        tagName: 'a',
        properties: {
          className: ['heading-anchor'],
          href: `#${id}`,
          ariaLabel: headingText
            ? `Link to this section: ${headingText}`
            : 'Link to this section',
        },
        children: [linkIcon()],
      };

      node.children.push(anchor);
    });
  };
}
