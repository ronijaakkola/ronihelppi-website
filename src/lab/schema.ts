import { z } from 'astro/zod';

// Metadata every demo folder exports from `meta.ts`. The slug is the folder
// name, never a field here, so it cannot drift from the URL and asset paths.
export const labMetaSchema = z.object({
  title: z.string().min(1),
  /** Shown under the demo when present. Most demos need none. */
  description: z.string().min(1).optional(),
  date: z.coerce.date(),
  published: z.boolean(),
  tags: z.array(z.string()).default([]),
  /** CSS aspect-ratio of the stage, e.g. "4 / 3". Defaults to 4:3. */
  aspectRatio: z.string().regex(/^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/).default('4 / 3'),
  /** Show a "requires a pointer device" note on coarse-pointer devices. */
  requiresPointer: z.boolean().default(false),
  /** Slug of a related writing entry. */
  post: z.string().optional(),
});

export type LabMeta = z.infer<typeof labMetaSchema>;
export type LabMetaInput = z.input<typeof labMetaSchema>;
