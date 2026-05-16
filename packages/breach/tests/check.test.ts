import { afterEach, describe, expect, it, vi } from 'vitest'
import { checkBreach } from '../src/check'
import { createBreachCache } from '../src/cache'

// SHA-1("password") = 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
const PASSWORD = 'password'
const PREFIX = '5BAA6'
const SUFFIX = '1E4C9B93F3F0682250B6CF8331B7EE68FD8'
const FULL_HASH = PREFIX + SUFFIX

interface StubInit {
  body?: string
  status?: number
  textThrows?: boolean
}

function stubResponse({ body = '', status = 200, textThrows = false }: StubInit): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: textThrows
      ? (): Promise<string> => Promise.reject(new Error('stream error'))
      : (): Promise<string> => Promise.resolve(body),
  } as unknown as Response
}

/** A fetch stub that records the URL + init it was called with. */
function recordingFetch(init: StubInit): {
  fetch: typeof fetch
  calls: { url: string; init: RequestInit | undefined }[]
} {
  const calls: { url: string; init: RequestInit | undefined }[] = []
  const fetch = ((url: string, reqInit?: RequestInit): Promise<Response> => {
    calls.push({ url, init: reqInit })
    return Promise.resolve(stubResponse(init))
  }) as unknown as typeof fetch
  return { fetch, calls }
}

function rejectingFetch(error: unknown): typeof fetch {
  return ((): Promise<Response> => Promise.reject(error)) as unknown as typeof fetch
}

const FOUND_BODY = `0018A45C4D1DEF81644B54AB7F969B88D65:1\r\n${SUFFIX}:9659365\r\nFFFF:0\r\n`

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('checkBreach — short-circuits & k-anonymity', () => {
  it('returns a zero verdict for an empty password without hashing or fetching', async () => {
    const { fetch, calls } = recordingFetch({ body: FOUND_BODY })
    const result = await checkBreach('', { fetch })
    expect(result).toEqual({ status: 'ok', breachCount: 0, breached: false })
    expect(calls).toHaveLength(0)
  })

  it('sends only the 5-char SHA-1 prefix — the suffix never leaves the process', async () => {
    const { fetch, calls } = recordingFetch({ body: FOUND_BODY })
    await checkBreach(PASSWORD, { fetch })
    expect(calls).toHaveLength(1)
    expect(calls[0]?.url).toBe(`https://api.pwnedpasswords.com/range/${PREFIX}`)
    expect(calls[0]?.url).not.toContain(SUFFIX)
  })
})

describe('checkBreach — verdicts', () => {
  it('reports the exposure count and breached=true when the suffix is present', async () => {
    const { fetch } = recordingFetch({ body: FOUND_BODY })
    const result = await checkBreach(PASSWORD, { fetch })
    expect(result).toEqual({ status: 'ok', breachCount: 9659365, breached: true })
  })

  it('reports breachCount=0 and breached=false when the suffix is absent', async () => {
    const { fetch } = recordingFetch({ body: 'AAAA:5\r\nBBBB:0\r\n' })
    const result = await checkBreach(PASSWORD, { fetch })
    expect(result).toEqual({ status: 'ok', breachCount: 0, breached: false })
  })

  it('matches the suffix case-insensitively and tolerates padding/blank lines', async () => {
    const body = `\r\nFFFF:0\r\n${SUFFIX.toLowerCase()}:42\r\n`
    const { fetch } = recordingFetch({ body })
    const result = await checkBreach(PASSWORD, { fetch })
    expect(result).toEqual({ status: 'ok', breachCount: 42, breached: true })
  })

  it('treats a non-numeric count as zero (defensive against malformed lines)', async () => {
    const { fetch } = recordingFetch({ body: `${SUFFIX}:notanumber\r\n` })
    const result = await checkBreach(PASSWORD, { fetch })
    expect(result).toEqual({ status: 'ok', breachCount: 0, breached: false })
  })

  it('honours a custom threshold (below → not breached, at → breached)', async () => {
    const { fetch } = recordingFetch({ body: `${SUFFIX}:5\r\n` })
    expect(await checkBreach(PASSWORD, { fetch, threshold: 6 })).toEqual({
      status: 'ok',
      breachCount: 5,
      breached: false,
    })
    expect(await checkBreach(PASSWORD, { fetch, threshold: 5 })).toEqual({
      status: 'ok',
      breachCount: 5,
      breached: true,
    })
  })
})

