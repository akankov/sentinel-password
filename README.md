# sentinel-password

[![CI](https://github.com/akankov/sentinel-password/actions/workflows/ci.yml/badge.svg)](https://github.com/akankov/sentinel-password/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@sentinel-password/core.svg)](https://www.npmjs.com/package/@sentinel-password/core)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@sentinel-password/core)](https://bundlephobia.com/package/@sentinel-password/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Modern TypeScript password validation library with zero dependencies, comprehensive validation rules, and rich user feedback.

> **Status**: Ready for v0.1.0 release. Core package is feature-complete with 100% test coverage.

## Features

- **Zero Dependencies** - No external dependencies, tree-shakeable, ~5.5KB gzipped (< 10KB limit)
- **TypeScript-First** - Full type safety with 100% test coverage
- **Rich Feedback** - Actionable suggestions for password improvement
- **Comprehensive Validation** - 7 built-in validators covering OWASP best practices
- **Flexible API** - Zero-config defaults with full customization options
- **Framework Agnostic** - Works in Node.js, browsers, and any JavaScript environment

## Packages

This repo is a pnpm workspace monorepo:

- **`@sentinel-password/core`** – Zero-dependency password validation engine ✅ Ready
- **`@sentinel-password/react`** – React hook and headless input component (planned)
- **Docs & examples** – Vitepress docs, playground, and example apps (planned)

## Installing

The core package is published as `@sentinel-password/core`.

```bash
pnpm add @sentinel-password/core
# or
npm install @sentinel-password/core
# or
yarn add @sentinel-password/core
```

React integration will be published later as `@sentinel-password/react`.

## Quick Start

```typescript
import { validatePassword } from '@sentinel-password/core'

const result = validatePassword('MySecure!Pass_w0rd')

if (result.valid) {
  console.log('Password is valid!')
  console.log(`Strength: ${result.strength}`) // 'very-strong'
  console.log(`Score: ${result.score}`) // 4
} else {
  console.log('Password is invalid')
  console.log(result.feedback.warning) // First suggestion
  result.feedback.suggestions.forEach(suggestion => {
    console.log(`- ${suggestion}`)
  })
}
```

**See the [Core Package README](./packages/core/README.md) for complete documentation and examples.**

## Configuration

`validatePassword(password, options?)` accepts comprehensive validation options:

```typescript
const result = validatePassword('MyPassword123!', {
  // Length constraints
  minLength: 12,              // default: 8
  maxLength: 128,             // default: 128
  
  // Character requirements
  requireUppercase: true,     // default: false
  requireLowercase: true,     // default: false
  requireDigit: true,         // default: false
  requireSymbol: true,        // default: false
  
  // Pattern detection
  maxRepeatedChars: 3,        // default: 3
  checkSequential: true,      // default: true (blocks abc, 123, etc.)
  checkKeyboardPatterns: true, // default: true (blocks qwerty, asdf, etc.)
  checkCommonPasswords: true, // default: true (blocks top 1K passwords)
  
  // Personal information exclusion
  personalInfo: ['johndoe', 'john.doe@example.com']
})
```

## Validation Result

```typescript
interface ValidationResult {
  // Overall validation status
  valid: boolean
  
  // Strength scoring
  score: 0 | 1 | 2 | 3 | 4
  strength: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong'
  
  // User feedback
  feedback: {
    warning?: string              // Primary warning message
    suggestions: readonly string[] // All improvement suggestions
  }
  
  // Individual check results
  checks: {
    length: boolean             // Meets length requirements
    characterTypes: boolean     // Meets character type requirements
    repetition: boolean         // No excessive repeated characters
    sequential: boolean         // No sequential patterns (abc, 123)
    keyboardPattern: boolean    // No keyboard patterns (qwerty, asdf)
    commonPassword: boolean     // Not in top 1K common passwords
    personalInfo: boolean       // Doesn't contain personal information
  }
}
```

### Advanced: Individual Validators

For advanced use cases, you can import and use individual validators:

```ts
import { 
  validateLength,
  validateCharacterTypes,
  validateRepetition,
  validateSequential,
  validateKeyboardPattern,
  validateCommonPassword,
  validatePersonalInfo,
  hasUppercase,
  hasLowercase,
  hasDigit,
  hasSymbol
} from '@sentinel-password/core'

const lengthCheck = validateLength('mypassword', { minLength: 12 })
// { passed: boolean, message?: string }
```

### MVP v0.1.0 Public API

The v0.1.0 release provides:

- **Primary API**: `validatePassword(password, options?)` - zero-config function with sensible defaults
- **Types**: Full TypeScript support with `ValidationResult`, `ValidatorOptions`, `CheckId`, etc.
- **Individual validators**: Low-level functions for custom validation flows
- **Future APIs**: Fluent builder and schema-based APIs are planned for post-MVP releases

## Local Development

Requirements:

- Node.js >= 20
- pnpm (see `packageManager` in `package.json`)

Install dependencies:

```bash
pnpm install
```

Common scripts (run from repo root):

```bash
pnpm build      # Build all packages via Turborepo
pnpm test       # Run all tests
pnpm lint       # ESLint + Prettier check
pnpm lint:fix   # Auto-fix lint issues
pnpm typecheck  # TypeScript strict mode check
pnpm dev        # Dev workflow (docs / packages as configured)
```

## Project Goals (MVP)

The v0.1.0 MVP delivers:

- **Zero-config validation**: `validatePassword()` with sensible OWASP-aligned defaults
- **Comprehensive checks**: Length, character types, repetition, sequential patterns, keyboard patterns, common passwords, personal info
- **Rich feedback**: Detailed validation results with actionable suggestions
- **TypeScript-first**: Strict mode with full type inference
- **Zero dependencies**: Small bundle size (~5.5KB gzipped, < 10KB limit)

**Post-MVP roadmap**:
- Fluent builder API and schema-based configuration
- React hook + headless input component
- Vitepress documentation site with interactive playground
- Additional framework integrations (Vue, Svelte, Angular)

## License

MIT
