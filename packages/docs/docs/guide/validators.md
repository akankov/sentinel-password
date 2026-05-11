# Validators

A complete guide to the seven built-in validators. All seven run inside a single call to `validatePassword(password, options)` — you don't pick them individually; you tune their behavior through the flat options object.

Each validator is also exported standalone if you want to call it directly (handy for testing or for tree-shaking when you only need one).

## How Validators Combine

`validatePassword` runs all seven checks unconditionally and reports the result in `result.checks`. To make a check effectively a no-op:

- `length`, `repetition`: relax the threshold (`minLength: 1`, `maxRepeatedChars: 9999`)
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

Caps the password length on both sides.

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

Detects ascending or descending runs in the alphabet or digits (`abc`, `xyz`, `123`, `987`).

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
A Bloom filter is space-efficient (~1.5 KB here, vs ~8 KB for the raw list) but probabilistic in one direction: **no false negatives** (every password in the top-1,000 list is rejected) and a small **false-positive rate of ~0.84%** — about 1 in 119 passwords *not* in the list may still be flagged as "common." This is by design and documented in `common-password.ts`. If you have a use case that needs exact-match rejection (e.g., a curated wordlist with no near-collisions), do that lookup yourself outside the validator.
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
