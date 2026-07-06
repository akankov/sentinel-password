import { describe, it, expect } from 'vitest'
import { validatePassword } from '../src'
import type { CustomValidator } from '../src'

// A strong baseline password that passes all seven built-in checks.
const STRONG = 'Quartz-Glider!9pumpkin'

const alwaysPass: CustomValidator = () => ({ passed: true })
const alwaysFail: CustomValidator = () => ({
  passed: false,
  message: 'Nope',
})

describe('validatePassword — customValidators', () => {
  it('runs a passing custom validator and exposes it in checks', () => {
    const result = validatePassword(STRONG, { customValidators: { myRule: alwaysPass } })
    expect(result.checks['myRule']).toBe(true)
    expect(result.valid).toBe(true)
    expect(result.failures).toHaveLength(0)
  })

  it('fails validation when a custom validator fails', () => {
    const result = validatePassword(STRONG, { customValidators: { myRule: alwaysFail } })
    expect(result.checks['myRule']).toBe(false)
    expect(result.valid).toBe(false)
    expect(result.feedback.suggestions).toContain('Nope')
    expect(result.feedback.warning).toBe('Nope')
  })

  it('surfaces a structured failure with defaulted code and params', () => {
    const result = validatePassword(STRONG, { customValidators: { myRule: alwaysFail } })
    expect(result.failures).toHaveLength(1)
    expect(result.failures[0]).toEqual({
      check: 'myRule',
      code: 'custom.myRule',
      params: {},
      message: 'Nope',
    })
  })

  it('passes through a custom code and params when provided', () => {
    const result = validatePassword(STRONG, {
      customValidators: {
        myRule: () => ({
          passed: false,
          message: 'Too corporate',
          code: 'company.blocked',
          params: { company: 'Acme' },
        }),
      },
    })
    expect(result.failures[0]).toEqual({
      check: 'myRule',
      code: 'company.blocked',
      params: { company: 'Acme' },
      message: 'Too corporate',
    })
  })

  it('grows the score denominator: one failing custom among 8 total checks', () => {
    // 7 built-ins pass + 1 custom fails => floor((7/8)*5) = 4
    const result = validatePassword(STRONG, { customValidators: { myRule: alwaysFail } })
    expect(result.score).toBe(4)

    // 7 built-ins pass + 7 failing customs => floor((7/14)*5) = 2
    const many = Object.fromEntries(
      Array.from({ length: 7 }, (_, i) => [`rule${String(i)}`, alwaysFail])
    )
    const diluted = validatePassword(STRONG, { customValidators: many })
    expect(diluted.score).toBe(2)
  })

  it('counts passing custom validators toward the score', () => {
    // 7 built-ins + 1 passing custom => 8/8 => score 4, valid
    const result = validatePassword(STRONG, { customValidators: { myRule: alwaysPass } })
    expect(result.score).toBe(4)
    expect(result.valid).toBe(true)
  })

  it('receives the password and the full options object', () => {
    let seenPassword: string | undefined
    let seenMinLength: number | undefined
    validatePassword(STRONG, {
      minLength: 12,
      customValidators: {
        spy: (pw, opts) => {
          seenPassword = pw
          seenMinLength = opts?.minLength
          return { passed: true }
        },
      },
    })
    expect(seenPassword).toBe(STRONG)
    expect(seenMinLength).toBe(12)
  })

  it('treats a throwing custom validator as a failed check instead of throwing', () => {
    const result = validatePassword(STRONG, {
      customValidators: {
        explosive: () => {
          throw new Error('boom')
        },
      },
    })
    expect(result.valid).toBe(false)
    expect(result.checks['explosive']).toBe(false)
    expect(result.failures[0]?.message).toBe('Custom check "explosive" threw an error')
    expect(result.failures[0]?.code).toBe('custom.explosive')
  })

  it('treats a malformed return value as a failed check', () => {
    const result = validatePassword(STRONG, {
      customValidators: {
        // Runtime-JS consumers can return anything despite the types.
        broken: (() => undefined) as unknown as CustomValidator,
      },
    })
    expect(result.checks['broken']).toBe(false)
    expect(result.failures[0]?.message).toBe('Custom check "broken" failed')
  })

  it('treats a non-boolean passed value as failed (fail closed)', () => {
    const result = validatePassword(STRONG, {
      customValidators: {
        truthy: (() => ({ passed: 1 })) as unknown as CustomValidator,
      },
    })
    expect(result.checks['truthy']).toBe(false)
  })

  it('skips custom validators whose names collide with built-in checks', () => {
    const result = validatePassword(STRONG, {
      customValidators: { length: alwaysFail, myRule: alwaysPass },
    })
    // Built-in `length` result is untouched, collision does not run or count.
    expect(result.checks.length).toBe(true)
    expect(result.valid).toBe(true)
    expect(result.failures).toHaveLength(0)
    // Denominator is 8 (7 built-ins + myRule), all passing => score 4.
    expect(result.score).toBe(4)
  })

  it('appends custom failures after built-in failures in evaluation order', () => {
    const result = validatePassword('abc', {
      customValidators: { myRule: alwaysFail },
    })
    const lastFailure = result.failures[result.failures.length - 1]
    expect(lastFailure?.check).toBe('myRule')
    expect(result.failures.length).toBeGreaterThan(1)
  })

  it('is a no-op for an empty customValidators object', () => {
    const result = validatePassword(STRONG, { customValidators: {} })
    expect(result.valid).toBe(true)
    expect(result.score).toBe(4)
    expect(Object.keys(result.checks)).toHaveLength(7)
  })

  it('accepts a built-in standalone validator re-registered under a custom name', () => {
    // Validator is structurally assignable to CustomValidator.
    const strictLength: CustomValidator = (pw, opts) =>
      pw.length >= 20
        ? { passed: true }
        : { passed: false, message: 'Need 20+ characters', code: 'custom.strictLength', params: {} }
    const result = validatePassword(STRONG, {
      customValidators: { strictLength },
    })
    expect(result.checks['strictLength']).toBe(true)
  })
})
