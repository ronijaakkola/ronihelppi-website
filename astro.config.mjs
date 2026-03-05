// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { remarkObsidianImages } from './src/utils/remark-obsidian-images';
import rehypeExternalLinks from 'rehype-external-links';
import { rehypeCodeBlocks } from './src/utils/rehype-code-blocks';
import { rehypeImageFigure } from './src/utils/rehype-image-figure';
import { remarkCodeTitle } from './src/utils/remark-code-title';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.ronihelppi.com',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
    remarkPlugins: [remarkObsidianImages, remarkCodeTitle],
    rehypePlugins: [
      rehypeCodeBlocks,
      rehypeImageFigure,
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
  },
});
