import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import GithubSlugger from 'github-slugger';
import type { Root, Heading } from 'mdast';

export interface TocHeading {
  text: string;
  slug: string;
}

const processor = unified().use(remarkParse);

/**
 * Return the `h2` headings of a markdown tree in document order, each paired
 * with the exact fragment slug Astro assigns to the rendered heading.
 *
 * Astro's built-in `rehypeHeadingIds` assigns ids with `github-slugger`, walking
 * every heading (any depth) in document order and de-duplicating repeats as
 * `slug`, `slug-1`, `slug-2`, ... One slugger is fed every heading here so the
 * counter matches; `rehypeHeadingLinks` does the same on the hast side. The
 * heading rail, the inline `[toc]` card and the per-heading anchors therefore
 * all resolve to the same ids. Kept `h2`-only to mirror the inline table of
 * contents.
 */
export function collectH2Headings(tree: Root): TocHeading[] {
  const slugger = new GithubSlugger();
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

/** Parse raw markdown and return its `h2` headings (see `collectH2Headings`). */
export function extractH2Headings(markdown: string): TocHeading[] {
  return collectH2Headings(processor.parse(markdown) as Root);
}
