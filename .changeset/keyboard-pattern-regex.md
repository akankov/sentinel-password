---
'@sentinel-password/core': patch
---

Replace `validateKeyboardPattern`'s inline loop with a single precomputed
regex. The previous implementation called `pattern.split('').reverse().join('')`
on every invocation across ~80 multi-layout keyboard patterns, producing ~480
redundant allocations per call. A single `RegExp` built once at module load
with all 160 forward+reverse alternatives is **~53× faster** for the individual
validator (117,000 → 6,150,000 ops/s) and propagates to **~10-15× speedup** on
the full `validatePassword` pipeline.

No public API change — same `passed`/`message`/`code`/`params` returned for
every input. Bundle gains ~600 bytes gzipped (well under the 10 KB CI cap).
