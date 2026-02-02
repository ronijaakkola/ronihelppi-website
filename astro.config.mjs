// @ts-check
import { defineConfig } from 'astro/config';
import { remarkObsidianImages } from './src/utils/remark-obsidian-images';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.ronihelppi.com',
  markdown: {
    remarkPlugins: [remarkObsidianImages],
  },
});
