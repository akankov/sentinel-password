# Custom Validators

`validatePassword` accepts consumer-defined rules through the
`customValidators` option: a map of check name → validator function. Custom
checks run after the seven built-ins and participate in the result exactly
like them — they count toward `valid` and the strength score, appear in
`result.checks` under their registered name, and their failure messages join
`feedback.suggestions`.

```typescript
import { validatePassword } from '@sentinel-password/core'

const result = validatePassword(userPassword, {
  minLength: 12,
  customValidators: {
    noDates: (password) =>
      /\b(19|20)\d{2}\b|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(password)
        ? { passed: false, message: 'Password looks like a date — pick something less guessable.' }
        : { passed: true },
  },
})

result.checks.noDates // boolean, alongside the 7 built-in checks
result.valid          // false if ANY check — built-in or custom — failed
```

Because the option rides on `ValidatorOptions`, it flows through
[`usePasswordValidator`](/api/react) and
[`PasswordInput`](/api/react-components)'s `validatorOptions` prop with no
extra wiring — custom failure messages render in the component's validation
list like any built-in message.

## How custom checks surface in the result

For a custom validator registered as `noDates` that fails:

| Field | Value |
|-------|-------|
| `checks.noDates` | `false` |
| `valid` | `false` |
| `feedback.suggestions` | includes your `message` |
| `failures` | includes `{ check: 'noDates', code: 'custom.noDates', params: {}, message: '…' }` |
| `score` | denominator grows to `7 + N` — e.g. 7 built-ins passing + 1 custom failing = `floor((7/8)·5)` = 4 |

You can override the defaulted `code` and attach interpolation `params` for
your own localization pipeline:

```typescript
customValidators: {
  noCompanyName: (pw) =>
    pw.toLowerCase().includes('acme')
      ? { passed: false, message: 'No company names', code: 'company.blocked', params: { company: 'acme' } }
      : { passed: true },
}
```

## Rules of the road

- **Never throw.** Validators are pure functions returning `{ passed, … }`.
  If a custom validator does throw, `validatePassword` treats it as a
  *failed* check (fail closed) rather than crashing — but that's a safety
  net, not a feature.
- **Built-in names are reserved.** A custom validator registered as `length`,
  `commonPassword`, etc. would overwrite the built-in entry in
  `result.checks`, so colliding names are skipped entirely.
- **Render your own messages.** Custom messages are NOT routed through the
  `messages` / `formatMessage` i18n options (those are keyed by the closed
  built-in `MessageCode` union). Your validator receives the full options
  object, so it can implement whatever localization it needs.
- Anything other than a literal `passed: true` — including a malformed
  return value — counts as failed.

## Recipe: Forbidden Words / Blocklist

A common requirement is rejecting passwords that contain a specific word — a
product name, the literal string `password`, or an internal codename. You may
not need any custom code.

### Zero-code: you might already be covered

- **Common words like `password`, `admin`, `letmein`** are already rejected.
  The `checkCommonPasswords` option is `true` by default and matches against
  the top‑1,000 list, so `validatePassword('password123')` already fails the
  common-password check — no extra work needed.
- **A handful of org-specific words** can ride on the existing `personalInfo`
  option, which does a case-insensitive **substring** match against every
  entry:

```typescript
import { validatePassword } from '@sentinel-password/core'

// Rejects any password containing "acme" or "projectx" (case-insensitive).
const result = validatePassword(userPassword, {
  minLength: 12,
  personalInfo: ['acme', 'projectx'],
})
```

Two caveats on the `personalInfo` shortcut: entries shorter than **3
characters are ignored** (to avoid false positives), and entries containing
`@` are treated as emails and reduced to the local part (everything before
`@`). For a curated wordlist where those rules don't fit, register a custom
validator:

### As a custom validator

```typescript
import { validatePassword } from '@sentinel-password/core'
import type { CustomValidator } from '@sentinel-password/core'

const FORBIDDEN_WORDS = ['password', 'acme', 'projectx', 'admin']

// Case-insensitive substring match — same semantics as the personalInfo check.
const noForbiddenWords: CustomValidator = (password) => {
  const lower = password.toLowerCase()
  return FORBIDDEN_WORDS.some((w) => lower.includes(w.toLowerCase()))
    ? { passed: false, message: 'Password contains a forbidden word.' }
    : { passed: true }
}

const result = validatePassword(userPassword, {
  minLength: 12,
  requireDigit: true,
  customValidators: { noForbiddenWords },
})
```

`includes` is a substring match, so blocklisting `'admin'` also rejects
`'badminton'`. If that's too aggressive, swap the check for a word-boundary
regex such as `new RegExp(\`\\b${w}\\b\`, 'i').test(password)`.

## Advanced: Build Your Own Aggregator

`customValidators` *adds* checks to the built-in seven. If you instead want a
**different** set of built-ins — say, length and character types but no
sequential/keyboard-pattern checks — import the individual validators and
compose your own aggregator. Every built-in validator is exported
individually. (Disabling via options — `checkSequential: false` etc. — covers
most cases without custom code; see [Validators](/guide/validators).)

```typescript
import {
  validateLength,
  validateCharacterTypes,
  validateCommonPassword,
} from '@sentinel-password/core'
import type { ValidatorCheck } from '@sentinel-password/core'

export function validateMyPassword(password: string) {
  const checks: ValidatorCheck[] = [
    validateLength(password, { minLength: 12 }),
    validateCharacterTypes(password, { requireUppercase: true, requireDigit: true }),
    validateCommonPassword(password),
  ]

  const failures = checks.filter((c) => !c.passed)
  return {
    valid: failures.length === 0,
    messages: failures.map((c) => (c.passed ? undefined : c.message)).filter(Boolean),
  }
}
```

## Typing Your Custom Validators

```typescript
import type { CustomValidator, CustomValidatorCheck } from '@sentinel-password/core'

// (password, options?) => CustomValidatorCheck
// where CustomValidatorCheck is:
// { passed: boolean; message?: string; code?: string; params?: MessageParams }
```

The built-in `Validator` type is structurally assignable to
`CustomValidator`, so a standalone built-in (e.g. `validateLength` with
stricter options) can be re-registered under a custom name:

```typescript
import { validateLength } from '@sentinel-password/core'

validatePassword(password, {
  customValidators: {
    strictLength: (pw) => validateLength(pw, { minLength: 20 }),
  },
})
```

## Testing Custom Validators

Validators are pure functions over a string, so unit tests are trivial — no
React, no DOM, no fixtures:

```typescript
import { describe, it, expect } from 'vitest'
import { validateNoDate } from './my-validators'

describe('validateNoDate', () => {
  it('rejects four-digit years', () => {
    expect(validateNoDate('hello-2024-world').passed).toBe(false)
  })

  it('rejects slash-separated dates', () => {
    expect(validateNoDate('birthdate-3/14/1995').passed).toBe(false)
  })

  it('passes safe passwords', () => {
    expect(validateNoDate('Tr0ub4dor&3-isLong!').passed).toBe(true)
  })
})
```

## See Also

- [Validators](/guide/validators) — the canonical list of built-in validators
- [Core API](/api/core) — `CustomValidator`, `ValidatorCheck`, and `ValidationResult` types
- [Configuration](/guide/configuration) — composing built-in validator options
