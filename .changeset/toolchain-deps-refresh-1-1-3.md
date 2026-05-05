---
'@sentinel-password/core': patch
'@sentinel-password/react': patch
'@sentinel-password/react-components': patch
---

Rebuild with refreshed toolchain devDependencies: `eslint` 10.2.1 → 10.3.0, `typescript-eslint` 8.59.1 → 8.59.2, `turbo` 2.9.8 → 2.9.9, `@changesets/changelog-github` 0.6.0 → 0.7.0. Example apps (`playground`, `vite-react`) also moved to ESLint 10 to align with the root; the Next.js example stays on ESLint 9 until `eslint-config-next` ships an ESLint 10 compatible plugin set. Published artifact bytes are unchanged; the provenance attestations attached to this release reflect the refreshed build environment and can be verified with `npm audit signatures`.
