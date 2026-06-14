# @sentinel-password/breach

## 0.2.5

### Patch Changes

- [#211](https://github.com/akankov/sentinel-password/pull/211) [`818ae3c`](https://github.com/akankov/sentinel-password/commit/818ae3c3de286b7b6c03cb5e085eff7176c691ba) Thanks [@akankov](https://github.com/akankov)! - Security maintenance: pin esbuild to >= 0.28.1 via a pnpm override,
  closing the high-severity binary-integrity bypass (GHSA, Deno install
  path) and the low-severity Windows dev-server file-read advisory. esbuild
  is a build-time dev dependency only — published code is identical in
  behavior to the previous versions. The VitePress docs site build target
  was raised to es2022 since esbuild 0.28 no longer down-levels
  destructuring to the previous low target.

## 0.2.4

### Patch Changes

- [#196](https://github.com/akankov/sentinel-password/pull/196) [`275f4d4`](https://github.com/akankov/sentinel-password/commit/275f4d4bc69aca7888478bcf0b898c274db66cd8) Thanks [@akankov](https://github.com/akankov)! - Core correctness and type-design improvements.
  - **core:** `requireSymbol` now counts every printable non-alphanumeric ASCII
    character — including space, backtick (`` ` ``) and tilde (`~`) — matching
    `@sentinel-password/entropy`'s character-class counting. Previously these
    three were rejected, so e.g. `Abcdef1~` failed the symbol requirement.
  - **core:** the repetition validator iterates by Unicode code point, so runs of
    identical astral characters (e.g. repeated emoji) are detected instead of
    slipping through a UTF-16 code-unit scan.
  - **core:** `ValidatorCheck` is now a discriminated union on `passed` — the
    failure branch guarantees `message`/`code`/`params`, so consumers no longer
    need non-null assertions to read them.
  - **core:** `ValidationResult` gains `failures: ValidationFailure[]`, exposing
    each failing check's stable `code`/`params` from the zero-config
    `validatePassword` call (previously only pre-rendered English strings were
    surfaced via `feedback.suggestions`).
  - **entropy:** added `EntropyScore` as the canonical score type; `StrengthScore`
    is retained as a deprecated alias to avoid a name collision with core's
    `StrengthScore` when both packages are imported together.
  - **react-components:** `PasswordInput`'s `value`/`defaultValue` props are
    narrowed to `string` (a password field is always text).
  - **breach:** a misconfigured `threshold` (NaN, 0, or negative) now falls back
    to the default of `1` instead of silently reporting a pwned password as safe.

- [#195](https://github.com/akankov/sentinel-password/pull/195) [`fba8ca1`](https://github.com/akankov/sentinel-password/commit/fba8ca141d9fd0d66c76e0a4beca780833755c79) Thanks [@akankov](https://github.com/akankov)! - Packaging hygiene: ship a `LICENSE` file in every published tarball (previously
  only the repo root had one), declare `engines.node: ">=20"`, emit npm provenance
  intrinsically via `publishConfig.provenance` (so manual/first publishes match the
  CI flow), and use the canonical `git+https://….git` repository URL.

## 0.2.3

### Patch Changes

- [#191](https://github.com/akankov/sentinel-password/pull/191) [`8c721f9`](https://github.com/akankov/sentinel-password/commit/8c721f9eae9ed31aa564e83267096c2a03f9b459) Thanks [@akankov](https://github.com/akankov)! - chore: bump dependencies

  react 19.2.7, @types/react 19.2.16, vitest 4.1.8, @vitest/coverage-v8 4.1.8, storybook 10.4.2, vite 8.0.16, typescript-eslint 8.60.1, eslint-config-next 16.2.7, next 16.2.7

## 0.2.2

### Patch Changes

- [#186](https://github.com/akankov/sentinel-password/pull/186) [`7e3d814`](https://github.com/akankov/sentinel-password/commit/7e3d814a8d17493c3e06b6d0f711f8aa04f14db2) Thanks [@akankov](https://github.com/akankov)! - chore: bump development dependencies

  turbo 2.9.16, vitest 4.1.7, @vitest/coverage-v8 4.1.7, storybook 10.4.1, vite 8.0.14, typescript-eslint 8.60.0, eslint 10.4.1, tsx 4.22.4, vue 3.5.35, @types/node 25.9.1, @types/react 19.2.15

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
