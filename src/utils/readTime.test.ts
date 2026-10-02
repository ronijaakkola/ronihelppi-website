import { describe, it, expect } from 'vitest';
import { readTime } from './readTime';

const words = (n: number) => Array(n).fill('word').join(' ');

describe('readTime', () => {
  it('returns 1 minute for very short content', () => {
    expect(readTime('Hello world')).toBe('1 minute read');
  });

  it('reads 200 words in 1 minute', () => {
    expect(readTime(words(200))).toBe('1 minute read');
  });

  it('rounds up to next minute', () => {
    expect(readTime(words(201))).toBe('2 minute read');
  });

  it('handles 400 words as 2 minutes', () => {
    expect(readTime(words(400))).toBe('2 minute read');
  });

  it('formats long reads', () => {
    expect(readTime(words(6000))).toBe('30 minute read');
  });

  it('handles empty string', () => {
    expect(readTime('')).toBe('1 minute read');
  });

  it('handles whitespace-only string', () => {
    expect(readTime('   \n\t  ')).toBe('1 minute read');
  });

  it('strips HTML tags before counting', () => {
    // 200 words wrapped in tags: still 1 minute, so the tags were not counted
    const html = `<p><strong>${words(100)}</strong> <a href="#">${words(100)}</a></p>`;
    expect(readTime(html)).toBe('1 minute read');
  });

  it('handles content with multiple spaces between words', () => {
    expect(readTime('word1    word2     word3')).toBe('1 minute read');
  });

  it('handles newlines and tabs in content', () => {
    expect(readTime('word1\nword2\tword3\r\nword4')).toBe('1 minute read');
  });
});
