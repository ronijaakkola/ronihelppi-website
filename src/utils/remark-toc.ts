import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Heading, Html } from 'mdast';
import { toString } from 'mdast-util-to-string';
import { createHeadingSlugger } from './heading-slug';

/**
 * Remark plugin that replaces a `[toc]` marker in markdown with a
 * table-of-contents card generated from h2 headings.
 */
export function remarkToc() {
  return (tree: Root) => {
    // Slug every heading in document order with the same github-slugger Astro
    // uses for heading ids, so TOC links resolve to the real heading anchors
    // (including github-slugger's de-duplication of repeated headings).
    const slugger = createHeadingSlugger();
    const headings: { text: string; slug: string }[] = [];
    visit(tree, 'heading', (node: Heading) => {
      const text = toString(node);
      const slug = slugger.slug(text);
      if (node.depth === 2) {
        headings.push({ text, slug });
      }
    });

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
