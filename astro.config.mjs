// @ts-check
import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import { remarkModifiedTime } from './remark-modified-time';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.llweb.top',
  integrations: [react(), icon()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkModifiedTime, [remarkToc, { heading: "contents" }]],
    rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'append' }]],
  },
});