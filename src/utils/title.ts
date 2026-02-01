/**
 * Derives a display title from a content entry ID.
 * Preserves original filename casing by stripping the .md extension.
 */
export function getTitle(id: string): string {
  return id.replace(/\.md$/, '');
}
