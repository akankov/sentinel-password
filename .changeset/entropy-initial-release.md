---
'@sentinel-password/entropy': minor
---

Initial release of `@sentinel-password/entropy` (v0.1.0) — a standalone
Shannon-entropy estimator with dictionary, l33t, and pattern detection. Zero
runtime dependencies. ≤ 30 KB gzipped, enforced in CI alongside core's 10 KB
gate.

```typescript
import { estimateEntropy } from '@sentinel-password/entropy'

const result = estimateEntropy('Tr0ub4dor&3')
// {
//   bits: ~28,
//   score: 1,
//   crackTime: {
//     onlineThrottled:   { seconds: 6.5e6, display: '2 months' },
//     onlineUnthrottled: { seconds: 1.8e4, display: '5 hours' },
//     offlineSlowHash:   { seconds: 18,    display: 'less than a minute' },
//     offlineFastHash:   { seconds: 0.018, display: 'instant' },
//   },
//   patterns: ['l33t', 'capitalization'],
// }
```

The package is intentionally decoupled from `@sentinel-password/core`: it
shares no types or runtime, and consumers compose the two explicitly. Core
stays synchronous, zero-dependency, and ≤ 10 KB; entropy adds the orthogonal
"how long would this survive a brute-force attack?" signal.

**What it detects:**

- Sequences (`abc`, `123`, `qwerty`)
- Repetitions (`aaaa`, `abab`)
- 12 K-word dictionary (built-in, via bloom filter at ~0.3% FP rate)
- L33t-substituted dictionary matches (`p@ssw0rd` → `password`)
- Initial-capital styling
- `personalInfo` substring matches (forces `bits: 0`)

**Crack-time estimates** under four standard attacker models:
`onlineThrottled` (100/hour), `onlineUnthrottled` (10/sec), `offlineSlowHash`
(10⁴/sec, bcrypt-class), `offlineFastHash` (10¹⁰/sec, raw GPU).

**What it deliberately doesn't include:**

- No async API or integration into `validatePassword`. Core stays sync; a
  future opt-in async surface can land in a separate plan.
- No frequency weighting on dictionary matches — every entry is treated as
  equiprobable (~13.9 bits per match). Trade-off for the bundle budget.
- No dynamic-programming partition search (zxcvbn-style). Greedy left-to-right
  pattern walk instead.

The algorithm is simpler and the bundle smaller than zxcvbn (~30 KB vs
~400 KB), targeted at apps that need a meaningful entropy signal without the
weight.
