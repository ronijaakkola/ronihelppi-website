import type { SearchResult } from './machine';

// A small fake index of fruit with their energy per 100 g. Generic enough that
// anyone can guess a hit ("apple", "berry"), and the demo is about the motion,
// so any query yields four rows: title matches float to the top and the rest
// is filled from the index in order, which keeps the result count (and
// therefore the card height) stable.
const fruit: [string, number][] = [
  ['Apple', 52],
  ['Banana', 89],
  ['Orange', 47],
  ['Strawberry', 32],
  ['Blueberry', 57],
  ['Mango', 60],
  ['Pineapple', 50],
  ['Watermelon', 30],
  ['Grapes', 69],
  ['Kiwi', 61],
  ['Peach', 39],
  ['Cherry', 63],
  ['Pear', 57],
  ['Lemon', 29],
  ['Avocado', 160],
  ['Pomegranate', 83],
];

export const searchIndex: SearchResult[] = fruit.map(([title, kcal]) => ({
  id: title.toLowerCase(),
  title,
  meta: `${kcal} kcal · 100 g`,
}));

export const RESULT_COUNT = 4;

export function rankResults(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  const score = (r: SearchResult) => {
    if (!q) return 0;
    const title = r.title.toLowerCase();
    if (title.startsWith(q)) return 2;
    if (title.includes(q)) return 1;
    return 0;
  };
  return searchIndex
    .map((r, i) => ({ r, s: score(r), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, RESULT_COUNT)
    .map(({ r }) => r);
}

/** [start, end) of the query inside the title, case-insensitively, or null when it does not occur. */
export function matchRange(title: string, query: string): [number, number] | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const i = title.toLowerCase().indexOf(q);
  return i === -1 ? null : [i, i + q.length];
}
