import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  external: ['react'],
  // The hook uses client-only React APIs (useState/useEffect). The banner
  // marks the bundle as a Client Component boundary so React Server
  // Components environments (Next.js App Router) can import it directly
  // without the consumer adding their own 'use client' wrapper file.
  banner: { js: "'use client'" },
})
