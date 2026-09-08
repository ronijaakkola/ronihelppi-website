import { labMetaSchema, type LabMeta, type LabMetaInput } from './schema';

export interface LabEntry {
  slug: string;
  meta: LabMeta;
}

export const GITHUB_REPO_URL = 'https://github.com/ronijaakkola/ronihelppi-website';

// Every `src/lab/<slug>/meta.ts` is a demo. Eager so the registry is plain data
// at build time; the React component in `<slug>/index.tsx` is loaded lazily by
// LabStage on the client instead.
const metaModules = import.meta.glob<{ default: LabMetaInput }>('./*/meta.ts', { eager: true });

function slugFromPath(path: string): string {
  const match = path.match(/^\.\/([^/]+)\/meta\.ts$/);
  if (!match) throw new Error(`Unexpected lab meta path: ${path}`);
  return match[1];
}

export function loadLabEntries(modules: Record<string, { default: LabMetaInput }> = metaModules): LabEntry[] {
  return Object.entries(modules)
    .map(([path, mod]) => {
      const slug = slugFromPath(path);
      const parsed = labMetaSchema.safeParse(mod.default);
      if (!parsed.success) {
        throw new Error(`Invalid lab meta for "${slug}": ${parsed.error.message}`);
      }
      return { slug, meta: parsed.data };
    })
    .filter((entry) => entry.meta.published)
    .sort((a, b) => b.meta.date.getTime() - a.meta.date.getTime());
}

/** Published demos, newest first. */
export const labEntries: LabEntry[] = loadLabEntries();

export function labSourceUrl(slug: string): string {
  return `${GITHUB_REPO_URL}/tree/master/src/lab/${slug}`;
}

export function labPreviewPaths(slug: string) {
  return {
    video: `/lab/${slug}/preview.mp4`,
    poster: `/lab/${slug}/poster.webp`,
  };
}

export function formatLabDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
