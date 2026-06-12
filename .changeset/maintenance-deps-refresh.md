---
'@sentinel-password/core': patch
'@sentinel-password/react': patch
'@sentinel-password/react-components': patch
---

Maintenance release: refresh development tooling (Storybook 10.4.4, turbo
2.9.18, @types/node 25.9.3) and add Stryker mutation testing to core
(96% mutation score, enforced via `test:mutation`). No runtime changes —
published code is identical in behavior to the previous versions.
