# Performance

Sentinel Password is designed to be fast and lightweight. This page covers benchmark results, bundle size comparisons, and performance tips.

## Bundle Size

One of the key advantages of Sentinel Password is its minimal footprint:

| Package | ESM | ESM (gzip) | CJS (gzip) |
|---------|-----|------------|------------|
| `@sentinel-password/core` | 15.8 KB | **5.4 KB** | 5.9 KB |
| `@sentinel-password/react` | 2.5 KB | **0.7 KB** | — |
| `@sentinel-password/react-components` | 6.0 KB | **1.7 KB** | — |

### Comparison with Alternatives

| Library | Gzipped Size | Dependencies | Notes |
|---------|-------------|--------------|-------|
| **@sentinel-password/core** | **5.4 KB** | 0 | Bloom filter, 7 validators, O(1) common password lookup |
| zxcvbn | ~400 KB | 0 | Large frequency-ranked dictionaries |
| password-validator | ~4 KB | 0 | Basic rule-based validation |
| check-password-strength | ~1 KB | 0 | Regex-only strength scoring |

Sentinel Password delivers comprehensive validation — including common password detection via bloom filter, keyboard pattern analysis, and sequential character detection — at a fraction of zxcvbn's bundle cost.

## Benchmark Results

Benchmarks were run using Vitest bench on a single core. All numbers are operations per second (higher is better).

### Validation Speed

| Password Type | sentinel-password | zxcvbn | check-password-strength | password-validator |
|---------------|-------------------|--------|-------------------------|--------------------|
| Weak (`"password"`) | **119,000** ops/s | 21,500 ops/s | 2,800,000 ops/s | 1,355,000 ops/s |
| Medium (`"MyPassword1"`) | **115,000** ops/s | 6,000 ops/s | 2,400,000 ops/s | 1,650,000 ops/s |
| Strong (`"MyP@ssw0rd123!"`) | **123,000** ops/s | 2,300 ops/s | 2,280,000 ops/s | 2,220,000 ops/s |
| Long (200+ chars) | **55,000** ops/s | 5.2 ops/s | 2,220,000 ops/s | 1,200,000 ops/s |
| Batch (100 passwords) | **1,665** batches/s | 36 batches/s | 23,700 batches/s | 15,600 batches/s |

### How to Read These Numbers

- **vs. zxcvbn**: Sentinel Password is **5–10,000x faster** depending on password length. zxcvbn's entropy-based pattern matching is thorough but computationally expensive, especially on long inputs where it degrades to ~5 ops/sec.
- **vs. check-password-strength**: It's faster because it only runs basic regex checks — no dictionary, no keyboard patterns, no sequential detection. The speed difference reflects the difference in validation depth.
- **vs. password-validator**: Similar scope but uses a fluent API with simple regex rules. Faster for the same reason — fewer checks.

::: tip Key Takeaway
Sentinel Password validates a typical password in **~7 microseconds**. For comparison, a single DOM repaint takes ~16 milliseconds — over 2,000x longer. Password validation will never be your bottleneck.
:::

### Individual Validator Performance

| Validator | ops/sec | Time per call |
|-----------|---------|---------------|
| Length | 30,240,000 | ~33 ns |
| Repetition | 22,830,000 | ~44 ns |
| Common password (bloom filter) | 12,930,000 | ~77 ns |
| Character types | 11,810,000 | ~85 ns |
| Sequential | 9,360,000 | ~107 ns |
| Personal info | 8,580,000 | ~117 ns |
| Keyboard patterns | 117,000 | ~8.5 μs |

The keyboard pattern validator is the most expensive because it checks against multiple keyboard layouts (QWERTY, AZERTY, etc.), but at ~8.5 microseconds per call, it's still well within acceptable limits.

## Entropy Estimation Performance

`@sentinel-password/entropy` is an optional standalone package that adds Shannon entropy + crack-time estimation alongside core's rule-based validation. Install it only if you need a "how long would this survive a brute-force attack?" signal.

### Latency by Password Shape

| Fixture | ops/sec | Time per call |
|---------|---------|---------------|
| Dictionary hit (`"password"`) | **835,000** | ~1.2 μs |
| Repetition (`"aaaaaaaa"`) | **918,000** | ~1.1 μs |
| Keyboard pattern (`"qwertyuiop"`) | **737,000** | ~1.4 μs |
| Passphrase (`"correct horse battery staple"`) | **74,000** | ~13 μs |
| Long edge case (256 chars) | **42,000** | ~24 μs |
| L33t + capitalization (`"Tr0ub4dor&3"`) | **33,000** | ~31 μs |
| Pure-random 12-char | **24,000** | ~41 μs |

