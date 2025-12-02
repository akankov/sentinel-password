# Installation

## Package Overview

Sentinel Password provides three packages to fit different use cases:

| Package | Description | Size | Dependencies |
|---------|-------------|------|--------------|
| `@sentinel-password/core` | Core validation library for any JavaScript framework | <5KB | Zero |
| `@sentinel-password/react` | React hooks for password validation | ~2.5KB | React 18+ |
| `@sentinel-password/react-components` | Pre-built accessible React components | ~6KB | React 18+ |

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
:::

## Requirements

### Core Package
- **No runtime dependencies**
- Works with any JavaScript environment (Node.js, browsers, Deno, Bun)
- TypeScript 5+ for development

### React Packages
- React 18.0.0 or higher (or React 19+)
- React DOM 18.0.0 or higher (for components package)

## TypeScript Support

All packages are written in TypeScript and include full type definitions:

```typescript
import type { 
  ValidationResult,
  ValidatorConfig,
  PasswordStrength 
} from '@sentinel-password/core'

import type { 
  UsePasswordValidatorOptions,
  UsePasswordValidatorReturn 
} from '@sentinel-password/react'

import type { 
  PasswordInputProps,
  ValidationMessage 
} from '@sentinel-password/react-components'
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
  
  const result = validatePassword('password123', {
    validators: { length: { min: 8 } }
  })
  console.log(result)
</script>
```

::: warning
CDN usage is not recommended for production. Always install packages via npm for better performance and caching.
:::

## Verify Installation

After installation, verify everything works:

```javascript
import { validatePassword } from '@sentinel-password/core'

const result = validatePassword('Test1234!', {
  validators: {
    length: { min: 8 }
  }
})

console.log(result.isValid) // true
```

## Next Steps

- [Get started with basic usage](/guide/getting-started)
- [Learn about validators](/guide/validators)
- [Explore configuration options](/guide/configuration)
