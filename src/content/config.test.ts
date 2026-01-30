import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Replicate the schema definitions from config.ts for testing
// These should match the schemas defined in src/content/config.ts
const postsSchema = z.object({
  date: z.coerce.date(),
});

const workSchema = z.object({
  date: z.coerce.date(),
  tags: z.array(z.string()).optional(),
  team: z.string().optional(),
});

describe('Content Collection Schemas', () => {
  describe('Posts Schema', () => {
    it('requires a date field', () => {
      expect(() => postsSchema.parse({})).toThrow();
    });

    it('accepts valid date string', () => {
      const result = postsSchema.parse({ date: '2026-01-30' });
      expect(result.date).toBeInstanceOf(Date);
      expect(result.date.getFullYear()).toBe(2026);
      expect(result.date.getMonth()).toBe(0); // January is 0
      expect(result.date.getDate()).toBe(30);
    });

    it('accepts Date object', () => {
      const testDate = new Date('2026-01-30');
      const result = postsSchema.parse({ date: testDate });
      expect(result.date).toBeInstanceOf(Date);
      expect(result.date).toEqual(testDate);
    });

    it('coerces various date formats', () => {
      const formats = [
        '2026-01-30',
        '2026/01/30',
        'January 30, 2026',
        '01/30/2026',
      ];

      for (const format of formats) {
        const result = postsSchema.parse({ date: format });
        expect(result.date).toBeInstanceOf(Date);
      }
    });

    it('rejects invalid date strings', () => {
      expect(() => postsSchema.parse({ date: 'not a date' })).toThrow();
      expect(() => postsSchema.parse({ date: 'invalid' })).toThrow();
    });

    it('rejects missing date field', () => {
      expect(() => postsSchema.parse({})).toThrow();
    });

    it('coerces null to epoch date (zod coerce behavior)', () => {
      // z.coerce.date() converts null to new Date(null) which is epoch
      const result = postsSchema.parse({ date: null });
      expect(result.date).toBeInstanceOf(Date);
    });

    it('rejects undefined date', () => {
      expect(() => postsSchema.parse({ date: undefined })).toThrow();
    });

    it('allows extra fields (Astro adds content, slug, etc.)', () => {
      const result = postsSchema.parse({
        date: '2026-01-30',
        extraField: 'extra value',
      });
      expect(result.date).toBeInstanceOf(Date);
    });
  });

  describe('Work Schema', () => {
    it('requires a date field', () => {
      expect(() => workSchema.parse({})).toThrow();
    });

    it('accepts valid date string', () => {
      const result = workSchema.parse({ date: '2026-01-30' });
      expect(result.date).toBeInstanceOf(Date);
    });

    it('accepts optional tags array', () => {
      const result = workSchema.parse({
        date: '2026-01-30',
        tags: ['#personal', '#games'],
      });
      expect(result.tags).toEqual(['#personal', '#games']);
      expect(result.tags).toHaveLength(2);
    });

    it('accepts empty tags array', () => {
      const result = workSchema.parse({
        date: '2026-01-30',
        tags: [],
      });
      expect(result.tags).toEqual([]);
      expect(result.tags).toHaveLength(0);
    });

    it('works without tags field', () => {
      const result = workSchema.parse({
        date: '2026-01-30',
      });
      expect(result.date).toBeInstanceOf(Date);
      expect(result.tags).toBeUndefined();
    });

    it('accepts optional team string', () => {
      const result = workSchema.parse({
        date: '2026-01-30',
        team: 'solo',
      });
      expect(result.team).toBe('solo');
    });

    it('works without team field', () => {
      const result = workSchema.parse({
        date: '2026-01-30',
      });
      expect(result.date).toBeInstanceOf(Date);
      expect(result.team).toBeUndefined();
    });

    it('accepts both tags and team', () => {
      const result = workSchema.parse({
        date: '2026-01-30',
        tags: ['#personal', '#project'],
        team: 'team of 3',
      });
      expect(result.date).toBeInstanceOf(Date);
      expect(result.tags).toEqual(['#personal', '#project']);
      expect(result.team).toBe('team of 3');
    });

    it('rejects invalid tags (not an array)', () => {
      expect(() =>
        workSchema.parse({
          date: '2026-01-30',
          tags: 'not an array',
        })
      ).toThrow();
    });

    it('rejects tags array with non-string elements', () => {
      expect(() =>
        workSchema.parse({
          date: '2026-01-30',
          tags: [1, 2, 3],
        })
      ).toThrow();
    });

    it('rejects invalid team (not a string)', () => {
      expect(() =>
        workSchema.parse({
          date: '2026-01-30',
          team: 123,
        })
      ).toThrow();
    });

    it('handles tags with special characters', () => {
      const result = workSchema.parse({
        date: '2026-01-30',
        tags: ['#tag-with-dashes', '#tag_with_underscores', '#tag123'],
      });
      expect(result.tags).toEqual([
        '#tag-with-dashes',
        '#tag_with_underscores',
        '#tag123',
      ]);
    });

    it('handles team with special characters', () => {
      const result = workSchema.parse({
        date: '2026-01-30',
        team: 'Team of 4 (remote)',
      });
      expect(result.team).toBe('Team of 4 (remote)');
    });
  });

  describe('Schema Type Inference', () => {
    it('posts schema produces correct TypeScript types', () => {
      const validPost = postsSchema.parse({ date: '2026-01-30' });

      // TypeScript will catch type errors at compile time
      expect(validPost.date).toBeInstanceOf(Date);
    });

    it('work schema produces correct TypeScript types', () => {
      const validWork = workSchema.parse({
        date: '2026-01-30',
        tags: ['#test'],
        team: 'solo',
      });

      // TypeScript will catch type errors at compile time
      expect(validWork.date).toBeInstanceOf(Date);
    });
  });
});
