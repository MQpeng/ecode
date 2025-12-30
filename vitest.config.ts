import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: __dirname,
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/{__test__,tests}/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'lcov'],
      exclude: ['**/node_modules/**', 'packages/**/dist/**']
    }
  }
})
