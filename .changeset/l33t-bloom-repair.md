---
'@sentinel-password/core': minor
---

Common-password check: l33t-speak detection + Bloom filter hashing repair.

- **L33t-speak normalization**: `P@ssw0rd`, `p4ssword`, `l3tm3in`, `m0nkey`,
  and similar substituted forms of listed passwords now fail the
  `commonPassword` check like their plain forms. Up to two normalized
  candidates (primary reading, plus the `1`/`|`→`l` reading) are probed
  alongside the raw lowercased string; mixed per-character readings are
  deliberately out of scope to bound false positives.
- **Double-hashing repair**: the second Bloom hash was previously derived
  from the same multiplicative function with a different seed — the seed
  contributes only linearly, so all 7 probe positions collapsed into a
  function of the first hash (measured ~1.1% false-positive rate). hash2 is
  now FNV-1a and the filter size is prime (12,007), restoring genuine double
  hashing: measured **~0.32% FP per probe** on 200k random strings (≲0.8%
  for l33t-heavy inputs), with the no-false-negative guarantee verified
  against the full wordlist.

Same `commonPassword.found` message code and English string — no i18n
impact. Bundle: ~6.6 KB gzipped, still well under the 10 KB budget.
