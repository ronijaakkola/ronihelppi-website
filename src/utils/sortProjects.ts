/**
 * Deterministic ordering for project cards.
 *
 * - Entries with an explicit `order` come first, ascending by `order`.
 * - Entries without an `order` follow, retaining date-descending order
 *   (newest first).
 * - Ties (equal `order`, or equal date among unordered entries) break by
 *   `id` ascending, so the result is fully deterministic and stable.
 */
export function sortProjects<
  T extends { id: string; data: { date: Date; order?: number } }
>(items: T[]): T[] {
  const byId = (a: T, b: T) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

  return [...items].sort((a, b) => {
    const aOrdered = a.data.order != null;
    const bOrdered = b.data.order != null;

    if (aOrdered && bOrdered) {
      if (a.data.order !== b.data.order) {
        return a.data.order! - b.data.order!;
      }
      return byId(a, b);
    }

    // Ordered entries always precede unordered ones.
    if (aOrdered) return -1;
    if (bOrdered) return 1;

    const dateDiff = b.data.date.getTime() - a.data.date.getTime();
    if (dateDiff !== 0) return dateDiff;
    return byId(a, b);
  });
}
