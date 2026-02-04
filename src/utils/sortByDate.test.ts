import { describe, it, expect } from 'vitest';
import { sortByDateDesc } from './sortByDate';

describe('sortByDateDesc', () => {
  it('sorts items by date in descending order (newest first)', () => {
    const items = [
      { data: { date: new Date('2024-01-15') } },
      { data: { date: new Date('2024-03-20') } },
      { data: { date: new Date('2024-02-10') } },
    ];

    const sorted = sortByDateDesc(items);

    expect(sorted[0].data.date).toEqual(new Date('2024-03-20'));
    expect(sorted[1].data.date).toEqual(new Date('2024-02-10'));
    expect(sorted[2].data.date).toEqual(new Date('2024-01-15'));
  });

  it('returns empty array for empty input', () => {
    const sorted = sortByDateDesc([]);
    expect(sorted).toEqual([]);
  });

  it('returns single item unchanged', () => {
    const items = [{ data: { date: new Date('2024-01-15') } }];
    const sorted = sortByDateDesc(items);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].data.date).toEqual(new Date('2024-01-15'));
  });

  it('handles items with same dates', () => {
    const items = [
      { data: { date: new Date('2024-01-15') }, id: 'first' },
      { data: { date: new Date('2024-01-15') }, id: 'second' },
    ];

    const sorted = sortByDateDesc(items);
    expect(sorted).toHaveLength(2);
    // Both should be present, order is stable
    expect(sorted.map((i) => i.id)).toContain('first');
    expect(sorted.map((i) => i.id)).toContain('second');
  });

  it('does not mutate the original array', () => {
    const items = [
      { data: { date: new Date('2024-01-15') } },
      { data: { date: new Date('2024-03-20') } },
    ];

    const original = [...items];
    sortByDateDesc(items);

    expect(items[0].data.date).toEqual(original[0].data.date);
    expect(items[1].data.date).toEqual(original[1].data.date);
  });

  it('handles dates with time components', () => {
    const items = [
      { data: { date: new Date('2024-01-15T10:30:00') } },
      { data: { date: new Date('2024-01-15T14:00:00') } },
      { data: { date: new Date('2024-01-15T08:00:00') } },
    ];

    const sorted = sortByDateDesc(items);

    expect(sorted[0].data.date).toEqual(new Date('2024-01-15T14:00:00'));
    expect(sorted[1].data.date).toEqual(new Date('2024-01-15T10:30:00'));
    expect(sorted[2].data.date).toEqual(new Date('2024-01-15T08:00:00'));
  });

  it('preserves additional properties on items', () => {
    const items = [
      { data: { date: new Date('2024-01-15'), title: 'Post A' }, slug: 'a' },
      { data: { date: new Date('2024-03-20'), title: 'Post B' }, slug: 'b' },
    ];

    const sorted = sortByDateDesc(items);

    expect(sorted[0].data.title).toBe('Post B');
    expect(sorted[0].slug).toBe('b');
    expect(sorted[1].data.title).toBe('Post A');
    expect(sorted[1].slug).toBe('a');
  });
});
