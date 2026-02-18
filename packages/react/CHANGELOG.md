# Changelog

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
