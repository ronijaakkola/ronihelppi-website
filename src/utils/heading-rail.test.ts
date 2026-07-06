import { describe, it, expect } from 'vitest';
import { pickActiveHeadingId, type HeadingPosition } from './heading-rail';

describe('pickActiveHeadingId', () => {
  const headings: HeadingPosition[] = [
    { id: 'intro', top: -400 },
    { id: 'setup', top: -100 },
    { id: 'usage', top: 300 },
    { id: 'wrap-up', top: 900 },
  ];

  it('returns null when there are no headings', () => {
    expect(pickActiveHeadingId([], 120)).toBeNull();
  });

  it('activates the last heading whose top has scrolled above the offset line', () => {
    // With offset 120: intro (-400) and setup (-100) are above the line,
    // usage (300) and wrap-up (900) are still below it.
    expect(pickActiveHeadingId(headings, 120)).toBe('setup');
  });

  it('falls back to the first heading before any heading reaches the line', () => {
    const belowLine: HeadingPosition[] = [
      { id: 'intro', top: 200 },
      { id: 'setup', top: 500 },
    ];
    expect(pickActiveHeadingId(belowLine, 120)).toBe('intro');
  });

  it('activates the final heading once the reader scrolls past all of them', () => {
    const allAbove: HeadingPosition[] = [
      { id: 'intro', top: -900 },
      { id: 'setup', top: -600 },
      { id: 'usage', top: -300 },
    ];
    expect(pickActiveHeadingId(allAbove, 120)).toBe('usage');
  });

  it('treats a heading exactly on the offset line as active', () => {
    const onLine: HeadingPosition[] = [
      { id: 'intro', top: -50 },
      { id: 'setup', top: 120 },
      { id: 'usage', top: 400 },
    ];
    expect(pickActiveHeadingId(onLine, 120)).toBe('setup');
  });

  it('respects a zero offset (activation at the viewport top)', () => {
    const items: HeadingPosition[] = [
      { id: 'a', top: -10 },
      { id: 'b', top: 10 },
    ];
    expect(pickActiveHeadingId(items, 0)).toBe('a');
  });

  it('activates the last heading at the bottom of the page even if it never crossed the line', () => {
    // The final section is short, so `wrap-up` (top 900) never scrolls above the
    // activation line — but once the reader hits the bottom of the page it is the
    // section they are looking at, so it must win.
    expect(pickActiveHeadingId(headings, 120, true)).toBe('wrap-up');
  });

  it('ignores the bottom flag when there are no headings', () => {
    expect(pickActiveHeadingId([], 120, true)).toBeNull();
  });
});
