export function generateDescription(body: string): string {
  const plainText = body
    .replace(/^---[\s\S]*?---/, '') // Remove frontmatter
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
    .replace(/[#*_`~]/g, '') // Remove markdown formatting
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  if (plainText.length <= 155) return plainText;
  return plainText.slice(0, 152).trim() + '\u2026';
}
