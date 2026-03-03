import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getTitle } from '../utils/title';
import { sortByDateDesc } from '../utils/sortByDate';
import type { APIContext } from 'astro';

function generateDescription(body: string): string {
  const plainText = body
    .replace(/^---[\s\S]*?---/, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_`~]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  if (plainText.length <= 155) return plainText;
  return plainText.slice(0, 152).trim() + '\u2026';
}

export async function GET(context: APIContext) {
  const sortedPosts = sortByDateDesc(await getCollection('posts'));

  return rss({
    title: 'Roni Helppi',
    description: 'Writing by Roni Helppi',
    site: context.site!,
    items: sortedPosts.map((post) => ({
      title: getTitle(post.id),
      pubDate: post.data.date,
      description: post.data.description || generateDescription(post.body || ''),
      link: `/writing/${post.slug}/`,
    })),
  });
}
