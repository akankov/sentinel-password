import { describe, it, expect } from 'vitest'
import { validateLength } from '../../src'

describe('validateLength', () => {
  it('should pass for passwords within min and max length', () => {
    const result = validateLength('password123', { minLength: 8, maxLength: 128 })
    expect(result.passed).toBe(true)
    expect(result.message).toBeUndefined()
  })

  it('should fail for passwords below minimum length', () => {
    const result = validateLength('short', { minLength: 8 })
    expect(result.passed).toBe(false)
    expect(result.message).toContain('at least 8')
  })

  it('should fail for passwords above maximum length', () => {
    const result = validateLength('a'.repeat(200), { maxLength: 128 })
    expect(result.passed).toBe(false)
    expect(result.message).toContain('at most 128')
  })

  it('should use default min length of 8 if not specified', () => {
    const result = validateLength('1234567')
    expect(result.passed).toBe(false)
  })

  it('should use default max length of 128 if not specified', () => {
    const result = validateLength('a'.repeat(129))
    expect(result.passed).toBe(false)
  })

  it('should pass for password exactly at min length', () => {
    const result = validateLength('12345678', { minLength: 8 })
    expect(result.passed).toBe(true)
  })

  it('should pass for password exactly at max length', () => {
    const result = validateLength('a'.repeat(128), { maxLength: 128 })
    expect(result.passed).toBe(true)
  })

  it('should handle empty password', () => {
    const result = validateLength('', { minLength: 8 })
    expect(result.passed).toBe(false)
    expect(result.message).toBeDefined()
  })
})