Fast paths (dictionary hits, repetitions, keyboard patterns) exit early via specific detectors. Slower fixtures exercise the full substring-scan plus l33t-candidate enumeration paths.

### sentinel-entropy vs zxcvbn

The only meaningful entropy comparator is zxcvbn — both libraries produce entropy bits + a 0-4 score + crack-time estimates under multiple attacker models.

| Password Type | sentinel-entropy | zxcvbn | Speedup |
|---------------|------------------|--------|---------|
| Weak (`"password"`) | **817,000** ops/s | 21,500 ops/s | **38×** |
| Medium (`"MyPassword1"`) | **135,000** ops/s | 5,400 ops/s | **25×** |
| Strong (`"MyP@ssw0rd123!"`) | **63,000** ops/s | 2,400 ops/s | **26×** |
| Long (200+ chars) | **14,300** ops/s | 5.2 ops/s | **2,766×** |
| Batch (100 passwords) | **1,150** batches/s | 36 batches/s | **32×** |

The gap widens dramatically on long inputs — zxcvbn's dictionary partition search scales superlinearly with length, while sentinel-entropy's greedy walk caps each dictionary probe at 18 chars.

::: tip Trade-off
sentinel-entropy is intentionally simpler than zxcvbn. It skips the dynamic-programming partition search to stay under the 30 KB bundle budget (zxcvbn ships ~400 KB). Accuracy on adversarial inputs is somewhat lower; runtime and bundle cost are dramatically better.
:::

### Run Environment

The numbers above were captured on:

- **CPU**: Apple M4 (10 cores)
- **OS**: macOS (Darwin 25.5.0, arm64)
- **Node**: v22.22.2
- **Vitest**: `^4.1.5`

Ops/sec varies 30-50 % across hardware (Intel/AMD/ARM, laptop/desktop/CI runner). Treat absolute values as illustrative; **relative ranking** (which library is fastest, by what factor) is stable across machines.

## Performance Tips

### Use Debouncing in React

The React hook includes built-in debouncing (300ms default) to avoid validating on every keystroke:

```typescript
import { usePasswordValidator } from '@sentinel-password/react'

const { password, setPassword, result } = usePasswordValidator({
  minLength: 8,
  debounceMs: 300, // Default — validates 300ms after typing stops
})
```

### Disable Checks You Don't Need

`validatePassword` always invokes all seven built-in validators — there is no way to skip a validator entirely from the top-level call. Three of them, however, have explicit disable flags that short-circuit the validator's inner work via an early-return:

```typescript
import { validatePassword } from '@sentinel-password/core'

const result = validatePassword(password, {
  checkCommonPasswords: false,    // skips Bloom-filter lookup
  checkKeyboardPatterns: false,   // skips QWERTY/AZERTY scan
  checkSequential: false,         // skips abc/123 scan
})
// `length`, `characterTypes`, `repetition`, and `personalInfo` still run.
```

Two notes on what this actually does:

- The disabled validators are **still called** and **still appear in `result.checks`** — they just always report `passed: true` when their flag is off. Don't treat `result.checks.sequential === true` as proof the password was checked for sequences if you've disabled the flag.
- The other four validators have no disable flag. To make them effectively no-ops:
  - `length` — set `minLength: 0, maxLength: 9999`. (Use `0`, not `1` — `validateLength` rejects with strict `length < minLength`, so `minLength: 1` still fails empty strings.)
  - `repetition` — set `maxRepeatedChars: 9999`.
  - `characterTypes` — leave the `require*` flags off (the default).
  - `personalInfo` — omit the `personalInfo` array (the default; the validator early-returns on empty arrays).

The savings are real but small — validation already runs in microseconds end-to-end (see the [Individual Validator Performance](#individual-validator-performance) table). If you genuinely need only one or two checks, prefer the tree-shaking pattern below.

### Tree-Shaking Individual Validators

If you only need specific validators, import them directly. Bundlers will tree-shake the rest:

```typescript
import { validateLength, validateCharacterTypes } from '@sentinel-password/core'

const lengthCheck = validateLength(password, { minLength: 12 })
// { passed: true | false, message?: string }

const charCheck = validateCharacterTypes(password, {
  requireUppercase: true,
  requireDigit: true,
})
```

## Running Benchmarks Locally

To reproduce these benchmarks on your machine:

```bash
git clone https://github.com/akankov/sentinel-password.git
cd sentinel-password
pnpm install

# Run all packages' benchmarks (core + entropy)
pnpm bench

# Or scope to a single package
pnpm --filter @sentinel-password/core bench
pnpm --filter @sentinel-password/entropy bench
```

Each package has two suites: `performance.bench.ts` (internal latency) and `comparative.bench.ts` (vs competitor libraries).
