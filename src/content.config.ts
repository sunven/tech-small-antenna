// Import the glob loader
import { glob } from 'astro/loaders'
// Import utilities from `astro:content`
import { z, defineCollection } from 'astro:content'

const schema = z.object({
  title: z.string(),
  description: z.string(),
  coverImage: z.string().nullable().optional(),
  tags: z.array(z.string()),
  lastModified: z.string().optional(),
})

// Define a `loader` and `schema` for each collection
const blog = defineCollection({
  loader: glob({ pattern: ['!.obsidian', '!templates', '**/[^_]*.md'], base: './src/blog' }),
  schema,
})

export type MarkdownFrontmatterType = z.infer<typeof schema>

// Export a single `collections` object to register your collection(s)
export const collections = { blog }
