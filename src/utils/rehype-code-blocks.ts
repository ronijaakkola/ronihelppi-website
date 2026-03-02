import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

// Must match the prefix in remark-code-title.ts
const TITLE_COMMENT_PREFIX = 'code-block-title:';

export function rehypeCodeBlocks() {
  return (tree: Root) => {
    visit(
      tree,
      'element',
      (node: Element, index: number | null | undefined, parent: Element | Root | null | undefined) => {
        if (node.tagName !== 'pre') return;
        if (index == null || !parent || !('children' in parent)) return;

        let title: string | undefined;
        let commentIndex: number | undefined;

        // Walk backwards past whitespace text nodes to find the title comment.
        // rehypeRaw runs AFTER user rehypePlugins, so the HTML comment from
        // remarkCodeTitle is still a { type: 'raw', value: '<!-- ... -->' } node.
        let searchIndex = index - 1;
        while (searchIndex >= 0) {
          const sibling = parent.children[searchIndex];
          // Skip whitespace-only text nodes (e.g. "\n" between blocks)
          if (sibling.type === 'text' && /^\s*$/.test((sibling as { value: string }).value)) {
            searchIndex--;
            continue;
          }
          const rawValue = (sibling as { type: string; value?: string })?.value;
          if (sibling.type === 'raw' && rawValue !== undefined) {
            const commentMatch = rawValue
              .trim()
              .match(/^<!--\s*code-block-title:\s*(.+?)\s*-->$/);
            if (commentMatch) {
              title = commentMatch[1];
              commentIndex = searchIndex;
            }
          }
          break;
        }

        // Remove the comment + any whitespace nodes between it and the <pre>.
        if (commentIndex !== undefined) {
          const deleteCount = index - commentIndex;
          parent.children.splice(commentIndex, deleteCount);
          index = commentIndex;
        }

        const wrapperChildren: Element[] = [];

        if (title) {
          wrapperChildren.push({
            type: 'element',
            tagName: 'div',
            properties: { className: ['code-block-filename'] },
            children: [{ type: 'text', value: title }],
          });
        }

        const body: Element = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['code-block-body'] },
          children: [
            node,
            {
              type: 'element',
              tagName: 'button',
              properties: {
                className: ['code-copy-btn'],
                type: 'button',
                ariaLabel: 'Copy code',
              },
              children: [{ type: 'text', value: 'Copy' }],
            },
          ],
        };

        wrapperChildren.push(body);

        const wrapper: Element = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['code-block-wrapper'] },
          children: wrapperChildren,
        };

        (parent.children as Element[]).splice(index, 1, wrapper);
      },
    );
  };
}
