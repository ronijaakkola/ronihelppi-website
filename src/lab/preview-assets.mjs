// Where a demo's preview clip and poster live: the Lab pages, scripts/lab-preview.mjs
// (which writes them) and the tests all derive the paths from here. Plain .mjs so
// the scripts can import it without Vite or a TypeScript loader.

/**
 * Public URLs of the preview clip and its poster.
 * @param {string} slug
 */
export function labPreviewPaths(slug) {
  return {
    video: `/lab/${slug}/preview.mp4`,
    poster: `/lab/${slug}/poster.webp`,
  };
}

/**
 * The same files on disk, relative to the project root (`public/` is served at `/`).
 * @param {string} slug
 */
export function labPreviewFiles(slug) {
  const { video, poster } = labPreviewPaths(slug);
  return { video: `public${video}`, poster: `public${poster}` };
}
