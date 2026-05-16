/**
 * Public types for `@sentinel-password/breach`.
 *
 * These types do NOT share runtime or import paths with `@sentinel-password/core`.
 * Consumers compose the two packages explicitly.
 */

/**
 * A prefix-keyed response cache. Keys are the 5-hex-char SHA-1 prefix sent to
 * the Pwned Passwords range API; values are the raw `SUFFIX:COUNT` response
 * body. No password or full hash is ever stored.
 */
export interface BreachCache {
  get(prefix: string): string | undefined
  set(prefix: string, body: string): void
}

/** Stable message code(s) emitted by this package. Decoupled from core. */
export type BreachMessageCode = 'breach.found'

/** Interpolation values for a message template. */
export type BreachMessageParams = Readonly<Record<string, string | number | undefined>>

/**
 * Consumer-supplied renderer. Receives the code, params, and the built-in
 * English rendering; returns the final string. If it throws, the default
 * English message is used instead.
 */
export type BreachMessageFormatter = (
  code: BreachMessageCode,
  params: BreachMessageParams,
  defaultMessage: string
) => string

/** i18n hooks, mirrored from core's mechanism but owned by this package. */
export interface BreachMessageOptions {
  /** Per-code template overrides. Templates use `{name}` placeholders. */
  readonly messages?: Partial<Record<BreachMessageCode, string>>
  /** Full control over rendering. Takes precedence over `messages`. */
  readonly formatMessage?: BreachMessageFormatter
}

/** Why a breach check could not produce a verdict. */
export type BreachErrorReason =
  | 'network' // fetch threw (DNS, connection reset, CORS, …)
  | 'timeout' // aborted by `timeoutMs`
  | 'rate-limit' // HTTP 429 from the Pwned Passwords API
  | 'http' // any other non-2xx response
  | 'unsupported' // no global `fetch` or `crypto.subtle` in this runtime

export interface BreachOptions {
  /**
   * Exposure count at or above which `breached` is `true`. Default `1` (any
   * appearance counts). Raise it to tolerate low-frequency hits.
   */
  readonly threshold?: number
  /**
   * Send the HIBP `Add-Padding: true` request header so the response size does
   * not leak how many suffixes share the prefix. Default `true`.
   */
  readonly addPadding?: boolean
  /** Abort the request after this many milliseconds. Default `5000`. */
  readonly timeoutMs?: number
  /**
   * `fetch` implementation. Defaults to the global `fetch`. Inject for custom
   * agents/proxies or for tests (no real network required).
   */
  readonly fetch?: typeof fetch
  /** Optional prefix-keyed response cache. See {@link BreachCache}. */
  readonly cache?: BreachCache
}

/** A successful verdict. */
export interface BreachOk {
  readonly status: 'ok'
  /** Times this exact password appears in the HIBP corpus (`0` if absent). */
  readonly breachCount: number
  /** `breachCount >= threshold`. */
  readonly breached: boolean
}

/**
 * The check could not complete. Never silently treated as "safe" — the
 * consumer decides fail-open vs fail-closed. `detail` never contains the
 * password or its hash.
 */
export interface BreachError {
  readonly status: 'error'
  readonly reason: BreachErrorReason
  readonly detail?: string
}

export type BreachResult = BreachOk | BreachError
