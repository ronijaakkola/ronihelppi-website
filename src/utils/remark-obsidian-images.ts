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
            // Add image node — support ![[file.png|alt text]] syntax
            const parts = match[1].split('|');
            const filename = parts[0].trim();
            const alt = parts[1]?.trim() || filename;
            const imageNode: Image = {
              type: 'image',
              url: `../images/${filename}`,
              alt,
              title: parts[1]?.trim() || null,
            };
            newChildren.push(imageNode as unknown as PhrasingContent);
            lastIndex = regex.lastIndex;
          }

          // If no matches, keep original; otherwise add remaining text
          if (lastIndex === 0) {
            newChildren.push(child);
          } else if (lastIndex < child.value.length) {
            newChildren.push({
              type: 'text',
              value: child.value.slice(lastIndex),
            } as Text);
          }
        } else {
          newChildren.push(child);
        }
      }

      node.children = newChildren;
    });
  };
}
