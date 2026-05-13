# Installation

## Package Overview

Sentinel Password ships four packages — pick the one(s) that match what you're building:

| Package | Gzipped (ESM) | Raw (ESM) | Runtime deps | Peer deps |
|---------|---------------|-----------|--------------|-----------|
| `@sentinel-password/core` | ~5.4 KB | ~15.8 KB | none | none |
| `@sentinel-password/react` | ~0.7 KB | ~2.5 KB | `@sentinel-password/core` (installed transitively) | React 18 or 19 |
| `@sentinel-password/react-components` | ~1.7 KB | ~6.0 KB | `@sentinel-password/core` (installed transitively) | React 18 or 19, React DOM 18 or 19 |
| `@sentinel-password/entropy` | ~28 KB | ~53 KB | none | none |

- **`@sentinel-password/core`** — zero-dependency validation engine. Use directly with vanilla JS, Node, Deno, Bun, or any framework.
- **`@sentinel-password/react`** — `usePasswordValidator` hook with debouncing and state management.
- **`@sentinel-password/react-components`** — headless, accessible `PasswordInput` component.
- **`@sentinel-password/entropy`** — optional Shannon entropy + crack-time estimator. Standalone, not bundled with core. Use alongside core when you need a "how long would it survive an offline attack?" signal in addition to rule-based validity.

> Sizes are the ESM build measured at the time of this release; CJS is slightly larger. Runtime deps install automatically with your package-manager command — you only ever need to `npm install` the package you're using. Peer deps are bring-your-own.

## Installation Methods

### npm

::: code-group
```bash [Core]
npm install @sentinel-password/core
```

```bash [React Hook]
npm install @sentinel-password/react
```

```bash [React Components]
npm install @sentinel-password/react-components
```

```bash [Entropy]
npm install @sentinel-password/entropy
```
:::

### pnpm

::: code-group
```bash [Core]
pnpm add @sentinel-password/core
```

```bash [React Hook]
pnpm add @sentinel-password/react
```

```bash [React Components]
pnpm add @sentinel-password/react-components
```

```bash [Entropy]
pnpm add @sentinel-password/entropy
```
:::

### yarn

::: code-group
```bash [Core]
yarn add @sentinel-password/core
```

```bash [React Hook]
yarn add @sentinel-password/react
```

```bash [React Components]
yarn add @sentinel-password/react-components
```

```bash [Entropy]
yarn add @sentinel-password/entropy
```
:::

### bun

::: code-group
```bash [Core]
bun add @sentinel-password/core
```

```bash [React Hook]
bun add @sentinel-password/react
```

```bash [React Components]
bun add @sentinel-password/react-components
```

```bash [Entropy]
bun add @sentinel-password/entropy
```
:::

## Requirements

### Core Package
- **No runtime dependencies**
- Works with any JavaScript environment (Node.js, browsers, Deno, Bun)
- TypeScript 6+ for development (root devDep is `typescript: ^6.0.3`)

### React Packages
- React 18 or 19 (peer range: `^18.0.0 || ^19.0.0`)
- React DOM 18 or 19 (same range, required only for `@sentinel-password/react-components`)

## TypeScript Support

All packages are written in TypeScript and include full type definitions:

```typescript
import type {
  ValidationResult,
  ValidatorOptions,
  StrengthScore,
  StrengthLabel,
} from '@sentinel-password/core'

import type {
  UsePasswordValidatorOptions,
  UsePasswordValidatorReturn,
} from '@sentinel-password/react'

import type {
  PasswordInputProps,
  ValidationMessage,
} from '@sentinel-password/react-components'

import type {
  EntropyOptions,
  EntropyResult,
  EntropyPattern,
  CrackTimePresets,
} from '@sentinel-password/entropy'
```

## Module Formats

All packages support both ESM and CommonJS:

```javascript
// ESM
import { validatePassword } from '@sentinel-password/core'

// CommonJS
const { validatePassword } = require('@sentinel-password/core')
```

## CDN Usage

For quick prototyping, you can use a CDN:

```html
<!-- ESM -->
<script type="module">
  import { validatePassword } from 'https://esm.sh/@sentinel-password/core'

  const result = validatePassword('password123', { minLength: 8 })
  console.log(result.valid, result.strength)
</script>
```

::: warning
CDN usage is not recommended for production. Always install packages via npm for better performance and caching.
:::

## Verify Installation

After installation, verify everything works:

```javascript
import { validatePassword } from '@sentinel-password/core'

const result = validatePassword('Test-Pa55word!', { minLength: 8 })

console.log(result.valid) // true
console.log(result.strength) // 'very-strong'
```

::: tip Why not `Test1234!`?
The `1234` sequence trips the sequential + keyboard-pattern detectors even though every other check passes — `valid` comes back `false` with `strength: 'strong'`. The validator's job is to catch exactly these "looks fine, isn't" passwords.
:::

## Next Steps

- [Get started with basic usage](/guide/getting-started)
- [Learn about validators](/guide/validators)
- [Explore configuration options](/guide/configuration)
