---
'@sentinel-password/core': patch
'@sentinel-password/react': patch
'@sentinel-password/react-components': patch
'@sentinel-password/entropy': patch
'@sentinel-password/breach': patch
---

Packaging hygiene: ship a `LICENSE` file in every published tarball (previously
only the repo root had one), declare `engines.node: ">=20"`, emit npm provenance
intrinsically via `publishConfig.provenance` (so manual/first publishes match the
CI flow), and use the canonical `git+https://….git` repository URL.
