import type { CollectionEntry } from 'astro:content';
import { getTitleFromEntry } from './title';

type MarkdownEntry = CollectionEntry<'posts'> | CollectionEntry<'projects'>;

/**
 * Build the plain-markdown twin of a post/project page, exposed at a `.md`
 * URL so agents can fetch a clean, structure-preserving source instead of
 * parsing the rendered HTML. Mirrors the on-page "Copy post" output: the
 * title as an H1 followed by the raw markdown body.
 */
export function renderEntryMarkdown(entry: MarkdownEntry): Response {
  const title = getTitleFromEntry(entry);
  const body = `# ${title}\n\n${entry.body ?? ''}\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
