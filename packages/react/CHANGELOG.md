# Changelog

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
