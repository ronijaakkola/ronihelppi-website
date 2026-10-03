import type { ComponentType } from 'react';

// One chunk per demo: the page for `/lab/<slug>` only downloads that demo (and
// whatever it imports, e.g. Motion). The registry never touches these.
const demoLoaders = import.meta.glob<{ default: ComponentType }>('./*/index.tsx');

export const loaderFor = (slug: string) => demoLoaders[`./${slug}/index.tsx`];

/** Whether `slug` has a component to load; `completeness.test.ts` checks every meta against this. */
export function hasDemo(slug: string): boolean {
  return loaderFor(slug) !== undefined;
}
