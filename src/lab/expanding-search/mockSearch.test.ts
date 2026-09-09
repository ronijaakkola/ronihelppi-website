import { describe, it, expect } from 'vitest';
import { searchIndex, rankResults } from './mockSearch';

describe('rankResults', () => {
  it('always returns exactly four results', () => {
    expect(rankResults('')).toHaveLength(4);
    expect(rankResults('zzzzzz')).toHaveLength(4);
    expect(rankResults('tabs')).toHaveLength(4);
  });

  it('puts matching titles first, case-insensitively', () => {
    expect(rankResults('SLIDING')[0].title).toBe('Sliding tabs');
  });

  it('returns entries from the index with unique ids', () => {
    const results = rankResults('lab');
    const ids = new Set(results.map((r) => r.id));
    expect(ids.size).toBe(4);
    for (const r of results) expect(searchIndex.some((e) => e.id === r.id)).toBe(true);
  });

  it('is deterministic for the same query', () => {
    expect(rankResults('design')).toEqual(rankResults('design'));
  });
});
