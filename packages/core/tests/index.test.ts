import { describe, it, expect } from 'vitest'
import { validatePassword } from '../src'

describe('validatePassword', () => {
  describe('basic validation', () => {
    it('should return valid for password meeting requirements', () => {
      const result = validatePassword('SecurePassword123!')
      expect(result.valid).toBe(true)
      expect(result.checks['minLength']).toBe(true)
      expect(result.checks['maxLength']).toBe(true)
    })

    it('should return invalid for short password', () => {
      const result = validatePassword('short')
      expect(result.valid).toBe(false)
      expect(result.checks['minLength']).toBe(false)
    })

    it('should return invalid for empty password', () => {
      const result = validatePassword('')
      expect(result.valid).toBe(false)
      expect(result.checks['minLength']).toBe(false)
    })
  })

  describe('custom options', () => {
    it('should respect custom minLength option', () => {
      const result = validatePassword('12345678', { minLength: 10 })
      expect(result.valid).toBe(false)
      expect(result.checks['minLength']).toBe(false)
    })

    it('should respect custom maxLength option', () => {
      const result = validatePassword('a'.repeat(150), { maxLength: 100 })
      expect(result.valid).toBe(false)
      expect(result.checks['maxLength']).toBe(false)
    })

    it('should pass with password exactly at minLength', () => {
      const result = validatePassword('12345678', { minLength: 8 })
      expect(result.checks['minLength']).toBe(true)
    })
  })

  describe('strength scoring', () => {
    it('should return weak score for failing some checks', () => {
      // Empty string fails minLength but passes maxLength (1 of 2 checks)
      const result = validatePassword('')
      expect(result.valid).toBe(false)
      expect(result.score).toBeLessThan(4)
    })

    it('should return high score for passing all checks', () => {
      const result = validatePassword('ValidPassword123')
      expect(result.valid).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(2)
    })

    it('should return appropriate strength for valid password', () => {
      const result = validatePassword('ValidPassword123')
      expect(result.score).toBeGreaterThan(0)
      expect(['weak', 'medium', 'strong', 'very-strong']).toContain(result.strength)
    })

    it('should have matching score and strength label', () => {
      const strengthMap = ['very-weak', 'weak', 'medium', 'strong', 'very-strong']
      const result = validatePassword('test1234')
      expect(result.strength).toBe(strengthMap[result.score])
    })
  })

  describe('feedback', () => {
    it('should provide suggestion for short password', () => {
      const result = validatePassword('short')
      expect(result.feedback.suggestions.length).toBeGreaterThan(0)
      expect(result.feedback.suggestions[0]).toContain('at least')
    })

    it('should not provide suggestions for valid password', () => {
      const result = validatePassword('ValidPassword123')
      expect(result.feedback.suggestions).toHaveLength(0)
      expect(result.feedback.warning).toBeUndefined()
    })
  })
})
