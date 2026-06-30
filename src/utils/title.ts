/**
 * Derives a display title from a filename.
 * Preserves original filename casing by stripping the .md extension.
 */
export function getTitle(id: string): string {
  return id.replace(/\.md$/, '');
}

/**
 * Derives a display title from a content collection entry.
 *
 * The Content Layer `glob` loader slugifies `entry.id` (lowercased, dashed),
 * so the original filename casing is only available via `entry.filePath`.
 * Falls back to `entry.id` when `filePath` is unavailable.
 */
export function getTitleFromEntry(entry: { id: string; filePath?: string }): string {
  const filename = entry.filePath?.split('/').pop() ?? entry.id;
  return getTitle(filename);
}
