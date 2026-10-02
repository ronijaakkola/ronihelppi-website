const WORDS_PER_MINUTE = 200;

/**
 * Estimated reading time for content, formatted for display ("2 minute read").
 * HTML tags are ignored; the minimum is one minute.
 */
export function readTime(content: string): string {
  const text = content.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length;
  const minutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
  return `${minutes} minute read`;
}
