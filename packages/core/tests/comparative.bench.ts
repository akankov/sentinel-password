import { bench, describe } from 'vitest'
import { validatePassword } from '../src/index'
import zxcvbn from 'zxcvbn'
import { passwordStrength } from 'check-password-strength'
import PasswordValidator from 'password-validator'

/**
 * Comparative benchmarks: sentinel-password vs popular alternatives
 *
 * Run with: pnpm --filter @sentinel-password/core bench
 *
 * Libraries compared:
 * - @sentinel-password/core (this library)
 * - zxcvbn v4.4.2 — entropy-based scoring with dictionaries (~400KB gzipped)
 * - check-password-strength v3.0.0 — regex-based strength scoring (~1KB)
 * - password-validator v5.3.0 — fluent rule-based validation (~4KB)
 */

// Pre-configure password-validator schema (done once, reused in bench)
const pvSchema = new PasswordValidator()
pvSchema
  .is()
  .min(8)
  .is()
  .max(128)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits()
  .has()
  .symbols()
  .has()
  .not()
  .spaces()

const sentinelOptions = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true,
  checkCommonPasswords: true,
  maxRepeatedChars: 3,
  checkSequential: true,
  checkKeyboardPatterns: true,
} as const

// --- Test passwords covering different strength levels ---

const WEAK_PASSWORD = 'password'
const MEDIUM_PASSWORD = 'MyPassword1'
const STRONG_PASSWORD = 'MyP@ssw0rd123!'
const VERY_LONG_PASSWORD = 'A1b@' + 'x'.repeat(200) + 'Z9$'

describe('Weak password — "password"', () => {
  bench('sentinel-password', () => {
    validatePassword(WEAK_PASSWORD, sentinelOptions)
  })

  bench('zxcvbn', () => {
    zxcvbn(WEAK_PASSWORD)
  })

  bench('check-password-strength', () => {
    passwordStrength(WEAK_PASSWORD)
  })

  bench('password-validator', () => {
    pvSchema.validate(WEAK_PASSWORD, { details: true })
  })
})

describe('Medium password — "MyPassword1"', () => {
  bench('sentinel-password', () => {
    validatePassword(MEDIUM_PASSWORD, sentinelOptions)
  })

  bench('zxcvbn', () => {
    zxcvbn(MEDIUM_PASSWORD)
  })

  bench('check-password-strength', () => {
    passwordStrength(MEDIUM_PASSWORD)
  })

  bench('password-validator', () => {
    pvSchema.validate(MEDIUM_PASSWORD, { details: true })
  })
})

describe('Strong password — "MyP@ssw0rd123!"', () => {
  bench('sentinel-password', () => {
    validatePassword(STRONG_PASSWORD, sentinelOptions)
  })

  bench('zxcvbn', () => {
    zxcvbn(STRONG_PASSWORD)
  })

  bench('check-password-strength', () => {
    passwordStrength(STRONG_PASSWORD)
  })

  bench('password-validator', () => {
    pvSchema.validate(STRONG_PASSWORD, { details: true })
  })
})

describe('Long password (200+ chars)', () => {
  bench('sentinel-password', () => {
    validatePassword(VERY_LONG_PASSWORD, sentinelOptions)
  })

  bench('zxcvbn', () => {
    zxcvbn(VERY_LONG_PASSWORD)
  })

  bench('check-password-strength', () => {
    passwordStrength(VERY_LONG_PASSWORD)
  })

  bench('password-validator', () => {
    pvSchema.validate(VERY_LONG_PASSWORD, { details: true })
  })
})

describe('Batch validation — 100 passwords', () => {
  const passwords: string[] = Array.from({ length: 100 }, (_, i) => {
    const bases: string[] = ['password', 'MyP@ssw0rd!', 'qwerty123', 'Str0ng!Pass', 'abcdef']
    const base: string = bases[i % bases.length] as string
    return base + String(i)
  })

  bench('sentinel-password', () => {
    for (const pwd of passwords) {
      validatePassword(pwd, sentinelOptions)
    }
  })

  bench('zxcvbn', () => {
    for (const pwd of passwords) {
      zxcvbn(pwd)
    }
  })

  bench('check-password-strength', () => {
    for (const pwd of passwords) {
      passwordStrength(pwd)
    }
  })

  bench('password-validator', () => {
    for (const pwd of passwords) {
      pvSchema.validate(pwd, { details: true })
    }
  })
})
