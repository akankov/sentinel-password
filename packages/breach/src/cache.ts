import type { BreachCache } from './types'

/**
 * Create a bounded, in-memory {@link BreachCache} with FIFO eviction.
 *
 * Keys are 5-hex-char SHA-1 prefixes; values are raw Pwned Passwords range
 * response bodies. Once `maxEntries` distinct prefixes are stored, inserting a
 * new prefix evicts the oldest one. Updating an existing prefix replaces its
 * value in place without changing insertion order or size.
 *
 * @example
 * ```typescript
 * import { checkBreach, createBreachCache } from '@sentinel-password/breach'
 *
 * const cache = createBreachCache()
 * await checkBreach('hunter2', { cache })
 * await checkBreach('hunter2', { cache }) // served from cache, no network
 * ```
 */
export function createBreachCache(maxEntries: number = 1024): BreachCache {
  const store: Map<string, string> = new Map<string, string>()

  return {
    get(prefix: string): string | undefined {
      return store.get(prefix)
    },
    set(prefix: string, body: string): void {
      store.delete(prefix)
      store.set(prefix, body)
      if (store.size > maxEntries) {
        // size > maxEntries >= 0 implies at least one entry exists.
        const oldest: string = store.keys().next().value as string
        store.delete(oldest)
      }
    },
  }
}
