import { bench, describe } from 'vitest'
import { validatePassword } from '../src/index'
import { validateLength } from '../src/validators/length'
import { validateCharacterTypes } from '../src/validators/character-types'
import { validateCommonPassword } from '../src/validators/common-password'
import { validateRepetition } from '../src/validators/repetition'
import { validateSequential } from '../src/validators/sequential'
import { validateKeyboardPattern } from '../src/validators/keyboard-pattern'
import { validatePersonalInfo } from '../src/validators/personal-info'

/**
 * Performance benchmarks for password validators
 *
 * Run with: pnpm --filter @sentinel-password/core bench
 */

describe('validatePassword - full validation', () => {
  const testPasswords = [
    'short',
    'MyP@ssw0rd123!',
    'VeryLongPasswordWithManyCharacters123!@#$%^&*()',
    'password123', // Common password
    'qwertyuiop', // Keyboard pattern
    '11111111111', // Repetition
    'abcdefghij', // Sequential
  ]

  testPasswords.forEach((password) => {
    bench(`validate "${password.substring(0, 20)}..."`, () => {
      validatePassword(password, {
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
        personalInfo: ['John', 'Doe', 'john@example.com'],
      })
    })
  })
})

describe('Individual validators', () => {
  const password = 'MyP@ssw0rd123!'

  bench('validateLength', () => {
    validateLength(password, { minLength: 8, maxLength: 128 })
  })

  bench('validateCharacterTypes', () => {
    validateCharacterTypes(password, {
      requireUppercase: true,
      requireLowercase: true,
      requireDigit: true,
      requireSymbol: true,
    })
  })

  bench('validateCommonPassword (bloom filter)', () => {
    validateCommonPassword(password, { checkCommonPasswords: true })
  })

  bench('validateRepetition', () => {
    validateRepetition(password, { maxRepeatedChars: 3 })
  })

  bench('validateSequential', () => {
    validateSequential(password, { checkSequential: true })
  })

  bench('validateKeyboardPattern', () => {
    validateKeyboardPattern(password, { checkKeyboardPatterns: true })
  })

  bench('validatePersonalInfo', () => {
    validatePersonalInfo(password, {
      personalInfo: ['John', 'Doe', 'john@example.com'],
    })
  })
})

describe('Bloom filter performance', () => {
  const passwords = [
    'password', // In list (true positive)
    'MySecureP@ssw0rd!', // Not in list
    '123456', // In list
    'ComplexPasswordThatIsNotCommon123!@#', // Not in list
  ]

  passwords.forEach((password) => {
    bench(`check "${password.substring(0, 20)}..."`, () => {
      validateCommonPassword(password, { checkCommonPasswords: true })
    })
  })
})

describe('Edge cases', () => {
  const longPassword = 'a'.repeat(256)

  bench('empty password', () => {
    validatePassword('', {
      minLength: 8,
    })
  })

  bench('very long password (256 chars)', () => {
    validatePassword(longPassword, {
      minLength: 8,
      maxLength: 128,
    })
  })

  bench('password with unicode', () => {
    validatePassword('MyP@ssw0rd🔒🔑', {
      minLength: 8,
    })
  })
})

// -----------------------------------------------------------------------------
// Keyboard pattern: implementation comparison
//
// Side-by-side benchmark of three implementations for the keyboard-pattern
// check. The current shipped implementation is the regex variant. The other
// two are kept here as rollback references and as a record of why the regex
// was chosen.
//
//   1. inlineSplitReverseJoin — the implementation that shipped in core@1.0
//      through 1.2.x. Rebuilds each reversed pattern via
//      `pattern.split('').reverse().join('')` on every call (~480 allocations
//      per invocation across the ~80 patterns).
//   2. precomputedArray — the simpler fix: builds a single array of both
//      forward and reverse patterns at module load, then loops with
//      `includes()`. Eliminates the per-call allocations but still does ~160
//      separate substring scans.
//   3. regex — the shipped variant. Single `RegExp` built at module load
//      combining all 160 forward+reverse patterns with `|` and the `/i` flag
//      (so no `toLowerCase()` is needed). One pass over the input string via
//      V8's regex engine.
// -----------------------------------------------------------------------------
const KEYBOARD_PATTERN_FIXTURES: readonly string[] = [
  'qwerty123', // matches early — best case for the loop variants
  'MyP@ssw0rd!', // no match — worst case (full iteration)
  'X9#mK2!pL7', // no match, fully random
  'asdfghjkl', // matches near the start of the list
  'йцукен789', // matches a Cyrillic pattern (exercises /i over Unicode)
] as const

