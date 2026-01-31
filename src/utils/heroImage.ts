/**
 * Extract the first image URL from HTML content
 * @param html - The rendered HTML content
 * @returns The first image src or null if none found
 */
export function extractFirstImage(html: string): string | null {
  // Match img tags and extract src attribute
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  return null;
}

/**
 * Remove the first image from HTML content (for when it's used as hero)
 * @param html - The rendered HTML content
 * @returns HTML with first image removed
 */
export function removeFirstImage(html: string): string {
  // Remove first img tag (including any wrapping p tag if it only contains the image)
  return html.replace(/<p>\s*<img[^>]+>\s*<\/p>/i, '').replace(/<img[^>]+>/i, '');
}
