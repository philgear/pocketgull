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
    root: import.meta.dirname,
    // @ts-ignore
    configFile: false,
    define: {
      'import.meta.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || '')
    },
    server: {
      fs: {
        strict: true
      }
    }
  }
});