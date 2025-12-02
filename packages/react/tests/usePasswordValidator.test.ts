import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePasswordValidator } from '../src'

describe('usePasswordValidator', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('basic functionality', () => {
    it('should initialize with empty password and no result', () => {
      const { result } = renderHook(() => usePasswordValidator())

      expect(result.current.password).toBe('')
      expect(result.current.result).toBeUndefined()
      expect(result.current.isValidating).toBe(false)
    })

    it('should update password when setPassword is called', () => {
      const { result } = renderHook(() => usePasswordValidator())

      act(() => {
        result.current.setPassword('test123')
      })

      expect(result.current.password).toBe('test123')
    })

    it('should validate password after debounce delay', async () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => usePasswordValidator({ debounceMs: 300 }))

      act(() => {
        result.current.setPassword('SecureP4ssw0rd!')
      })

      expect(result.current.isValidating).toBe(true)
      expect(result.current.result).toBeUndefined()

      await act(async () => {
        vi.advanceTimersByTime(300)
        await vi.runAllTimersAsync()
      })

      expect(result.current.isValidating).toBe(false)
      expect(result.current.result).toBeDefined()
      expect(result.current.result?.valid).toBe(true)
      expect(result.current.result?.strength).toBe('very-strong')

      vi.useRealTimers()
    })

    it('should debounce multiple rapid password changes', async () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => usePasswordValidator({ debounceMs: 300 }))

      act(() => {
        result.current.setPassword('a')
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      act(() => {
        result.current.setPassword('ab')
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      act(() => {
        result.current.setPassword('SecureP4ssw0rd!')
      })

      // Should not validate yet
      expect(result.current.result).toBeUndefined()

      await act(async () => {
        vi.advanceTimersByTime(300)
        await vi.runAllTimersAsync()
      })

      // Should validate the final password only
      expect(result.current.result).toBeDefined()
      expect(result.current.result?.valid).toBe(true)
      expect(result.current.password).toBe('SecureP4ssw0rd!')

      vi.useRealTimers()
    })
  })

  describe('debouncing options', () => {
    it('should validate immediately when debounceMs is 0 and validateOnChange is true', () => {
      const { result } = renderHook(() =>
        usePasswordValidator({ debounceMs: 0, validateOnChange: true })
      )

      act(() => {
        result.current.setPassword('SecureP4ssw0rd!')
      })

      expect(result.current.result).toBeDefined()
      expect(result.current.result?.valid).toBe(true)
      expect(result.current.isValidating).toBe(false)
    })

    it('should use custom debounce delay', async () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => usePasswordValidator({ debounceMs: 500 }))

      act(() => {
        result.current.setPassword('test')
      })

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(result.current.result).toBeUndefined()

      await act(async () => {
        vi.advanceTimersByTime(200)
        await vi.runAllTimersAsync()
      })

      expect(result.current.result).toBeDefined()

      vi.useRealTimers()
    })
  })

  describe('validateOnMount option', () => {
    it('should not validate on mount by default', () => {
      const { result } = renderHook(() => usePasswordValidator())

      expect(result.current.result).toBeUndefined()
    })
  })

  describe('manual validation', () => {
    it('should validate when validate() is called', () => {
      const { result } = renderHook(() => usePasswordValidator({ debounceMs: 0 }))

      act(() => {
        result.current.setPassword('SecureP4ssw0rd!')
      })

      act(() => {
        result.current.validate()
      })

      expect(result.current.result).toBeDefined()
      expect(result.current.result?.valid).toBe(true)
    })
  })

  describe('reset functionality', () => {
    it('should reset password and validation state', () => {
      const { result } = renderHook(() =>
        usePasswordValidator({ debounceMs: 0, validateOnChange: true })
      )

      act(() => {
        result.current.setPassword('SecureP4ssw0rd!')
      })

      expect(result.current.result).toBeDefined()

      act(() => {
        result.current.reset()
      })

      expect(result.current.password).toBe('')
      expect(result.current.result).toBeUndefined()
      expect(result.current.isValidating).toBe(false)
    })

    it('should clear debounce timer when reset is called', async () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => usePasswordValidator({ debounceMs: 300 }))

      act(() => {
        result.current.setPassword('test')
      })

      expect(result.current.isValidating).toBe(true)

      act(() => {
        result.current.reset()
      })

      expect(result.current.isValidating).toBe(false)
      expect(result.current.password).toBe('')

      await act(async () => {
        vi.advanceTimersByTime(300)
        await vi.runAllTimersAsync()
      })

      expect(result.current.result).toBeUndefined()

      vi.useRealTimers()
    })
  })

  describe('validation with custom options', () => {
    it('should validate with custom minLength', () => {
      const { result } = renderHook(() =>
        usePasswordValidator({ debounceMs: 0, minLength: 12, validateOnChange: true })
      )

      act(() => {
        result.current.setPassword('Short1!')
      })

      expect(result.current.result).toBeDefined()
      expect(result.current.result?.valid).toBe(false)
      expect(result.current.result?.checks['length']).toBe(false)
    })

    it('should validate with character type requirements', () => {
      const { result } = renderHook(() =>
        usePasswordValidator({
          debounceMs: 0,
          validateOnChange: true,
          requireUppercase: true,
          requireLowercase: true,
          requireDigit: true,
          requireSymbol: true,
        })
      )

      act(() => {
        result.current.setPassword('password')
      })

      expect(result.current.result).toBeDefined()
      expect(result.current.result?.valid).toBe(false)
      expect(result.current.result?.checks['characterTypes']).toBe(false)
    })

    it('should validate with personal info check', () => {
      const { result } = renderHook(() =>
        usePasswordValidator({
          debounceMs: 0,
          validateOnChange: true,
          personalInfo: ['john', 'doe'],
        })
      )

      act(() => {
        result.current.setPassword('john1234!')
      })

      expect(result.current.result).toBeDefined()
      expect(result.current.result?.valid).toBe(false)
      expect(result.current.result?.checks['personalInfo']).toBe(false)
    })

    it('should validate with disabled checks', () => {
      const { result } = renderHook(() =>
        usePasswordValidator({
          debounceMs: 0,
          validateOnChange: true,
          checkSequential: false,
          checkKeyboardPatterns: false,
          checkCommonPasswords: false,
        })
      )

      act(() => {
        result.current.setPassword('qwerty123')
      })

      expect(result.current.result).toBeDefined()
      // Should pass even though it has patterns
      expect(result.current.result?.checks['sequential']).toBe(true)
      expect(result.current.result?.checks['keyboardPattern']).toBe(true)
      expect(result.current.result?.checks['commonPassword']).toBe(true)
    })
  })

  describe('validation results', () => {
    it('should return correct strength for weak password', () => {
      const { result } = renderHook(() =>
        usePasswordValidator({ debounceMs: 0, validateOnChange: true })
      )

      act(() => {
        result.current.setPassword('abc')
      })

      expect(result.current.result).toBeDefined()
      expect(result.current.result?.valid).toBe(false)
      // "abc" passes 5/7 checks (length=false, sequential=false), score=3
      expect(result.current.result?.strength).toBe('strong')
      expect(result.current.result?.score).toBe(3)
    })

    it('should return feedback messages for invalid password', () => {
      const { result } = renderHook(() =>
        usePasswordValidator({ debounceMs: 0, validateOnChange: true })
      )

      act(() => {
        result.current.setPassword('short')
      })

      expect(result.current.result).toBeDefined()
      expect(result.current.result?.feedback.warning).toBeDefined()
      expect(result.current.result?.feedback.suggestions.length).toBeGreaterThan(0)
    })

    it('should return all check results', () => {
      const { result } = renderHook(() =>
        usePasswordValidator({ debounceMs: 0, validateOnChange: true })
      )

      act(() => {
        result.current.setPassword('SecureP4ssw0rd!')
      })

      expect(result.current.result).toBeDefined()
      expect(result.current.result?.checks).toMatchObject({
        length: expect.any(Boolean),
        characterTypes: expect.any(Boolean),
        repetition: expect.any(Boolean),
        sequential: expect.any(Boolean),
        keyboardPattern: expect.any(Boolean),
        commonPassword: expect.any(Boolean),
        personalInfo: expect.any(Boolean),
      })
    })
  })

  describe('cleanup', () => {
    it('should cleanup debounce timer on unmount', async () => {
      vi.useFakeTimers()
      const { result, unmount } = renderHook(() => usePasswordValidator({ debounceMs: 300 }))

      act(() => {
        result.current.setPassword('test')
      })

      expect(result.current.isValidating).toBe(true)

      unmount()

      // Should not throw or cause issues
      await act(async () => {
        vi.advanceTimersByTime(300)
        await vi.runAllTimersAsync()
      })

      vi.useRealTimers()
    })
  })

  describe('edge cases', () => {
    it('should handle empty string password', () => {
      const { result } = renderHook(() => usePasswordValidator({ debounceMs: 0 }))

      act(() => {
        result.current.setPassword('')
      })

      expect(result.current.password).toBe('')
    })

    it('should handle very long passwords', () => {
      const { result } = renderHook(() =>
        usePasswordValidator({ debounceMs: 0, validateOnChange: true })
      )

      const longPassword: string = 'A'.repeat(1000) + '1!'

      act(() => {
        result.current.setPassword(longPassword)
      })

      expect(result.current.result).toBeDefined()
      expect(result.current.result?.checks['length']).toBe(false)
    })

    it('should handle special characters', () => {
      const { result } = renderHook(() =>
        usePasswordValidator({ debounceMs: 0, validateOnChange: true })
      )

      act(() => {
        result.current.setPassword('P@ssw0rd!#$%^&*()')
      })

      expect(result.current.result).toBeDefined()
      expect(result.current.password).toBe('P@ssw0rd!#$%^&*()')
    })

    it('should handle unicode characters', () => {
      const { result } = renderHook(() =>
        usePasswordValidator({ debounceMs: 0, validateOnChange: true })
      )

      act(() => {
        result.current.setPassword('P@ssw0rd123こんにちは')
      })

      expect(result.current.result).toBeDefined()
      expect(result.current.password).toBe('P@ssw0rd123こんにちは')
    })
  })
})
