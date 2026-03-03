import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getTitle } from '../utils/title';
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
      title: getTitle(post.id),
      pubDate: post.data.date,
      description: post.data.description || generateDescription(post.body || ''),
      link: `/writing/${post.slug}/`,
    })),
  });
}
