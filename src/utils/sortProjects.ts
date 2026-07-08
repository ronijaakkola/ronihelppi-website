/**
 * Sorts projects by optional explicit order first, then by descending date.
 * Lower order numbers appear earlier in the list.
 */
export function sortProjects<T extends { data: { date: Date; order?: number } }>(projects: T[]): T[] {
  return [...projects].sort((a, b) => {
    const aOrder = a.data.order;
    const bOrder = b.data.order;

    if (aOrder !== undefined && bOrder !== undefined && aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    if (aOrder !== undefined && bOrder === undefined) {
      return -1;
    }

    if (aOrder === undefined && bOrder !== undefined) {
      return 1;
    }

    return b.data.date.getTime() - a.data.date.getTime();
  });
}