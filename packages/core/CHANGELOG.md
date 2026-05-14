# @sentinel-password/core

## 1.2.1

### Patch Changes

- [#171](https://github.com/akankov/sentinel-password/pull/171) [`2ac3ef3`](https://github.com/akankov/sentinel-password/commit/2ac3ef3da778afba3313145fb20ec5508af9f746) Thanks [@akankov](https://github.com/akankov)! - Replace `validateKeyboardPattern`'s inline loop with a single precomputed
  regex. The previous implementation called `pattern.split('').reverse().join('')`
  on every invocation across ~80 multi-layout keyboard patterns, producing ~480
  redundant allocations per call. A single `RegExp` built once at module load
  with all 160 forward+reverse alternatives is **~53× faster** for the individual
  validator (117,000 → 6,150,000 ops/s) and propagates to **~10-15× speedup** on
  the full `validatePassword` pipeline.

  No public API change — same `passed`/`message`/`code`/`params` returned for
  every input. Bundle gains ~600 bytes gzipped (well under the 10 KB CI cap).

## 1.2.0

### Minor Changes

- [#162](https://github.com/akankov/sentinel-password/pull/162) [`43ef014`](https://github.com/akankov/sentinel-password/commit/43ef01485bbaf94f35fb958dddc10d43d1014fbc) Thanks [@akankov](https://github.com/akankov)! - Pluggable i18n message templates. Validators now emit a stable `code` and
  `params` alongside `message`, and `validatePassword` accepts two new options
  for localization:
  - `messages: Partial<Record<MessageCode, string>>` — partial template map
    keyed by stable codes. Templates support `{placeholder}` interpolation.
  - `formatMessage: (code, params, defaultMessage) => string` — escape hatch
    for `react-intl`, `i18next`, `lingui`, FormatJS/ICU, etc.

  Eight stable `MessageCode`s cover every validator failure:
  `length.tooShort`, `length.tooLong`, `characterTypes.missing`,
  `repetition.tooMany`, `sequential.found`, `keyboardPattern.found`,
  `commonPassword.found`, `personalInfo.found`. New `MessageCode`,
  `MessageParams`, `MessageFormatter` types and a `DEFAULT_TEMPLATES`
  constant are exported.

  ```typescript
  import { validatePassword } from '@sentinel-password/core'

  // Pattern 1: simple template overrides
  const result = validatePassword(password, {
    minLength: 12,
    messages: {
      'length.tooShort': 'La contraseña debe tener al menos {minLength} caracteres',
    },
  })

  // Pattern 2: integrate with an i18n library
  const result2 = validatePassword(password, {
    formatMessage: (code, params, defaultMessage) =>
      intl.formatMessage({ id: `sentinelPassword.${code}`, defaultMessage }, params),
  })
  ```

  `@sentinel-password/react`'s `usePasswordValidator` accepts the same
  options (transparent pass-through) and re-exports `MessageCode`,
  `MessageParams`, and `MessageFormatter` for ergonomic imports.

  Note: `@sentinel-password/react-components`' `PasswordInput` does
  **not** yet thread `ValidatorOptions` through to the underlying
  validator — it still calls `validatePassword(password)` with no
  options. Threading the new (and existing) `ValidatorOptions` through
  `PasswordInput` is planned for the next minor release alongside the
  toggle-button text props. Until then, drive validation with
  `usePasswordValidator` or `validatePassword` directly if you need
  custom messages.

  Fully backwards-compatible: the default English strings emitted on
  `ValidatorCheck.message` are unchanged, so existing apps using the
  lookup-table workaround documented in earlier releases keep working.

  See the [i18n guide](https://akankov.github.io/sentinel-password/guide/i18n)
  for full examples (Spanish catalog, `react-intl` integration,
  re-localizing `characterTypes` via `params.missingTypes`, ICU pluralization).

## 1.1.4

### Patch Changes

- [#157](https://github.com/akankov/sentinel-password/pull/157) [`f2005af`](https://github.com/akankov/sentinel-password/commit/f2005af0edd1ac1c5ef0cfbb9052c3c0da746b19) Thanks [@akankov](https://github.com/akankov)! - Align the JSDoc on `validatePassword` and the package README with the
  validator's real output.
  - The "weak password" JSDoc example claimed `validatePassword('password')`
    returns `score: 1, strength: 'weak'`. Actual output is `score: 4,
strength: 'very-strong'` — `'password'` fails only the common-password
    check, so 6 of 7 checks pass and the ratio-based scoring lands on 4. The
    example now shows the real numbers, and a new "Scoring" section in
    `@remarks` documents that `valid` and `strength` answer different
    questions: `valid` is for acceptance decisions, `strength` is a
    passed-check ratio meant for UX cues (progress bars etc.).
  - The Custom Requirements section in the package README listed
    `feedback.suggestions` strings that the validators don't emit
    (`'Add uppercase letters'`, `'Add numbers'`, etc.). Replaced with the
    actual three-suggestion output — the character-types validator returns
    one combined message naming every missing type, and the common-password
    check also fires for `'password'`.
  - Same kind of fix in the Individual Validators section: the README
    claimed `validateCharacterTypes(...).message` returns
    `'Add special characters (!@#$%^&*)'`; the real message is
    `'Password must contain at least one symbol'`.
  - The `@remarks` Security section claimed "Constant-time operations prevent
    timing attacks". The validators use early-return `includes()` and loops
    and are not constant-time. The claim was also misleading conceptually —
    this is a strength validator that compares the password against public
    patterns, not a password-comparison primitive, so timing is not a
    relevant attack surface. Replaced with an honest note pointing readers
    at Argon2/bcrypt for actual password verification.
  - npm `description` field said "90%+ test coverage, <5KB gzipped". Real
    coverage on core is 100% (statements/branches/functions/lines) and the
    gzipped bundle is ~5.5 KB under a 10 KB CI ceiling. Description updated
    to match measured reality.
  - "Browser Support" section was ambiguous about who the Node 18+ minimum
    applies to. Renamed to "Runtime Support" and made the scope explicit:
    Node 18+ is the _runtime_ minimum for the published package; building
    the monorepo requires Node 20+ per the repo-level `engines.node`.
    Added edge-runtime targets and a pointer to the Server-Side Usage guide.
  - Common-password detection now documents the Bloom filter tradeoff:
    no false negatives, ~0.84% false-positive rate (uncommon passwords are
    very rarely flagged as "common"). The source has documented this in
    `common-password.ts` since the validator landed; the README/API docs
    just hadn't carried the detail.
  - Keyboard-pattern detection section in the README now lists every
    layout the source actually covers — QWERTY, AZERTY, QWERTZ,
    Dvorak, Colemak, and Cyrillic — plus the numeric row and keypad
    patterns and the "shifted symbol row is not detected" caveat. The
    previous list ("QWERTY, AZERTY, and QWERTZ") undersold the
    detector for Dvorak/Colemak users and entirely omitted the
    Russian-keyboard catch, which is in `keyboard-pattern.ts`.
  - `validatePersonalInfo` JSDoc no longer mis-describes email handling.
    The old example claimed `'john123'` is rejected when `personalInfo`
    contains `'john.doe@example.com'`, "detects 'john' from email."
    Reality: `extractUsername` keeps the _entire local part_
    (`'john.doe'`) and matches as a literal substring, so `'john123'`
    doesn't match. Replaced with two corrected examples — one showing
    `'john.doe123'` matching the full local part, the other showing
    the explicit-`'john'` workaround for the name-fragment use case.
    Ships in the bundled `.d.ts`, surfaces at IDE hover.
  - Sequential-pattern detection is now described accurately on two
    axes:
    - It matches _any_ three consecutive ascending/descending runs,
      not just alphabet or digit — including less-obvious cases like
      `!"#`, `,-.`, or `9:;` (digit → punctuation).
    - The mechanism is `charCodeAt` deltas (UTF-16 code units), not
      Unicode code points. For the BMP (U+0000–U+FFFF) — every
      character a typical password uses — the two are identical, so
      the practical effect is "three consecutive code points."
      Supplementary-plane characters (emoji etc.) are split into
      surrogate pairs and don't trigger sequential detection.
      README and types comment updated so consumers can interpret
      rejection messages and the boundary case without surprise.
  - The "100% test coverage" claim is now _enforced_ rather than merely
    observed. `vitest.config.ts` adds 100% thresholds for statements,
    branches, functions, and lines; a `test:coverage` script runs in CI
    alongside the regular test step. The description field on npm now
    reads "(enforced)" so consumers know coverage is a contract, not a
    snapshot.

  No runtime behavior change.

- [#157](https://github.com/akankov/sentinel-password/pull/157) [`f2005af`](https://github.com/akankov/sentinel-password/commit/f2005af0edd1ac1c5ef0cfbb9052c3c0da746b19) Thanks [@akankov](https://github.com/akankov)! - Document the deliberate overlap between `validateSequential` and
  `validateKeyboardPattern` in their JSDoc.

  The numeric runs `123`, `456`, `789` (and their reverses `321`, `654`,
  `987`) are matched by _both_ validators — Sequential catches them as
  `charCodeAt`-consecutive triples, Keyboard Pattern catches them as
  numeric-keypad substrings (`KEYBOARD_PATTERNS` contains literal `'123'`,
  `'456'`, `'789'`). The two validators are intentionally independent
  defences, but the overlap can be surprising when a consumer sets
  `checkSequential: false` expecting `password123` to pass and finds it
  still rejected by `checkKeyboardPatterns` (default `true`). To accept
  simple numeric runs, both flags must be disabled.

  The Validators guide (`packages/docs/docs/guide/validators.md`) gets a
  matching warning callout in each section so the cross-reference is
  visible from both directions.

  No runtime change.

## 1.1.3

### Patch Changes

- [#155](https://github.com/akankov/sentinel-password/pull/155) [`303dd99`](https://github.com/akankov/sentinel-password/commit/303dd996487be759e08a88e25ab4ab3a70b879e3) Thanks [@akankov](https://github.com/akankov)! - Rebuild with refreshed toolchain devDependencies: `eslint` 10.2.1 → 10.3.0, `typescript-eslint` 8.59.1 → 8.59.2, `turbo` 2.9.8 → 2.9.9, `@changesets/changelog-github` 0.6.0 → 0.7.0. Example apps (`playground`, `vite-react`) also moved to ESLint 10 to align with the root; the Next.js example stays on ESLint 9 until `eslint-config-next` ships an ESLint 10 compatible plugin set. Published artifact bytes are unchanged; the provenance attestations attached to this release reflect the refreshed build environment and can be verified with `npm audit signatures`.

## 1.1.2

### Patch Changes

- [#152](https://github.com/akankov/sentinel-password/pull/152) [`57fe9ab`](https://github.com/akankov/sentinel-password/commit/57fe9ab7c0dcc792dfaf7772002625122a3e533f) Thanks [@akankov](https://github.com/akankov)! - Drop the redundant `esbuild` pnpm override added in 1.1.1. The `>=0.25.0` floor it provided is already required naturally by every direct consumer of esbuild in the dependency graph (vite, storybook, vitest, tsup), so the GHSA-67mh-4wv8-2f99 patch level is still enforced. Removing the override prevents lockfile regenerations from collapsing two compatible vite versions onto a single esbuild that breaks vitepress's build. Published artifact bytes are unchanged from 1.1.1; the provenance attestations attached to this release reflect the simplified pnpm configuration and can be verified with `npm audit signatures`.

## 1.1.1

### Patch Changes

- [#147](https://github.com/akankov/sentinel-password/pull/147) [`5831576`](https://github.com/akankov/sentinel-password/commit/5831576beb356dae2ac810574f6e807d0347fd86) Thanks [@akankov](https://github.com/akankov)! - Rebuild with hardened toolchain: the build pipeline now pins `esbuild >= 0.25.0` (closing GHSA-67mh-4wv8-2f99) and constrains transitive `vite` to `>= 6.4.2` via a pnpm override (closing GHSA-4w7w-66w2-5vf9 / CVE-2026-39365). Published artifact bytes are unchanged; the provenance attestations attached to this release reflect the patched build environment and can be verified with `npm audit signatures`.

## 1.1.0

### Minor Changes

- [#138](https://github.com/akankov/sentinel-password/pull/138) [`0adb392`](https://github.com/akankov/sentinel-password/commit/0adb3923f8530b1df79e66c591b9eac8a0ab9b7f) Thanks [@akankov](https://github.com/akankov)! - Publish pipeline now uses npm Trusted Publishing (OIDC) with provenance attestations enabled by default. Consumers can verify published packages with `npm audit signatures`. Release automation simplified — version bumps and publishes trigger automatically from merges to main, no manual workflow dispatch required.

## 1.0.1

### Patch Changes

- [#103](https://github.com/akankov/sentinel-password/pull/103) [`bb49910`](https://github.com/akankov/sentinel-password/commit/bb49910b0d7a3e41acdbd730875bf9e1b58f4874) Thanks [@akankov](https://github.com/akankov)! - chore: update all dependencies to latest versions

## 1.0.0

### Major Changes

- [#120](https://github.com/akankov/sentinel-password/pull/120) [`b394e9d`](https://github.com/akankov/sentinel-password/commit/b394e9d79d86c59bdb9a9aa48154b44643898446) Thanks [@akankov](https://github.com/akankov)! - Release v1.0.0 — first stable release.

  Zero-dependency TypeScript password validation with React integration. Includes 7 built-in validators, bloom filter-based common password detection, headless accessible components, and comprehensive documentation.

## 0.4.6

### Patch Changes

- [#118](https://github.com/akankov/sentinel-password/pull/118) [`e50ee82`](https://github.com/akankov/sentinel-password/commit/e50ee82a5b30739874b943d1f31d76c5b327a439) Thanks [@akankov](https://github.com/akankov)! - Add comparative benchmarks against zxcvbn, check-password-strength, and password-validator. Make bloom filter generation reproducible with tracked password list and generation script.

## 0.4.5

### Patch Changes

- Add documentation site and playground links to package READMEs

## 0.4.4

### Patch Changes

- Update to TypeScript 6.0 and typescript-eslint 8.58

## 0.4.3

### Patch Changes

- Update homepage links in package metadata to point to the documentation site and playground

## 0.4.2

### Patch Changes

- [#103](https://github.com/akankov/sentinel-password/pull/103) [`bb49910`](https://github.com/akankov/sentinel-password/commit/bb49910b0d7a3e41acdbd730875bf9e1b58f4874) Thanks [@akankov](https://github.com/akankov)! - Update development dependencies: ESLint 10, Turbo 2.9, Vitest 4.1.2

## 0.4.1

### Patch Changes

- [#91](https://github.com/akankov/sentinel-password/pull/91) [`1196993`](https://github.com/akankov/sentinel-password/commit/1196993adb762eeb5549d2888e4f7c24ee4efcd7) Thanks [@akankov](https://github.com/akankov)! - Update dependencies for minor release

## 0.4.0

### Minor Changes

- [#84](https://github.com/akankov/sentinel-password/pull/84) [`e179fea`](https://github.com/akankov/sentinel-password/commit/e179fea1e2d324c30374a41e41842e447bed34d7) Thanks [@akankov](https://github.com/akankov)! - Update workspace dependencies to current compatible versions and refresh lockfile.

  This release also updates tooling across examples and docs to keep local development aligned with the latest ecosystem updates.

## 0.3.0

### Minor Changes

- [#84](https://github.com/akankov/sentinel-password/pull/84) [`0599661`](https://github.com/akankov/sentinel-password/commit/0599661799f62dbb6a8e57d1d6a4639e3e836fcc) Thanks [@akankov](https://github.com/akankov)! - Update workspace dependencies to current compatible versions and refresh lockfile.

  This release also updates tooling across examples and docs to keep local development aligned with the latest ecosystem updates.

## 0.2.0

### Minor Changes

- [#77](https://github.com/akankov/sentinel-password/pull/77) [`d1fb2fe`](https://github.com/akankov/sentinel-password/commit/d1fb2fe5a5c943b21f4930cdb27daca58db8392a) Thanks [@akankov](https://github.com/akankov)! - Chores. Update dependencies

## 0.1.3

### Patch Changes

- # Release v0.1.0 - MVP Release

  ## Core Package

  ### Features
  - Add comprehensive integration tests for user workflows (21 tests)
  - Add performance benchmarks (20+ benchmarks, 47K-2.2M ops/sec)
  - Add interactive examples and playground

  ### Security Fixes
  - Fix esbuild CORS vulnerability (CVE-2025-0216) - update to >= 0.25.0
  - Fix potential ReDoS vulnerability in sequential pattern validator

  ### Documentation
  - Fix API examples to match actual implementation
  - Add VitePress documentation site

  ### Quality
  - 100% statement coverage, 98.34% branch coverage
  - 209 tests total (188 unit + 21 integration)
  - Zero security vulnerabilities
  - Bundle size: 5.41 KB gzipped

  ## React Package

  ### Features
  - usePasswordValidator hook with debouncing support
  - Manual validation and reset functions
  - Loading states for better UX

  ### Quality
  - 97.82% test coverage (22 tests)
  - 0.66 KB gzipped
  - Full TypeScript support

  ## React Components Package

  ### Features
  - Headless PasswordInput component
  - WCAG 2.1 AAA accessibility compliance
  - Controlled and uncontrolled modes
  - Show/hide password toggle
  - Comprehensive keyboard navigation

  ### Quality
  - 94.02% test coverage (26 tests)
  - 1.69 KB gzipped
  - Full ARIA support

## Unreleased

### Minor Changes

- [#37](https://github.com/akankov/sentinel-password/pull/37) - Add comprehensive integration tests for user workflows
  - Add 21 integration tests covering real-world scenarios
  - Test signup flows, login flows, password resets, enterprise policies
  - Test edge cases, boundaries, and configuration combinations
  - Total test count: 209 tests (188 unit + 21 integration)

- [#35](https://github.com/akankov/sentinel-password/pull/35) - Add performance benchmarks
  - Add 20+ performance benchmarks using Vitest bench
  - Full validation: 47K-2.2M ops/sec
  - Individual validators: 137K-32.6M ops/sec
  - Bloom filter: 13.6M ops/sec
  - Add `pnpm bench` script

### Patch Changes

- [#36](https://github.com/akankov/sentinel-password/pull/36) - Fix API documentation examples to match actual implementation
  - Fix core API examples (flat options vs nested validators)
  - Fix `result.isValid` → `result.valid`
  - Fix `errors` → `result.feedback.suggestions`

- [#34](https://github.com/akankov/sentinel-password/pull/34) - Update esbuild to resolve CORS vulnerability (CVE-2025-0216)
  - Add pnpm override for `esbuild >= 0.25.0`
  - Resolve Dependabot security alert

- [#33](https://github.com/akankov/sentinel-password/pull/33) - Address code scanning security alerts
  - Fix potential ReDoS vulnerability in sequential pattern validator
  - Replace complex regex with constant-time algorithm
  - Add additional security tests

## 0.1.2

### Patch Changes

- [#23](https://github.com/akankov/sentinel-password/pull/23) [`4f17125`](https://github.com/akankov/sentinel-password/commit/4f1712500393c43efdf215e4ff1b26d89706c18d) Thanks [@akankov](https://github.com/akankov)! - Update release scripts

## 0.1.1

### Patch Changes

- [#16](https://github.com/akankov/sentinel-password/pull/16) [`b073d5d`](https://github.com/akankov/sentinel-password/commit/b073d5d6dff7e93ff37293d2448f989bf570b797) Thanks [@akankov](https://github.com/akankov)! - Test automated release workflow

- [#18](https://github.com/akankov/sentinel-password/pull/18) [`9fc5f90`](https://github.com/akankov/sentinel-password/commit/9fc5f90060dd074b906919b63cba038a68a997b2) Thanks [@akankov](https://github.com/akankov)! - Test automated release workflow
