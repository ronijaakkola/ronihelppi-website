import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const postsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) => z.object({
    date: z.coerce.date(),
    dateModified: z.coerce.date().optional(),
    description: z.string().optional(),
    heroImage: image().optional(),
    heroImageAlt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    relatedPosts: z.array(z.string()).optional(),
  }),
});

const projectsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    date: z.coerce.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    coverImage: image().optional(),
    subtitle: z.string().optional(),
    coverImageAlt: z.string().optional(),
    meta: z.array(z.object({
      label: z.string(),
      value: z.string(),
      list: z.boolean().optional(),
    })).optional(),
    links: z.array(z.object({
      label: z.string(),
      url: z.url(),
    })).optional(),
  }),
});

export const collections = {
  posts: postsCollection,
  projects: projectsCollection,
};
