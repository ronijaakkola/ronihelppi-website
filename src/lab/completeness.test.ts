import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { labSlugs, labEntries } from './index';
import { hasDemo } from './LabStage';
import { labPreviewFiles } from './preview-assets.mjs';

// A demo is spread over files that only agree by convention (meta.ts, index.tsx,
// the preview assets in public/). Check the real folders agree here, so a missing
// piece fails `npm test` instead of the browser or the build.
describe('every lab demo is complete', () => {
  it.each(labSlugs)('%s has a component in index.tsx', (slug) => {
    expect(hasDemo(slug), `src/lab/${slug}/index.tsx`).toBe(true);
  });

  it.each(labEntries.map((e) => e.slug))('%s (published) has its preview clip and poster', (slug) => {
    for (const file of Object.values(labPreviewFiles(slug))) {
      expect(existsSync(file), `${file} (render it with npm run lab:record)`).toBe(true);
    }
  });
});
