// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  base: '/docs/study/',
  integrations: [mdx()],
  outDir: './dist'
});