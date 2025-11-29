import { describe, it, expect } from 'vitest'
import {
  hasUppercase,
  hasLowercase,
  hasDigit,
  hasSymbol,
  validateCharacterTypes,
} from '../../src/validators/character-types.js'

describe('hasUppercase', () => {
  it('should detect uppercase letters', () => {
    expect(hasUppercase('Password')).toBe(true)
    expect(hasUppercase('PASSWORD')).toBe(true)
    expect(hasUppercase('pAssword')).toBe(true)
  })

  it('should return false for strings without uppercase', () => {
    expect(hasUppercase('password')).toBe(false)
    expect(hasUppercase('12345')).toBe(false)
    expect(hasUppercase('!@#$%')).toBe(false)
  })

  it('should handle empty strings', () => {
    expect(hasUppercase('')).toBe(false)
  })
})

describe('hasLowercase', () => {
  it('should detect lowercase letters', () => {
    expect(hasLowercase('Password')).toBe(true)
    expect(hasLowercase('password')).toBe(true)
    expect(hasLowercase('PASSword')).toBe(true)
  })

  it('should return false for strings without lowercase', () => {
    expect(hasLowercase('PASSWORD')).toBe(false)
    expect(hasLowercase('12345')).toBe(false)
    expect(hasLowercase('!@#$%')).toBe(false)
  })

  it('should handle empty strings', () => {
    expect(hasLowercase('')).toBe(false)
  })
})

describe('hasDigit', () => {
  it('should detect digits', () => {
    expect(hasDigit('password123')).toBe(true)
    expect(hasDigit('123')).toBe(true)
    expect(hasDigit('1password')).toBe(true)
  })

  it('should return false for strings without digits', () => {
    expect(hasDigit('password')).toBe(false)
    expect(hasDigit('PASSWORD')).toBe(false)
    expect(hasDigit('!@#$%')).toBe(false)
  })

  it('should handle empty strings', () => {
    expect(hasDigit('')).toBe(false)
  })
})

describe('hasSymbol', () => {
  it('should detect common symbols', () => {
    expect(hasSymbol('password!')).toBe(true)
    expect(hasSymbol('pass@word')).toBe(true)
    expect(hasSymbol('#password')).toBe(true)
    expect(hasSymbol('pa$$word')).toBe(true)
  })

  it('should return false for strings without symbols', () => {
    expect(hasSymbol('password')).toBe(false)
    expect(hasSymbol('PASSWORD123')).toBe(false)
  })

  it('should handle empty strings', () => {
    expect(hasSymbol('')).toBe(false)
  })

  it('should detect various symbol types', () => {
    expect(hasSymbol('pass%word')).toBe(true)
    expect(hasSymbol('pass^word')).toBe(true)
    expect(hasSymbol('pass&word')).toBe(true)
    expect(hasSymbol('pass*word')).toBe(true)
    expect(hasSymbol('pass(word')).toBe(true)
    expect(hasSymbol('pass)word')).toBe(true)
  })
})

describe('validateCharacterTypes', () => {
  it('should pass when no requirements are set', () => {
    const result = validateCharacterTypes('password')
    expect(result.passed).toBe(true)
  })

  it('should validate uppercase requirement', () => {
    const result = validateCharacterTypes('password', { requireUppercase: true })
    expect(result.passed).toBe(false)
    expect(result.message).toContain('uppercase')

    const resultValid = validateCharacterTypes('Password', { requireUppercase: true })
    expect(resultValid.passed).toBe(true)
  })

  it('should validate lowercase requirement', () => {
    const result = validateCharacterTypes('PASSWORD', { requireLowercase: true })
    expect(result.passed).toBe(false)
    expect(result.message).toContain('lowercase')

    const resultValid = validateCharacterTypes('Password', { requireLowercase: true })
    expect(resultValid.passed).toBe(true)
  })

  it('should validate digit requirement', () => {
    const result = validateCharacterTypes('password', { requireDigit: true })
    expect(result.passed).toBe(false)
    expect(result.message).toContain('digit')

    const resultValid = validateCharacterTypes('password1', { requireDigit: true })
    expect(resultValid.passed).toBe(true)
  })

  it('should validate symbol requirement', () => {
    const result = validateCharacterTypes('password', { requireSymbol: true })
    expect(result.passed).toBe(false)
    expect(result.message).toContain('symbol')

    const resultValid = validateCharacterTypes('password!', { requireSymbol: true })
    expect(resultValid.passed).toBe(true)
  })

  it('should validate multiple requirements', () => {
    const result = validateCharacterTypes('password', {
      requireUppercase: true,
      requireLowercase: true,
      requireDigit: true,
      requireSymbol: true,
    })
    expect(result.passed).toBe(false)

    const resultValid = validateCharacterTypes('Password123!', {
      requireUppercase: true,
      requireLowercase: true,
      requireDigit: true,
      requireSymbol: true,
    })
    expect(resultValid.passed).toBe(true)
  })

  it('should list all missing requirements', () => {
    const result = validateCharacterTypes('pass', {
      requireUppercase: true,
      requireDigit: true,
      requireSymbol: true,
    })
    expect(result.passed).toBe(false)
    expect(result.message).toContain('uppercase')
    expect(result.message).toContain('digit')
    expect(result.message).toContain('symbol')
  })
})
