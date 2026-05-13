# @sentinel-password/entropy

Shannon entropy estimator for [sentinel-password](https://github.com/akankov/sentinel-password) with dictionary, l33t, and pattern detection. Zero runtime dependencies. **≤ 30 KB gzipped** (CI enforced).

This package complements [`@sentinel-password/core`](https://www.npmjs.com/package/@sentinel-password/core), which performs *rule-based* validation (length, character types, common passwords). The entropy package answers a different question: **how long would this password survive a brute-force attack?**

## Installation

```bash
pnpm add @sentinel-password/entropy
```

The package has no peer dependencies. It can be used standalone or alongside `@sentinel-password/core`.

## Quick start

```typescript
import { estimateEntropy } from '@sentinel-password/entropy'

const result = estimateEntropy('Tr0ub4dor&3')
// {
//   bits: 28.4,
//   score: 1,
//   crackTime: {
//     onlineThrottled:   { seconds: 6.5e6, display: '2 months' },
//     onlineUnthrottled: { seconds: 1.8e4, display: '5 hours' },
//     offlineSlowHash:   { seconds: 18,    display: 'less than a minute' },
//     offlineFastHash:   { seconds: 0.018, display: 'instant' },
//   },
//   patterns: ['dictionary', 'l33t', 'capitalization'],
// }
```

## Composition with `@sentinel-password/core`

The two packages do not share types or runtime; consumers compose them explicitly:

```typescript
import { validatePassword } from '@sentinel-password/core'
import { estimateEntropy } from '@sentinel-password/entropy'

function check(pwd: string, email: string) {
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

## API

### `estimateEntropy(password, options?)`

Returns an `EntropyResult` describing the password's effective entropy in bits, a 0-4 score, four crack-time estimates under standard attack models, and the list of entropy-reducing patterns detected.

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `personalInfo` | `readonly string[]` | `[]` | Strings whose presence in the password reduces effective entropy to 0. |
| `customDictionary` | `readonly string[]` | `[]` | Extra dictionary words to match alongside the built-in 15K-word dictionary. |
| `scoreThresholds` | `readonly [number, number, number, number]` | `[28, 36, 60, 128]` | Bit cutoffs for scores 1/2/3/4. Defaults align with NIST 800-63B guidance. |

#### Result

| Field | Type | Description |
|---|---|---|
| `bits` | `number` | Effective entropy after pattern/dictionary/l33t reduction. |
| `score` | `0 \| 1 \| 2 \| 3 \| 4` | Banded score derived from `bits` via `scoreThresholds`. Aligns with core's `StrengthScore`. |
| `crackTime` | `CrackTimePresets` | Four attack-model estimates (see below). |
| `patterns` | `readonly EntropyPattern[]` | Reducing patterns detected, in order. |

#### Crack-time attack models

| Preset | Guesses/sec | Scenario |
|---|---|---|
| `onlineThrottled` | 100/hour | Rate-limited login form. |
| `onlineUnthrottled` | 10/sec | No rate limit. |
| `offlineSlowHash` | 10⁴/sec | Bcrypt cost 10, scrypt, argon2. |
| `offlineFastHash` | 10¹⁰/sec | Raw MD5/SHA1 on a single modern GPU. |

#### Detected patterns

- `'sequence'` — `abc`, `123`, `qwerty`, …
- `'repetition'` — `aaaa`, `abab`, …
- `'dictionary'` — match against the built-in 15 K dictionary or `customDictionary`.
- `'l33t'` — match after un-substituting `@`→`a`, `0`→`o`, etc.
- `'capitalization'` — initial capital on a dictionary word.
- `'personalInfo'` — substring match against `personalInfo` (case-insensitive); forces `bits: 0`.

## Bundle size

The built bundle is checked in CI and **must stay under 30 720 bytes (30 KB) gzipped**. If you add code, run:

```bash
pnpm --filter @sentinel-password/entropy build
gzip -c packages/entropy/dist/index.js | wc -c
```

## Regenerating the dictionary

The bloom filter at `src/data/dict-bloom.ts` is generated from the seed files in `data/`. Regenerate after changing those files:

```bash
pnpm --filter @sentinel-password/entropy generate:dict
```

## License

MIT. See [LICENSE](../../LICENSE).
