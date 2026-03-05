import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Replicate the schema definitions from config.ts for testing
// These should match the schemas defined in src/content/config.ts
const postsSchema = z.object({
  date: z.coerce.date(),
  description: z.string().optional(),
  heroImage: z.string().optional(),
  relatedPosts: z.array(z.string()).optional(),
});

const projectsSchema = z.object({
  date: z.coerce.date(),
  tags: z.array(z.string()).optional(),
  meta: z.array(z.object({
    label: z.string(),
    value: z.string(),
    list: z.boolean().optional(),
  })).optional(),
  links: z.array(z.object({
    label: z.string(),
    url: z.string().url(),
  })).optional(),
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

    it('accepts optional heroImage string', () => {
      const result = postsSchema.parse({
        date: '2026-01-30',
        heroImage: '/images/hero.jpg',
      });
      expect(result.heroImage).toBe('/images/hero.jpg');
    });

    it('works without heroImage field', () => {
      const result = postsSchema.parse({
        date: '2026-01-30',
      });
      expect(result.heroImage).toBeUndefined();
    });

    it('rejects invalid heroImage (not a string)', () => {
      expect(() =>
        postsSchema.parse({
          date: '2026-01-30',
          heroImage: 123,
        })
      ).toThrow();
    });

    it('accepts optional relatedPosts array', () => {
      const result = postsSchema.parse({
        date: '2026-01-30',
        relatedPosts: ['post-one', 'post-two'],
      });
      expect(result.relatedPosts).toEqual(['post-one', 'post-two']);
    });

    it('works without relatedPosts field', () => {
      const result = postsSchema.parse({
        date: '2026-01-30',
      });
      expect(result.relatedPosts).toBeUndefined();
    });

    it('accepts empty relatedPosts array', () => {
      const result = postsSchema.parse({
        date: '2026-01-30',
        relatedPosts: [],
      });
      expect(result.relatedPosts).toEqual([]);
    });

    it('accepts optional description string', () => {
      const result = postsSchema.parse({
        date: '2026-01-30',
        description: 'A short summary of the post.',
      });
      expect(result.description).toBe('A short summary of the post.');
    });

    it('works without description field', () => {
      const result = postsSchema.parse({
        date: '2026-01-30',
      });
      expect(result.description).toBeUndefined();
    });

    it('rejects invalid description (not a string)', () => {
      expect(() =>
        postsSchema.parse({
          date: '2026-01-30',
          description: 123,
        })
      ).toThrow();
    });

    it('accepts all optional fields together', () => {
      const result = postsSchema.parse({
        date: '2026-01-30',
        description: 'A post description.',
        heroImage: '/images/hero.jpg',
        relatedPosts: ['related-post'],
      });
      expect(result.date).toBeInstanceOf(Date);
      expect(result.description).toBe('A post description.');
      expect(result.heroImage).toBe('/images/hero.jpg');
      expect(result.relatedPosts).toEqual(['related-post']);
    });
  });

  describe('Projects Schema', () => {
    it('requires a date field', () => {
      expect(() => projectsSchema.parse({})).toThrow();
    });

    it('accepts valid date string', () => {
      const result = projectsSchema.parse({ date: '2026-01-30' });
      expect(result.date).toBeInstanceOf(Date);
    });

    it('accepts optional tags array', () => {
      const result = projectsSchema.parse({
        date: '2026-01-30',
        tags: ['#personal', '#games'],
      });
      expect(result.tags).toEqual(['#personal', '#games']);
      expect(result.tags).toHaveLength(2);
    });

    it('accepts empty tags array', () => {
      const result = projectsSchema.parse({
        date: '2026-01-30',
        tags: [],
      });
      expect(result.tags).toEqual([]);
      expect(result.tags).toHaveLength(0);
    });

    it('works without tags field', () => {
      const result = projectsSchema.parse({
        date: '2026-01-30',
      });
      expect(result.date).toBeInstanceOf(Date);
      expect(result.tags).toBeUndefined();
    });

    it('accepts optional meta array', () => {
      const result = projectsSchema.parse({
        date: '2026-01-30',
        meta: [{ label: 'Team', value: 'solo' }],
      });
      expect(result.meta).toEqual([{ label: 'Team', value: 'solo' }]);
    });

    it('works without meta field', () => {
      const result = projectsSchema.parse({
        date: '2026-01-30',
      });
      expect(result.date).toBeInstanceOf(Date);
      expect(result.meta).toBeUndefined();
    });

    it('accepts both tags and meta', () => {
      const result = projectsSchema.parse({
        date: '2026-01-30',
        tags: ['#personal', '#project'],
        meta: [{ label: 'Team', value: 'team of 3' }],
      });
      expect(result.date).toBeInstanceOf(Date);
      expect(result.tags).toEqual(['#personal', '#project']);
      expect(result.meta).toEqual([{ label: 'Team', value: 'team of 3' }]);
    });

    it('rejects invalid tags (not an array)', () => {
      expect(() =>
        projectsSchema.parse({
          date: '2026-01-30',
          tags: 'not an array',
        })
      ).toThrow();
    });

    it('rejects tags array with non-string elements', () => {
      expect(() =>
        projectsSchema.parse({
          date: '2026-01-30',
          tags: [1, 2, 3],
        })
      ).toThrow();
    });

    it('rejects invalid meta (not an array)', () => {
      expect(() =>
        projectsSchema.parse({
          date: '2026-01-30',
          meta: 'not an array',
        })
      ).toThrow();
    });

    it('handles tags with special characters', () => {
      const result = projectsSchema.parse({
        date: '2026-01-30',
        tags: ['#tag-with-dashes', '#tag_with_underscores', '#tag123'],
      });
      expect(result.tags).toEqual([
        '#tag-with-dashes',
        '#tag_with_underscores',
        '#tag123',
      ]);
    });

    it('accepts meta with multiple entries', () => {
      const result = projectsSchema.parse({
        date: '2026-01-30',
        meta: [
          { label: 'Team', value: 'Team of 4 (remote)' },
          { label: 'Made with', value: 'Unity' },
        ],
      });
      expect(result.meta).toHaveLength(2);
      expect(result.meta![1].value).toBe('Unity');
    });

    it('accepts optional links array', () => {
      const result = projectsSchema.parse({
        date: '2026-01-30',
        links: [
          { label: 'GitHub', url: 'https://github.com/example' },
          { label: 'Itch.io', url: 'https://example.itch.io/game' },
        ],
      });
      expect(result.links).toHaveLength(2);
      expect(result.links![0].label).toBe('GitHub');
      expect(result.links![0].url).toBe('https://github.com/example');
    });

    it('works without links field', () => {
      const result = projectsSchema.parse({
        date: '2026-01-30',
      });
      expect(result.links).toBeUndefined();
    });

    it('rejects links with invalid URL', () => {
      expect(() =>
        projectsSchema.parse({
          date: '2026-01-30',
          links: [{ label: 'Bad', url: 'not-a-url' }],
        })
      ).toThrow();
    });

    it('rejects links missing label', () => {
      expect(() =>
        projectsSchema.parse({
          date: '2026-01-30',
          links: [{ url: 'https://example.com' }],
        })
      ).toThrow();
    });
  });

  describe('Schema Type Inference', () => {
    it('posts schema produces correct TypeScript types', () => {
      const validPost = postsSchema.parse({ date: '2026-01-30' });

      // TypeScript will catch type errors at compile time
      expect(validPost.date).toBeInstanceOf(Date);
    });

    it('projects schema produces correct TypeScript types', () => {
      const validProject = projectsSchema.parse({
        date: '2026-01-30',
        tags: ['#test'],
        meta: [{ label: 'Team', value: 'solo' }],
      });

      // TypeScript will catch type errors at compile time
      expect(validProject.date).toBeInstanceOf(Date);
    });
  });
});
