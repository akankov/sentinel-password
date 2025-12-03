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
