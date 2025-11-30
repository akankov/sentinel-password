# sentinel-password

[![CI](https://github.com/akankov/sentinel-password/actions/workflows/ci.yml/badge.svg)](https://github.com/akankov/sentinel-password/actions/workflows/ci.yml)

Modern TypeScript password validation library with a focus on DX, sensible defaults, and small bundle size.

> Status: Early MVP. APIs and implementation may change before v0.1.0.

## Packages

This repo is a pnpm workspace monorepo:

- `@sentinel-password/core` – zero-dependency password validation engine (rule-based)
- `@sentinel-password/react` – React hook and headless input component (planned)
- Docs & examples – Vitepress docs, playground, and example apps (planned)

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

## Quick Start (Core)

```ts
import { validatePassword } from '@sentinel-password/core'

const result = validatePassword('MySecurePassword123!')

if (result.valid) {
  console.log('Password is valid')
} else {
  console.log('Password is invalid')
  console.log(result.feedback.warning)
  console.log(result.feedback.suggestions)
}
```

### Options

`validatePassword(password, options?)` accepts a comprehensive set of validation options:

```ts
import { validatePassword } from '@sentinel-password/core'

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
  personalInfo: ['johndoe', 'john.doe@example.com'],
})

console.log(result.valid) // false
console.log(result.score) // 0–4
console.log(result.strength) // 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong'
console.log(result.feedback.warning) // First suggestion
console.log(result.feedback.suggestions) // All actionable suggestions
```

### Validation Result

```ts
interface ValidationResult {
  valid: boolean  // true if all checks pass
  score: 0 | 1 | 2 | 3 | 4  // Numeric strength score
  strength: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong'
  feedback: {
    warning?: string  // Primary warning message
    suggestions: readonly string[]  // All improvement suggestions
  }
  checks: {
    length: boolean
    characterTypes: boolean
    repetition: boolean
    sequential: boolean
    keyboardPattern: boolean
    commonPassword: boolean
    personalInfo: boolean
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

Individual package scripts are described in `private_docs/plan.md` and will be wired up as the MVP progresses.

## Project Goals (MVP)

The v0.1.0 MVP delivers:

- **Zero-config validation**: `validatePassword()` with sensible OWASP-aligned defaults
- **Comprehensive checks**: Length, character types, repetition, sequential patterns, keyboard patterns, common passwords, personal info
- **Rich feedback**: Detailed validation results with actionable suggestions
- **TypeScript-first**: Strict mode with full type inference
- **Zero dependencies**: Small bundle size (target < 5KB gzipped)

**Post-MVP roadmap**:
- Fluent builder API and schema-based configuration
- React hook + headless input component
- Vitepress documentation site with interactive playground
- Additional framework integrations (Vue, Svelte, Angular)

## License

MIT
