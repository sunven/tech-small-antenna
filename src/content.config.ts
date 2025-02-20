// Import the glob loader
import { glob } from 'astro/loaders'
// Import utilities from `astro:content`
import { z, defineCollection } from 'astro:content'

const schema = z.object({
  title: z.string(),
  description: z.string(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()),
})

// Define a `loader` and `schema` for each collection
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/blog' }),
  schema,
})

export type MarkdownFrontmatterType = z.infer<typeof schema>

// Export a single `collections` object to register your collection(s)
export const collections = { blog }
