import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.coerce.date(),
    heroImage: z.string().optional(),
    relatedPosts: z.array(z.string()).optional(),
  }),
});

const workCollection = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.coerce.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    team: z.string().optional(),
  }),
});

export const collections = {
  posts: postsCollection,
  work: workCollection,
};
