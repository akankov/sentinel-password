import { describe, expect, it } from 'vitest'
import { createBreachCache } from '../src/cache'

describe('createBreachCache', () => {
  it('stores and retrieves a body by prefix', () => {
    const cache = createBreachCache()
    cache.set('ABCDE', 'SUFFIX:1')
    expect(cache.get('ABCDE')).toBe('SUFFIX:1')
  })

  it('returns undefined for an unknown prefix', () => {
    const cache = createBreachCache()
    expect(cache.get('ZZZZZ')).toBeUndefined()
  })

  it('evicts the oldest entry once maxEntries is exceeded (FIFO)', () => {
    const cache = createBreachCache(2)
    cache.set('AAAAA', 'a')
    cache.set('BBBBB', 'b')
    cache.set('CCCCC', 'c') // evicts AAAAA

    expect(cache.get('AAAAA')).toBeUndefined()
    expect(cache.get('BBBBB')).toBe('b')
    expect(cache.get('CCCCC')).toBe('c')
  })

  it('refreshing an existing key does not grow size or evict', () => {
    const cache = createBreachCache(2)
    cache.set('AAAAA', 'a')
    cache.set('BBBBB', 'b')
    cache.set('AAAAA', 'a2') // update in place, no eviction

    expect(cache.get('AAAAA')).toBe('a2')
    expect(cache.get('BBBBB')).toBe('b')
  })

  it('updating a key keeps its original insertion position (true FIFO)', () => {
    const cache = createBreachCache(2)
    cache.set('AAAAA', 'a')
    cache.set('BBBBB', 'b')
    cache.set('AAAAA', 'a2') // update must NOT move AAAAA to newest
    cache.set('CCCCC', 'c') // AAAAA is still the oldest, so it is evicted

    expect(cache.get('AAAAA')).toBeUndefined()
    expect(cache.get('BBBBB')).toBe('b')
    expect(cache.get('CCCCC')).toBe('c')
  })
})
