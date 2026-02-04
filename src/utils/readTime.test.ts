import { describe, it, expect } from 'vitest';
import { calculateReadTime, formatReadTime } from './readTime';

describe('calculateReadTime', () => {
  it('returns 1 minute for very short content', () => {
    expect(calculateReadTime('Hello world')).toBe(1);
  });

  it('calculates correct time for longer content', () => {
    // 200 words = 1 minute at default 200 wpm
    const words = Array(200).fill('word').join(' ');
    expect(calculateReadTime(words)).toBe(1);
  });

  it('rounds up to next minute', () => {
    // 201 words should be 2 minutes (rounds up)
    const words = Array(201).fill('word').join(' ');
    expect(calculateReadTime(words)).toBe(2);
  });

  it('handles 400 words as 2 minutes', () => {
    const words = Array(400).fill('word').join(' ');
    expect(calculateReadTime(words)).toBe(2);
  });

  it('handles empty string', () => {
    expect(calculateReadTime('')).toBe(1);
  });

  it('handles whitespace-only string', () => {
    expect(calculateReadTime('   \n\t  ')).toBe(1);
  });

  it('strips HTML tags before counting', () => {
    const html = '<p>Hello <strong>world</strong> this is <a href="#">a test</a></p>';
    // "Hello world this is a test" = 6 words
    expect(calculateReadTime(html)).toBe(1);
  });

  it('handles content with multiple spaces between words', () => {
    expect(calculateReadTime('word1    word2     word3')).toBe(1);
  });

  it('respects custom words per minute', () => {
    // 100 words at 100 wpm = 1 minute
    const words = Array(100).fill('word').join(' ');
    expect(calculateReadTime(words, 100)).toBe(1);

    // 150 words at 100 wpm = 2 minutes (rounds up from 1.5)
    const moreWords = Array(150).fill('word').join(' ');
    expect(calculateReadTime(moreWords, 100)).toBe(2);
  });

  it('handles newlines and tabs in content', () => {
    const content = 'word1\nword2\tword3\r\nword4';
    expect(calculateReadTime(content)).toBe(1);
  });
});

describe('formatReadTime', () => {
  it('formats 1 minute correctly', () => {
    expect(formatReadTime(1)).toBe('1 minute read');
  });

  it('formats multiple minutes correctly', () => {
    expect(formatReadTime(5)).toBe('5 minute read');
  });

  it('formats large numbers correctly', () => {
    expect(formatReadTime(30)).toBe('30 minute read');
  });
});
