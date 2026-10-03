import { describe, it, expect } from 'vitest';
import { loadLabEntries, labEntries, labNeighbours, labSourceUrl, labPreviewPaths, formatLabDate } from './index';

const entry = (over: Record<string, unknown> = {}) => ({
  default: { title: 'T', description: 'D', date: '2026-01-01', published: true, ...over },
});

describe('loadLabEntries', () => {
  it('derives the slug from the folder name', () => {
    const entries = loadLabEntries({ './my-demo/meta.ts': entry() });
    expect(entries.map((e) => e.slug)).toEqual(['my-demo']);
  });

  it('excludes unpublished demos entirely', () => {
    const entries = loadLabEntries({
      './a/meta.ts': entry({ published: false }),
      './b/meta.ts': entry(),
    });
    expect(entries.map((e) => e.slug)).toEqual(['b']);
  });

  it('sorts newest first', () => {
    const entries = loadLabEntries({
      './old/meta.ts': entry({ date: '2024-01-01' }),
      './new/meta.ts': entry({ date: '2026-01-01' }),
      './mid/meta.ts': entry({ date: '2025-01-01' }),
    });
    expect(entries.map((e) => e.slug)).toEqual(['new', 'mid', 'old']);
  });

  it('throws with the slug when metadata is invalid', () => {
    expect(() => loadLabEntries({ './broken/meta.ts': entry({ title: '' }) })).toThrow(/"broken"/);
  });

  it('the real registry has at least one published demo', () => {
    expect(labEntries.length).toBeGreaterThan(0);
  });
});

describe('labNeighbours', () => {
  // Newest first, as the registry sorts them.
  const entries = loadLabEntries({
    './new/meta.ts': entry({ date: '2026-01-01' }),
    './mid/meta.ts': entry({ date: '2025-01-01' }),
    './old/meta.ts': entry({ date: '2024-01-01' }),
  });
  const slugs = (n: ReturnType<typeof labNeighbours>) => ({ newer: n.newer?.slug ?? null, older: n.older?.slug ?? null });

  it('gives a lone demo no neighbours', () => {
    const [only] = entries;
    expect(slugs(labNeighbours([only], 0))).toEqual({ newer: null, older: null });
  });

  it('links a middle demo to the newer one before it and the older one after it', () => {
    expect(slugs(labNeighbours(entries, 1))).toEqual({ newer: 'new', older: 'old' });
  });

  it('gives the newest demo no newer neighbour and the oldest no older one', () => {
    expect(slugs(labNeighbours(entries, 0))).toEqual({ newer: null, older: 'mid' });
    expect(slugs(labNeighbours(entries, 2))).toEqual({ newer: 'mid', older: null });
  });
});

describe('derived paths', () => {
  it('points the source link at the demo folder on master', () => {
    expect(labSourceUrl('sliding-tabs')).toBe(
      'https://github.com/ronijaakkola/ronihelppi-website/tree/master/src/lab/sliding-tabs',
    );
  });

  it('derives preview assets from the slug', () => {
    expect(labPreviewPaths('x')).toEqual({ video: '/lab/x/preview.mp4', poster: '/lab/x/poster.webp' });
  });

  it('formats dates as month and year', () => {
    expect(formatLabDate(new Date('2026-09-08T12:00:00Z'))).toBe('September 2026');
  });
});
