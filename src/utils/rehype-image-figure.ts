import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

export function rehypeImageFigure() {
  return (tree: Root) => {
    visit(
      tree,
      'element',
      (node: Element, index: number | null | undefined, parent: Element | Root | null | undefined) => {
        if (node.tagName !== 'img') return;
        if (index == null || !parent || !('children' in parent)) return;

        const title = node.properties?.title as string | undefined;
        if (!title) return;

        // Remove title from img to avoid browser tooltip
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
              children: [{ type: 'text', value: title }],
            },
          ],
        };

        parent.children[index] = figure;
      },
    );
  };
}
