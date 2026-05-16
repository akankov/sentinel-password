# @sentinel-password/breach

Have I Been Pwned breach checking via **k-anonymity**, for
[sentinel-password](https://github.com/akankov/sentinel-password). Zero runtime
dependencies. ≤ 10 KB gzipped (CI enforced).

The password is SHA-1 hashed locally and **only the first 5 hex characters of
the digest are sent** to the Pwned Passwords range API. The password, the full
hash, and the matched suffix never leave the process and are never logged.

## Installation

```bash
pnpm add @sentinel-password/breach
```

Requires a runtime with global `fetch` and `crypto.subtle` — Node.js ≥ 20 or a
modern browser. (SHA-1 is mandated by the HIBP protocol; it is not used here as
a security primitive.)

## Quick start

```typescript
import { checkBreach } from '@sentinel-password/breach'

const result = await checkBreach(password)

if (result.status === 'error') {
  // The check could not complete — see result.reason. It is NEVER silently
  // treated as "safe". You decide: block submission, or allow and log.
} else if (result.breached) {
  console.log(`Seen ${result.breachCount} times in known breaches`)
}
```

## Composition with `@sentinel-password/core`

This package shares no types or runtime with core. Compose them explicitly:

```typescript
import { validatePassword } from '@sentinel-password/core'
import { checkBreach } from '@sentinel-password/breach'

async function evaluate(password: string) {
  const rule = validatePassword(password)
  const pwned = await checkBreach(password)

  // Fail-closed example: a degraded breach check blocks the password.
  // Swap to fail-open by treating status === 'error' as acceptable.
  const breachOk = pwned.status === 'ok' && !pwned.breached

  return { accepted: rule.valid && breachOk, rule, pwned }
}
```

## How k-anonymity works

1. `SHA1(password)` is computed locally and upper-cased to 40 hex chars.
2. Only the **first 5 chars** (the prefix) are sent:
   `GET https://api.pwnedpasswords.com/range/<prefix>`.
3. The API returns every `SUFFIX:COUNT` pair sharing that prefix (hundreds of
   them). The remaining 35 chars are matched **locally**.
4. The server never learns which password — or even which full hash — you
   asked about. `Add-Padding: true` is sent by default so the response size
   doesn't leak how many suffixes share the prefix.

## API

### `checkBreach(password, options?): Promise<BreachResult>`

Never throws. Resolves to a discriminated union:

- `{ status: 'ok', breachCount, breached }` — `breached` is
  `breachCount >= threshold`.
- `{ status: 'error', reason, detail? }` — `reason` is one of `network`,
  `timeout`, `rate-limit`, `http`, `unsupported`. `detail` never contains the
  password or its hash.

An empty password short-circuits to a zero verdict with no hashing or network.

#### Options

| Option       | Default | Description                                                        |
| ------------ | ------- | ------------------------------------------------------------------ |
| `threshold`  | `1`     | Exposure count at or above which `breached` is `true`.             |
| `addPadding` | `true`  | Send the HIBP `Add-Padding: true` header.                          |
| `timeoutMs`  | `5000`  | Abort the request after this many milliseconds.                    |
| `fetch`      | global  | `fetch` implementation (inject for proxies/agents or tests).       |
| `cache`      | —       | Optional prefix-keyed response cache (see `createBreachCache`).     |

### `createBreachCache(maxEntries?): BreachCache`

In-memory, FIFO-bounded cache keyed by the 5-char prefix. One cached prefix
serves every password whose hash starts with it. Stores only public range
data — never a password or hash.

### `resolveBreachMessage(code, params, options?)` / `DEFAULT_BREACH_MESSAGES`

Optional decoupled i18n, mirroring core's `messages` / `formatMessage`
mechanism but owned by this package (core's `MessageCode` union is untouched).
`checkBreach` returns structured data; use this only if you want a rendered,
translatable string.

## Server-side recommended

HIBP best practice is to call this **from your server**, not the browser:

- Calling from the browser exposes the k-anonymity prefix from every client and
  adds an external origin to your CSP / egress allowlist — a known enterprise
  adoption blocker.
- The API has rate limits; a server can cache and centralize.
- Privacy: even with k-anonymity, keep the lookup server-side where you already
  handle the password.

A runnable server example lives in `examples/express-backend`.

## Bundle size

CI fails if `dist/index.js` exceeds 10 KB gzipped. Check locally:

```bash
pnpm --filter @sentinel-password/breach build
gzip -c packages/breach/dist/index.js | wc -c   # must be <= 10240
```

## License

MIT. See the repository root `LICENSE`.
