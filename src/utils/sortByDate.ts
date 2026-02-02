/**
 * Sorts items by date in descending order (newest first).
 * Works with any object that has a `data.date` property.
 */
export function sortByDateDesc<T extends { data: { date: Date } }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
