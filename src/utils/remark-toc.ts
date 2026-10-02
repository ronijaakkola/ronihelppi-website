import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Html } from 'mdast';
import { collectH2Headings } from './extract-headings';

/**
 * Remark plugin that replaces a `[toc]` marker in markdown with a
 * table-of-contents card generated from h2 headings.
 */
export function remarkToc() {
  return (tree: Root) => {
    // Slugged exactly as Astro slugs heading ids, so TOC links resolve to the
    // real heading anchors.
    const headings = collectH2Headings(tree);

    // Find and replace [toc] marker
    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      if (!parent || index === undefined) return;
      if (
        node.children.length === 1 &&
        node.children[0].type === 'text' &&
        node.children[0].value.trim() === '[toc]'
      ) {
        if (headings.length === 0) {
          // No headings — remove the marker
          parent.children.splice(index, 1);
          return;
        }

        const count = headings.length;
        const label = count === 1 ? '1 section' : `${count} sections`;

        const rows = headings
          .map((h, i) => {
            const num = String(i + 1).padStart(2, '0');
            const safeText = h.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            const safeSlug = h.slug.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
            return `<li class="toc-row"><a href="#${safeSlug}" class="toc-link"><span class="toc-number" aria-hidden="true">${num}</span><span class="toc-text">${safeText}</span></a></li>`;
          })
          .join('\n');

        const html: Html = {
          type: 'html',
          value: `<nav class="toc-card" aria-label="Table of contents">
<div class="toc-header"><span class="toc-label">Table of contents</span><span class="toc-count">${label}</span></div>
<ol class="toc-list" role="list">
${rows}
</ol>
</nav>`,
        };

        parent.children.splice(index, 1, html);
      }
    });
  };
}
