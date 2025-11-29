import { describe, it, expect } from 'vitest'
import { validatePersonalInfo } from '../../src/validators/personal-info.js'

describe('validatePersonalInfo', () => {
  it('should pass when no personal info provided', () => {
    const result = validatePersonalInfo('MySecureP4ss!')
    expect(result.passed).toBe(true)
  })

  it('should fail when password contains username', () => {
    const result = validatePersonalInfo('johndoe123', { personalInfo: ['johndoe'] })
    expect(result.passed).toBe(false)
    expect(result.message).toContain('personal information')
  })

  it('should fail when password contains email username', () => {
    const result = validatePersonalInfo('alice1234', {
      personalInfo: ['alice@example.com'],
    })
    expect(result.passed).toBe(false)
  })

  it('should fail when password contains name', () => {
    const result = validatePersonalInfo('robert2024', { personalInfo: ['Robert'] })
    expect(result.passed).toBe(false)
  })

  it('should be case-insensitive', () => {
    const result = validatePersonalInfo('JOHNDOE123', { personalInfo: ['johndoe'] })
    expect(result.passed).toBe(false)
  })

  it('should detect personal info in middle of password', () => {
    const result = validatePersonalInfo('pass_alice_123', { personalInfo: ['alice'] })
    expect(result.passed).toBe(false)
  })

  it('should pass when personal info not in password', () => {
    const result = validatePersonalInfo('MySecureP4ss!', { personalInfo: ['johndoe', 'alice'] })
    expect(result.passed).toBe(true)
  })

  it('should handle multiple personal info items', () => {
    const result = validatePersonalInfo('robert123', {
      personalInfo: ['johndoe', 'alice', 'robert'],
    })
    expect(result.passed).toBe(false)
  })

  it('should handle empty personal info array', () => {
    const result = validatePersonalInfo('password123', { personalInfo: [] })
    expect(result.passed).toBe(true)
  })

  it('should handle empty password', () => {
    const result = validatePersonalInfo('', { personalInfo: ['john'] })
    expect(result.passed).toBe(true)
  })

  it('should extract username from email addresses', () => {
    const result = validatePersonalInfo('john.doe123', {
      personalInfo: ['john.doe@example.com'],
    })
    expect(result.passed).toBe(false)
  })

  it('should ignore very short personal info (< 3 chars)', () => {
    const result = validatePersonalInfo('password_ab', { personalInfo: ['ab'] })
    expect(result.passed).toBe(true)
  })

  it('should fail for longer personal info strings', () => {
    const result = validatePersonalInfo('password_abc', { personalInfo: ['abc'] })
    expect(result.passed).toBe(false)
  })

  it('should handle special characters in personal info', () => {
    const result = validatePersonalInfo('john.doe123', { personalInfo: ['john.doe'] })
    expect(result.passed).toBe(false)
  })
})
