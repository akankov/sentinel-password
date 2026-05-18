# @sentinel-password/breach

## 0.2.1

### Patch Changes

- [#180](https://github.com/akankov/sentinel-password/pull/180) [`3ab2486`](https://github.com/akankov/sentinel-password/commit/3ab248644b9991bda54c5d712103112a5c3a670c) Thanks [@akankov](https://github.com/akankov)! - chore: bump development dependencies

  turbo 2.9.14, vitest 4.1.6, storybook 10.4.0, vite 8.0.13, typescript-eslint 8.59.3, tsx 4.22.1, @vitejs/plugin-react 6.0.2, @types/node 25.8.0

## 0.2.0

### Minor Changes

- [#175](https://github.com/akankov/sentinel-password/pull/175) [`558c599`](https://github.com/akankov/sentinel-password/commit/558c599b9eb4543007828938b79ef877c6575596) Thanks [@akankov](https://github.com/akankov)! - Initial release of `@sentinel-password/breach` (v0.1.0) — standalone, opt-in
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
