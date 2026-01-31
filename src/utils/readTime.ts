/**
 * Calculate estimated reading time for content
 * @param content - The text content to analyze
 * @param wordsPerMinute - Average reading speed (default: 200)
 * @returns Estimated reading time in minutes
 */
export function calculateReadTime(content: string, wordsPerMinute = 200): number {
  // Remove HTML tags if present
  const text = content.replace(/<[^>]*>/g, '');
  // Count words by splitting on whitespace
  const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length;
  // Calculate minutes, minimum 1
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Format reading time as a human-readable string
 * @param minutes - Reading time in minutes
 * @returns Formatted string like "2 minute read"
 */
export function formatReadTime(minutes: number): string {
  return `${minutes} minute read`;
}
