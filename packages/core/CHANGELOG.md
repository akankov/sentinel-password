# @sentinel-password/core

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
