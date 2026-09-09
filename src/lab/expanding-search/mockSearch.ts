import type { SearchResult } from './machine';

// A small fake index in the shape of this site's own content. The demo is about
// the motion, so any query yields four rows: title matches float to the top and
// the rest is filled from the index in order, which keeps the result count (and
// therefore the card height) stable.
export const searchIndex: SearchResult[] = [
  { id: 'sliding-tabs', title: 'Sliding tabs', meta: 'Lab · motion, navigation' },
  { id: 'expanding-search', title: 'Expanding search', meta: 'Lab · motion, search' },
  { id: 'designing-with-constraints', title: 'Designing with constraints', meta: 'Writing · 6 min read' },
  { id: 'herdr', title: 'Herdr', meta: 'Project · 2025' },
  { id: 'about', title: 'About Roni', meta: 'Page' },
  { id: 'contact', title: 'Contact', meta: 'Page' },
  { id: 'weeknotes', title: 'Weeknotes, spring', meta: 'Writing · 3 min read' },
  { id: 'type-scale', title: 'A type scale for the web', meta: 'Writing · 8 min read' },
];

export const RESULT_COUNT = 4;

export function rankResults(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  const score = (r: SearchResult) => {
    if (!q) return 0;
    const title = r.title.toLowerCase();
    if (title.startsWith(q)) return 3;
    if (title.includes(q)) return 2;
    if (r.meta.toLowerCase().includes(q)) return 1;
    return 0;
  };
  return searchIndex
    .map((r, i) => ({ r, s: score(r), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, RESULT_COUNT)
    .map(({ r }) => r);
}
