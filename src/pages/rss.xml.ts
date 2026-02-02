import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getTitle } from '../utils/title';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');

  const sortedPosts = posts.sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  return rss({
    title: 'Roni Helppi',
    description: 'Posts by Roni Helppi',
    site: context.site!,
    items: sortedPosts.map((post) => ({
      title: getTitle(post.id),
      pubDate: post.data.date,
      link: `/posts/${post.slug}/`,
    })),
  });
}
