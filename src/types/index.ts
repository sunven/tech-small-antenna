import type { MarkdownHeading } from 'astro'

export type MarkdownHeadingTree = MarkdownHeading & {
  children: MarkdownHeadingTree[]
}
