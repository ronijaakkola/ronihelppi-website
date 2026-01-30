import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.coerce.date(),
  }),
});

const workCollection = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    team: z.string().optional(),
  }),
});

export const collections = {
  posts: postsCollection,
  work: workCollection,
};
