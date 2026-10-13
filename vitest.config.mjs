import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.mjs'],
    testTimeout: 30000,
    chaiConfig: { truncateThreshold: 300 },
  },
});
