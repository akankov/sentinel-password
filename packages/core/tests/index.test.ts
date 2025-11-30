import { describe, it, expect } from 'vitest'
import { validatePassword } from '../src'

describe('validatePassword', () => {
  describe('basic validation', () => {
    it('should return valid for password meeting all requirements', () => {
      const result = validatePassword('SecureP4ssw0rd!')
      expect(result.valid).toBe(true)
      expect(result.checks['length']).toBe(true)
      expect(result.checks['sequential']).toBe(true)
      expect(result.checks['repetition']).toBe(true)
    })

    it('should return invalid for short password', () => {
      const result = validatePassword('short')
      expect(result.valid).toBe(false)
      expect(result.checks['length']).toBe(false)
    })

    it('should return invalid for empty password', () => {
      const result = validatePassword('')
      expect(result.valid).toBe(false)
      expect(result.checks['length']).toBe(false)
    })

    it('should detect sequential patterns', () => {
      const result = validatePassword('password123')
      expect(result.valid).toBe(false)
      expect(result.checks['sequential']).toBe(false)
    })

    it('should detect excessive repetition', () => {
      const result = validatePassword('passssssword')
      expect(result.valid).toBe(false)
      expect(result.checks['repetition']).toBe(false)
    })
  })

  describe('custom options', () => {
    it('should respect custom minLength option', () => {
      const result = validatePassword('short135', { minLength: 10 })
      expect(result.valid).toBe(false)
      expect(result.checks['length']).toBe(false)
    })

    it('should respect custom maxLength option', () => {
      const result = validatePassword('a'.repeat(150), { maxLength: 100 })
      expect(result.valid).toBe(false)
      expect(result.checks['length']).toBe(false)
    })

    it('should pass with password exactly at minLength', () => {
      const result = validatePassword('p4ssw0rd', { minLength: 8 })
      expect(result.checks['length']).toBe(true)
    })

    it('should respect character type requirements', () => {
      const result = validatePassword('password', { requireUppercase: true })
      expect(result.valid).toBe(false)
      expect(result.checks['characterTypes']).toBe(false)
    })

    it('should pass when all character types present', () => {
      const result = validatePassword('P4ssw0rd!', {
        requireUppercase: true,
        requireLowercase: true,
        requireDigit: true,
        requireSymbol: true,
      })
      expect(result.checks['characterTypes']).toBe(true)
    })
  })

  describe('strength scoring', () => {
    it('should return weak score for failing multiple checks', () => {
      const result = validatePassword('abc')
      expect(result.valid).toBe(false)
      expect(result.score).toBeLessThan(4)
    })

    it('should return high score for passing all checks', () => {
      const result = validatePassword('V4lidP4ssw0rd!')
      expect(result.valid).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(3)
    })

    it('should return appropriate strength for valid password', () => {
      const result = validatePassword('V4lidP4ssw0rd!')
      expect(result.score).toBeGreaterThan(0)
      expect(['weak', 'medium', 'strong', 'very-strong']).toContain(result.strength)
    })

    it('should have matching score and strength label', () => {
      const strengthMap = ['very-weak', 'weak', 'medium', 'strong', 'very-strong']
      const result = validatePassword('test1357')
      expect(result.strength).toBe(strengthMap[result.score])
    })
  })

  describe('feedback', () => {
    it('should provide suggestion for short password', () => {
      const result = validatePassword('short')
      expect(result.feedback.suggestions.length).toBeGreaterThan(0)
      expect(result.feedback.suggestions[0]).toContain('at least')
    })

    it('should provide suggestion for sequential password', () => {
      const result = validatePassword('password123')
      expect(result.feedback.suggestions.length).toBeGreaterThan(0)
      const hasSequentialMessage = result.feedback.suggestions.some((s) => s.includes('sequential'))
      expect(hasSequentialMessage).toBe(true)
    })

    it('should not provide suggestions for valid password', () => {
      const result = validatePassword('V4lidP4ssw0rd!')
      expect(result.feedback.suggestions).toHaveLength(0)
      expect(result.feedback.warning).toBeUndefined()
    })

    it('should set warning to first suggestion', () => {
      const result = validatePassword('short')
      expect(result.feedback.warning).toBe(result.feedback.suggestions[0])
    })

    it('should provide suggestion for personal info in password', () => {
      const result = validatePassword('johndoe123', { personalInfo: ['johndoe'] })
      expect(result.valid).toBe(false)
      expect(result.checks['personalInfo']).toBe(false)
      expect(result.feedback.suggestions.length).toBeGreaterThan(0)
      const hasPersonalInfoMessage = result.feedback.suggestions.some((s) =>
        s.includes('personal information')
      )
      expect(hasPersonalInfoMessage).toBe(true)
    })

    it('should provide suggestion for keyboard pattern in password', () => {
      const result = validatePassword('qwerty123')
      expect(result.valid).toBe(false)
      expect(result.checks['keyboardPattern']).toBe(false)
      expect(result.feedback.suggestions.length).toBeGreaterThan(0)
      const hasKeyboardMessage = result.feedback.suggestions.some((s) => s.includes('keyboard'))
      expect(hasKeyboardMessage).toBe(true)
    })
  })

  describe('personal info validation', () => {
    it('should reject password containing username', () => {
      const result = validatePassword('alice2024', { personalInfo: ['alice'] })
      expect(result.valid).toBe(false)
      expect(result.checks['personalInfo']).toBe(false)
    })

    it('should reject password containing email username', () => {
      const result = validatePassword('john.doe123', {
        personalInfo: ['john.doe@example.com'],
      })
      expect(result.valid).toBe(false)
      expect(result.checks['personalInfo']).toBe(false)
    })

    it('should pass when no personal info provided', () => {
      const result = validatePassword('RandomP4ssw0rd!')
      expect(result.checks['personalInfo']).toBe(true)
    })

    it('should pass when password does not contain personal info', () => {
      const result = validatePassword('SecureP4ss!', { personalInfo: ['alice', 'bob'] })
      expect(result.checks['personalInfo']).toBe(true)
    })
  })

  describe('keyboard pattern validation', () => {
    it('should reject QWERTY pattern', () => {
      const result = validatePassword('qwerty2024')
      expect(result.valid).toBe(false)
      expect(result.checks['keyboardPattern']).toBe(false)
    })

    it('should reject AZERTY pattern', () => {
      const result = validatePassword('azerty2024')
      expect(result.valid).toBe(false)
      expect(result.checks['keyboardPattern']).toBe(false)
    })

    it('should pass with no keyboard patterns', () => {
      const result = validatePassword('R@nd0mP4ss!')
      expect(result.checks['keyboardPattern']).toBe(true)
    })

    it('should allow disabling keyboard pattern check', () => {
      const result = validatePassword('qwerty123', { checkKeyboardPatterns: false })
      expect(result.checks['keyboardPattern']).toBe(true)
    })
  })
})
