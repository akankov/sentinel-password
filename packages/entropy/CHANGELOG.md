# @sentinel-password/entropy

## 0.3.0

### Minor Changes

- [#249](https://github.com/akankov/sentinel-password/pull/249) [`50aa239`](https://github.com/akankov/sentinel-password/commit/50aa2393b92e4af02b45d4575deed4c8caf9a4cd) Thanks [@akankov](https://github.com/akankov)! - Require Node.js 22 or later.

  `engines.node` moves from `>=20` to `>=22` across every package. Node 20 reached
  end-of-life in April 2026 and no longer receives security updates, and the CI
  matrix now runs 22, 24 and 26.

  The compiled output is unchanged — it is still plain ES2022 with no
  Node-specific APIs, so it will keep working on older runtimes in practice. What
  changes is the declared support floor: on Node 20 or below, npm and pnpm now
  emit an engine warning, and installs fail outright under `engine-strict`.

  If you are still on Node 20, stay on the previous release until you can upgrade.

## 0.2.1

### Patch Changes

- [#211](https://github.com/akankov/sentinel-password/pull/211) [`818ae3c`](https://github.com/akankov/sentinel-password/commit/818ae3c3de286b7b6c03cb5e085eff7176c691ba) Thanks [@akankov](https://github.com/akankov)! - Security maintenance: pin esbuild to >= 0.28.1 via a pnpm override,
  closing the high-severity binary-integrity bypass (GHSA, Deno install
  path) and the low-severity Windows dev-server file-read advisory. esbuild
  is a build-time dev dependency only — published code is identical in
  behavior to the previous versions. The VitePress docs site build target
  was raised to es2022 since esbuild 0.28 no longer down-levels
  destructuring to the previous low target.

## 0.2.0

### Minor Changes

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

### Patch Changes

- [#195](https://github.com/akankov/sentinel-password/pull/195) [`fba8ca1`](https://github.com/akankov/sentinel-password/commit/fba8ca141d9fd0d66c76e0a4beca780833755c79) Thanks [@akankov](https://github.com/akankov)! - Packaging hygiene: ship a `LICENSE` file in every published tarball (previously
  only the repo root had one), declare `engines.node: ">=20"`, emit npm provenance
  intrinsically via `publishConfig.provenance` (so manual/first publishes match the
  CI flow), and use the canonical `git+https://….git` repository URL.

## 0.1.3

### Patch Changes

- [#191](https://github.com/akankov/sentinel-password/pull/191) [`8c721f9`](https://github.com/akankov/sentinel-password/commit/8c721f9eae9ed31aa564e83267096c2a03f9b459) Thanks [@akankov](https://github.com/akankov)! - chore: bump dependencies

  react 19.2.7, @types/react 19.2.16, vitest 4.1.8, @vitest/coverage-v8 4.1.8, storybook 10.4.2, vite 8.0.16, typescript-eslint 8.60.1, eslint-config-next 16.2.7, next 16.2.7

## 0.1.2

### Patch Changes

- [#186](https://github.com/akankov/sentinel-password/pull/186) [`7e3d814`](https://github.com/akankov/sentinel-password/commit/7e3d814a8d17493c3e06b6d0f711f8aa04f14db2) Thanks [@akankov](https://github.com/akankov)! - chore: bump development dependencies

  turbo 2.9.16, vitest 4.1.7, @vitest/coverage-v8 4.1.7, storybook 10.4.1, vite 8.0.14, typescript-eslint 8.60.0, eslint 10.4.1, tsx 4.22.4, vue 3.5.35, @types/node 25.9.1, @types/react 19.2.15

## 0.1.1

### Patch Changes

- [#180](https://github.com/akankov/sentinel-password/pull/180) [`3ab2486`](https://github.com/akankov/sentinel-password/commit/3ab248644b9991bda54c5d712103112a5c3a670c) Thanks [@akankov](https://github.com/akankov)! - chore: bump development dependencies

  turbo 2.9.14, vitest 4.1.6, storybook 10.4.0, vite 8.0.13, typescript-eslint 8.59.3, tsx 4.22.1, @vitejs/plugin-react 6.0.2, @types/node 25.8.0

## 0.1.0

### Minor Changes

- [#166](https://github.com/akankov/sentinel-password/pull/166) [`b13431d`](https://github.com/akankov/sentinel-password/commit/b13431d6974d4677a1a28836a7902bcda04e5e8d) Thanks [@akankov](https://github.com/akankov)! - Initial release of `@sentinel-password/entropy` (v0.1.0) — a standalone
  Shannon-entropy estimator with dictionary, l33t, and pattern detection. Zero
  runtime dependencies. ≤ 30 KB gzipped, enforced in CI alongside core's 10 KB
  gate.

  ```typescript
  import { estimateEntropy } from '@sentinel-password/entropy'

  const result = estimateEntropy('Tr0ub4dor&3')
  // {
  //   bits: ~28,
  //   score: 1,
  //   crackTime: {
  //     onlineThrottled:   { seconds: 6.5e6, display: '2 months' },
  //     onlineUnthrottled: { seconds: 1.8e4, display: '5 hours' },
  //     offlineSlowHash:   { seconds: 18,    display: 'less than a minute' },
  //     offlineFastHash:   { seconds: 0.018, display: 'instant' },
  //   },
  //   patterns: ['l33t', 'capitalization'],
  // }
  ```

  The package is intentionally decoupled from `@sentinel-password/core`: it
  shares no types or runtime, and consumers compose the two explicitly. Core
  stays synchronous, zero-dependency, and ≤ 10 KB; entropy adds the orthogonal
  "how long would this survive a brute-force attack?" signal.

  **What it detects:**
  - Sequences (`abc`, `123`, `qwerty`)
  - Repetitions (`aaaa`, `abab`)
  - 12 K-word dictionary (built-in, via bloom filter at ~0.3% FP rate)
  - L33t-substituted dictionary matches (`p@ssw0rd` → `password`)
  - Initial-capital styling
  - `personalInfo` substring matches (forces `bits: 0`)

  **Crack-time estimates** under four standard attacker models:
  `onlineThrottled` (100/hour), `onlineUnthrottled` (10/sec), `offlineSlowHash`
  (10⁴/sec, bcrypt-class), `offlineFastHash` (10¹⁰/sec, raw GPU).

  **What it deliberately doesn't include:**
  - No async API or integration into `validatePassword`. Core stays sync; a
    future opt-in async surface can land in a separate plan.
  - No frequency weighting on dictionary matches — every entry is treated as
    equiprobable (~13.9 bits per match). Trade-off for the bundle budget.
  - No dynamic-programming partition search (zxcvbn-style). Greedy left-to-right
    pattern walk instead.

  The algorithm is simpler and the bundle smaller than zxcvbn (~30 KB vs
  ~400 KB), targeted at apps that need a meaningful entropy signal without the
  weight.
