/**
 * Derives a display title from a content collection entry: the original
 * filename without its `.md` extension.
 *
 * The Content Layer `glob` loader slugifies `entry.id` (lowercased, dashed),
 * so the original filename casing is only available via `entry.filePath`.
 * Falls back to `entry.id` when `filePath` is unavailable.
 */
export function getTitleFromEntry(entry: { id: string; filePath?: string }): string {
  const filename = entry.filePath?.split('/').pop() ?? entry.id;
  return filename.replace(/\.md$/, '');
}
