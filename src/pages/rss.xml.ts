import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getTitleFromEntry } from '../utils/title';
import { sortByDateDesc } from '../utils/sortByDate';
import { generateDescription } from '../utils/description';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const sortedPosts = sortByDateDesc(await getCollection('posts'));

  return rss({
    title: 'Roni Helppi',
    description: 'Writing by Roni Helppi',
    site: context.site!,
    items: sortedPosts.map((post) => ({
      title: getTitleFromEntry(post),
      pubDate: post.data.date,
      description: post.data.description || generateDescription(post.body || ''),
      link: `/writing/${post.id}/`,
    })),
  });
}
