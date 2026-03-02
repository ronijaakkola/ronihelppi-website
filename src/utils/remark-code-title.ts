import { visit, SKIP } from 'unist-util-visit';
import type { Root, Code, Html, Parent } from 'mdast';

// Marker prefix used to communicate the title from remark to the rehype plugin.
// An HTML comment is injected BEFORE the code block; rehype-raw converts it to
// a hast comment node which rehypeCodeBlocks picks up after Shiki runs.
const TITLE_COMMENT_PREFIX = 'code-block-title:';

export function remarkCodeTitle() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code, index: number | null | undefined, parent: Parent | null | undefined) => {
      if (index == null || !parent) return;

      const meta = node.meta ?? '';
      const match = meta.match(/(?:title|filename)="([^"]+)"/);
      if (!match) return SKIP;

      const title = match[1];

      // Strip the title/filename attribute from the meta so Shiki doesn't see it
      node.meta = meta.replace(/(?:title|filename)="[^"]+"/, '').trim() || null;

      // Insert an HTML comment node BEFORE the code block that carries the title.
      // rehype-raw will convert this to a hast comment node, which rehypeCodeBlocks
      // can read AFTER Shiki has syntax-highlighted the code.
      const marker: Html = {
        type: 'html',
        value: `<!-- ${TITLE_COMMENT_PREFIX} ${title} -->`,
      };

      parent.children.splice(index, 0, marker);

      // Skip re-visiting the inserted node; re-visiting the code node is fine
      return [SKIP, index + 1] as const;
    });
  };
}
