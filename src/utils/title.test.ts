import { describe, it, expect } from 'vitest';
import { getTitleFromEntry } from './title';

const fromFile = (filename: string) =>
  getTitleFromEntry({ id: 'slugified-id', filePath: `src/content/posts/${filename}` });

describe('getTitleFromEntry filename handling', () => {
  it('removes .md extension from filename', () => {
    expect(fromFile('my-post.md')).toBe('my-post');
  });

  it('preserves original casing', () => {
    expect(fromFile('My-Cool-Post.md')).toBe('My-Cool-Post');
    expect(fromFile('UPPERCASE.md')).toBe('UPPERCASE');
    expect(fromFile('lowercase.md')).toBe('lowercase');
  });

  it('returns unchanged string if no .md extension', () => {
    expect(fromFile('my-post')).toBe('my-post');
    expect(fromFile('my-post.txt')).toBe('my-post.txt');
  });

  it('only removes .md at the end', () => {
    expect(fromFile('my.md.post.md')).toBe('my.md.post');
    expect(fromFile('.md.md')).toBe('.md');
  });

  it('handles empty string', () => {
    expect(fromFile('')).toBe('');
  });

  it('handles just .md', () => {
    expect(fromFile('.md')).toBe('');
  });

  it('handles spaces in title', () => {
    expect(fromFile('My Cool Post.md')).toBe('My Cool Post');
  });

  it('handles special characters', () => {
    expect(fromFile("what's-new.md")).toBe("what's-new");
    expect(fromFile('post_v2.0.md')).toBe('post_v2.0');
  });

  it('handles unicode characters', () => {
    expect(fromFile('\u00e4\u00f6\u00fc.md')).toBe('\u00e4\u00f6\u00fc');
  });
});

describe('getTitleFromEntry', () => {
  it('derives title from filePath basename, preserving original casing', () => {
    expect(
      getTitleFromEntry({ id: 'resokill', filePath: 'src/content/projects/RESOKILL.md' })
    ).toBe('RESOKILL');
  });

  it('preserves spaces from the original filename', () => {
    expect(
      getTitleFromEntry({ id: 'clear-skies', filePath: 'src/content/projects/Clear Skies.md' })
    ).toBe('Clear Skies');
  });

  it('strips the .md extension', () => {
    expect(
      getTitleFromEntry({ id: 'my-post', filePath: 'src/content/posts/My Post.md' })
    ).toBe('My Post');
  });

  it('falls back to id when filePath is missing', () => {
    expect(getTitleFromEntry({ id: 'fallback-id' })).toBe('fallback-id');
  });
});
