---
'@sentinel-password/core': patch
'@sentinel-password/react': patch
'@sentinel-password/react-components': patch
---

Drop the redundant `esbuild` pnpm override added in 1.1.1. The `>=0.25.0` floor it provided is already required naturally by every direct consumer of esbuild in the dependency graph (vite, storybook, vitest, tsup), so the GHSA-67mh-4wv8-2f99 patch level is still enforced. Removing the override prevents lockfile regenerations from collapsing two compatible vite versions onto a single esbuild that breaks vitepress's build. Published artifact bytes are unchanged from 1.1.1; the provenance attestations attached to this release reflect the simplified pnpm configuration and can be verified with `npm audit signatures`.
