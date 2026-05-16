---
'@sentinel-password/breach': minor
---

Initial release of `@sentinel-password/breach` (v0.1.0) — standalone, opt-in
Have I Been Pwned breach checking via the k-anonymity model. The password is
SHA-1 hashed locally (Web Crypto) and only the first 5 hex characters of the
digest are sent to the Pwned Passwords range API; the password, full hash, and
matched suffix never leave the process and are never logged.

Zero runtime dependencies. ≤ 10 KB gzipped, enforced in CI alongside core's
10 KB and entropy's 30 KB gates. Requires global `fetch` + `crypto.subtle`
(Node.js ≥ 20 or a modern browser).

Decoupled from `@sentinel-password/core` (no shared types or runtime) — compose
the two explicitly, mirroring the `@sentinel-password/entropy` pattern.

- `checkBreach(password, options?)` — async; never throws and never silently
  reports "safe". Resolves to a discriminated union
  `{ status: 'ok', breachCount, breached } | { status: 'error', reason, detail? }`
  so the caller explicitly decides fail-open vs fail-closed. Empty password
  short-circuits with no hashing or network. Options: `threshold` (default 1),
  `addPadding` (default true), `timeoutMs` (default 5000), injectable `fetch`,
  optional `cache`.
- `createBreachCache(maxEntries?)` — in-memory, FIFO-bounded, prefix-keyed
  response cache (stores only public range data).
- `resolveBreachMessage` / `DEFAULT_BREACH_MESSAGES` — optional decoupled i18n
  mirroring core's `messages` / `formatMessage` mechanism; core's `MessageCode`
  union is untouched.

Recommended for server-side use (a runnable example is wired into
`examples/express-backend`). Does not include a sync API, a React hook, an
offline breach database, or retry/backoff — composition and policy are left to
the consumer.
