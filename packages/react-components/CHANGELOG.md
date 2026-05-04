# @sentinel-password/react-components

## 1.1.2

### Patch Changes

- [#152](https://github.com/akankov/sentinel-password/pull/152) [`57fe9ab`](https://github.com/akankov/sentinel-password/commit/57fe9ab7c0dcc792dfaf7772002625122a3e533f) Thanks [@akankov](https://github.com/akankov)! - Drop the redundant `esbuild` pnpm override added in 1.1.1. The `>=0.25.0` floor it provided is already required naturally by every direct consumer of esbuild in the dependency graph (vite, storybook, vitest, tsup), so the GHSA-67mh-4wv8-2f99 patch level is still enforced. Removing the override prevents lockfile regenerations from collapsing two compatible vite versions onto a single esbuild that breaks vitepress's build. Published artifact bytes are unchanged from 1.1.1; the provenance attestations attached to this release reflect the simplified pnpm configuration and can be verified with `npm audit signatures`.

- Updated dependencies [[`57fe9ab`](https://github.com/akankov/sentinel-password/commit/57fe9ab7c0dcc792dfaf7772002625122a3e533f)]:
  - @sentinel-password/core@1.1.2
  - @sentinel-password/react@1.1.2

## 1.1.1

### Patch Changes

- [#147](https://github.com/akankov/sentinel-password/pull/147) [`5831576`](https://github.com/akankov/sentinel-password/commit/5831576beb356dae2ac810574f6e807d0347fd86) Thanks [@akankov](https://github.com/akankov)! - Rebuild with hardened toolchain: the build pipeline now pins `esbuild >= 0.25.0` (closing GHSA-67mh-4wv8-2f99) and constrains transitive `vite` to `>= 6.4.2` via a pnpm override (closing GHSA-4w7w-66w2-5vf9 / CVE-2026-39365). Published artifact bytes are unchanged; the provenance attestations attached to this release reflect the patched build environment and can be verified with `npm audit signatures`.

- Updated dependencies [[`5831576`](https://github.com/akankov/sentinel-password/commit/5831576beb356dae2ac810574f6e807d0347fd86)]:
  - @sentinel-password/core@1.1.1
  - @sentinel-password/react@1.1.1

## 1.1.0

### Minor Changes

- [#138](https://github.com/akankov/sentinel-password/pull/138) [`0adb392`](https://github.com/akankov/sentinel-password/commit/0adb3923f8530b1df79e66c591b9eac8a0ab9b7f) Thanks [@akankov](https://github.com/akankov)! - Publish pipeline now uses npm Trusted Publishing (OIDC) with provenance attestations enabled by default. Consumers can verify published packages with `npm audit signatures`. Release automation simplified — version bumps and publishes trigger automatically from merges to main, no manual workflow dispatch required.

### Patch Changes

- Updated dependencies [[`0adb392`](https://github.com/akankov/sentinel-password/commit/0adb3923f8530b1df79e66c591b9eac8a0ab9b7f)]:
  - @sentinel-password/core@1.1.0
  - @sentinel-password/react@1.1.0

## 1.0.1

### Patch Changes

- [#103](https://github.com/akankov/sentinel-password/pull/103) [`bb49910`](https://github.com/akankov/sentinel-password/commit/bb49910b0d7a3e41acdbd730875bf9e1b58f4874) Thanks [@akankov](https://github.com/akankov)! - chore: update all dependencies to latest versions

- Updated dependencies [[`bb49910`](https://github.com/akankov/sentinel-password/commit/bb49910b0d7a3e41acdbd730875bf9e1b58f4874)]:
  - @sentinel-password/core@1.0.1
  - @sentinel-password/react@1.0.1

## 1.0.0

### Major Changes

- [#120](https://github.com/akankov/sentinel-password/pull/120) [`b394e9d`](https://github.com/akankov/sentinel-password/commit/b394e9d79d86c59bdb9a9aa48154b44643898446) Thanks [@akankov](https://github.com/akankov)! - Release v1.0.0 — first stable release.

  Zero-dependency TypeScript password validation with React integration. Includes 7 built-in validators, bloom filter-based common password detection, headless accessible components, and comprehensive documentation.

### Patch Changes

- Updated dependencies [[`b394e9d`](https://github.com/akankov/sentinel-password/commit/b394e9d79d86c59bdb9a9aa48154b44643898446)]:
  - @sentinel-password/core@1.0.0
  - @sentinel-password/react@1.0.0

## 0.4.8

### Patch Changes

- Updated dependencies [[`e50ee82`](https://github.com/akankov/sentinel-password/commit/e50ee82a5b30739874b943d1f31d76c5b327a439)]:
  - @sentinel-password/core@0.4.6
  - @sentinel-password/react@0.5.8

## 0.4.7

### Patch Changes

- Add documentation site and playground links to package READMEs

- Updated dependencies []:
  - @sentinel-password/core@0.4.5
  - @sentinel-password/react@0.5.7

## 0.4.6

### Patch Changes

- Update to TypeScript 6.0 and typescript-eslint 8.58

- Updated dependencies []:
  - @sentinel-password/core@0.4.4
  - @sentinel-password/react@0.5.6

## 0.4.5

### Patch Changes

- Update homepage links in package metadata to point to the documentation site and playground

- Updated dependencies []:
  - @sentinel-password/core@0.4.3
  - @sentinel-password/react@0.5.5

## 0.4.4

### Patch Changes

- [#103](https://github.com/akankov/sentinel-password/pull/103) [`bb49910`](https://github.com/akankov/sentinel-password/commit/bb49910b0d7a3e41acdbd730875bf9e1b58f4874) Thanks [@akankov](https://github.com/akankov)! - Update development dependencies: ESLint 10, Turbo 2.9, Vitest 4.1.2

- Updated dependencies [[`bb49910`](https://github.com/akankov/sentinel-password/commit/bb49910b0d7a3e41acdbd730875bf9e1b58f4874)]:
  - @sentinel-password/core@0.4.2
  - @sentinel-password/react@0.5.4

## 0.4.3

### Patch Changes

- [#98](https://github.com/akankov/sentinel-password/pull/98) [`47dc1cc`](https://github.com/akankov/sentinel-password/commit/47dc1cc055055b87408f60e5d67f3474d9055d25) Thanks [@akankov](https://github.com/akankov)! - Update Vite to 8.x and @vitejs/plugin-react to 6.x

- Updated dependencies [[`47dc1cc`](https://github.com/akankov/sentinel-password/commit/47dc1cc055055b87408f60e5d67f3474d9055d25)]:
  - @sentinel-password/react@0.5.3

## 0.4.2

### Patch Changes

- [#95](https://github.com/akankov/sentinel-password/pull/95) [`2a3fbb9`](https://github.com/akankov/sentinel-password/commit/2a3fbb93410f9b78184675a7c7cb41ef09cdf8f1) Thanks [@akankov](https://github.com/akankov)! - Migrate Storybook from 8.x to 10.x

- Updated dependencies [[`2a3fbb9`](https://github.com/akankov/sentinel-password/commit/2a3fbb93410f9b78184675a7c7cb41ef09cdf8f1)]:
  - @sentinel-password/react@0.5.2

## 0.4.1

### Patch Changes

- [#91](https://github.com/akankov/sentinel-password/pull/91) [`1196993`](https://github.com/akankov/sentinel-password/commit/1196993adb762eeb5549d2888e4f7c24ee4efcd7) Thanks [@akankov](https://github.com/akankov)! - Update dependencies for minor release

- Updated dependencies [[`1196993`](https://github.com/akankov/sentinel-password/commit/1196993adb762eeb5549d2888e4f7c24ee4efcd7)]:
  - @sentinel-password/core@0.4.1
  - @sentinel-password/react@0.5.1

## 0.4.0

### Minor Changes

- [#84](https://github.com/akankov/sentinel-password/pull/84) [`e179fea`](https://github.com/akankov/sentinel-password/commit/e179fea1e2d324c30374a41e41842e447bed34d7) Thanks [@akankov](https://github.com/akankov)! - Update workspace dependencies to current compatible versions and refresh lockfile.

  This release also updates tooling across examples and docs to keep local development aligned with the latest ecosystem updates.

### Patch Changes

- Updated dependencies [[`e179fea`](https://github.com/akankov/sentinel-password/commit/e179fea1e2d324c30374a41e41842e447bed34d7)]:
  - @sentinel-password/core@0.4.0
  - @sentinel-password/react@0.5.0

## 0.3.0

### Minor Changes

- [#84](https://github.com/akankov/sentinel-password/pull/84) [`0599661`](https://github.com/akankov/sentinel-password/commit/0599661799f62dbb6a8e57d1d6a4639e3e836fcc) Thanks [@akankov](https://github.com/akankov)! - Update workspace dependencies to current compatible versions and refresh lockfile.

  This release also updates tooling across examples and docs to keep local development aligned with the latest ecosystem updates.

### Patch Changes

- Updated dependencies [[`0599661`](https://github.com/akankov/sentinel-password/commit/0599661799f62dbb6a8e57d1d6a4639e3e836fcc)]:
  - @sentinel-password/core@0.3.0
  - @sentinel-password/react@0.4.0

## 0.2.0

### Minor Changes

- [#77](https://github.com/akankov/sentinel-password/pull/77) [`d1fb2fe`](https://github.com/akankov/sentinel-password/commit/d1fb2fe5a5c943b21f4930cdb27daca58db8392a) Thanks [@akankov](https://github.com/akankov)! - Chores. Update dependencies

### Patch Changes

- Updated dependencies [[`d1fb2fe`](https://github.com/akankov/sentinel-password/commit/d1fb2fe5a5c943b21f4930cdb27daca58db8392a)]:
  - @sentinel-password/react@0.3.0
  - @sentinel-password/core@0.2.0

## 0.1.1

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
  - @sentinel-password/react@0.2.1

## 0.1.0

### Minor Changes

- Initial release of React components package
- Add headless PasswordInput component with WCAG 2.1 AAA accessibility
- Support for controlled and uncontrolled modes
- Comprehensive keyboard navigation
- Full TypeScript support with JSDoc documentation
