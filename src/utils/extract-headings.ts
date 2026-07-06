import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import type { Root, Heading } from 'mdast';
import { createHeadingSlugger } from './heading-slug';

export interface TocHeading {
  text: string;
  slug: string;
}

const processor = unified().use(remarkParse);

/**
 * Parse raw markdown and return its `h2` headings in document order, each paired
 * with the exact fragment slug Astro assigns to the rendered heading.
 *
 * Every heading (any depth) is fed through a single github-slugger so its
 * de-duplication counter matches `rehypeHeadingIds` / `rehypeHeadingLinks` /
 * `remarkToc`. The rail links this produces, the inline `[toc]` card, and the
 * per-heading anchors therefore all resolve to the same ids. Kept `h2`-only to
 * mirror the inline table of contents.
 */
export function extractH2Headings(markdown: string): TocHeading[] {
  const tree = processor.parse(markdown) as Root;
  const slugger = createHeadingSlugger();
  const headings: TocHeading[] = [];

  visit(tree, 'heading', (node: Heading) => {
    const text = toString(node);
    const slug = slugger.slug(text);
    if (node.depth === 2) {
      headings.push({ text, slug });
    }
  });

  return headings;
}
