import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: false,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.d.ts', 'src/**/*.stories.tsx'],
      // Regression floor set below the current 94.79/89.62/100/97.7. Headroom
      // keeps CI from flaking on a single new defensive branch; core remains
      // the only package pinned at 100%.
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 95,
        lines: 95,
      },
    },
  },
})
