// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { remarkObsidianImages } from './src/utils/remark-obsidian-images';
import rehypeExternalLinks from 'rehype-external-links';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.ronihelppi.com',
  integrations: [sitemap({
    serialize(item) {
      item.lastmod = new Date().toISOString();
      return item;
    },
  })],
  markdown: {
    remarkPlugins: [remarkObsidianImages],
    rehypePlugins: [
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
