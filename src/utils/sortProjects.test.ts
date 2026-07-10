import { describe, it, expect } from 'vitest';
import { sortProjects } from './sortProjects';

// Helper to build a minimal project-like entry.
function entry(id: string, date: string, order?: number, span?: 1 | 2) {
  return { id, data: { date: new Date(date), order, span } };
}

describe('sortProjects', () => {
  it('places ordered entries first, ascending by order', () => {
    const items = [
      entry('c', '2025-01-01', 2),
      entry('a', '2025-01-01', 1),
      entry('b', '2025-01-01', 3),
    ];

    const sorted = sortProjects(items);

    expect(sorted.map((i) => i.id)).toEqual(['a', 'c', 'b']);
  });

  it('keeps unordered entries after ordered ones, in date-descending order', () => {
    const items = [
      entry('old', '2024-01-01'),
      entry('pinned', '2020-01-01', 1),
      entry('new', '2026-01-01'),
    ];

    const sorted = sortProjects(items);

    expect(sorted.map((i) => i.id)).toEqual(['pinned', 'new', 'old']);
  });

  it('breaks ties between equal orders by id ascending (stable, deterministic)', () => {
    const items = [
      entry('zebra', '2025-01-01', 1),
      entry('apple', '2025-01-01', 1),
      entry('mango', '2025-01-01', 1),
    ];

    const sorted = sortProjects(items);

    expect(sorted.map((i) => i.id)).toEqual(['apple', 'mango', 'zebra']);
  });

  it('breaks ties between unordered entries with equal dates by id ascending', () => {
    const items = [
      entry('zebra', '2025-01-01'),
      entry('apple', '2025-01-01'),
    ];

    const sorted = sortProjects(items);

    expect(sorted.map((i) => i.id)).toEqual(['apple', 'zebra']);
  });

  it('mixes ordered and unordered deterministically', () => {
    const items = [
      entry('vuoro', '2026-06-11'),
      entry('clear-skies', '2025-10-06'),
      entry('resokill', '2025-12-01', 1),
      entry('extra', '2025-11-01', 1),
    ];

    const sorted = sortProjects(items);

    // order 1 group: extra & resokill tie on order -> id tie-break
    // unordered group: date desc -> vuoro, clear-skies
    expect(sorted.map((i) => i.id)).toEqual(['extra', 'resokill', 'vuoro', 'clear-skies']);
  });

  it('does not mutate the original array', () => {
    const items = [entry('b', '2025-01-01'), entry('a', '2026-01-01')];
    const snapshot = items.map((i) => i.id);
    sortProjects(items);
    expect(items.map((i) => i.id)).toEqual(snapshot);
  });

  it('returns empty array for empty input', () => {
    expect(sortProjects([])).toEqual([]);
  });

  it('treats order 0 as an explicit order, not unordered', () => {
    const items = [
      entry('new', '2026-01-01'),
      entry('zeroth', '2020-01-01', 0),
    ];

    const sorted = sortProjects(items);

    expect(sorted.map((i) => i.id)).toEqual(['zeroth', 'new']);
  });
});
