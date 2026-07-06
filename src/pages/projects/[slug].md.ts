import { getCollection } from 'astro:content';
import { renderEntryMarkdown } from '../../utils/markdown-endpoint';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((item) => ({
    params: { slug: item.id },
    props: { item },
  }));
}

export function GET({ props }: { props: { item: Parameters<typeof renderEntryMarkdown>[0] } }) {
  return renderEntryMarkdown(props.item);
}
