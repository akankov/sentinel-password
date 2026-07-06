# Validators

A complete guide to the seven built-in validators. All seven run inside a single call to `validatePassword(password, options)` — you don't pick them individually; you tune their behavior through the flat options object.

Each validator is also exported standalone if you want to call it directly (handy for testing or for tree-shaking when you only need one).

## How Validators Combine

`validatePassword` runs all seven checks unconditionally and reports the result in `result.checks`. To make a check effectively a no-op:

- `length`, `repetition`: relax the threshold (`minLength: 0` — note `0`, not `1`, because the check is strict `length < minLength`; `maxRepeatedChars: 9999`)
- `characterTypes`: leave the four `require*` options off (the default)
- `sequential`, `keyboardPattern`, `commonPassword`: set `checkSequential`, `checkKeyboardPatterns`, or `checkCommonPasswords` to `false`
- `personalInfo`: omit the `personalInfo` array (default), or pass an empty array

```typescript
import { validatePassword } from '@sentinel-password/core'

const result = validatePassword('MyP@ssw0rd!', {
  minLength: 12,
  requireUppercase: true,
  requireDigit: true,
  requireSymbol: true,
  personalInfo: ['user@example.com', 'Alex'],
})

console.log(result.checks)
// { length: false, characterTypes: true, repetition: true, sequential: true,
//   keyboardPattern: true, commonPassword: true, personalInfo: true }
```

## Available Validators

### Length

Caps the password length on both sides. Length is counted in **Unicode code points** (user-perceived characters, per NIST 800-63B), not UTF-16 code units — an emoji counts as 1, so `'😀😁😂🤣'` has length 4 and does not satisfy `minLength: 8`.

**Options:**

| Option | Default | Effect |
|--------|---------|--------|
| `minLength` | `8` | Reject passwords shorter than this |
| `maxLength` | `128` | Reject passwords longer than this |

**Standalone:**
```typescript
import { validateLength } from '@sentinel-password/core'

validateLength('abc', { minLength: 8 })
// { passed: false, message: 'Password must be at least 8 characters' }
```

### Character Types

Enforces required character classes.

**Options:**

| Option | Default | Effect |
|--------|---------|--------|
| `requireUppercase` | `false` | Require ≥1 uppercase letter |
| `requireLowercase` | `false` | Require ≥1 lowercase letter |
| `requireDigit` | `false` | Require ≥1 digit |
| `requireSymbol` | `false` | Require ≥1 symbol |
| `unicodeCharacterTypes` | `false` | Opt-in Unicode-aware classification: `Пароль123!` satisfies `requireUppercase`, `№`/`€`/em-dash count as symbols, `\p{Nd}` digits count. Default ASCII mode only recognizes `A-Z`/`a-z`/`0-9`/printable ASCII punctuation. |

**Standalone:**
```typescript
import { validateCharacterTypes, hasUppercase, hasDigit } from '@sentinel-password/core'

validateCharacterTypes('alllower1', { requireUppercase: true })
// { passed: false, message: 'Password must contain at least one uppercase letter' }

hasUppercase('Hi')  // true
hasDigit('hi')      // false
```

### Repetition

Rejects long runs of the same character (`aaaa`, `1111`).

**Options:**

| Option | Default | Effect |
|--------|---------|--------|
| `maxRepeatedChars` | `3` | Max allowed identical consecutive characters |

**Standalone:**
```typescript
import { validateRepetition } from '@sentinel-password/core'

validateRepetition('Paaaaass1!', { maxRepeatedChars: 3 })
// { passed: false, message: 'Password contains too many repeated characters' }
```

### Sequential

Detects **three or more letters or digits whose `charCodeAt` values are consecutive (ascending or descending)**. Source uses `String.prototype.charCodeAt` deltas (`sequential.ts`), which return UTF-16 code units. For the Basic Multilingual Plane (U+0000–U+FFFF) — every character you'd see in a typical password, including ASCII, Latin extensions, Cyrillic, Greek, and CJK — code units and Unicode code points are identical, so the practical effect is "three consecutive code points." Supplementary-plane characters (emoji, etc.) are encoded as surrogate pairs, so a code-point-level run like `😀😁😂` does *not* trigger the check.

What counts as a sequence:

- Within letters: `abc`, `xyz`, `ABC` (and reverse: `cba`, `zyx`)
- Within digits: `123`, `987`
- Non-ASCII alphabets whose letters are code-point-consecutive: Cyrillic `абв`, Greek `αβγ`

What does **not** count: ASCII symbol/punctuation runs that happen to be code-point-consecutive — `!"#` (codes 33-35), `()*` (40-42), `[\]` (91-93) — and runs that cross out of the letter/digit classes, like `9:;` (57-59) or `?@A` (63-65). Those are typical of randomly generated passwords (password managers), not predictable typing patterns, so they pass.

