import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node16',
  outDir: 'dist',
  splitting: false,
  minify: false,
  keepNames: true,
  external: [],
})
