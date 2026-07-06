# Migrating from zxcvbn

zxcvbn (and its maintained fork zxcvbn-ts) estimates password strength by
pattern-matching against large frequency-ranked dictionaries. sentinel-password
splits the same job across two much smaller packages:

- **`@sentinel-password/core`** (~6.3 KB gzipped) — pass/fail policy validation:
  7 checks, actionable feedback, a 0–4 score
- **`@sentinel-password/entropy`** (~28 KB gzipped, optional) — the
  zxcvbn-style part: entropy bits, a 0–4 banded score, and crack-time
  estimates under four attacker models

Install what you use — if you only need "is this password acceptable?", core
alone replaces most zxcvbn call sites at ~1.5% of the bundle cost. Add entropy
when you also want "how long would this take to crack?".

```bash
pnpm add @sentinel-password/core @sentinel-password/entropy
```

## API mapping

`zxcvbn(password, user_inputs)` becomes one or both of:

```typescript
import { validatePassword } from '@sentinel-password/core'
import { estimateEntropy } from '@sentinel-password/entropy'

const validation = validatePassword(password, { personalInfo: userInputs })
const entropy = estimateEntropy(password)
```

| zxcvbn | sentinel-password |
| --- | --- |
| `score` (0–4, entropy-banded) | `estimateEntropy(pw).score` (0–4, entropy-banded — the semantic equivalent) |
| — | `validatePassword(pw).score` (0–4, **ratio of passed checks** — a different metric; see below) |
| `feedback.warning` | `validatePassword(pw).feedback.warning` |
| `feedback.suggestions` | `validatePassword(pw).feedback.suggestions` |
| `guesses_log10` | `estimateEntropy(pw).bits × 0.301` (bits are log₂; log₁₀(2) ≈ 0.301) |
| `crack_times_seconds.online_throttling_100_per_hour` | `estimateEntropy(pw).crackTime.onlineThrottled.seconds` |
| `crack_times_seconds.online_no_throttling_10_per_second` | `estimateEntropy(pw).crackTime.onlineUnthrottled.seconds` |
| `crack_times_seconds.offline_slow_hashing_1e4_per_second` | `estimateEntropy(pw).crackTime.offlineSlowHash.seconds` |
| `crack_times_seconds.offline_fast_hashing_1e10_per_second` | `estimateEntropy(pw).crackTime.offlineFastHash.seconds` |
| `crack_times_display.*` | `estimateEntropy(pw).crackTime.<preset>.display` |
| `sequence` (matched patterns) | `estimateEntropy(pw).patterns` |
| `user_inputs` argument | `personalInfo` option on `validatePassword` |
| `calc_time` | — (validation runs in ~7 µs; no need to report it) |

## Before / after

::: code-group

```typescript [zxcvbn]
import zxcvbn from 'zxcvbn'

const result = zxcvbn(password, [email, username])

if (result.score < 3) {
  showError(result.feedback.warning, result.feedback.suggestions)
}
showCrackTime(result.crack_times_display.offline_slow_hashing_1e4_per_second)
```

```typescript [sentinel-password]
import { validatePassword } from '@sentinel-password/core'
import { estimateEntropy } from '@sentinel-password/entropy'

const validation = validatePassword(password, {
  personalInfo: [email, username],
})
const entropy = estimateEntropy(password)

if (!validation.valid || entropy.score < 3) {
  showError(validation.feedback.warning, validation.feedback.suggestions)
}
showCrackTime(entropy.crackTime.offlineSlowHash.display)
```

:::

## Semantics that differ

**Two different 0–4 scores exist here.** zxcvbn's `score` is entropy-banded;
its drop-in replacement is `estimateEntropy(pw).score`. Core's
`validatePassword(pw).score` is the **ratio of passed checks** — a password
failing only the common-password check still scores 4 while `valid` is
`false`. For acceptance decisions use `valid` (or `result.checks`); use the
scores for UX cues like strength meters. See the
[core API reference](/api/core) for the exact formula.

**Common-password detection is a Bloom filter over the top 1,000 passwords**,
not zxcvbn's ~30,000-entry ranked dictionary walk. That's the deliberate
trade behind the ~60× bundle difference: no false negatives on the embedded
list, a small (<1%) false-positive rate, and O(1) lookups. L33t-speak and
dictionary-adjacency analysis live in the entropy package's pattern detection
rather than in core's pass/fail check.

**Feedback is policy-shaped, not pattern-shaped.** zxcvbn tells you *why the
guess estimate is low* ("this is similar to a commonly used password");
core tells you *which policy check failed and how to fix it* ("Password must
be at least 12 characters"). Messages carry stable codes and are fully
[localizable](/guide/i18n) — something zxcvbn only gained via zxcvbn-ts.

## What you give up

Honest accounting — migrate only if the trade fits:

- **Dictionary depth.** zxcvbn ships ~30k ranked passwords plus name/surname/
  English-word dictionaries (~400 KB gzipped). sentinel-password embeds the
  top 1,000 (Bloom filter, ~1.5 KB) and leans on the
  [breach package](/api/breach) (Have I Been Pwned's corpus of hundreds of
  millions of leaked passwords, via k-anonymity) for real-world exposure —
  an online check, but far deeper than any embedded list.
- **Date/year and spatial-graph pattern scoring.** The entropy package
  detects sequences, repetition, dictionary hits, l33t substitutions,
  capitalization patterns, and personal info, but skips zxcvbn's
  dynamic-programming partition search, so entropy estimates on adversarial
  inputs run somewhat higher. Keyboard-run *rejection* still happens in
  core's `keyboardPattern` check.

What you gain: ~60× smaller bundles, 60–40,000× faster validation (see
[Performance](/guide/performance)), zero dependencies, a React integration
layer, i18n, and a pass/fail policy engine zxcvbn never had.

## user_inputs → personalInfo

zxcvbn's `user_inputs` penalizes the score; core's `personalInfo` is a hard
check — a password containing the user's email/name fails validation with an
explicit message. Pass the same array you passed zxcvbn:

```typescript
validatePassword(password, {
  personalInfo: [user.email, user.firstName, user.lastName, user.username],
})
```