::: warning Overlap with keyboard-pattern
The numeric runs `123`, `456`, `789` (and their reverses `321`, `654`, `987`) are *also* matched by the [Keyboard Pattern](#keyboard-pattern) validator's numeric-keypad list. Setting `checkSequential: false` alone will **not** allow a password like `password123` through — `checkKeyboardPatterns` (default `true`) still catches the `123` substring. To accept those numeric runs you must disable **both** flags: `{ checkSequential: false, checkKeyboardPatterns: false }`. The two validators were designed as independent defences (one catches arbitrary code-point runs, the other catches keyboard-locality runs), so this overlap is by design — but it can be surprising when you're trying to isolate behaviour.
:::

**Options:**

| Option | Default | Effect |
|--------|---------|--------|
| `checkSequential` | `true` | Disable with `false` to allow sequences |

**Standalone:**
```typescript
import { validateSequential } from '@sentinel-password/core'

validateSequential('abc1xyz!')
// { passed: false, message: 'Password contains sequential characters (e.g., abc, 123)' }
```

### Keyboard Pattern

Catches runs along common keyboard layouts (`qwerty`, `asdfgh`, `zxcvbn`) plus the numeric row (`1234567890`) and numeric-keypad rows/columns (`789`, `456`, `123`, `741`, `852`, `963`). Supports QWERTY, AZERTY, QWERTZ, Dvorak, Colemak, and Cyrillic layouts. The shifted symbol row (`!@#$%…`) is **not** in the pattern set today — only unshifted runs are detected.

::: warning Overlap with sequential
The numeric-keypad rows `123`, `456`, `789` (and their reverses) are *also* caught by the [Sequential](#sequential) validator's `charCodeAt`-consecutive check — Sequential catches them as code-point runs, Keyboard Pattern catches them as numeric-keypad substrings. The two validators are independent gates: `checkKeyboardPatterns: false` alone won't allow `password123` through because `checkSequential` (default `true`) still rejects it. Disable both (`checkSequential: false, checkKeyboardPatterns: false`) to accept simple numeric runs.
:::

**Options:**

| Option | Default | Effect |
|--------|---------|--------|
| `checkKeyboardPatterns` | `true` | Disable with `false` to allow keyboard patterns |

**Standalone:**
```typescript
import { validateKeyboardPattern } from '@sentinel-password/core'

validateKeyboardPattern('qwerty123!')
// { passed: false, message: 'Password contains common keyboard patterns' }
```

### Common Password

Looks the password up in a precomputed Bloom filter of the top 1,000 common passwords. O(1) lookup, no network calls.

::: tip Bloom filter tradeoff
A Bloom filter is space-efficient (~1.5 KB here, vs ~8 KB for the raw list) but probabilistic in one direction: **no false negatives** (every password in the top-1,000 list is rejected — including its l33t-speak readings: `P@ssw0rd`, `l3tm3in`, and `m0nkey` fail like their plain forms) and a small **false-positive rate of ~0.33% per probe**, up to roughly 1% for inputs full of substitutable characters (at most three probes run). This is by design and documented in `common-password.ts`. If you have a use case that needs exact-match rejection (e.g., a curated wordlist with no near-collisions), do that lookup yourself outside the validator.
:::

**Options:**

| Option | Default | Effect |
|--------|---------|--------|
| `checkCommonPasswords` | `true` | Disable with `false` to skip the lookup |

**Standalone:**
```typescript
import { validateCommonPassword } from '@sentinel-password/core'

validateCommonPassword('password')
// { passed: false, message: 'Password is too common. Please choose a more unique password.' }
```

### Personal Info

Rejects passwords that contain any of the supplied identifiers as a case-insensitive substring. Pass user-identifying strings — name, username, email — that the password should not include.

::: tip Emails are reduced to the local part
Any value containing `@` is treated as an email and **only the part before `@` is matched**. `personalInfo: ['john.doe@example.com']` is effectively `personalInfo: ['john.doe']` — the domain (`example.com`) is not checked. If you want to reject passwords containing your company domain, pass it as a separate string (e.g. `['john.doe@example.com', 'example']`).

Identifiers shorter than 3 characters are also ignored to avoid false positives.
:::

**Options:**

| Option | Default | Effect |
|--------|---------|--------|
| `personalInfo` | `undefined` | Array of strings the password must not contain (substring match, case-insensitive; emails reduced to local part) |

**Standalone:**
```typescript
import { validatePersonalInfo } from '@sentinel-password/core'

validatePersonalInfo('john1234!', { personalInfo: ['john@example.com', 'John', 'Doe'] })
// { passed: false, message: 'Password contains personal information' }
```

::: tip
Pass `personalInfo` whenever you have user context (signup form, profile update). It's a cheap, high-signal check — substring match catches `JohnDoe2024!` for `[ "John", "Doe" ]`.
:::

## Strict Policy Example

A common "high security" preset:

```typescript
import { validatePassword } from '@sentinel-password/core'

const result = validatePassword(password, {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true,
  maxRepeatedChars: 2,
  // checkSequential, checkKeyboardPatterns, checkCommonPasswords default to true
  personalInfo: [user.email, user.firstName, user.lastName].filter(Boolean),
})
```

## See Also

- [Configuration Guide](/guide/configuration)
- [Core API](/api/core)
- [Getting Started](/guide/getting-started)
