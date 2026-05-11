import { describe, it, expect } from 'vitest'
import {
  validateLength,
  validateCharacterTypes,
  validateRepetition,
  validateSequential,
  validateKeyboardPattern,
  validateCommonPassword,
  validatePersonalInfo,
  validatePassword,
} from '../src'
import type { MessageCode, ValidatorOptions } from '../src'

describe('validator-emitted code and params', () => {
  it('validateLength → length.tooShort with minLength param', () => {
    const result = validateLength('abc', { minLength: 8 })
    expect(result.passed).toBe(false)
    expect(result.code).toBe('length.tooShort')
    expect(result.params).toEqual({ minLength: 8 })
  })

  it('validateLength → length.tooLong with maxLength param', () => {
    const result = validateLength('a'.repeat(200), { maxLength: 128 })
    expect(result.passed).toBe(false)
    expect(result.code).toBe('length.tooLong')
    expect(result.params).toEqual({ maxLength: 128 })
  })

  it('validateCharacterTypes → characterTypes.missing with missing + missingTypes params', () => {
    const result = validateCharacterTypes('password', {
      requireUppercase: true,
      requireDigit: true,
      requireSymbol: true,
    })
    expect(result.passed).toBe(false)
    expect(result.code).toBe('characterTypes.missing')
    expect(result.params).toEqual({
      missing: 'uppercase letter, digit, symbol',
      missingTypes: 'uppercase,digit,symbol',
    })
  })

  it('validateRepetition → repetition.tooMany with maxRepeatedChars param', () => {
    const result = validateRepetition('aaaaaa', { maxRepeatedChars: 3 })
    expect(result.passed).toBe(false)
    expect(result.code).toBe('repetition.tooMany')
    expect(result.params).toEqual({ maxRepeatedChars: 3 })
  })

  it('validateSequential → sequential.found with empty params', () => {
    const result = validateSequential('abc123')
    expect(result.passed).toBe(false)
    expect(result.code).toBe('sequential.found')
    expect(result.params).toEqual({})
  })

  it('validateKeyboardPattern → keyboardPattern.found with empty params', () => {
    const result = validateKeyboardPattern('qwerty')
    expect(result.passed).toBe(false)
    expect(result.code).toBe('keyboardPattern.found')
    expect(result.params).toEqual({})
  })

  it('validateCommonPassword → commonPassword.found with empty params', () => {
    const result = validateCommonPassword('password')
    expect(result.passed).toBe(false)
    expect(result.code).toBe('commonPassword.found')
    expect(result.params).toEqual({})
  })

  it('validatePersonalInfo → personalInfo.found with empty params', () => {
    const result = validatePersonalInfo('johnpass', { personalInfo: ['john'] })
    expect(result.passed).toBe(false)
    expect(result.code).toBe('personalInfo.found')
    expect(result.params).toEqual({})
  })

  it('passing validators do not emit code or params', () => {
    const result = validateLength('longenough')
    expect(result.passed).toBe(true)
    expect(result.code).toBeUndefined()
    expect(result.params).toBeUndefined()
    expect(result.message).toBeUndefined()
  })
})

describe('messages template override', () => {
  it('applies a Spanish template with interpolation', () => {
    const result = validateLength('abc', {
      minLength: 8,
      messages: { 'length.tooShort': 'Mínimo {minLength} caracteres' },
    })
    expect(result.message).toBe('Mínimo 8 caracteres')
  })

  it('falls back to default English when the code is missing from the override', () => {
    const result = validateLength('abc', {
      minLength: 8,
      messages: { 'length.tooLong': 'Demasiado largo' },
    })
    expect(result.message).toBe('Password must be at least 8 characters')
  })

  it('threads through validatePassword orchestrator', () => {
    const result = validatePassword('abc', {
      minLength: 8,
      messages: { 'length.tooShort': 'TOO_SHORT_{minLength}' },
    })
    expect(result.feedback.warning).toBe('TOO_SHORT_8')
    expect(result.feedback.suggestions).toContain('TOO_SHORT_8')
  })

  it('characterTypes override uses joined English {missing}', () => {
    const result = validateCharacterTypes('password', {
      requireUppercase: true,
      requireDigit: true,
      messages: { 'characterTypes.missing': 'Falta: {missing}' },
    })
    expect(result.message).toBe('Falta: uppercase letter, digit')
  })
})

