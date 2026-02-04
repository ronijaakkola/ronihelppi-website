import { describe, it, expect } from 'vitest';
import { getTitle } from './title';

describe('getTitle', () => {
  it('removes .md extension from filename', () => {
    expect(getTitle('my-post.md')).toBe('my-post');
  });

  it('preserves original casing', () => {
    expect(getTitle('My-Cool-Post.md')).toBe('My-Cool-Post');
    expect(getTitle('UPPERCASE.md')).toBe('UPPERCASE');
    expect(getTitle('lowercase.md')).toBe('lowercase');
  });

  it('returns unchanged string if no .md extension', () => {
    expect(getTitle('my-post')).toBe('my-post');
    expect(getTitle('my-post.txt')).toBe('my-post.txt');
  });

  it('only removes .md at the end', () => {
    expect(getTitle('my.md.post.md')).toBe('my.md.post');
    expect(getTitle('.md.md')).toBe('.md');
  });

  it('handles empty string', () => {
    expect(getTitle('')).toBe('');
  });

  it('handles just .md', () => {
    expect(getTitle('.md')).toBe('');
  });

  it('handles spaces in title', () => {
    expect(getTitle('My Cool Post.md')).toBe('My Cool Post');
  });

  it('handles special characters', () => {
    expect(getTitle("what's-new.md")).toBe("what's-new");
    expect(getTitle('post_v2.0.md')).toBe('post_v2.0');
  });

  it('handles unicode characters', () => {
    expect(getTitle('\u00e4\u00f6\u00fc.md')).toBe('\u00e4\u00f6\u00fc');
  });
});
