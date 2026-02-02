// @ts-check
import { defineConfig } from 'astro/config';
import { remarkObsidianImages } from './src/utils/remark-obsidian-images';
import rehypeExternalLinks from 'rehype-external-links';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.ronihelppi.com',
  markdown: {
    remarkPlugins: [remarkObsidianImages],
    rehypePlugins: [
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
    ],
  },
});
