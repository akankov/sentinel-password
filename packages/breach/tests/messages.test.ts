import { describe, expect, it } from 'vitest'
import { DEFAULT_BREACH_MESSAGES, resolveBreachMessage } from '../src/messages'

const DEFAULT_FOUND = 'This password has appeared in known data breaches. Choose a different one.'

describe('DEFAULT_BREACH_MESSAGES', () => {
  it('is grammatical for any count: no count-dependent pluralization in the default', () => {
    expect(DEFAULT_BREACH_MESSAGES['breach.found']).toBe(DEFAULT_FOUND)
    expect(DEFAULT_BREACH_MESSAGES['breach.found']).not.toContain('{count}')
  })
})

describe('resolveBreachMessage', () => {
  it('renders the default template; it is grammatical even at count 1', () => {
    expect(resolveBreachMessage('breach.found', { count: 42 })).toBe(DEFAULT_FOUND)
    expect(resolveBreachMessage('breach.found', { count: 1 })).toBe(DEFAULT_FOUND)
  })

  it('uses a per-code messages override when provided', () => {
    const msg = resolveBreachMessage(
      'breach.found',
      { count: 3 },
      { messages: { 'breach.found': 'Pwned {count}x' } }
    )
    expect(msg).toBe('Pwned 3x')
  })

  it('uses formatMessage when provided, receiving the default rendering', () => {
    const msg = resolveBreachMessage(
      'breach.found',
      { count: 7 },
      {
        formatMessage: (code, params, def) => `[${code}] ${String(params.count)} :: ${def}`,
      }
    )
    expect(msg).toBe(`[breach.found] 7 :: ${DEFAULT_FOUND}`)
  })

  it('falls back to the default rendering when formatMessage throws', () => {
    const msg = resolveBreachMessage(
      'breach.found',
      { count: 1 },
      {
        formatMessage: () => {
          throw new Error('boom')
        },
      }
    )
    expect(msg).toBe(DEFAULT_FOUND)
  })

  it('leaves unknown placeholders intact so missing data is visible', () => {
    const msg = resolveBreachMessage(
      'breach.found',
      {},
      { messages: { 'breach.found': 'Seen {count} times, source {source}' } }
    )
    expect(msg).toBe('Seen {count} times, source {source}')
  })
})
