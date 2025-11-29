import { describe, it, expect } from 'vitest'
import { validateCommonPassword } from '../../src/validators/common-password.js'

describe('validateCommonPassword', () => {
  it('should pass for uncommon passwords', () => {
    const result = validateCommonPassword('MyUniqueP4ssw0rd!')
    expect(result.passed).toBe(true)
  })

  it('should fail for very common passwords', () => {
    const result = validateCommonPassword('password')
    expect(result.passed).toBe(false)
    expect(result.message).toContain('common')
  })

  it('should fail for common numeric passwords', () => {
    const result = validateCommonPassword('123456')
    expect(result.passed).toBe(false)
  })

  it('should fail for qwerty', () => {
    const result = validateCommonPassword('qwerty')
    expect(result.passed).toBe(false)
  })

  it('should be case-insensitive', () => {
    const result = validateCommonPassword('PASSWORD')
    expect(result.passed).toBe(false)
  })

  it('should pass when checkCommonPasswords is false', () => {
    const result = validateCommonPassword('password', { checkCommonPasswords: false })
    expect(result.passed).toBe(true)
  })

  it('should handle empty password', () => {
    const result = validateCommonPassword('')
    expect(result.passed).toBe(true)
  })

  it('should fail for common variations', () => {
    // All these passwords are in the top 10k list
    const commonPasswords = ['12345678', 'qwerty123', 'letmein', 'welcome', 'dragon']

    commonPasswords.forEach((pwd) => {
      const result = validateCommonPassword(pwd)
      expect(result.passed).toBe(false)
    })
  })

  it('should pass for strong uncommon passwords', () => {
    const strongPasswords = ['MyStr0ng!Pass', 'C0mpl3x$ecur1ty', 'Un1qu3P@ssw0rd', 'S3cur3Rand0m!']

    strongPasswords.forEach((pwd) => {
      const result = validateCommonPassword(pwd)
      expect(result.passed).toBe(true)
    })
  })
})
