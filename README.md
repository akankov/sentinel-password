# sentinel-password

[![CI](https://github.com/akankov/sentinel-password/actions/workflows/ci.yml/badge.svg)](https://github.com/akankov/sentinel-password/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/akankov/sentinel-password/graph/badge.svg)](https://codecov.io/gh/akankov/sentinel-password)
[![Mutation score](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fakankov%2Fsentinel-password%2Fmain)](https://dashboard.stryker-mutator.io/reports/github.com/akankov/sentinel-password/main)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/2794ccc3d7534248baa48a513d4f7fcb)](https://app.codacy.com/gh/akankov/sentinel-password/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![npm version](https://img.shields.io/npm/v/@sentinel-password/core.svg)](https://www.npmjs.com/package/@sentinel-password/core)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@sentinel-password/core)](https://bundlephobia.com/package/@sentinel-password/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Modern TypeScript password validation library with zero dependencies, React integration, and comprehensive validation rules.

**[Documentation](https://akankov.github.io/sentinel-password/)** | **[Playground](https://akankov.github.io/sentinel-password/playground/)** | **[API Reference](https://akankov.github.io/sentinel-password/api/core.html)**

## Features

- **Zero Dependencies** - No external dependencies, tree-shakeable, ~6.3KB gzipped (< 10KB limit)
- **TypeScript-First** - Full type safety with 100% test coverage on core, enforced via vitest coverage thresholds in CI
- **React Integration** - Hook and headless components designed to meet WCAG 2.1 AAA — semantic HTML, ARIA live region, keyboard support; page-level conformance is your CSS and surrounding markup. See [Accessibility guide](https://akankov.github.io/sentinel-password/guide/accessibility) for what's covered vs. what's the consumer's.
- **Rich Feedback** - Actionable suggestions for password improvement
- **Comprehensive Validation** - 7 built-in validators covering OWASP best practices
- **Flexible API** - Zero-config defaults with full customization options

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@sentinel-password/core`](https://www.npmjs.com/package/@sentinel-password/core) | Zero-dependency validation engine | [![npm](https://img.shields.io/npm/v/@sentinel-password/core.svg)](https://www.npmjs.com/package/@sentinel-password/core) |
| [`@sentinel-password/react`](https://www.npmjs.com/package/@sentinel-password/react) | React hook (`usePasswordValidator`) | [![npm](https://img.shields.io/npm/v/@sentinel-password/react.svg)](https://www.npmjs.com/package/@sentinel-password/react) |
| [`@sentinel-password/react-components`](https://www.npmjs.com/package/@sentinel-password/react-components) | Headless React components | [![npm](https://img.shields.io/npm/v/@sentinel-password/react-components.svg)](https://www.npmjs.com/package/@sentinel-password/react-components) |
| [`@sentinel-password/entropy`](https://www.npmjs.com/package/@sentinel-password/entropy) | Shannon entropy + crack-time estimation (optional add-on) | [![npm](https://img.shields.io/npm/v/@sentinel-password/entropy.svg)](https://www.npmjs.com/package/@sentinel-password/entropy) |
| [`@sentinel-password/breach`](https://www.npmjs.com/package/@sentinel-password/breach) | Have I Been Pwned breach checking via k-anonymity (optional add-on) | [![npm](https://img.shields.io/npm/v/@sentinel-password/breach.svg)](https://www.npmjs.com/package/@sentinel-password/breach) |
| [`@sentinel-password/generate`](https://www.npmjs.com/package/@sentinel-password/generate) | Secure password + diceware passphrase generation (optional add-on) | [![npm](https://img.shields.io/npm/v/@sentinel-password/generate.svg)](https://www.npmjs.com/package/@sentinel-password/generate) |

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

For entropy / crack-time estimates (optional, ≤ 30 KB gzipped):

```bash
pnpm add @sentinel-password/entropy
```

For Have I Been Pwned breach checking (optional, ≤ 10 KB gzipped, server-side recommended):

```bash
pnpm add @sentinel-password/breach
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

```tsx
import { usePasswordValidator } from '@sentinel-password/react'

function SignupForm() {
  const { password, setPassword, result } = usePasswordValidator({
    minLength: 8,
    requireUppercase: true,
    requireDigit: true,
  })

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <p>Strength: {result?.strength ?? '—'}</p>
      {result?.feedback.suggestions.map((msg, i) => (
        <p key={i}>{msg}</p>
      ))}
    </div>
  )
}
```

See the [full documentation](https://akankov.github.io/sentinel-password/guide/getting-started.html) for more examples, or try the [interactive playground](https://akankov.github.io/sentinel-password/playground/).

## Benchmarks

Numbers below are refreshed from a fresh run via `pnpm bench:update-readme`. See the [Performance docs](https://akankov.github.io/sentinel-password/guide/performance) for per-fixture latency tables, individual validator timings, and run methodology.

<!-- BENCHMARK:START -->

### Password validation (`@sentinel-password/core`)

| Password | sentinel-password | zxcvbn | check-password-strength | password-validator |
|---|---|---|---|---|
| Weak (`"password"`) | **1,410,000 ops/s** | 22,000 ops/s | 2,902,000 ops/s | 1,290,000 ops/s |
| Medium (`"MyPassword1"`) | **1,741,000 ops/s** | 6,500 ops/s | 2,348,000 ops/s | 1,732,000 ops/s |
| Strong (`"MyP@ssw0rd123!"`) | **2,221,000 ops/s** | 2,700 ops/s | 2,275,000 ops/s | 2,063,000 ops/s |
| Long (200+ chars) | **319,000 ops/s** | 8 ops/s | 2,185,000 ops/s | 1,238,000 ops/s |
| Batch (100 passwords) | **18,000 batches/s** | 56 batches/s | 24,000 batches/s | 16,000 batches/s |

### Entropy estimation (`@sentinel-password/entropy`)

| Password | sentinel-entropy | zxcvbn | Speedup |
|---|---|---|---|
| Weak (`"password"`) | **902,000 ops/s** | 22,000 ops/s | **42×** |
| Medium (`"MyPassword1"`) | **165,000 ops/s** | 6,600 ops/s | **25×** |
| Strong (`"MyP@ssw0rd123!"`) | **62,000 ops/s** | 1,900 ops/s | **33×** |
| Long (200+ chars) | **15,000 ops/s** | 7 ops/s | **2,010×** |
| Batch (100 passwords) | **1,200 batches/s** | 55 batches/s | **21×** |

_Refreshed via `pnpm bench:update-readme` on Apple M4, Node v26.0.0, darwin arm64._  
_Ops/sec varies 30-50 % across hardware. See [Performance docs](https://akankov.github.io/sentinel-password/guide/performance) for run methodology + per-fixture latency tables._

<!-- BENCHMARK:END -->

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

Requirements: Node.js >= 22, pnpm (see `packageManager` in `package.json`)

```bash
pnpm install
pnpm build              # Build all packages
pnpm test               # Run all tests
pnpm bench              # Run benchmarks (read-only; prints to stdout)
pnpm bench:update-readme # Run benchmarks AND rewrite the tables above
pnpm lint               # Run ESLint (does NOT run Prettier — see format:check)
pnpm format:check       # Run Prettier --check
pnpm typecheck          # TypeScript strict mode check
pnpm docs:dev           # Dev docs site
```

## License

MIT
