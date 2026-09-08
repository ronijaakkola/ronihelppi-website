import { describe, it, expect } from 'vitest';
import { labMetaSchema } from './schema';

const valid = {
  title: 'Sliding tabs',
  description: 'A button that springs.',
  date: '2026-09-08',
  published: true,
};

describe('labMetaSchema', () => {
  it('accepts a minimal entry and fills defaults', () => {
    const meta = labMetaSchema.parse(valid);
    expect(meta.date).toBeInstanceOf(Date);
    expect(meta.tags).toEqual([]);
    expect(meta.aspectRatio).toBe('4 / 3');
    expect(meta.requiresPointer).toBe(false);
    expect(meta.post).toBeUndefined();
  });

  it('requires published to be explicit', () => {
    const { published, ...rest } = valid;
    expect(() => labMetaSchema.parse(rest)).toThrow();
  });

  it('rejects an empty title, and an empty (rather than omitted) description', () => {
    expect(() => labMetaSchema.parse({ ...valid, title: '' })).toThrow();
    expect(() => labMetaSchema.parse({ ...valid, description: '' })).toThrow();
    const { description, ...noDescription } = valid;
    expect(labMetaSchema.parse(noDescription).description).toBeUndefined();
  });

  it('only accepts "w / h" aspect ratios', () => {
    expect(labMetaSchema.parse({ ...valid, aspectRatio: '16 / 9' }).aspectRatio).toBe('16 / 9');
    expect(() => labMetaSchema.parse({ ...valid, aspectRatio: '16:9' })).toThrow();
    expect(() => labMetaSchema.parse({ ...valid, aspectRatio: 'square' })).toThrow();
  });

  it('rejects a slug field, since the folder name is the slug', () => {
    expect(() => labMetaSchema.strict().parse({ ...valid, slug: 'x' })).toThrow();
  });
});
