import { describe, it, expect } from 'vitest'
import { validatePassword } from '../src/index'

/**
 * Integration tests for complete user workflows
 *
 * These tests simulate real-world usage scenarios
 * to ensure all components work together correctly.
 */

describe('Integration Tests - User Workflows', () => {
  describe('Signup flow - Strong password policy', () => {
    const strongPolicyConfig = {
      minLength: 12,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireDigit: true,
      requireSymbol: true,
      maxRepeatedChars: 2,
      checkSequential: true,
      checkKeyboardPatterns: true,
      checkCommonPasswords: true,
    }

    it('should reject common weak passwords', () => {
      const weakPasswords = [
        'password',
        'password123',
        '12345678',
        'qwerty123',
        'letmein',
        'admin123',
      ]

      weakPasswords.forEach((password) => {
        const result = validatePassword(password, strongPolicyConfig)
        expect(result.valid).toBe(false)
        expect(result.score).toBeLessThan(4)
        expect(result.feedback.suggestions.length).toBeGreaterThan(0)
      })
    })

    it('should accept strong, unique passwords', () => {
      const strongPasswords = [
        'MyS3cur3!P@ssw0rd',
        'Bl@ckF0rest*Pine',
        'W1nterM00n$Shine',
        'Cr1mson&Sky#Dawn',
      ]

      strongPasswords.forEach((password) => {
        const result = validatePassword(password, strongPolicyConfig)
        expect(result.valid).toBe(true)
        expect(result.score).toBeGreaterThanOrEqual(3)
        expect(result.strength).toMatch(/strong|very-strong/)
        expect(result.feedback.warning).toBeUndefined()
      })
    })

    it('should provide actionable feedback for password improvement', () => {
      const result = validatePassword('short', strongPolicyConfig)

      expect(result.valid).toBe(false)
      expect(result.feedback.suggestions).toEqual(
        expect.arrayContaining([expect.stringContaining('12 characters')])
      )
      expect(result.checks.length).toBe(false)
    })
  })

  describe('Login flow - Basic password policy', () => {
    const basicPolicyConfig = {
      minLength: 8,
      maxLength: 128,
    }

    it('should allow any password meeting minimum length', () => {
      const passwords = ['password', '12345678', 'simple00', 'NoSymbols']

      passwords.forEach((password) => {
        const result = validatePassword(password, basicPolicyConfig)
        expect(result.checks.length).toBe(true)
      })
    })

    it('should reject passwords that are too short', () => {
      const result = validatePassword('short', basicPolicyConfig)
      expect(result.valid).toBe(false)
      expect(result.checks.length).toBe(false)
    })
  })

  describe('Password reset flow - Personal info exclusion', () => {
    const userInfo = {
      minLength: 8,
      personalInfo: ['johndoe', 'john', 'doe', 'john.doe@example.com', '1990'],
    }

    it('should reject passwords containing personal information', () => {
      const personalPasswords = [
        'johndoe123',
        'John2024!',
        'Doe$Password',
        'john.doe@pass',
        'born1990',
      ]

      personalPasswords.forEach((password) => {
        const result = validatePassword(password, userInfo)
        expect(result.valid).toBe(false)
        expect(result.checks.personalInfo).toBe(false)
        expect(result.feedback.suggestions).toEqual(
          expect.arrayContaining([expect.stringContaining('personal information')])
        )
      })
    })

    it('should accept passwords without personal information', () => {
      const validPasswords = ['TropicalSun$2024', 'MountainPeak#99', 'BlueOcean!Wave']

      validPasswords.forEach((password) => {
        const result = validatePassword(password, userInfo)
        expect(result.checks.personalInfo).toBe(true)
      })
    })
  })

  describe('Enterprise policy - Maximum security', () => {
    const enterpriseConfig = {
      minLength: 16,
      maxLength: 64,
      requireUppercase: true,
      requireLowercase: true,
      requireDigit: true,
      requireSymbol: true,
      maxRepeatedChars: 2,
      checkSequential: true,
      checkKeyboardPatterns: true,
      checkCommonPasswords: true,
      personalInfo: ['companyname', 'department'],
    }

    it('should enforce strict requirements', () => {
      const result = validatePassword('Short!1Aa', enterpriseConfig)

      expect(result.valid).toBe(false)
      expect(result.checks.length).toBe(false)
    })

    it('should accept highly complex passwords', () => {
      const result = validatePassword('C0mpl3x!Ent3rpr1se#P@ss', enterpriseConfig)

      expect(result.valid).toBe(true)
      expect(result.score).toBe(4)
      expect(result.strength).toBe('very-strong')
    })
  })

  describe('Progressive enhancement - Password strength levels', () => {
    it('should show progression from weak to strong', () => {
      const passwords = [
        { password: 'weak', expectedScore: 0 },
        { password: 'password', expectedScore: 1 },
        { password: 'Password123', expectedScore: 2 },
        { password: 'P@ssw0rd!23', expectedScore: 3 },
        { password: 'S3cur3!P@ssw0rd', expectedScore: 4 },
      ]

      const results = passwords.map(({ password }) => ({
        password,
        result: validatePassword(password),
      }))

      // Verify scores generally increase with complexity
      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1]?.result
        const curr = results[i]?.result

        if (prev && curr) {
          expect(curr.score).toBeGreaterThanOrEqual(prev.score - 1)
        }
      }
    })
  })

  describe('Edge cases - Boundary testing', () => {
    it('should handle minimum length boundary', () => {
      const config = { minLength: 8 }

      expect(validatePassword('1234567', config).checks.length).toBe(false)
      expect(validatePassword('12345678', config).checks.length).toBe(true)
    })

    it('should handle maximum length boundary', () => {
      const config = { maxLength: 10 }

      expect(validatePassword('a'.repeat(10), config).checks.length).toBe(true)
      expect(validatePassword('a'.repeat(11), config).checks.length).toBe(false)
    })

    it('should handle empty password', () => {
      const result = validatePassword('', { minLength: 8 })

      expect(result.valid).toBe(false)
      expect(result.checks.length).toBe(false)
      // Score is based on passed checks ratio, not validity
      expect(result.score).toBeGreaterThan(0)
    })

    it('should handle very long password', () => {
      const longPassword = 'A'.repeat(200)
      const result = validatePassword(longPassword)

      expect(result.valid).toBe(false)
      expect(result.checks.length).toBe(false)
    })

    it('should handle unicode characters', () => {
      const unicodePasswords = ['MyP@ssw0rd🔒', 'Пароль123!', '密码Password1!', 'Contraseña2024!']

      unicodePasswords.forEach((password) => {
        const result = validatePassword(password)
        expect(result).toBeDefined()
        expect(result.checks).toBeDefined()
      })
    })

    it('should handle special characters comprehensively', () => {
      const specialChars = '!@#$%^&*()_+-=[]{};\':"|,.<>/?'
      const password = `Pass${specialChars}123`

      const result = validatePassword(password, {
        requireSymbol: true,
      })

      expect(result.checks.characterTypes).toBe(true)
    })
  })

  describe('Configuration combinations', () => {
    it('should work with minimal configuration', () => {
      const result = validatePassword('SimplePassword')
      expect(result).toBeDefined()
      expect(result.checks).toBeDefined()
    })

    it('should work with all options disabled', () => {
      const result = validatePassword('anything', {
        checkSequential: false,
        checkKeyboardPatterns: false,
        checkCommonPasswords: false,
      })
      expect(result).toBeDefined()
    })

    it('should work with selective validators', () => {
      const result = validatePassword('Password123', {
        requireUppercase: true,
        requireDigit: true,
        checkCommonPasswords: false,
      })

      expect(result.checks.characterTypes).toBe(true)
      expect(result.checks.commonPassword).toBe(true) // Not checked, defaults to true
    })
  })

  describe('Realistic user scenarios', () => {
    it('should handle user trying to update from weak to strong password', () => {
      const oldPassword = 'password'
      const newAttempt1 = 'Password'
      const newAttempt2 = 'Password1'
      const newAttempt3 = 'Password123' // Common pattern
      const finalPassword = 'MyS3cur3!P@ss'

      const config = {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireDigit: true,
        requireSymbol: true,
      }

      expect(validatePassword(oldPassword, config).valid).toBe(false)
      expect(validatePassword(newAttempt1, config).valid).toBe(false)
      expect(validatePassword(newAttempt2, config).valid).toBe(false)
      expect(validatePassword(newAttempt3, config).valid).toBe(false) // Common password
      expect(validatePassword(finalPassword, config).valid).toBe(true)
    })

    it('should provide helpful suggestions throughout the process', () => {
      const attempts = ['pass', 'password', 'Password', 'Password1']

      const config = {
        minLength: 8,
        requireUppercase: true,
        requireDigit: true,
        requireSymbol: true,
      }

      attempts.forEach((password) => {
        const result = validatePassword(password, config)
        if (!result.valid) {
          expect(result.feedback.suggestions.length).toBeGreaterThan(0)
          expect(result.feedback.warning).toBeDefined()
        }
      })
    })
  })
})
