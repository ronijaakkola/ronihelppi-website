import { visit } from 'unist-util-visit';
import type { Root, Paragraph, PhrasingContent, Image, Text } from 'mdast';

export function remarkObsidianImages() {
  return (tree: Root) => {
    visit(tree, 'paragraph', (node: Paragraph) => {
      const newChildren: PhrasingContent[] = [];

      for (const child of node.children) {
        if (child.type === 'text') {
          const regex = /!\[\[([^\]]+)\]\]/g;
          let lastIndex = 0;
          let match;

          while ((match = regex.exec(child.value)) !== null) {
            // Add text before match
            if (match.index > lastIndex) {
              newChildren.push({
                type: 'text',
                value: child.value.slice(lastIndex, match.index),
              } as Text);
            }
            // Add image node
            newChildren.push({
              type: 'image',
              url: `/images/${match[1]}`,
              alt: match[1],
            } as Image);
            lastIndex = regex.lastIndex;
          }

          // Add remaining text
          if (lastIndex < child.value.length) {
            newChildren.push({
              type: 'text',
              value: child.value.slice(lastIndex),
            } as Text);
          }

          // If no matches, keep original
          if (lastIndex === 0) {
            newChildren.push(child);
          }
        } else {
          newChildren.push(child);
        }
      }

      node.children = newChildren;
    });
  };
}
