import GithubSlugger from 'github-slugger';

/**
 * Single source of truth for heading slugs.
 *
 * Astro's built-in `rehypeHeadingIds` plugin assigns each heading an `id`
 * using `github-slugger` (walking headings in document order, de-duplicating
 * repeats as `slug`, `slug-1`, `slug-2`, ...). To make the table-of-contents
 * links (generated in remark) and the per-heading anchor links (generated in
 * rehype) resolve to the exact same fragment ids, both must slug with the same
 * library and the same document-order/de-duplication behaviour.
 *
 * Create one slugger per document and feed it every heading in order.
 */
export function createHeadingSlugger(): GithubSlugger {
  return new GithubSlugger();
}