describe('formatMessage callback', () => {
  it('takes precedence over messages and default', () => {
    const options: ValidatorOptions = {
      minLength: 8,
      messages: { 'length.tooShort': 'lookup override' },
      formatMessage: (code) => `formatter override for ${code}`,
    }
    const result = validateLength('abc', options)
    expect(result.message).toBe('formatter override for length.tooShort')
  })

  it('receives code, params, and the rendered default English', () => {
    const calls: Array<{
      code: MessageCode
      params: Readonly<Record<string, string | number>>
      defaultMessage: string
    }> = []
    const options: ValidatorOptions = {
      minLength: 8,
      formatMessage: (code, params, defaultMessage) => {
        calls.push({ code, params, defaultMessage })
        return 'formatted'
      },
    }
    validateLength('abc', options)
    expect(calls).toHaveLength(1)
    expect(calls[0]).toEqual({
      code: 'length.tooShort',
      params: { minLength: 8 },
      defaultMessage: 'Password must be at least 8 characters',
    })
  })

  it('lets consumers re-localize characterTypes via missingTypes', () => {
    const dictionary: Record<string, string> = {
      uppercase: 'mayúscula',
      lowercase: 'minúscula',
      digit: 'dígito',
      symbol: 'símbolo',
    }
    const result = validateCharacterTypes('password', {
      requireUppercase: true,
      requireDigit: true,
      formatMessage: (code, params) => {
        if (code !== 'characterTypes.missing') return ''
        const types = (params['missingTypes'] as string).split(',')
        return `Falta al menos un ${types.map((t) => dictionary[t]).join(' o ')}`
      },
    })
    expect(result.message).toBe('Falta al menos un mayúscula o dígito')
  })

  it('threads through validatePassword and applies to every failing suggestion', () => {
    const result = validatePassword('abc', {
      requireUppercase: true,
      formatMessage: (code) => `[${code}]`,
    })
    expect(result.feedback.suggestions.every((s) => s.startsWith('['))).toBe(true)
    expect(result.feedback.suggestions).toContain('[length.tooShort]')
    expect(result.feedback.suggestions).toContain('[characterTypes.missing]')
  })
})

describe('backwards compatibility (default English unchanged)', () => {
  it('validateLength emits the legacy English string', () => {
    expect(validateLength('abc', { minLength: 8 }).message).toBe(
      'Password must be at least 8 characters'
    )
  })

  it('validateCharacterTypes emits the legacy English string', () => {
    expect(validateCharacterTypes('password', { requireUppercase: true }).message).toBe(
      'Password must contain at least one uppercase letter'
    )
  })

  it('validateRepetition emits the legacy English string', () => {
    expect(validateRepetition('aaaaaa', { maxRepeatedChars: 3 }).message).toBe(
      'Password contains too many repeated characters (max 3)'
    )
  })

  it('validateSequential emits the legacy English string', () => {
    expect(validateSequential('abc123').message).toBe(
      'Password contains sequential characters (e.g., abc, 123)'
    )
  })

  it('validateKeyboardPattern emits the legacy English string', () => {
    expect(validateKeyboardPattern('qwerty').message).toBe(
      'Password contains common keyboard patterns'
    )
  })

  it('validateCommonPassword emits the legacy English string', () => {
    expect(validateCommonPassword('password').message).toBe(
      'Password is too common. Please choose a more unique password.'
    )
  })

  it('validatePersonalInfo emits the legacy English string', () => {
    expect(validatePersonalInfo('johnpass', { personalInfo: ['john'] }).message).toBe(
      'Password contains personal information'
    )
  })
})
