---
'@sentinel-password/core': minor
'@sentinel-password/react': minor
'@sentinel-password/react-components': minor
---

Publish pipeline now uses npm Trusted Publishing (OIDC) with provenance attestations enabled by default. Consumers can verify published packages with `npm audit signatures`. Release automation simplified — version bumps and publishes trigger automatically from merges to main, no manual workflow dispatch required.
