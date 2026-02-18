# @sentinel-password/core

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
