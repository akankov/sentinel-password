# @sentinel-password/core

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
