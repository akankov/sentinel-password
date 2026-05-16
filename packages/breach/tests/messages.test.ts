import { describe, expect, it } from 'vitest'
import { DEFAULT_BREACH_MESSAGES, resolveBreachMessage } from '../src/messages'

describe('DEFAULT_BREACH_MESSAGES', () => {
  it('has a stable English template for breach.found with a {count} placeholder', () => {
    expect(DEFAULT_BREACH_MESSAGES['breach.found']).toContain('{count}')
  })
})

describe('resolveBreachMessage', () => {
  it('renders the default template with params substituted', () => {
    expect(resolveBreachMessage('breach.found', { count: 42 })).toBe(
      'This password has appeared in 42 known data breaches. Choose a different one.'
    )
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
    expect(msg).toBe(
      '[breach.found] 7 :: This password has appeared in 7 known data breaches. Choose a different one.'
    )
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
    expect(msg).toBe('This password has appeared in 1 known data breaches. Choose a different one.')
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
