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

`validatePassword(password, options?)` currently supports basic length rules:

```ts
import { validatePassword } from '@sentinel-password/core'

const result = validatePassword('short', {
  minLength: 12,
  maxLength: 128,
})

console.log(result.valid) // false
console.log(result.score) // 0–4
console.log(result.strength) // 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong'
console.log(result.checks) // { minLength: false, maxLength: true }
```

Returned shape:

```ts
interface ValidationResult {
  valid: boolean
  score: 0 | 1 | 2 | 3 | 4
  strength: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong'
  feedback: {
    warning?: string
    suggestions: string[]
  }
  checks: Record<string, boolean>
}
```

Future MVP work will extend `checks` to include character types, repetition/sequence detection, blacklist checks, and personal-data rules as described in `docs/plan.md`.

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

Individual package scripts (planned) are described in `docs/plan.md` and will be wired up as the MVP progresses.

## Project Goals (MVP)

High level goals from `docs/plan.md`:

- Rule-based password validation with sensible presets
- Three API styles in core: zero-config function, fluent builder, and schema-based config
- First-class TypeScript support with strict mode and rich result types
- React hook + headless input component for easy integration
- Vitepress-powered documentation site with examples and a simple playground

For the detailed MVP roadmap, see `docs/plan.md`.

## License

MIT
