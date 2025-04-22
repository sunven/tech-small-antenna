// @ts-check
import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import { remarkModifiedTime } from './remark-modified-time';
import pagefind from "astro-pagefind";

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  build: {
    format: "file",
  },
  site: 'https://blog.llweb.top',
  integrations: [react(), icon(), pagefind()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkModifiedTime, [remarkToc, { heading: "contents" }]],
    rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'append' }]],
  },
});