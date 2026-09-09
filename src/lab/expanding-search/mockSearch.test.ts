import { describe, it, expect } from 'vitest';
import { searchIndex, rankResults, matchRange } from './mockSearch';

describe('rankResults', () => {
  it('always returns exactly four results', () => {
    expect(rankResults('')).toHaveLength(4);
    expect(rankResults('zzzzzz')).toHaveLength(4);
    expect(rankResults('berry')).toHaveLength(4);
  });

  it('puts matching titles first, case-insensitively, prefix before infix', () => {
    expect(rankResults('APP')[0].title).toBe('Apple');
    const berries = rankResults('berry').slice(0, 2).map((r) => r.title);
    expect(berries).toEqual(expect.arrayContaining(['Strawberry', 'Blueberry']));
  });

  it('returns entries from the index with unique ids', () => {
    const results = rankResults('an');
    const ids = new Set(results.map((r) => r.id));
    expect(ids.size).toBe(4);
    for (const r of results) expect(searchIndex.some((e) => e.id === r.id)).toBe(true);
  });

  it('is deterministic for the same query', () => {
    expect(rankResults('pe')).toEqual(rankResults('pe'));
  });

  it('every entry has a kcal meta line', () => {
    for (const e of searchIndex) expect(e.meta).toMatch(/^\d+ kcal · 100 g$/);
  });
});

describe('matchRange', () => {
  it('finds the matched span case-insensitively', () => {
    expect(matchRange('Strawberry', 'BERRY')).toEqual([5, 10]);
    expect(matchRange('Apple', 'app')).toEqual([0, 3]);
  });

  it('returns null when there is no hit or the query is blank', () => {
    expect(matchRange('Apple', 'xyz')).toBeNull();
    expect(matchRange('Apple', '  ')).toBeNull();
  });
});