// Re-exporting from the validator module gives us the same KEYBOARD_PATTERNS
// without having to re-list them in this file.
const KEYBOARD_PATTERNS_FOR_BENCH: readonly string[] = [
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
  'qwert',
  'werty',
  'asdfg',
  'sdfgh',
  'zxcvb',
  'xcvbn',
  'qwe',
  'asd',
  'zxc',
  'rty',
  'fgh',
  'cvb',
  'poi',
  'lkj',
  'mnb',
  '1qaz',
  '2wsx',
  '3edc',
  '4rfv',
  '5tgb',
  '6yhn',
  '7ujm',
  '8ik',
  '9ol',
  '0p',
  'qaz',
  'wsx',
  'edc',
  'zaq',
  'xsw',
  'cde',
  'azertyuiop',
  'qsdfghjklm',
  'wxcvbn',
  'azert',
  'zerty',
  'qsdfg',
  'wxcvb',
  'aze',
  'qsd',
  'wxc',
  'qwertzuiop',
  'yxcvbnm',
  'qwertz',
  'yxcvb',
  'yxc',
  'pyfgcrl',
  'aoeuidhtns',
  'qjkxbmwvz',
  'aoeu',
  'htns',
  'qjkx',
  'qwfpgjluy',
  'arstdhneio',
  'zxcvbkm',
  'arst',
  'dhne',
  'zxcv',
  'йцукенгшщзхъ',
  'фывапролджэ',
  'ячсмитьбю',
  'йцукен',
  'фывап',
  'ячсми',
  'цукен',
  '1234567890',
  '0987654321',
  '789',
  '456',
  '123',
  '741',
  '852',
  '963',
  '7410',
  '8520',
  '9630',
] as const

// Variant 1: original inline split/reverse/join (the historical impl)
function checkInline(password: string): boolean {
  const lowercase: string = password.toLowerCase()
  for (const pattern of KEYBOARD_PATTERNS_FOR_BENCH) {
    if (lowercase.includes(pattern)) return true
    const reversed: string = pattern.split('').reverse().join('')
    if (lowercase.includes(reversed)) return true
  }
  return false
}

// Variant 2: precomputed-array loop
const PRECOMPUTED_PATTERNS: readonly string[] = (() => {
  const all: string[] = []
  for (const p of KEYBOARD_PATTERNS_FOR_BENCH) {
    all.push(p)
    all.push(p.split('').reverse().join(''))
  }
  return all
})()

function checkPrecomputed(password: string): boolean {
  const lowercase: string = password.toLowerCase()
  for (const pattern of PRECOMPUTED_PATTERNS) {
    if (lowercase.includes(pattern)) return true
  }
  return false
}

// Variant 3: single regex (matches the production implementation)
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
const BENCH_KEYBOARD_REGEX: RegExp = new RegExp(
  KEYBOARD_PATTERNS_FOR_BENCH.flatMap((p: string): readonly string[] => {
    const reversed: string = p.split('').reverse().join('')
    return [escapeRegex(p), escapeRegex(reversed)]
  }).join('|'),
  'i'
)
function checkRegex(password: string): boolean {
  return BENCH_KEYBOARD_REGEX.test(password)
}

for (const fixture of KEYBOARD_PATTERN_FIXTURES) {
  describe(`Keyboard pattern impl comparison — "${fixture}"`, () => {
    bench('inline split/reverse/join (historical)', () => {
      checkInline(fixture)
    })

    bench('precomputed-array loop (rollback target)', () => {
      checkPrecomputed(fixture)
    })

    bench('regex (shipped)', () => {
      checkRegex(fixture)
    })
  })
}
