import { describe, it, expect } from 'vitest'
import { DEFAULT_TEMPLATES } from '../src'
import { formatTemplate, resolveMessage } from '../src/messages'
import type { MessageCode, ValidatorOptions } from '../src'

describe('formatTemplate', () => {
  it('substitutes a single placeholder', () => {
    expect(formatTemplate('Min {minLength} chars', { minLength: 8 })).toBe('Min 8 chars')
  })

  it('substitutes multiple distinct placeholders', () => {
    expect(formatTemplate('{a} and {b}', { a: 'X', b: 'Y' })).toBe('X and Y')
  })

  it('substitutes the same placeholder repeated', () => {
    expect(formatTemplate('{n}+{n}={n}{n}', { n: 1 })).toBe('1+1=11')
  })

  it('coerces numeric params to strings', () => {
    expect(formatTemplate('value: {x}', { x: 42 })).toBe('value: 42')
  })

  it('leaves the {placeholder} token intact when a key is missing', () => {
    expect(formatTemplate('have {a}, missing {b}', { a: 'X' })).toBe('have X, missing {b}')
  })

  it('returns the template unchanged when params is empty', () => {
    expect(formatTemplate('no placeholders here', {})).toBe('no placeholders here')
  })

  it('returns the template unchanged when there are no placeholders', () => {
    expect(formatTemplate('plain text', { unused: 'value' })).toBe('plain text')
  })

  it('ignores tokens with non-word characters', () => {
    expect(formatTemplate('keep {a-b}', { 'a-b': 'X' })).toBe('keep {a-b}')
  })
})

describe('resolveMessage', () => {
  const code: MessageCode = 'length.tooShort'
  const params = { minLength: 8 } as const

  it('returns the default English template when no overrides given', () => {
    expect(resolveMessage(code, params, {})).toBe('Password must be at least 8 characters')
  })

  it('applies the messages override when provided', () => {
    const options: ValidatorOptions = {
      messages: { 'length.tooShort': 'Mínimo {minLength} caracteres' },
    }
    expect(resolveMessage(code, params, options)).toBe('Mínimo 8 caracteres')
  })

  it('falls back to default English when the messages override is missing this code', () => {
    const options: ValidatorOptions = {
      messages: { 'length.tooLong': 'Demasiado largo' },
    }
    expect(resolveMessage(code, params, options)).toBe('Password must be at least 8 characters')
  })

  it('formatMessage takes precedence over messages and default', () => {
    const options: ValidatorOptions = {
      messages: { 'length.tooShort': 'Mínimo {minLength}' },
      formatMessage: (resolvedCode, resolvedParams, defaultMessage) => {
        return `[${resolvedCode}] ${defaultMessage} (params=${JSON.stringify(resolvedParams)})`
      },
    }
    expect(resolveMessage(code, params, options)).toBe(
      '[length.tooShort] Password must be at least 8 characters (params={"minLength":8})'
    )
  })

  it('passes the rendered default English to formatMessage as the third arg', () => {
    let captured: string | undefined
    const options: ValidatorOptions = {
      formatMessage: (_code, _params, defaultMessage) => {
        captured = defaultMessage
        return 'replaced'
      },
    }
    resolveMessage(code, params, options)
    expect(captured).toBe('Password must be at least 8 characters')
  })
})

describe('DEFAULT_TEMPLATES', () => {
  it('has a template for every MessageCode', () => {
    const codes: readonly MessageCode[] = [
      'length.tooShort',
      'length.tooLong',
      'characterTypes.missing',
      'repetition.tooMany',
      'sequential.found',
      'keyboardPattern.found',
      'commonPassword.found',
      'personalInfo.found',
    ]
    for (const code of codes) {
      expect(DEFAULT_TEMPLATES[code]).toBeTypeOf('string')
      expect(DEFAULT_TEMPLATES[code].length).toBeGreaterThan(0)
    }
  })

  it('matches the legacy English strings (backwards compatibility)', () => {
    expect(DEFAULT_TEMPLATES['length.tooShort']).toBe(
      'Password must be at least {minLength} characters'
    )
    expect(DEFAULT_TEMPLATES['length.tooLong']).toBe(
      'Password must be at most {maxLength} characters'
    )
    expect(DEFAULT_TEMPLATES['characterTypes.missing']).toBe(
      'Password must contain at least one {missing}'
    )
    expect(DEFAULT_TEMPLATES['repetition.tooMany']).toBe(
      'Password contains too many repeated characters (max {maxRepeatedChars})'
    )
    expect(DEFAULT_TEMPLATES['sequential.found']).toBe(
      'Password contains sequential characters (e.g., abc, 123)'
    )
    expect(DEFAULT_TEMPLATES['keyboardPattern.found']).toBe(
      'Password contains common keyboard patterns'
    )
    expect(DEFAULT_TEMPLATES['commonPassword.found']).toBe(
      'Password is too common. Please choose a more unique password.'
    )
    expect(DEFAULT_TEMPLATES['personalInfo.found']).toBe('Password contains personal information')
  })
})
