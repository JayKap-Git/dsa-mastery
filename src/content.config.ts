import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const bi = z.object({ en: z.string().min(1), hi: z.string().min(1) });

const chapters = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/chapters' }),
  schema: z.object({
    num: z.number().int().min(1).max(30),
    minutes: z.number().int().positive(),
    prerequisites: z.array(z.number().int()).default([]),
    learn: z.array(bi).min(1),
  }),
});

export const collections = { chapters };