describe('checkBreach — Add-Padding header', () => {
  it('sends Add-Padding: true by default', async () => {
    const { fetch, calls } = recordingFetch({ body: FOUND_BODY })
    await checkBreach(PASSWORD, { fetch })
    const headers = new Headers(calls[0]?.init?.headers)
    expect(headers.get('Add-Padding')).toBe('true')
  })

  it('omits Add-Padding when addPadding is false', async () => {
    const { fetch, calls } = recordingFetch({ body: FOUND_BODY })
    await checkBreach(PASSWORD, { fetch, addPadding: false })
    const headers = new Headers(calls[0]?.init?.headers)
    expect(headers.get('Add-Padding')).toBeNull()
  })

  it('passes an abort signal so timeoutMs can cancel the request', async () => {
    const { fetch, calls } = recordingFetch({ body: FOUND_BODY })
    await checkBreach(PASSWORD, { fetch, timeoutMs: 1234 })
    expect(calls[0]?.init?.signal).toBeInstanceOf(AbortSignal)
  })
})

describe('checkBreach — error mapping (never silently "safe")', () => {
  it('maps a timeout/abort to reason "timeout"', async () => {
    const timeoutErr = Object.assign(new Error('timed out'), { name: 'TimeoutError' })
    expect(await checkBreach(PASSWORD, { fetch: rejectingFetch(timeoutErr) })).toEqual({
      status: 'error',
      reason: 'timeout',
    })
    const abortErr = Object.assign(new Error('aborted'), { name: 'AbortError' })
    expect(await checkBreach(PASSWORD, { fetch: rejectingFetch(abortErr) })).toEqual({
      status: 'error',
      reason: 'timeout',
    })
  })

  it('maps a generic fetch rejection to reason "network" without leaking secrets', async () => {
    const result = await checkBreach(PASSWORD, {
      fetch: rejectingFetch(new Error('ECONNRESET')),
    })
    expect(result.status).toBe('error')
    if (result.status === 'error') {
      expect(result.reason).toBe('network')
      expect(result.detail ?? '').not.toContain(PASSWORD)
      expect(result.detail ?? '').not.toContain(FULL_HASH)
    }
  })

  it('maps HTTP 429 to reason "rate-limit"', async () => {
    const { fetch } = recordingFetch({ status: 429 })
    expect(await checkBreach(PASSWORD, { fetch })).toEqual({
      status: 'error',
      reason: 'rate-limit',
    })
  })

  it('maps other non-2xx responses to reason "http" with the status in detail', async () => {
    const { fetch } = recordingFetch({ status: 500 })
    const result = await checkBreach(PASSWORD, { fetch })
    expect(result.status).toBe('error')
    if (result.status === 'error') {
      expect(result.reason).toBe('http')
      expect(result.detail).toContain('500')
    }
  })

  it('maps a body read failure to reason "network"', async () => {
    const { fetch } = recordingFetch({ textThrows: true })
    expect(await checkBreach(PASSWORD, { fetch })).toEqual({
      status: 'error',
      reason: 'network',
    })
  })
})

describe('checkBreach — capability guard', () => {
  it('returns "unsupported" when no fetch is available', async () => {
    vi.stubGlobal('fetch', undefined)
    const result = await checkBreach(PASSWORD)
    expect(result).toMatchObject({ status: 'error', reason: 'unsupported' })
  })

  it('returns "unsupported" when crypto.subtle is unavailable', async () => {
    vi.stubGlobal('crypto', undefined)
    const { fetch } = recordingFetch({ body: FOUND_BODY })
    const result = await checkBreach(PASSWORD, { fetch })
    expect(result).toMatchObject({ status: 'error', reason: 'unsupported' })
  })

  it('falls back to the global fetch when no fetch option is given', async () => {
    const { fetch, calls } = recordingFetch({ body: FOUND_BODY })
    vi.stubGlobal('fetch', fetch)
    const result = await checkBreach(PASSWORD)
    expect(result).toEqual({ status: 'ok', breachCount: 9659365, breached: true })
    expect(calls).toHaveLength(1)
  })
})

describe('checkBreach — caching', () => {
  it('serves a cached prefix without hitting the network', async () => {
    const cache = createBreachCache()
    cache.set(PREFIX, `${SUFFIX}:777\r\n`)
    const { fetch, calls } = recordingFetch({ body: FOUND_BODY })
    const result = await checkBreach(PASSWORD, { fetch, cache })
    expect(result).toEqual({ status: 'ok', breachCount: 777, breached: true })
    expect(calls).toHaveLength(0)
  })

  it('stores the fetched body so a second call is served from cache', async () => {
    const cache = createBreachCache()
    const { fetch, calls } = recordingFetch({ body: FOUND_BODY })
    await checkBreach(PASSWORD, { fetch, cache })
    await checkBreach(PASSWORD, { fetch, cache })
    expect(calls).toHaveLength(1)
    expect(cache.get(PREFIX)).toBe(FOUND_BODY)
  })
})
