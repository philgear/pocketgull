// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://astro.build/config
export default defineConfig({
  root: __dirname,
  base: '/docs/study/',
  integrations: [mdx()],
  outDir: './dist',
  vite: {
    appType: 'custom',
    define: {
      'import.meta.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || 'placeholder-key-for-build')
    }
  }
});