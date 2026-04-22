---
'@sentinel-password/core': patch
'@sentinel-password/react': patch
'@sentinel-password/react-components': patch
---

Rebuild with hardened toolchain: the build pipeline now pins `esbuild >= 0.25.0` (closing GHSA-67mh-4wv8-2f99) and constrains transitive `vite` to `>= 6.4.2` via a pnpm override (closing GHSA-4w7w-66w2-5vf9 / CVE-2026-39365). Published artifact bytes are unchanged; the provenance attestations attached to this release reflect the patched build environment and can be verified with `npm audit signatures`.
