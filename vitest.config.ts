import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    include: ['lib/utils/**/*.test.ts', 'tests/api/**/*.test.ts'],
  },
});
