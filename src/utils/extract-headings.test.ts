import { describe, it, expect } from 'vitest';
import { extractH2Headings } from './extract-headings';

describe('extractH2Headings', () => {
  it('returns an empty array when there are no h2 headings', () => {
    expect(extractH2Headings('# Title\n\nJust a paragraph.')).toEqual([]);
  });

  it('collects only h2 headings, in document order', () => {
    const md = `# Title

## First

### A nested h3

## Second

#### Deeper still
`;
    expect(extractH2Headings(md)).toEqual([
      { text: 'First', slug: 'first' },
      { text: 'Second', slug: 'second' },
    ]);
  });

  it('slugs headings the way github-slugger does, de-duplicating repeats', () => {
    const md = `## Setup

## Setup

## Setup
`;
    expect(extractH2Headings(md)).toEqual([
      { text: 'Setup', slug: 'setup' },
      { text: 'Setup', slug: 'setup-1' },
      { text: 'Setup', slug: 'setup-2' },
    ]);
  });

  it('advances the slug counter for non-h2 headings so ids stay in sync', () => {
    // An h3 named "Notes" consumes the "notes" slug, so the later h2 "Notes"
    // must resolve to "notes-1" — matching the rendered heading id.
    const md = `### Notes

## Notes
`;
    expect(extractH2Headings(md)).toEqual([{ text: 'Notes', slug: 'notes-1' }]);
  });

  it('uses the visible text of headings that contain inline markup', () => {
    const md = '## Using `code` and *emphasis*';
    expect(extractH2Headings(md)).toEqual([
      { text: 'Using code and emphasis', slug: 'using-code-and-emphasis' },
    ]);
  });

  it('ignores the [toc] marker paragraph', () => {
    const md = `[toc]

## Only Section
`;
    expect(extractH2Headings(md)).toEqual([
      { text: 'Only Section', slug: 'only-section' },
    ]);
  });
});
