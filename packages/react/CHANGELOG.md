# Changelog

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
