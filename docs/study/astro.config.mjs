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
    root: __dirname,
    plugins: [
      {
        name: 'fix-vite6-ssr-input',
        configResolved(config) {
          if (!config.build.rollupOptions.input) {
            config.build.rollupOptions.input = { 'prerender-entry': 'virtual:astro:legacy-ssr-entry' };
          }
        },
        resolveId(id) {
          if (id === 'virtual:astro:legacy-ssr-entry') {
            return '\0virtual:astro:legacy-ssr-entry';
          }
        },
        load(id) {
          if (id === '\0virtual:astro:legacy-ssr-entry') {
            return 'export const app = { manifest: { routes: [] }, setInternals() {}, setOptions() {}, async render() { return new Response(); } };';
          }
        }
      }
    ],
    define: {
      'import.meta.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || 'placeholder-key-for-build')
    }
  }
});