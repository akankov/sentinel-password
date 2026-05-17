# Custom Validators

`@sentinel-password/core` does not yet have a built-in hook for registering custom validators with `validatePassword` — the seven built-in checks run unconditionally and `ValidatorOptions` has no `customValidators` slot. Until that lands on the roadmap, two patterns let you add your own rules today.

## Pattern 1: Wrap and Combine

Call `validatePassword` for the built-in checks, then run your own logic against the same password and merge the results. Cleanest if you want the built-ins **plus** an extra check or two.

```typescript
import { validatePassword } from '@sentinel-password/core'
import type { ValidationResult } from '@sentinel-password/core'

// Your custom check — reject passwords that look like a date.
function rejectDateLikePasswords(password: string): { passed: boolean; message?: string } {
  const looksLikeDate = /\b(19|20)\d{2}\b|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(password)
  return looksLikeDate
    ? { passed: false, message: 'Password looks like a date — pick something less guessable.' }
    : { passed: true }
}

export function validateWithCustomRules(password: string): ValidationResult {
  const builtin = validatePassword(password, {
    minLength: 12,
    requireUppercase: true,
    requireDigit: true,
    requireSymbol: true,
  })

  const custom = rejectDateLikePasswords(password)
  const customPassed = custom.passed

  // Merge: the result is invalid if either side failed; combine suggestions.
  const mergedSuggestions = [
    ...builtin.feedback.suggestions,
    ...(custom.message ? [custom.message] : []),
  ]

  return {
    ...builtin,
    valid: builtin.valid && customPassed,
    feedback: {
      ...(mergedSuggestions[0] !== undefined && { warning: mergedSuggestions[0] }),
      suggestions: mergedSuggestions,
    },
    checks: {
      ...builtin.checks,
      // Note: `checks` is keyed by built-in CheckId. If you want to surface
      // your custom check in the result, return your own ValidationResult-like
      // shape instead of overloading `checks`.
    },
  }
}
```

## Pattern 2: Build Your Own Aggregator

If you want full control — including swapping out built-in checks — import the individual validators you need and write your own aggregator. Every built-in validator is exported individually and conforms to the `Validator` type.

```typescript
import {
  validateLength,
  validateCharacterTypes,
  validateCommonPassword,
} from '@sentinel-password/core'
import type { Validator, ValidatorCheck } from '@sentinel-password/core'

// Your custom validator, conforming to the built-in signature.
const validateNoDate: Validator = (password) => {
  const looksLikeDate = /\b(19|20)\d{2}\b|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(password)
  return looksLikeDate
    ? { passed: false, message: 'Password looks like a date — pick something less guessable.' }
    : { passed: true }
}

// Compose only the built-in checks you want, plus your own.
export function validateMyPassword(password: string) {
  const checks: ValidatorCheck[] = [
    validateLength(password, { minLength: 12 }),
    validateCharacterTypes(password, { requireUppercase: true, requireDigit: true }),
    validateCommonPassword(password),
    validateNoDate(password),
  ]

  const failures = checks.filter((c) => !c.passed)
  return {
    valid: failures.length === 0,
    messages: failures.map((c) => c.message).filter((m): m is string => Boolean(m)),
  }
}
```

This pattern is also how you'd build a validator with a **different** set of built-ins than `validatePassword` runs (for example, skipping sequential/keyboard-pattern checks entirely while still using length and character-type validation).

## Recipe: Forbidden Words / Blocklist

A common requirement is rejecting passwords that contain a specific word — a product name, the literal string `password`, or an internal codename. You may not need any custom code.

### Zero-code: you might already be covered

- **Common words like `password`, `admin`, `letmein`** are already rejected. The `checkCommonPasswords` option is `true` by default and matches against the top‑1,000 list, so `validatePassword('password123')` already fails the common-password check — no extra work needed.
- **A handful of org-specific words** can ride on the existing `personalInfo` option, which does a case-insensitive **substring** match against every entry:

```typescript
import { validatePassword } from '@sentinel-password/core'

// Rejects any password containing "acme" or "projectx" (case-insensitive).
const result = validatePassword(userPassword, {
  minLength: 12,
  personalInfo: ['acme', 'projectx'],
})
```

Two caveats on the `personalInfo` shortcut: entries shorter than **3 characters are ignored** (to avoid false positives), and entries containing `@` are treated as emails and reduced to the local part (everything before `@`). For a curated wordlist where those rules don't fit, use the validator below.

### Reusable: a dedicated forbidden-words validator

When you want a real, testable rule with its own message, write a `Validator` and wire it through [Pattern 1](#pattern-1-wrap-and-combine):

```typescript
import { validatePassword } from '@sentinel-password/core'
import type { Validator, ValidationResult } from '@sentinel-password/core'

const FORBIDDEN_WORDS = ['password', 'acme', 'projectx', 'admin']

// Case-insensitive substring match — same semantics as the personalInfo check.
const validateNoForbiddenWords: Validator = (password) => {
  const lower = password.toLowerCase()
  const hit = FORBIDDEN_WORDS.find((w) => lower.includes(w.toLowerCase()))
  return hit
    ? { passed: false, message: 'Password contains a forbidden word.' }
    : { passed: true }
}

export function validateWithBlocklist(password: string): ValidationResult {
  const builtin = validatePassword(password, { minLength: 12, requireDigit: true })
  const custom = validateNoForbiddenWords(password)

  const mergedSuggestions = [
    ...builtin.feedback.suggestions,
    ...(custom.message ? [custom.message] : []),
  ]

  return {
    ...builtin,
    valid: builtin.valid && custom.passed,
    feedback: {
      ...(mergedSuggestions[0] !== undefined && { warning: mergedSuggestions[0] }),
      suggestions: mergedSuggestions,
    },
  }
}
```

`includes` is a substring match, so blocklisting `'admin'` also rejects `'badminton'`. If that's too aggressive, swap the check for a word-boundary regex such as `new RegExp(\`\\b${w}\\b\`, 'i').test(password)`.

## Typing Your Custom Validators

The exported `Validator` type is the same signature the built-ins use:

```typescript
import type { Validator, ValidatorOptions } from '@sentinel-password/core'

type Validator = (password: string, options?: ValidatorOptions) => ValidatorCheck
// where ValidatorCheck is { passed: boolean; message?: string }
```

Conforming to it now means your custom validators will slot into a future `customValidators` API without refactoring — and it lets you store custom and built-in validators in the same `Validator[]` array today.

## Testing Custom Validators

Validators are pure functions over a string, so unit tests are trivial — no React, no DOM, no fixtures:

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

If you build a custom aggregator (Pattern 2), test the aggregator the same way — call it with happy-path and failure-mode strings and assert on the returned shape.

## Roadmap

A future release will expose a `customValidators` option (or similar plugin hook) on `validatePassword` so you can register `Validator` functions with the same dispatch and feedback machinery the built-ins use. Until then, the patterns above are the recommended approach.

## See Also

- [Validators](/guide/validators) — the canonical list of built-in validators
- [Core API](/api/core) — `Validator`, `ValidatorCheck`, and `ValidationResult` types
- [Configuration](/guide/configuration) — composing built-in validator options
