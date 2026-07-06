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

    it('should be a no-op when initialPassword is empty', () => {
      const { result } = renderHook(() => usePasswordValidator({ validateOnMount: true }))

      expect(result.current.password).toBe('')
      expect(result.current.result).toBeUndefined()
    })

    it('should validate initialPassword on mount when validateOnMount is true', () => {
      const { result } = renderHook(() =>
        usePasswordValidator({
          initialPassword: 'SecureP4ssw0rd!',
          validateOnMount: true,
        })
      )

      expect(result.current.password).toBe('SecureP4ssw0rd!')
      expect(result.current.result).toBeDefined()
      expect(result.current.result?.valid).toBe(true)
    })

    it('should seed password from initialPassword without validating when validateOnMount is false', () => {
      const { result } = renderHook(() =>
        usePasswordValidator({ initialPassword: 'SecureP4ssw0rd!' })
      )

      expect(result.current.password).toBe('SecureP4ssw0rd!')
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

  describe('i18n options thread through to core', () => {
    it('applies the messages override on synchronous validation', () => {
      const { result } = renderHook(() =>
        usePasswordValidator({
          debounceMs: 0,
          validateOnChange: true,
          minLength: 8,
          messages: { 'length.tooShort': 'Mínimo {minLength} caracteres' },
        })
      )

      act(() => {
        result.current.setPassword('abc')
      })

      expect(result.current.result?.feedback.warning).toBe('Mínimo 8 caracteres')
    })

    it('applies formatMessage callback on synchronous validation', () => {
      const { result } = renderHook(() =>
        usePasswordValidator({
          debounceMs: 0,
          validateOnChange: true,
          minLength: 8,
          formatMessage: (code) => `[${code}]`,
        })
      )

      act(() => {
        result.current.setPassword('abc')
      })

      expect(result.current.result?.feedback.suggestions).toContain('[length.tooShort]')
    })
  })

  describe('asyncChecks', () => {
    const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

    it('runs async checks after synchronous validation and reports passed', async () => {
      const breach = vi.fn(async () => ({ passed: true }))
      const { result } = renderHook(() =>
        usePasswordValidator({
          debounceMs: 0,
          validateOnChange: true,
          asyncChecks: { breach },
        })
      )

      act(() => {
        result.current.setPassword('Str0ng!Passphrase')
      })
      expect(result.current.asyncResults['breach']?.status).toBe('pending')
      expect(result.current.isValidatingAsync).toBe(true)

      await act(flush)
      expect(breach).toHaveBeenCalledWith('Str0ng!Passphrase', expect.any(AbortSignal))
      expect(result.current.asyncResults['breach']?.status).toBe('passed')
      expect(result.current.isValidatingAsync).toBe(false)
    })

    it('reports failed with the provided message', async () => {
      const { result } = renderHook(() =>
        usePasswordValidator({
          debounceMs: 0,
          validateOnChange: true,
          asyncChecks: {
            breach: async () => ({ passed: false, message: 'Found in breaches' }),
          },
        })
      )

      act(() => {
        result.current.setPassword('hunter2hunter2')
      })
      await act(flush)
      expect(result.current.asyncResults['breach']).toEqual({
        status: 'failed',
        message: 'Found in breaches',
      })
    })

    it('reports error (not failed) when the check rejects, without a message', async () => {
      const { result } = renderHook(() =>
        usePasswordValidator({
          debounceMs: 0,
          validateOnChange: true,
          asyncChecks: {
            breach: async () => {
              throw new Error('ECONNRESET https://internal-secret-host')
            },
          },
        })
      )

      act(() => {
        result.current.setPassword('whatever123!X')
      })
      await act(flush)
      expect(result.current.asyncResults['breach']).toEqual({ status: 'error' })
    })

    it('aborts a superseded run and ignores its late result', async () => {
      const seenSignals: AbortSignal[] = []
      let release: (() => void) | undefined
      const slow = vi.fn((pw: string, signal: AbortSignal) => {
        seenSignals.push(signal)
        return new Promise<{ passed: boolean; message?: string }>((resolve) => {
          release = () => resolve({ passed: false, message: `stale:${pw}` })
        })
      })
      const { result } = renderHook(() =>
        usePasswordValidator({
          debounceMs: 0,
          validateOnChange: true,
          asyncChecks: { slow },
        })
      )

      act(() => {
        result.current.setPassword('first-attempt-1!')
      })
      // The check body is invoked in a microtask — flush so run #1 starts.
      await act(flush)
      const releaseFirst = release
      expect(seenSignals[0]?.aborted).toBe(false)

      act(() => {
        result.current.setPassword('second-attempt-2!')
      })
      await act(flush)
      expect(seenSignals[0]?.aborted).toBe(true)
      expect(seenSignals[1]?.aborted).toBe(false)

      // Late resolution from the superseded run must not overwrite state.
      await act(async () => {
        releaseFirst?.()
        await flush()
      })
      expect(result.current.asyncResults['slow']?.status).toBe('pending')
    })

    it('runs on manual validate() and clears on reset()', async () => {
      const breach = vi.fn(async () => ({ passed: true }))
      const { result } = renderHook(() =>
        usePasswordValidator({ debounceMs: 0, asyncChecks: { breach } })
      )

      act(() => {
        result.current.setPassword('SomethingLong!9')
      })
      // manual mode (debounceMs 0, validateOnChange false): nothing ran yet
      expect(breach).not.toHaveBeenCalled()

      act(() => {
        result.current.validate()
      })
      await act(flush)
      expect(breach).toHaveBeenCalledTimes(1)
      expect(result.current.asyncResults['breach']?.status).toBe('passed')

      act(() => {
        result.current.reset()
      })
      expect(result.current.asyncResults).toEqual({})
      expect(result.current.isValidatingAsync).toBe(false)
    })

    it('treats a malformed resolution as failed', async () => {
      const { result } = renderHook(() =>
        usePasswordValidator({
          debounceMs: 0,
          validateOnChange: true,
          asyncChecks: {
            broken: (async () => undefined) as unknown as (
              pw: string,
              signal: AbortSignal
            ) => Promise<{ passed: boolean }>,
          },
        })
      )

      act(() => {
        result.current.setPassword('whatever123!X')
      })
      await act(flush)
      expect(result.current.asyncResults['broken']?.status).toBe('failed')
    })

    it('is a no-op for an empty asyncChecks map', () => {
      const { result } = renderHook(() =>
        usePasswordValidator({ debounceMs: 0, validateOnChange: true, asyncChecks: {} })
      )
      act(() => {
        result.current.setPassword('Whatever123!X')
      })
      expect(result.current.asyncResults).toEqual({})
      expect(result.current.isValidatingAsync).toBe(false)
    })

    it('keeps async state stable across rerenders with identity-equal checks', async () => {
      const breach = vi.fn(async () => ({ passed: true }))
      const { result, rerender } = renderHook(() =>
        // Inline map literal, but the function reference is stable.
        usePasswordValidator({ debounceMs: 0, validateOnChange: true, asyncChecks: { breach } })
      )
      act(() => {
        result.current.setPassword('Str0ng!Passphrase')
      })
      await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
      expect(result.current.asyncResults['breach']?.status).toBe('passed')

      rerender()
      // No new run was triggered by the rerender.
      expect(breach).toHaveBeenCalledTimes(1)
      expect(result.current.asyncResults['breach']?.status).toBe('passed')
    })

    it('runs async checks through the debounced path', async () => {
      vi.useFakeTimers()
      const breach = vi.fn(async () => ({ passed: true }))
      const { result } = renderHook(() =>
        usePasswordValidator({ debounceMs: 300, asyncChecks: { breach } })
      )

      act(() => {
        result.current.setPassword('Debounced!Pass9')
      })
      expect(breach).not.toHaveBeenCalled()

      await act(async () => {
        vi.advanceTimersByTime(300)
        await vi.runAllTimersAsync()
      })
      expect(breach).toHaveBeenCalledTimes(1)
      expect(result.current.asyncResults['breach']?.status).toBe('passed')
      vi.useRealTimers()
    })
  })

  describe('re-validation when validator options change', () => {
    it('re-renders the result in the new locale after a messages switch', () => {
      const english = { 'length.tooShort': 'Too short (min {minLength})' }
      const spanish = { 'length.tooShort': 'Demasiado corta (mínimo {minLength})' }

      const { result, rerender } = renderHook(
        ({ messages }) =>
          usePasswordValidator({
            debounceMs: 0,
            validateOnChange: true,
            minLength: 8,
            messages,
          }),
        { initialProps: { messages: english } }
      )

      act(() => {
        result.current.setPassword('abc')
      })
      expect(result.current.result?.feedback.suggestions).toContain('Too short (min 8)')

      // Locale switch with NO keystroke — the rendered result must update.
      rerender({ messages: spanish })
      expect(result.current.result?.feedback.suggestions).toContain('Demasiado corta (mínimo 8)')
    })

    it('re-validates when a policy option changes', () => {
      const { result, rerender } = renderHook(
        ({ minLength }) =>
          usePasswordValidator({ debounceMs: 0, validateOnChange: true, minLength }),
        { initialProps: { minLength: 4 } }
      )

      act(() => {
        result.current.setPassword('Str0ng!x')
      })
      expect(result.current.result?.checks.length).toBe(true)

      rerender({ minLength: 12 })
      expect(result.current.result?.checks.length).toBe(false)
    })

    it('does not surface a result for an untouched input when options change', () => {
      const { result, rerender } = renderHook(
        ({ minLength }) => usePasswordValidator({ minLength }),
        { initialProps: { minLength: 8 } }
      )

      rerender({ minLength: 12 })
      expect(result.current.result).toBeUndefined()
    })

    it('re-validates when the score changes while staying invalid', () => {
      // 'aaaabbbb' with minLength 10 fails length + repetition (score 3);
      // adding requireUppercase also fails characterTypes (score 2) — same
      // valid=false, different score.
      const { result, rerender } = renderHook(
        ({ requireUppercase }: { requireUppercase: boolean }) =>
          usePasswordValidator({
            debounceMs: 0,
            validateOnChange: true,
            minLength: 10,
            requireUppercase,
          }),
        { initialProps: { requireUppercase: false } }
      )

      act(() => {
        result.current.setPassword('aaaabbbb')
      })
      const scoreBefore = result.current.result?.score

      rerender({ requireUppercase: true })
      expect(result.current.result?.score).not.toBe(scoreBefore)
      expect(result.current.result?.checks['characterTypes']).toBe(false)
    })

    it('re-validates when only a later suggestion message changes', () => {
      // 'aaaa' fails length (first suggestion) and repetition (second).
      // Overriding only the repetition template keeps valid/score/warning
      // identical while the second suggestion differs.
      const { result, rerender } = renderHook(
        ({ messages }: { messages: Record<string, string> }) =>
          usePasswordValidator({
            debounceMs: 0,
            validateOnChange: true,
            minLength: 8,
            messages,
          }),
        { initialProps: { messages: {} as Record<string, string> } }
      )

      act(() => {
        result.current.setPassword('aaaa')
      })
      expect(result.current.result?.feedback.suggestions.length).toBeGreaterThan(1)

      rerender({
        messages: { 'repetition.tooMany': 'Zu viele Wiederholungen (max {maxRepeatedChars})' },
      })
      expect(result.current.result?.feedback.suggestions).toContain(
        'Zu viele Wiederholungen (max 3)'
      )
    })

    it('detects option-set shape changes (added key) as an options change', () => {
      const { result, rerender } = renderHook(
        (props: { minLength?: number; requireDigit?: boolean }) =>
          usePasswordValidator({ debounceMs: 0, validateOnChange: true, ...props }),
        { initialProps: { minLength: 4 } as { minLength?: number; requireDigit?: boolean } }
      )

      act(() => {
        result.current.setPassword('abcdef')
      })
      expect(result.current.result?.checks['characterTypes']).toBe(true)

      rerender({ minLength: 4, requireDigit: true })
      expect(result.current.result?.checks['characterTypes']).toBe(false)
    })

    it('keeps callback identity stable across renders with equal inline options', () => {
      const { result, rerender } = renderHook(() =>
        // Inline literal: new object identity every render, same values.
        usePasswordValidator({ debounceMs: 0, validateOnChange: true, minLength: 10 })
      )

      const firstSetPassword = result.current.setPassword
      const firstValidate = result.current.validate

      rerender()

      expect(result.current.setPassword).toBe(firstSetPassword)
      expect(result.current.validate).toBe(firstValidate)
    })

    it('does not loop when nested option values churn identity every render', () => {
      // `messages` is a fresh object each render — the equality bail-out on
      // the result must stop the re-validation effect from looping.
      const { result, rerender } = renderHook(() =>
        usePasswordValidator({
          debounceMs: 0,
          validateOnChange: true,
          minLength: 8,
          messages: { 'length.tooShort': 'Too short' },
        })
      )

      act(() => {
        result.current.setPassword('abc')
      })
      const firstResult = result.current.result
      expect(firstResult?.feedback.suggestions).toContain('Too short')

      rerender()
      // Same reference back — React bailed out, no render loop.
      expect(result.current.result).toBe(firstResult)
    })
  })
})
