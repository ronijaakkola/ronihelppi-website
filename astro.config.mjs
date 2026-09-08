// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import { remarkObsidianImages } from './src/utils/remark-obsidian-images';
import rehypeExternalLinks from 'rehype-external-links';
import { rehypeCodeBlocks } from './src/utils/rehype-code-blocks';
import { rehypeImageFigure } from './src/utils/rehype-image-figure';
import { rehypeHeadingLinks } from './src/utils/rehype-heading-links';
import { remarkCodeTitle } from './src/utils/remark-code-title';
import { remarkToc } from './src/utils/remark-toc';
import { fileURLToPath } from 'node:url';

// DialKit is a dev-only tuning panel for the Lab demos. Production builds swap
// it for a stub that returns each control's default, so demo code imports
// "dialkit" unchanged and visitors download none of it.
const isBuild = process.argv.includes('build');
/** @param {string} file */
const labPath = (file) => fileURLToPath(new URL(`./src/lab/${file}`, import.meta.url));

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://ronihelppi.com',
  devToolbar: { enabled: false },
  // Prefetch pages as their links enter the viewport (the default prefetches
  // on tap, which can't hide network latency on touch devices where there's
  // no hover). Pages are small static HTML, so the bandwidth cost is tiny.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  integrations: [sitemap(), react()],
  vite: {
    resolve: {
      alias: isBuild
        ? [
            { find: 'dialkit/styles.css', replacement: labPath('dialkit-empty.css') },
            { find: /^dialkit$/, replacement: labPath('dialkit-stub.ts') },
          ]
        : [],
    },
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
    processor: unified({
      remarkPlugins: [remarkObsidianImages, remarkCodeTitle, remarkToc],
      rehypePlugins: [
        rehypeCodeBlocks,
        rehypeImageFigure,
        rehypeHeadingLinks,
        [rehypeExternalLinks, {
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
          content: {
            type: 'element',
            tagName: 'span',
            properties: { className: ['visually-hidden'] },
            children: [{ type: 'text', value: ' (opens in new tab)' }],
          },
        }],
      ],
    }),
  },
});