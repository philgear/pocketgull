// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  root: import.meta.dirname,
  base: '/docs/study/',
  integrations: [mdx()],
  outDir: './dist',
  vite: {
    // @ts-ignore
    configFile: false,
    build: {
      rollupOptions: {
        input: undefined
      }
    }
  }
});