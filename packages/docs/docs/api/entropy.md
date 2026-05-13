# `@sentinel-password/entropy`

A standalone Shannon entropy estimator with dictionary, l33t, and pattern detection. Zero runtime dependencies. **≤ 30 KB gzipped** (CI enforced).

This package complements [`@sentinel-password/core`](./core) but does **not** share types or runtime. Core answers _"does this password meet the rules?"_ while entropy answers _"how long would it survive a brute-force attack?"_. Consumers compose both explicitly.

## Installation

```bash
pnpm add @sentinel-password/entropy
```

No peer dependencies. Use alongside or independently of `@sentinel-password/core`.

## Quick start

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

## Composing with `@sentinel-password/core`

The packages are intentionally decoupled. Compose them in user-land:

```typescript
import { validatePassword } from '@sentinel-password/core'
import { estimateEntropy } from '@sentinel-password/entropy'

function checkPassword(pwd: string, email: string) {
  const rule = validatePassword(pwd, { personalInfo: [email] })
  const ent = estimateEntropy(pwd, { personalInfo: [email] })

  return {
    valid: rule.valid && ent.bits >= 40,
    score: Math.min(rule.score, ent.score),
    suggestions: rule.feedback.suggestions,
    crackTime: ent.crackTime.offlineSlowHash.display,
  }
}
```

`ScoreThresholds` accept the same `0 | 1 | 2 | 3 | 4` shape as core's `StrengthScore`, so you can take `Math.min(ruleScore, entropyScore)` to combine both signals.

## API

### `estimateEntropy(password, options?)`

```typescript
function estimateEntropy(password: string, options?: EntropyOptions): EntropyResult
```

Returns the effective entropy of `password` in bits, a 0–4 score, crack-time estimates under four standard attack models, and the list of entropy-reducing patterns detected.

### `EntropyOptions`

| Option | Type | Default | Description |
|---|---|---|---|
| `personalInfo` | `readonly string[]` | `[]` | Strings whose presence in the password (case-insensitive substring) forces `bits` to 0 and emits the `personalInfo` pattern. |
| `customDictionary` | `readonly string[]` | `[]` | Extra dictionary words to match alongside the built-in 12K-word dictionary. Useful for company / product names. |
| `scoreThresholds` | `readonly [number, number, number, number]` | `[28, 36, 60, 128]` | Bit cutoffs for scores 1 / 2 / 3 / 4. Defaults align with NIST 800-63B guidance. |

### `EntropyResult`

| Field | Type | Description |
|---|---|---|
| `bits` | `number` | Effective entropy after pattern / dictionary / l33t reduction. |
| `score` | `0 \| 1 \| 2 \| 3 \| 4` | Banded score derived from `bits`. Aligns with core's `StrengthScore`. |
| `crackTime` | `CrackTimePresets` | See below. |
| `patterns` | `readonly EntropyPattern[]` | Reducing patterns detected, in left-to-right encounter order, deduplicated. |

### `CrackTimePresets`

Estimates against four attacker models. Each is a `CrackEstimate` with `seconds` (number) and `display` (human-readable string).

| Preset | Guesses / sec | Scenario |
|---|---|---|
| `onlineThrottled` | 100 / hour | Rate-limited login form. |
| `onlineUnthrottled` | 10 / sec | No rate limit. |
| `offlineSlowHash` | 10⁴ / sec | Bcrypt cost 10, scrypt, argon2. |
| `offlineFastHash` | 10¹⁰ / sec | Raw MD5 / SHA-1 on a single modern GPU. |

`display` tiers as: `'instant'` → `'less than a minute'` → `'N minutes/hours/days/months/years'` → `'centuries'`.

### `EntropyPattern`

| Pattern | Trigger |
|---|---|
| `'sequence'` | `abc`, `123`, `qwerty`, … (length ≥ 4). |
| `'repetition'` | `aaaa`, `abab`, … (length ≥ 3). |
| `'dictionary'` | Match against the built-in dictionary or `customDictionary` (length ≥ 4). |
| `'l33t'` | Match after un-substituting `@`→`a`, `0`→`o`, `1`→`i/l`, etc. |
| `'capitalization'` | Initial capital on a dictionary word. |
| `'personalInfo'` | Substring match against `personalInfo`. Forces `bits: 0`. |

## How the estimator works

1. **Baseline.** Compute `password.length × log2(alphabetSize)`, where `alphabetSize` is the sum of size for each character class observed (lowercase 26, uppercase 26, digit 10, ASCII symbol 33, other 100).
2. **Pattern walk.** Walk the password left-to-right. At each position try sequence, repetition, dictionary, and l33t-dictionary; pick the longest match (tie-break on lowest intrinsic bits). Advance past the match.
3. **Score.** Map total bits to `0–4` via `scoreThresholds`.
4. **Crack time.** For each attacker preset, compute `seconds = 2^(bits-1) / guessesPerSecond`. Format human-readably.

The algorithm is intentionally simpler than zxcvbn — it skips the dynamic-programming partition search to stay under the 30 KB bundle budget. Trade-offs:

- **Greedy left-to-right** rather than optimal partition. May credit slightly more entropy than zxcvbn on adversarial inputs.
- **Bloom filter for the dictionary** (~0.3% false-positive rate, mitigated by an "only pure-alphabetic candidates" filter on the lookup path).
- **No frequency weighting.** All dictionary words are treated as equiprobable (log₂(15 000) ≈ 13.9 bits per match).

## Stability

Public surface is the named exports above. The l33t substitution table, default thresholds, and crack-time guess rates are frozen at v0.1.0 — changes require a minor version bump.

## Bundle size

Built artifact stays under **30 KB gzipped** (CI gate). To verify locally:

```bash
pnpm --filter @sentinel-password/entropy build
gzip -c packages/entropy/dist/index.js | wc -c
```

## Regenerating the dictionary

The bloom filter at `src/data/dict-bloom.ts` is generated from `data/dictionary.txt` (top 10K English words) and `data/passwords-extended.txt` (top 5K common passwords). Regenerate after changing those seeds:

```bash
pnpm --filter @sentinel-password/entropy generate:dict
```

The generator verifies no false negatives and reports the measured false-positive rate.
