import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
          root: '.',
          environment: 'jsdom',
          include: [
                  'src/**/*.spec.ts',
                  'tests/**/*.spec.ts'
                ],
          exclude: [
                  'e2e/**/*',
                  'node_modules/**/*'
                ],
          coverage: {
                  provider: 'v8',
                  reporter: ['text', 'json', 'html'],
                  include: ['src/**/*.ts'],
                  exclude: ['src/**/*.spec.ts', 'src/main.ts', 'src/environments/**']
          }
    }
});
