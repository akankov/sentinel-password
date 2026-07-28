---
'@sentinel-password/react-components': major
'@sentinel-password/core': major
'@sentinel-password/react': major
'@sentinel-password/entropy': minor
'@sentinel-password/generate': minor
'@sentinel-password/breach': minor
---

Require Node.js 22 or later.

`engines.node` moves from `>=20` to `>=22` across every package. Node 20 reached
end-of-life in April 2026 and no longer receives security updates, and the CI
matrix now runs 22, 24 and 26.

The compiled output is unchanged — it is still plain ES2022 with no
Node-specific APIs, so it will keep working on older runtimes in practice. What
changes is the declared support floor: on Node 20 or below, npm and pnpm now
emit an engine warning, and installs fail outright under `engine-strict`.

If you are still on Node 20, stay on the previous release until you can upgrade.
