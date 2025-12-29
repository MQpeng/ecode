import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: __dirname,
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/tests/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'lcov'],
      exclude: ['**/node_modules/**', 'packages/**/dist/**']
    }
  }
})
