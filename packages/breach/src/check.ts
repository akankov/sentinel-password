import type { BreachOptions, BreachResult } from './types'

const RANGE_API: string = 'https://api.pwnedpasswords.com/range/'
const DEFAULT_TIMEOUT_MS: number = 5000
const DEFAULT_THRESHOLD: number = 1

/** True for the abort/timeout signals raised by `AbortSignal.timeout`. */
function isTimeout(error: unknown): boolean {
  const name: string = String((error as { name?: unknown }).name)
  return name === 'AbortError' || name === 'TimeoutError'
}

/** Uppercase hex encoding of an `ArrayBuffer`. */
function toHex(buffer: ArrayBuffer): string {
  let hex: string = ''
  for (const byte of new Uint8Array(buffer)) {
    hex += byte.toString(16).padStart(2, '0')
  }
  return hex.toUpperCase()
}

/** Find the exposure count for `suffix` in a Pwned Passwords range body. */
function countFor(body: string, suffix: string): number {
  for (const line of body.split('\n')) {
    const idx: number = line.indexOf(':')
    if (idx === -1) {
      continue
    }
    if (line.slice(0, idx).trim().toUpperCase() === suffix) {
      return parseInt(line.slice(idx + 1), 10) || 0
    }
  }
  return 0
}

/**
 * Check a password against Have I Been Pwned's Pwned Passwords range API using
 * the k-anonymity model: the password is SHA-1 hashed locally and only the
 * first 5 hex characters of the digest are sent to the API. The full hash, the
 * password, and the matched suffix never leave this process and are never
 * logged.
 *
 * Never throws and never silently reports "safe" on failure — on any error it
 * resolves to `{ status: 'error', reason }` so the caller explicitly decides
 * fail-open vs fail-closed. Recommended for server-side use.
 *
 * @example
 * ```typescript
 * import { checkBreach } from '@sentinel-password/breach'
 *
 * const r = await checkBreach(password)
 * if (r.status === 'error') {
 *   // your call: block submission, or allow and log
 * } else if (r.breached) {
 *   // r.breachCount appearances in known breaches
 * }
 * ```
 */
export async function checkBreach(
  password: string,
  options: BreachOptions = {}
): Promise<BreachResult> {
  if (password === '') {
    return { status: 'ok', breachCount: 0, breached: false }
  }

  const fetchImpl: typeof fetch | undefined = options.fetch ?? globalThis.fetch
  if (typeof fetchImpl !== 'function') {
    return { status: 'error', reason: 'unsupported', detail: 'fetch unavailable' }
  }
  const subtle: SubtleCrypto | undefined = globalThis.crypto?.subtle
  if (!subtle) {
    return { status: 'error', reason: 'unsupported', detail: 'crypto.subtle unavailable' }
  }

  const digest: ArrayBuffer = await subtle.digest('SHA-1', new TextEncoder().encode(password))
  const hash: string = toHex(digest)
  const prefix: string = hash.slice(0, 5)
  const suffix: string = hash.slice(5)

  let body: string | undefined = options.cache?.get(prefix)
  if (body === undefined) {
    const headers: Record<string, string> = {}
    if (options.addPadding ?? true) {
      headers['Add-Padding'] = 'true'
    }

    let response: Response
    try {
      response = await fetchImpl(RANGE_API + prefix, {
        headers,
        signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
      })
    } catch (error: unknown) {
      return { status: 'error', reason: isTimeout(error) ? 'timeout' : 'network' }
    }

    if (response.status === 429) {
      return { status: 'error', reason: 'rate-limit' }
    }
    if (!response.ok) {
      return { status: 'error', reason: 'http', detail: `HTTP ${String(response.status)}` }
    }

    try {
      body = await response.text()
    } catch {
      return { status: 'error', reason: 'network' }
    }
    options.cache?.set(prefix, body)
  }

  const breachCount: number = countFor(body, suffix)
  const threshold: number = options.threshold ?? DEFAULT_THRESHOLD
  return { status: 'ok', breachCount, breached: breachCount >= threshold }
}
