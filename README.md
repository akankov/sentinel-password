# sentinel-password

[![CI](https://github.com/akankov/sentinel-password/actions/workflows/ci.yml/badge.svg)](https://github.com/akankov/sentinel-password/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@sentinel-password/core.svg)](https://www.npmjs.com/package/@sentinel-password/core)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@sentinel-password/core)](https://bundlephobia.com/package/@sentinel-password/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Modern TypeScript password validation library with zero dependencies, React integration, and comprehensive validation rules.

**[Documentation](https://akankov.github.io/sentinel-password/)** | **[Playground](https://akankov.github.io/sentinel-password/playground/)** | **[API Reference](https://akankov.github.io/sentinel-password/api/core.html)**

## Features

- **Zero Dependencies** - No external dependencies, tree-shakeable, ~5.5KB gzipped (< 10KB limit)
- **TypeScript-First** - Full type safety with 100% test coverage
- **React Integration** - Hook and headless accessible components (WCAG 2.1 AAA)
- **Rich Feedback** - Actionable suggestions for password improvement
- **Comprehensive Validation** - 7 built-in validators covering OWASP best practices
- **Flexible API** - Zero-config defaults with full customization options

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@sentinel-password/core`](https://www.npmjs.com/package/@sentinel-password/core) | Zero-dependency validation engine | [![npm](https://img.shields.io/npm/v/@sentinel-password/core.svg)](https://www.npmjs.com/package/@sentinel-password/core) |
| [`@sentinel-password/react`](https://www.npmjs.com/package/@sentinel-password/react) | React hook (`usePasswordValidator`) | [![npm](https://img.shields.io/npm/v/@sentinel-password/react.svg)](https://www.npmjs.com/package/@sentinel-password/react) |
| [`@sentinel-password/react-components`](https://www.npmjs.com/package/@sentinel-password/react-components) | Headless React components | [![npm](https://img.shields.io/npm/v/@sentinel-password/react-components.svg)](https://www.npmjs.com/package/@sentinel-password/react-components) |

## Installing

```bash
pnpm add @sentinel-password/core
# or
npm install @sentinel-password/core
```

For React projects:

```bash
pnpm add @sentinel-password/react @sentinel-password/react-components
```

## Quick Start

```typescript
import { validatePassword } from '@sentinel-password/core'

const result = validatePassword('MySecure!Pass_w0rd')

if (result.valid) {
  console.log(`Strength: ${result.strength}`) // 'very-strong'
} else {
  result.feedback.suggestions.forEach(suggestion => {
    console.log(`- ${suggestion}`)
  })
}
```

### React

```typescript
import { usePasswordValidator } from '@sentinel-password/react'

function SignupForm() {
  const { value, isValid, errors, strength, handleChange } =
    usePasswordValidator({
      validators: {
        length: { min: 8 },
        characterTypes: { requireUppercase: true, requireNumbers: true },
        commonPassword: { enabled: true },
      },
    })

  return (
    <div>
      <input type="password" value={value} onChange={handleChange} />
      <p>Strength: {strength}</p>
      {errors.map(e => <p key={e.code}>{e.message}</p>)}
    </div>
  )
}
```

See the [full documentation](https://akankov.github.io/sentinel-password/guide/getting-started.html) for more examples, or try the [interactive playground](https://akankov.github.io/sentinel-password/playground/).

## Configuration

```typescript
const result = validatePassword('MyPassword123!', {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true,
  maxRepeatedChars: 3,
  checkSequential: true,
  checkKeyboardPatterns: true,
  checkCommonPasswords: true,
  personalInfo: ['johndoe', 'john.doe@example.com'],
})
```

## Local Development

Requirements: Node.js >= 20, pnpm (see `packageManager` in `package.json`)

```bash
pnpm install
pnpm build      # Build all packages
pnpm test       # Run all tests
pnpm lint       # ESLint + Prettier check
pnpm typecheck  # TypeScript strict mode check
pnpm docs:dev   # Dev docs site
```

## License

MIT
