# @sentinel-password/react

[![npm version](https://img.shields.io/npm/v/@sentinel-password/react.svg)](https://www.npmjs.com/package/@sentinel-password/react)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

React hook for password validation using `@sentinel-password/core`. Provides debounced validation with full TypeScript support.

**[Documentation](https://akankov.github.io/sentinel-password/)** | **[Interactive Playground](https://akankov.github.io/sentinel-password/playground/)** | **[API Reference](https://akankov.github.io/sentinel-password/api/react.html)**

## Features

- **`usePasswordValidator` hook** - Debounced password validation with configurable delay
- **TypeScript-First** - Full type safety with strict mode
- **Lightweight** - Minimal wrapper around `@sentinel-password/core`
- **React 18 & 19** - Supports both React 18 and 19

## Installation

```bash
npm install @sentinel-password/react @sentinel-password/core
# or
pnpm add @sentinel-password/react @sentinel-password/core
# or
yarn add @sentinel-password/react @sentinel-password/core
```

## Quick Start

```tsx
import { usePasswordValidator } from '@sentinel-password/react'

function PasswordForm() {
  const { password, setPassword, result, isValidating } = usePasswordValidator({
    debounceMs: 300,
    minLength: 10,
    requireUppercase: true,
  })

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
      />
      {isValidating && <span>Validating...</span>}
      {result && (
        <div>
          <p>Strength: {result.strength}</p>
          {result.feedback.suggestions.map((s, i) => (
            <p key={i}>{s}</p>
          ))}
        </div>
      )}
    </div>
  )
}
```

## API

### `usePasswordValidator(options?)`

Returns an object with:

| Property | Type | Description |
|----------|------|-------------|
| `password` | `string` | Current password value |
| `setPassword` | `(password: string) => void` | Update password and trigger validation |
| `result` | `ValidationResult \| undefined` | Validation result (undefined until first validation) |
| `isValidating` | `boolean` | Whether validation is in progress (during debounce) |
| `validate` | `() => void` | Manually trigger validation |
| `reset` | `() => void` | Reset password and validation state |

### Options

Extends all [`@sentinel-password/core` options](https://www.npmjs.com/package/@sentinel-password/core) plus:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `debounceMs` | `number` | `300` | Debounce delay in ms (0 to disable) |
| `validateOnMount` | `boolean` | `false` | No-op today — the hook starts with an empty password and there's no `initialPassword` option to seed a value. If you need validation before user input, call `validatePassword(value, options)` from `@sentinel-password/core` directly. (The hook's `validate()` can't help here: it closes over the hook's `password` state, which is asynchronously updated by `setPassword`, so a back-to-back `setPassword(x); validate()` would still see the previous value.) |
| `validateOnChange` | `boolean` | `false` | Only matters when `debounceMs === 0`: `true` validates synchronously on every change, `false` disables automatic validation (call `validate()` manually). With the default `debounceMs > 0`, debounced validation runs on every change regardless of this flag. |

## Related Packages

- [`@sentinel-password/core`](https://www.npmjs.com/package/@sentinel-password/core) - Core validation engine (zero dependencies)
- [`@sentinel-password/react-components`](https://www.npmjs.com/package/@sentinel-password/react-components) - Accessible, headless React components

## License

MIT © Aleksei Kankov
