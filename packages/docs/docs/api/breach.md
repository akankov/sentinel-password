# `@sentinel-password/breach`

Have I Been Pwned breach checking via **k-anonymity**. Zero runtime dependencies. **≤ 10 KB gzipped** (CI enforced).

This package complements [`@sentinel-password/core`](./core) but does **not** share types or runtime. Core answers _"does this password meet the rules?"_; breach answers _"has this exact password leaked in a known breach?"_. It is **async** (one network call) and **opt-in**. Consumers compose both explicitly.

## Installation

```bash
pnpm add @sentinel-password/breach
```

No peer dependencies. Requires global `fetch` and `crypto.subtle` — Node.js ≥ 20 or a modern browser. SHA-1 is mandated by the HIBP protocol; it is **not** used here as a security primitive.

## Quick start

```typescript
import { checkBreach } from '@sentinel-password/breach'

const result = await checkBreach(password)

if (result.status === 'error') {
  // The check could not complete (result.reason). It is NEVER silently
  // treated as "safe" — you choose: block submission, or allow and log.
} else if (result.breached) {
  // result.breachCount = appearances in the HIBP corpus
}
```

## Composing with `@sentinel-password/core`

The packages are intentionally decoupled. Compose them in user-land:

```typescript
import { validatePassword } from '@sentinel-password/core'
import { checkBreach } from '@sentinel-password/breach'

async function checkPassword(pwd: string, email: string) {
  const rule = validatePassword(pwd, { personalInfo: [email] })
  const pwned = await checkBreach(pwd)

  // Fail-closed: a degraded breach check rejects the password.
  const breachOk = pwned.status === 'ok' && !pwned.breached

  return {
    valid: rule.valid && breachOk,
    score: rule.score,
    suggestions: rule.feedback.suggestions,
    breachCount: pwned.status === 'ok' ? pwned.breachCount : undefined,
  }
}
```

## How k-anonymity works

1. `SHA1(password)` is computed locally and upper-cased to 40 hex chars.
2. Only the **first 5 chars** (the prefix) are sent: `GET https://api.pwnedpasswords.com/range/<prefix>`.
3. The API returns every `SUFFIX:COUNT` pair sharing that prefix (hundreds). The remaining 35 chars are matched **locally**.
4. The server never learns which password — or even which full hash — you queried. `Add-Padding: true` is sent by default so the response size can't leak how many suffixes share the prefix.

The password, full hash, and matched suffix never leave the process and are never logged.

## API

### `checkBreach(password, options?)`

```typescript
function checkBreach(password: string, options?: BreachOptions): Promise<BreachResult>
```

Never throws. An empty password short-circuits to a zero verdict with no hashing or network.

### `BreachOptions`

| Option       | Type              | Default  | Description                                                       |
| ------------ | ----------------- | -------- | ----------------------------------------------------------------- |
| `threshold`  | `number`          | `1`      | Exposure count at or above which `breached` is `true`.            |
| `addPadding` | `boolean`         | `true`   | Send the HIBP `Add-Padding: true` header.                         |
| `timeoutMs`  | `number`          | `5000`   | Abort the request after this many milliseconds.                   |
| `fetch`      | `typeof fetch`    | global   | `fetch` implementation (inject for proxies/agents or tests).      |
| `cache`      | `BreachCache`     | —        | Optional prefix-keyed response cache.                             |

### `BreachResult`

A discriminated union on `status`:

| `status === 'ok'` | Type                        | Description                              |
| ------------------ | --------------------------- | ---------------------------------------- |
| `breachCount`      | `number`                    | Appearances in the HIBP corpus (`0` if absent). |
| `breached`         | `boolean`                   | `breachCount >= threshold`.              |

| `status === 'error'` | Type                | Description                              |
| -------------------- | ------------------- | ---------------------------------------- |
| `reason`             | `BreachErrorReason` | `network` \| `timeout` \| `rate-limit` \| `http` \| `unsupported`. |
| `detail`             | `string?`           | Non-sensitive context. Never the password or hash. |

The error variant is **never** treated as "safe" — the caller decides fail-open vs fail-closed.

### `createBreachCache(maxEntries?)`

```typescript
function createBreachCache(maxEntries?: number): BreachCache
```

In-memory, FIFO-bounded cache (default `1024`) keyed by the 5-char prefix. One cached prefix serves every password whose hash starts with it. Stores only public range data — never a password or hash.

### `resolveBreachMessage` / `DEFAULT_BREACH_MESSAGES`

Optional decoupled i18n, mirroring core's `messages` / `formatMessage` mechanism but owned by this package — core's `MessageCode` union is untouched. `checkBreach` returns structured data; use this only when you want a rendered, translatable string.

```typescript
import { resolveBreachMessage } from '@sentinel-password/breach'

resolveBreachMessage('breach.found')
// → "This password has appeared in known data breaches. Choose a different one."
```

The default message is intentionally count-free (a logic-less template can't pluralize grammatically). The exact exposure count is on `BreachOk.breachCount`; interpolate it yourself via a `messages` or `formatMessage` override if you want it in the string.

## Server-side recommended

Call this from your **server**, not the browser:

- Client-side use exposes the k-anonymity prefix from every client and adds an external origin to your CSP / egress allowlist — a known enterprise adoption blocker.
- The API rate-limits; a server can cache (`createBreachCache`) and centralize.
- Keep the lookup where you already handle the plaintext password.

A runnable example lives in [`examples/express-backend`](https://github.com/akankov/sentinel-password/tree/main/examples/express-backend). See also the [Server-Side Usage guide](../guide/server-side).

## Stability

Public surface is the named exports above. The default threshold, timeout, `Add-Padding` behavior, and the single `breach.found` message code are frozen at v0.1.0 — changes require a minor version bump.

## Bundle size

Built artifact stays under **10 KB gzipped** (CI gate). To verify locally:

```bash
pnpm --filter @sentinel-password/breach build
gzip -c packages/breach/dist/index.js | wc -c
```
