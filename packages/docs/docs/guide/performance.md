# Performance

Sentinel Password is designed to be fast and lightweight. This page covers benchmark results, bundle size comparisons, and performance tips.

## Bundle Size

One of the key advantages of Sentinel Password is its minimal footprint:

| Package | ESM | ESM (gzip) | CJS (gzip) |
|---------|-----|------------|------------|
| `@sentinel-password/core` | 16.2 KB | **5.5 KB** | 6.0 KB |
| `@sentinel-password/react` | 2.5 KB | **0.7 KB** | — |
| `@sentinel-password/react-components` | 6.2 KB | **1.7 KB** | — |

### Comparison with Alternatives

| Library | Gzipped Size | Dependencies | Notes |
|---------|-------------|--------------|-------|
| **@sentinel-password/core** | **5.5 KB** | 0 | Bloom filter, 7 validators, O(1) common password lookup |
| zxcvbn | ~400 KB | 0 | Large frequency-ranked dictionaries |
| password-validator | ~4 KB | 0 | Basic rule-based validation |
| check-password-strength | ~1 KB | 0 | Regex-only strength scoring |

Sentinel Password delivers comprehensive validation — including common password detection via bloom filter, keyboard pattern analysis, and sequential character detection — at a fraction of zxcvbn's bundle cost.

## Benchmark Results

Benchmarks were run using Vitest bench on a single core. All numbers are operations per second (higher is better).

### Validation Speed

| Password Type | sentinel-password | zxcvbn | check-password-strength | password-validator |
|---------------|-------------------|--------|-------------------------|--------------------|
| Weak (`"password"`) | **135,000** ops/s | 23,000 ops/s | 2,975,000 ops/s | 1,468,000 ops/s |
| Medium (`"MyPassword1"`) | **132,000** ops/s | 6,500 ops/s | 2,658,000 ops/s | 1,925,000 ops/s |
| Strong (`"MyP@ssw0rd123!"`) | **136,000** ops/s | 2,600 ops/s | 2,511,000 ops/s | 2,376,000 ops/s |
| Long (200+ chars) | **59,000** ops/s | 5.5 ops/s | 2,503,000 ops/s | 1,256,000 ops/s |
| Batch (100 passwords) | **1,870** batches/s | 53 batches/s | 27,350 batches/s | 18,400 batches/s |

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
| Length | 30,500,000 | ~33 ns |
| Repetition | 24,000,000 | ~42 ns |
| Sequential | 23,300,000 | ~43 ns |
| Bloom filter (common passwords) | 14,300,000 | ~70 ns |
| Character types | 13,600,000 | ~73 ns |
| Personal info | 9,660,000 | ~103 ns |
| Keyboard patterns | 137,600 | ~7 μs |

The keyboard pattern validator is the most expensive because it checks against multiple keyboard layouts (QWERTY, AZERTY, etc.), but at ~7 microseconds per call, it's still well within acceptable limits.

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
pnpm --filter @sentinel-password/core bench
```

This runs both internal benchmarks (`performance.bench.ts`) and comparative benchmarks (`comparative.bench.ts`).
