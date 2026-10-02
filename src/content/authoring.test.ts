import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// The collection schemas themselves are validated by `astro build` / `astro
// check` against the real content in src/content.config.ts.
describe('Posts content authoring', () => {
  it('post heroImage frontmatter uses relative image paths so Astro can manage them', () => {
    const postFile = readFileSync(
      join(process.cwd(), 'content/posts/A practical guide to writing your own Obsidian skills.md'),
      'utf-8'
    );

    expect(postFile).not.toContain('heroImage: /images/');
    expect(postFile).toContain('heroImage: ../images/');
  });
});
