import { getCollection } from 'astro:content';
import { renderEntryMarkdown } from '../../utils/markdown-endpoint';

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

export function GET({ props }: { props: { post: Parameters<typeof renderEntryMarkdown>[0] } }) {
  return renderEntryMarkdown(props.post);
}
