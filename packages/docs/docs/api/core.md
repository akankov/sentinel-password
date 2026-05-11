# Core Package API

The `@sentinel-password/core` package provides the foundational password validation functionality. It is zero-dependency, isomorphic, and ships both ESM and CommonJS builds.

## Installation

```bash
npm install @sentinel-password/core
```

## Main Functions

### `validatePassword()`

Run all built-in checks against a password and get a structured result with strength, feedback, and per-check booleans.

**Signature:**
```typescript
function validatePassword(
  password: string,
  options?: ValidatorOptions
): ValidationResult
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `password` | `string` | The password to validate |
| `options` | `ValidatorOptions` | Optional validation configuration (all fields optional) |

**Returns:** `ValidationResult`

**Example:**

```typescript
import { validatePassword } from '@sentinel-password/core'

const result = validatePassword('MyP@ssw0rd!', {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true,
})

console.log(result.valid)              // true
console.log(result.strength)           // 'very-strong'
console.log(result.score)              // 4
console.log(result.feedback.warning)   // undefined when valid
console.log(result.feedback.suggestions) // []
console.log(result.checks)
// {
//   length: true, characterTypes: true, repetition: true,
//   sequential: true, keyboardPattern: true,
//   commonPassword: true, personalInfo: true,
// }
```

## Individual Validators

Each built-in check is also exported on its own for targeted use and tree-shaking.

```typescript
import {
  validateLength,
  validateCharacterTypes,
  validateRepetition,
  validateSequential,
  validateKeyboardPattern,
  validateCommonPassword,
  validatePersonalInfo,
  hasUppercase,
  hasLowercase,
  hasDigit,
  hasSymbol,
} from '@sentinel-password/core'

const lengthCheck = validateLength('abc', { minLength: 8 })
// { passed: false, message: 'Password must be at least 8 characters' }
```

Every validator returns a `ValidatorCheck`:

```typescript
interface ValidatorCheck {
  passed: boolean
  message?: string
}
```

## Types

### `ValidatorOptions`

A flat configuration object — every field is optional.

```typescript
interface ValidatorOptions {
  minLength?: number              // Default: 8
  maxLength?: number              // Default: 128
  requireUppercase?: boolean      // Default: false
  requireLowercase?: boolean      // Default: false
  requireDigit?: boolean          // Default: false
  requireSymbol?: boolean         // Default: false
  maxRepeatedChars?: number       // Default: 3
  checkSequential?: boolean       // Default: true
  checkKeyboardPatterns?: boolean // Default: true
  checkCommonPasswords?: boolean  // Default: true
  personalInfo?: string[]         // Default: undefined (disabled)
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `minLength` | `8` | Minimum password length |
| `maxLength` | `128` | Maximum password length |
| `requireUppercase` | `false` | Require at least one uppercase letter |
| `requireLowercase` | `false` | Require at least one lowercase letter |
| `requireDigit` | `false` | Require at least one digit |
| `requireSymbol` | `false` | Require at least one symbol |
| `maxRepeatedChars` | `3` | Max consecutive repeated characters allowed |
| `checkSequential` | `true` | Reject any three characters whose `charCodeAt` values are consecutive ascending or descending — `abc`, `xyz`, `123`, `987`, **plus** less-obvious runs like `!"#`, `,-.`, or `9:;`. See [Sequential](/guide/validators#sequential). |
| `checkKeyboardPatterns` | `true` | Reject keyboard runs (`qwerty`, `asdfgh`) |
| `checkCommonPasswords` | `true` | Reject the top 1,000 common passwords. The check uses a Bloom filter with no false negatives but a ~0.84% false-positive rate — see [Common Password](/guide/validators#common-password). |
| `personalInfo` | — | Array of strings the password must not contain (substring match, case-insensitive; entries containing `@` are reduced to the local part before matching) |

### `ValidationResult`

```typescript
interface ValidationResult {
  valid: boolean
  score: StrengthScore
  strength: StrengthLabel
  feedback: {
    warning?: string
    suggestions: readonly string[]
  }
  checks: Record<CheckId, boolean>
}
```

| Field | Type | Description |
|-------|------|-------------|
| `valid` | `boolean` | `true` only if every check passed |
| `score` | `StrengthScore` (`0`–`4`) | Strength score derived from passed-check ratio |
| `strength` | `StrengthLabel` | Human-readable label (see below) |
| `feedback.warning` | `string \| undefined` | First failure message, if any |
| `feedback.suggestions` | `readonly string[]` | All failure messages, in check order |
| `checks` | `Record<CheckId, boolean>` | Per-check pass/fail map |

### `StrengthScore` and `StrengthLabel`

Five strength tiers — score and label are linked.

```typescript
type StrengthScore = 0 | 1 | 2 | 3 | 4
type StrengthLabel = 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong'
```

| Score | Label |
|-------|-------|
| `0` | `'very-weak'` |
| `1` | `'weak'` |
| `2` | `'medium'` |
| `3` | `'strong'` |
| `4` | `'very-strong'` |

### `CheckId`

Identifiers for the seven built-in checks.

```typescript
type CheckId =
  | 'length'
  | 'characterTypes'
  | 'repetition'
  | 'sequential'
  | 'keyboardPattern'
  | 'commonPassword'
  | 'personalInfo'
```

### `ValidatorCheck` and `Validator`

```typescript
interface ValidatorCheck {
  passed: boolean
  message?: string
}

type Validator = (password: string, options?: ValidatorOptions) => ValidatorCheck
```

## Advanced Usage

### Strength-Based Logic

Use `score` and `strength` for tiered acceptance:

```typescript
const result = validatePassword(password, options)

if (!result.valid) {
  // Reject; show suggestions
  return { error: result.feedback.warning, suggestions: result.feedback.suggestions }
}
if (result.strength === 'medium') {
  // Allow but encourage strengthening
  console.warn('Password meets minimum requirements but could be stronger')
}
```

### Disabling Specific Checks

Make validation more permissive:

```typescript
const result = validatePassword(password, {
  checkKeyboardPatterns: false,
  checkSequential: false,
  checkCommonPasswords: false,
})
```

### Personal Info

Pass user-identifying strings — name, username, email — to reject passwords that contain them. Matching is case-insensitive and substring-based.

```typescript
validatePassword('john1234!', {
  personalInfo: ['john@example.com', 'John', 'Doe'],
})
// { valid: false, feedback: { warning: 'Password contains personal information', ... } }
// — matches "john" from the email's local part. Identifiers under 3 characters are
//   ignored. To match a domain, pass it separately (e.g. add 'example' to the list).
```

**Email handling:** values containing `@` are reduced to the part before `@` before matching, so `'john.doe@example.com'` is treated as `'john.doe'`. The domain is not checked. Add it as a separate entry if you want it rejected too.

### Tree-Shaking Individual Validators

Bundlers will tree-shake unused validators because the package is `sideEffects: false`:

```typescript
import { validateLength, validateCharacterTypes } from '@sentinel-password/core'

const lengthCheck = validateLength(password, { minLength: 12 })
const charCheck = validateCharacterTypes(password, {
  requireUppercase: true,
  requireDigit: true,
})
```

## See Also

- [React Hook API](/api/react)
- [React Components API](/api/react-components)
- [Validators Guide](/guide/validators)
- [Configuration Guide](/guide/configuration)
- [Server-Side Usage](/guide/server-side)
