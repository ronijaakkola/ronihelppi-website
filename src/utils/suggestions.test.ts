import { describe, it, expect } from 'vitest';
import { getSuggestions, scoreSuggestion, normalizeTag, type SuggestionEntry } from './suggestions';

function entry(id: string, opts: Partial<SuggestionEntry['data']> = {}): SuggestionEntry {
  return {
    id,
    data: {
      date: opts.date ?? new Date('2025-01-01'),
      tags: opts.tags,
      relatedPosts: opts.relatedPosts,
    },
  };
}

describe('normalizeTag', () => {
  it('strips a leading hash', () => {
    expect(normalizeTag('#games')).toBe('games');
  });

  it('lowercases and trims', () => {
    expect(normalizeTag('  #Games ')).toBe('games');
  });

  it('leaves already-normalized tags unchanged', () => {
    expect(normalizeTag('games')).toBe('games');
  });
});

describe('scoreSuggestion', () => {
  it('scores zero when there is no shared signal', () => {
    expect(scoreSuggestion(entry('a'), entry('b'))).toBe(0);
  });

  it('rewards shared tags regardless of hash prefix or casing', () => {
    const current = entry('a', { tags: ['#Games', '#art'] });
    const candidate = entry('b', { tags: ['games'] });
    expect(scoreSuggestion(current, candidate)).toBe(10);
  });

  it('accumulates score for multiple shared tags', () => {
    const current = entry('a', { tags: ['#games', '#art'] });
    const candidate = entry('b', { tags: ['#games', '#art'] });
    expect(scoreSuggestion(current, candidate)).toBe(20);
  });

  it('ranks a manual reference above tag matches', () => {
    const current = entry('a', { tags: ['#games'], relatedPosts: ['b'] });
    const manual = entry('b');
    const tagged = entry('c', { tags: ['#games'] });
    expect(scoreSuggestion(current, manual)).toBeGreaterThan(scoreSuggestion(current, tagged));
  });
});

describe('getSuggestions', () => {
  it('excludes the current entry', () => {
    const current = entry('a', { tags: ['#games'] });
    const others = [current, entry('b', { tags: ['#games'] })];
    const result = getSuggestions(current, others);
    expect(result.map((e) => e.id)).toEqual(['b']);
  });

  it('returns tag-matched entries before unrelated ones', () => {
    const current = entry('a', { tags: ['#games'] });
    const candidates = [
      entry('unrelated', { date: new Date('2025-06-01') }),
      entry('match', { tags: ['#games'], date: new Date('2020-01-01') }),
    ];
    const result = getSuggestions(current, candidates);
    expect(result[0].id).toBe('match');
  });

  it('orders manual references first, then tag matches, then recency fallback', () => {
    const current = entry('a', { tags: ['#games'], relatedPosts: ['manual'] });
    const candidates = [
      entry('old', { date: new Date('2020-01-01') }),
      entry('recent', { date: new Date('2025-12-01') }),
      entry('tagged', { tags: ['#games'], date: new Date('2019-01-01') }),
      entry('manual', { date: new Date('2018-01-01') }),
    ];
    const result = getSuggestions(current, candidates, 4);
    expect(result.map((e) => e.id)).toEqual(['manual', 'tagged', 'recent', 'old']);
  });

  it('caps the results at the requested limit', () => {
    const current = entry('a', { tags: ['#games'] });
    const candidates = [
      entry('b', { tags: ['#games'] }),
      entry('c', { tags: ['#games'] }),
      entry('d', { tags: ['#games'] }),
    ];
    expect(getSuggestions(current, candidates, 2)).toHaveLength(2);
  });

  it('falls back to recency when no entry shares a signal', () => {
    const current = entry('a');
    const candidates = [
      entry('older', { date: new Date('2024-01-01') }),
      entry('newer', { date: new Date('2025-01-01') }),
    ];
    const result = getSuggestions(current, candidates, 2);
    expect(result.map((e) => e.id)).toEqual(['newer', 'older']);
  });

  it('returns an empty array when there are no other entries', () => {
    const current = entry('a');
    expect(getSuggestions(current, [current])).toEqual([]);
  });

  it('is deterministic for entries tied on score and date', () => {
    const current = entry('a', { tags: ['#games'] });
    const sameDate = new Date('2025-01-01');
    const candidates = [
      entry('zebra', { tags: ['#games'], date: sameDate }),
      entry('alpha', { tags: ['#games'], date: sameDate }),
    ];
    const result = getSuggestions(current, candidates, 2);
    expect(result.map((e) => e.id)).toEqual(['alpha', 'zebra']);
  });
});
