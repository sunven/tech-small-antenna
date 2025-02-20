// @ts-check
import { defineConfig } from 'astro/config';
import react from "@astrojs/react";

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
    remarkPlugins: [remarkModifiedTime],
  },
});