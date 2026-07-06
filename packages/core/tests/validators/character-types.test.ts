import { describe, it, expect } from 'vitest'
import { hasUppercase, hasLowercase, hasDigit, hasSymbol, validateCharacterTypes } from '../../src'

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

  it('counts space, backtick, and tilde as symbols (any printable non-alphanumeric ASCII)', () => {
    expect(hasSymbol('pass~word')).toBe(true)
    expect(hasSymbol('pass`word')).toBe(true)
    expect(hasSymbol('pass word')).toBe(true)
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

  it('accepts tilde, backtick, and space for the symbol requirement', () => {
    expect(validateCharacterTypes('Password1~', { requireSymbol: true }).passed).toBe(true)
    expect(validateCharacterTypes('Password1`', { requireSymbol: true }).passed).toBe(true)
    expect(validateCharacterTypes('Password1 ', { requireSymbol: true }).passed).toBe(true)
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

describe('validateCharacterTypes — class boundaries (single-pass scan)', () => {
  // Each boundary char is the only candidate for its required class, so the
  // result hinges on the exact comparison operators inside the char-code scan.
  const requireSymbol = { requireSymbol: true } as const

  it.each([
    ['space', ' '], // 0x20 — lower edge of range 1
    ['slash', '/'], // 0x2f — upper edge of range 1
    ['colon', ':'], // 0x3a — lower edge of range 2
    ['at', '@'], // 0x40 — upper edge of range 2
    ['open-bracket', '['], // 0x5b — lower edge of range 3
    ['backtick', '`'], // 0x60 — upper edge of range 3
    ['open-brace', '{'], // 0x7b — lower edge of range 4
    ['tilde', '~'], // 0x7e — upper edge of range 4
  ])('treats %s as a symbol', (_name, char) => {
    expect(validateCharacterTypes(char, requireSymbol).passed).toBe(true)
  })

  it.each([
    ['unit separator (0x1f)', '\x1f'], // just below range 1
    ['delete (0x7f)', '\x7f'], // just above range 4
  ])('does not treat %s as a symbol', (_name, char) => {
    expect(validateCharacterTypes(char, requireSymbol).passed).toBe(false)
  })

  it('treats A and Z as uppercase but @ (0x40) as not', () => {
    expect(validateCharacterTypes('A', { requireUppercase: true }).passed).toBe(true)
    expect(validateCharacterTypes('Z', { requireUppercase: true }).passed).toBe(true)
    expect(validateCharacterTypes('@', { requireUppercase: true }).passed).toBe(false)
  })

  it('treats a and z as lowercase but { (0x7b) as not', () => {
    expect(validateCharacterTypes('a', { requireLowercase: true }).passed).toBe(true)
    expect(validateCharacterTypes('z', { requireLowercase: true }).passed).toBe(true)
    expect(validateCharacterTypes('{', { requireLowercase: true }).passed).toBe(false)
  })

  it('treats 0 and 9 as digits but / (0x2f) as not', () => {
    expect(validateCharacterTypes('0', { requireDigit: true }).passed).toBe(true)
    expect(validateCharacterTypes('9', { requireDigit: true }).passed).toBe(true)
    expect(validateCharacterTypes('/', { requireDigit: true }).passed).toBe(false)
  })
})

describe('validateCharacterTypes — defaults and missing-type accounting', () => {
  it('does not require lowercase unless asked', () => {
    // No requireLowercase → an all-uppercase+digit password must still pass.
    const result = validateCharacterTypes('PASSWORD1', {
      requireUppercase: true,
      requireDigit: true,
    })
    expect(result.passed).toBe(true)
  })

  it('reports only the genuinely missing type (symbol)', () => {
    const result = validateCharacterTypes('Aa1', {
      requireUppercase: true,
      requireLowercase: true,
      requireDigit: true,
      requireSymbol: true,
    })
    expect(result.passed).toBe(false)
    expect(result.params?.missing).toBe('symbol')
    expect(result.params?.missingTypes).toBe('symbol')
  })

  it('reports only the genuinely missing type (lowercase)', () => {
    const result = validateCharacterTypes('A1!', {
      requireUppercase: true,
      requireLowercase: true,
      requireDigit: true,
      requireSymbol: true,
    })
    expect(result.passed).toBe(false)
    expect(result.params?.missing).toBe('lowercase letter')
    expect(result.params?.missingTypes).toBe('lowercase')
  })
})

describe('unicodeCharacterTypes mode', () => {
  it('accepts Cyrillic case with unicodeCharacterTypes enabled', () => {
    const result = validateCharacterTypes('Пароль123!', {
      requireUppercase: true,
      requireLowercase: true,
      unicodeCharacterTypes: true,
    })
    expect(result.passed).toBe(true)
  })

  it('still rejects Cyrillic case in the default ASCII mode', () => {
    const result = validateCharacterTypes('Пароль123!', { requireUppercase: true })
    expect(result.passed).toBe(false)
    expect(result.passed ? '' : result.message).toContain('uppercase')
  })

  it('counts non-ASCII punctuation and currency as symbols', () => {
    for (const pw of ['abcABC1№', 'abcABC1€', 'abcABC1—']) {
      const result = validateCharacterTypes(pw, {
        requireSymbol: true,
        unicodeCharacterTypes: true,
      })
      expect(result.passed).toBe(true)
    }
  })

  it('counts non-ASCII decimal digits via \\p{Nd}', () => {
    const result = validateCharacterTypes('Password!٣', {
      requireDigit: true,
      unicodeCharacterTypes: true,
    })
    expect(result.passed).toBe(true)
  })

  it('reports missing classes in unicode mode with the standard message', () => {
    const result = validateCharacterTypes('пароль', {
      requireUppercase: true,
      requireDigit: true,
      unicodeCharacterTypes: true,
    })
    expect(result.passed).toBe(false)
    if (!result.passed) {
      expect(result.code).toBe('characterTypes.missing')
      expect(result.message).toContain('uppercase letter, digit')
    }
  })

  it('caseless scripts cannot satisfy case requirements even in unicode mode', () => {
    // CJK letters are \p{Lo} (no case) — documented: do not require case
    // for passwords in caseless scripts.
    const result = validateCharacterTypes('ひらがなだけ', {
      requireUppercase: true,
      unicodeCharacterTypes: true,
    })
    expect(result.passed).toBe(false)
  })

  it('accepts accented Latin case', () => {
    const result = validateCharacterTypes('Éléphant9!', {
      requireUppercase: true,
      requireLowercase: true,
      unicodeCharacterTypes: true,
    })
    expect(result.passed).toBe(true)
  })

  it('unicode mode with no requirements is still a no-op', () => {
    const result = validateCharacterTypes('пароль', { unicodeCharacterTypes: true })
    expect(result.passed).toBe(true)
  })
})
