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
import { getSiteConfig } from './src/utils/site-config';

const { site, base } = getSiteConfig(process.env);

// https://astro.build/config
export default defineConfig({
  site,
  base,
  devToolbar: { enabled: false },
  // Prefetch pages as their links enter the viewport (the default prefetches
  // on tap, which can't hide network latency on touch devices where there's
  // no hover). Pages are small static HTML, so the bandwidth cost is tiny.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  integrations: [sitemap()],
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
