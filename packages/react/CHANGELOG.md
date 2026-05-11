# Changelog

## 1.3.0

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

### Patch Changes

- Updated dependencies [[`43ef014`](https://github.com/akankov/sentinel-password/commit/43ef01485bbaf94f35fb958dddc10d43d1014fbc)]:
  - @sentinel-password/core@1.2.0

## 1.2.0

### Minor Changes

- [#157](https://github.com/akankov/sentinel-password/pull/157) [`f2005af`](https://github.com/akankov/sentinel-password/commit/f2005af0edd1ac1c5ef0cfbb9052c3c0da746b19) Thanks [@akankov](https://github.com/akankov)! - Add `initialPassword` option to `usePasswordValidator` so the hook can be
  seeded with a non-empty value on mount (e.g. password-reset or edit-profile
  flows that echo a value back to the user).

  This fills a real API gap: `validateOnMount` already existed but was
  documented as a no-op because the hook hard-initialized `password` to `''`
  and the mount effect only ran when `password.length > 0`. With
  `initialPassword`, `validateOnMount: true` now does what its name implies —
  validates the seeded value on first render. The input stays fully
  controlled by `setPassword` afterwards.

  ```tsx
  const { password, setPassword, result } = usePasswordValidator({
    initialPassword: existingPassword,
    validateOnMount: true,
    minLength: 8,
  })
  // `result` is populated on first render with the validation of
  // `existingPassword`; subsequent edits go through `setPassword`.
  ```

  Backwards-compatible: `initialPassword` defaults to `''`, so the hook
  still starts empty unless the caller opts in, and `validateOnMount`
  remains a no-op when the seed is empty.

### Patch Changes

- [#157](https://github.com/akankov/sentinel-password/pull/157) [`f2005af`](https://github.com/akankov/sentinel-password/commit/f2005af0edd1ac1c5ef0cfbb9052c3c0da746b19) Thanks [@akankov](https://github.com/akankov)! - Align package metadata and runtime deps with what's actually exported.
  - `@sentinel-password/react`: description, keywords, and the bundled `.d.ts` header
    no longer claim the package ships components — it only exports the
    `usePasswordValidator` hook.
  - `@sentinel-password/react-components`: removed the unused
    `@sentinel-password/react` runtime dependency (the package never imported it),
    and the README no longer claims the components are "built on" it. The
    components import `validatePassword` directly from `@sentinel-password/core`.
    Consumers now install one fewer transitive package.
  - `@sentinel-password/react` README install command no longer asks consumers to
    install `@sentinel-password/core` alongside the React package. Core is a
    regular `dependency` (not a peer) of `@sentinel-password/react`, so package
    managers pull it in transitively — the old `npm install @sentinel-password/
react @sentinel-password/core` form was redundant and implied a peer-dep
    relationship that doesn't exist.
  - `usePasswordValidator` JSDoc + the `validateOnMount` / `validateOnChange`
    JSDoc in `types.ts` now honestly describe current behavior. `validateOnMount`
    is documented as a no-op (the hook initializes `password` to `''` and there
    is no `initialPassword` option, so the gate `password.length > 0` is never
    true on mount); the example shows the workaround of calling `validatePassword`
    from core directly. `validateOnChange` carries the full behavior matrix
    matching the README/docs-site fix from claim [#6](https://github.com/akankov/sentinel-password/issues/6). These JSDoc strings ship
    in the bundled `.d.ts` and surface in IDE IntelliSense for hook users.
  - README's `setPassword` row no longer says it "triggers validation" outright.
    In manual mode (`debounceMs: 0` + `validateOnChange: false`) `setPassword`
    only updates state — the validate-on-change branches in
    `usePasswordValidator.ts:155-173` don't run. Row now points at the
    `debounceMs` / `validateOnChange` rows for the matrix and notes the
    `validate()` workaround for manual mode.

- Updated dependencies [[`f2005af`](https://github.com/akankov/sentinel-password/commit/f2005af0edd1ac1c5ef0cfbb9052c3c0da746b19), [`f2005af`](https://github.com/akankov/sentinel-password/commit/f2005af0edd1ac1c5ef0cfbb9052c3c0da746b19)]:
  - @sentinel-password/core@1.1.4

## 1.1.3

### Patch Changes

- [#155](https://github.com/akankov/sentinel-password/pull/155) [`303dd99`](https://github.com/akankov/sentinel-password/commit/303dd996487be759e08a88e25ab4ab3a70b879e3) Thanks [@akankov](https://github.com/akankov)! - Rebuild with refreshed toolchain devDependencies: `eslint` 10.2.1 → 10.3.0, `typescript-eslint` 8.59.1 → 8.59.2, `turbo` 2.9.8 → 2.9.9, `@changesets/changelog-github` 0.6.0 → 0.7.0. Example apps (`playground`, `vite-react`) also moved to ESLint 10 to align with the root; the Next.js example stays on ESLint 9 until `eslint-config-next` ships an ESLint 10 compatible plugin set. Published artifact bytes are unchanged; the provenance attestations attached to this release reflect the refreshed build environment and can be verified with `npm audit signatures`.

- Updated dependencies [[`303dd99`](https://github.com/akankov/sentinel-password/commit/303dd996487be759e08a88e25ab4ab3a70b879e3)]:
  - @sentinel-password/core@1.1.3

## 1.1.2

### Patch Changes

- [#152](https://github.com/akankov/sentinel-password/pull/152) [`57fe9ab`](https://github.com/akankov/sentinel-password/commit/57fe9ab7c0dcc792dfaf7772002625122a3e533f) Thanks [@akankov](https://github.com/akankov)! - Drop the redundant `esbuild` pnpm override added in 1.1.1. The `>=0.25.0` floor it provided is already required naturally by every direct consumer of esbuild in the dependency graph (vite, storybook, vitest, tsup), so the GHSA-67mh-4wv8-2f99 patch level is still enforced. Removing the override prevents lockfile regenerations from collapsing two compatible vite versions onto a single esbuild that breaks vitepress's build. Published artifact bytes are unchanged from 1.1.1; the provenance attestations attached to this release reflect the simplified pnpm configuration and can be verified with `npm audit signatures`.

- Updated dependencies [[`57fe9ab`](https://github.com/akankov/sentinel-password/commit/57fe9ab7c0dcc792dfaf7772002625122a3e533f)]:
  - @sentinel-password/core@1.1.2

## 1.1.1

### Patch Changes

- [#147](https://github.com/akankov/sentinel-password/pull/147) [`5831576`](https://github.com/akankov/sentinel-password/commit/5831576beb356dae2ac810574f6e807d0347fd86) Thanks [@akankov](https://github.com/akankov)! - Rebuild with hardened toolchain: the build pipeline now pins `esbuild >= 0.25.0` (closing GHSA-67mh-4wv8-2f99) and constrains transitive `vite` to `>= 6.4.2` via a pnpm override (closing GHSA-4w7w-66w2-5vf9 / CVE-2026-39365). Published artifact bytes are unchanged; the provenance attestations attached to this release reflect the patched build environment and can be verified with `npm audit signatures`.

- Updated dependencies [[`5831576`](https://github.com/akankov/sentinel-password/commit/5831576beb356dae2ac810574f6e807d0347fd86)]:
  - @sentinel-password/core@1.1.1

## 1.1.0

### Minor Changes

- [#138](https://github.com/akankov/sentinel-password/pull/138) [`0adb392`](https://github.com/akankov/sentinel-password/commit/0adb3923f8530b1df79e66c591b9eac8a0ab9b7f) Thanks [@akankov](https://github.com/akankov)! - Publish pipeline now uses npm Trusted Publishing (OIDC) with provenance attestations enabled by default. Consumers can verify published packages with `npm audit signatures`. Release automation simplified — version bumps and publishes trigger automatically from merges to main, no manual workflow dispatch required.

### Patch Changes

- Updated dependencies [[`0adb392`](https://github.com/akankov/sentinel-password/commit/0adb3923f8530b1df79e66c591b9eac8a0ab9b7f)]:
  - @sentinel-password/core@1.1.0

## 1.0.1

### Patch Changes

- [#103](https://github.com/akankov/sentinel-password/pull/103) [`bb49910`](https://github.com/akankov/sentinel-password/commit/bb49910b0d7a3e41acdbd730875bf9e1b58f4874) Thanks [@akankov](https://github.com/akankov)! - chore: update all dependencies to latest versions

- Updated dependencies [[`bb49910`](https://github.com/akankov/sentinel-password/commit/bb49910b0d7a3e41acdbd730875bf9e1b58f4874)]:
  - @sentinel-password/core@1.0.1

## 1.0.0

### Major Changes

- [#120](https://github.com/akankov/sentinel-password/pull/120) [`b394e9d`](https://github.com/akankov/sentinel-password/commit/b394e9d79d86c59bdb9a9aa48154b44643898446) Thanks [@akankov](https://github.com/akankov)! - Release v1.0.0 — first stable release.

  Zero-dependency TypeScript password validation with React integration. Includes 7 built-in validators, bloom filter-based common password detection, headless accessible components, and comprehensive documentation.

### Patch Changes

- Updated dependencies [[`b394e9d`](https://github.com/akankov/sentinel-password/commit/b394e9d79d86c59bdb9a9aa48154b44643898446)]:
  - @sentinel-password/core@1.0.0

## 0.5.8

### Patch Changes

- Updated dependencies [[`e50ee82`](https://github.com/akankov/sentinel-password/commit/e50ee82a5b30739874b943d1f31d76c5b327a439)]:
  - @sentinel-password/core@0.4.6

## 0.5.7

### Patch Changes

- Add documentation site and playground links to package READMEs

- Updated dependencies []:
  - @sentinel-password/core@0.4.5

## 0.5.6

### Patch Changes

- Update to TypeScript 6.0 and typescript-eslint 8.58

- Updated dependencies []:
  - @sentinel-password/core@0.4.4

## 0.5.5

### Patch Changes

- Update homepage links in package metadata to point to the documentation site and playground

- Updated dependencies []:
  - @sentinel-password/core@0.4.3

## 0.5.4

### Patch Changes

- [#103](https://github.com/akankov/sentinel-password/pull/103) [`bb49910`](https://github.com/akankov/sentinel-password/commit/bb49910b0d7a3e41acdbd730875bf9e1b58f4874) Thanks [@akankov](https://github.com/akankov)! - Update development dependencies: ESLint 10, Turbo 2.9, Vitest 4.1.2

- Updated dependencies [[`bb49910`](https://github.com/akankov/sentinel-password/commit/bb49910b0d7a3e41acdbd730875bf9e1b58f4874)]:
  - @sentinel-password/core@0.4.2

## 0.5.3

### Patch Changes

- [#98](https://github.com/akankov/sentinel-password/pull/98) [`47dc1cc`](https://github.com/akankov/sentinel-password/commit/47dc1cc055055b87408f60e5d67f3474d9055d25) Thanks [@akankov](https://github.com/akankov)! - Update Vite to 8.x and @vitejs/plugin-react to 6.x

## 0.5.2

### Patch Changes

- [#95](https://github.com/akankov/sentinel-password/pull/95) [`2a3fbb9`](https://github.com/akankov/sentinel-password/commit/2a3fbb93410f9b78184675a7c7cb41ef09cdf8f1) Thanks [@akankov](https://github.com/akankov)! - Migrate Storybook from 8.x to 10.x

## 0.5.1

### Patch Changes

- [#91](https://github.com/akankov/sentinel-password/pull/91) [`1196993`](https://github.com/akankov/sentinel-password/commit/1196993adb762eeb5549d2888e4f7c24ee4efcd7) Thanks [@akankov](https://github.com/akankov)! - Update dependencies for minor release

- Updated dependencies [[`1196993`](https://github.com/akankov/sentinel-password/commit/1196993adb762eeb5549d2888e4f7c24ee4efcd7)]:
  - @sentinel-password/core@0.4.1

## 0.5.0

### Minor Changes

- [#84](https://github.com/akankov/sentinel-password/pull/84) [`e179fea`](https://github.com/akankov/sentinel-password/commit/e179fea1e2d324c30374a41e41842e447bed34d7) Thanks [@akankov](https://github.com/akankov)! - Update workspace dependencies to current compatible versions and refresh lockfile.

  This release also updates tooling across examples and docs to keep local development aligned with the latest ecosystem updates.

### Patch Changes

- Updated dependencies [[`e179fea`](https://github.com/akankov/sentinel-password/commit/e179fea1e2d324c30374a41e41842e447bed34d7)]:
  - @sentinel-password/core@0.4.0

## 0.4.0

### Minor Changes

- [#84](https://github.com/akankov/sentinel-password/pull/84) [`0599661`](https://github.com/akankov/sentinel-password/commit/0599661799f62dbb6a8e57d1d6a4639e3e836fcc) Thanks [@akankov](https://github.com/akankov)! - Update workspace dependencies to current compatible versions and refresh lockfile.

  This release also updates tooling across examples and docs to keep local development aligned with the latest ecosystem updates.

### Patch Changes

- Updated dependencies [[`0599661`](https://github.com/akankov/sentinel-password/commit/0599661799f62dbb6a8e57d1d6a4639e3e836fcc)]:
  - @sentinel-password/core@0.3.0

## 0.3.0

### Minor Changes

- [#77](https://github.com/akankov/sentinel-password/pull/77) [`d1fb2fe`](https://github.com/akankov/sentinel-password/commit/d1fb2fe5a5c943b21f4930cdb27daca58db8392a) Thanks [@akankov](https://github.com/akankov)! - Chores. Update dependencies

### Patch Changes

- Updated dependencies [[`d1fb2fe`](https://github.com/akankov/sentinel-password/commit/d1fb2fe5a5c943b21f4930cdb27daca58db8392a)]:
  - @sentinel-password/core@0.2.0

## 0.2.1

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

- Updated dependencies []:
  - @sentinel-password/core@0.1.3

## 0.2.0

### Minor Changes

- [#25](https://github.com/akankov/sentinel-password/pull/25) [`b7d4662`](https://github.com/akankov/sentinel-password/commit/b7d4662bf4a8fee60bffc4b261397718555c7d5d) Thanks [@akankov](https://github.com/akankov)! - Add React hooks package with usePasswordValidator hook
  - Implement usePasswordValidator hook with debouncing support
  - Add comprehensive TypeScript types and JSDoc documentation
  - Include Storybook stories for interactive documentation
  - Achieve 97.82% test coverage with 22 tests

### Patch Changes

- Updated dependencies [[`4f17125`](https://github.com/akankov/sentinel-password/commit/4f1712500393c43efdf215e4ff1b26d89706c18d)]:
  - @sentinel-password/core@0.1.2

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial React package with `usePasswordValidator` hook
- Debouncing support (300ms default, configurable via `debounceMs` option)
- Manual validation and reset functions
- TypeScript support with full type definitions
- Comprehensive test suite (22 tests, 97.82% coverage)
- Storybook integration with 3 interactive examples
- Small bundle size: 2.45KB ESM, 3.67KB CJS

## [0.1.0] - TBD

Initial release of @sentinel-password/react

### Added

- `usePasswordValidator` hook for React password validation
- Support for all @sentinel-password/core validation options
- Configurable debouncing with `debounceMs` option (default: 300ms)
- `validateOnMount` option to validate on component mount
- `validateOnChange` option for immediate validation
- `isValidating` state for loading indicators
- Manual `validate()` function for on-demand validation
- `reset()` function to clear password and validation state
- Proper cleanup on component unmount
- Full TypeScript support with exported types:
  - `UsePasswordValidatorOptions`
  - `UsePasswordValidatorReturn`
- Storybook examples demonstrating:
  - Basic usage with default debouncing
  - Immediate validation (no debounce)
  - Strict password requirements
