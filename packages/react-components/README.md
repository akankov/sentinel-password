# @sentinel-password/react-components

[![npm version](https://img.shields.io/npm/v/@sentinel-password/react-components.svg)](https://www.npmjs.com/package/@sentinel-password/react-components)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Accessible, headless React components for password validation built on top of `@sentinel-password/core` and `@sentinel-password/react`.

**[Documentation](https://akankov.github.io/sentinel-password/)** | **[Interactive Playground](https://akankov.github.io/sentinel-password/playground/)** | **[API Reference](https://akankov.github.io/sentinel-password/api/react-components.html)**

## Features

- **Headless & Unstyled** - Bring your own styles
- **WCAG 2.1 AAA** - Full accessibility compliance
- **Keyboard Navigation** - Complete keyboard support
- **TypeScript** - Full type safety
- **Lightweight** - Minimal bundle size
- **Flexible** - Controlled and uncontrolled modes
- **React 18 & 19** - Supports both React 18 and 19

## Installation

```bash
npm install @sentinel-password/react-components
# or
pnpm add @sentinel-password/react-components
# or
yarn add @sentinel-password/react-components
```

## Quick Start

```tsx
import { PasswordInput } from '@sentinel-password/react-components'

function MyForm() {
  return (
    <form>
      <PasswordInput
        label="Password"
        onValidationChange={(result) => {
          console.log('Valid:', result.valid)
          console.log('Strength:', result.strength)
        }}
      />
    </form>
  )
}
```

## API Reference

### PasswordInput

A headless password input component with built-in validation.

```tsx
<PasswordInput
  label="Password"
  description="Enter a strong password"
  onValidationChange={(result) => console.log(result)}
  onChange={(value) => console.log(value)}
  showPassword={false}
  onShowPasswordChange={(show) => console.log(show)}
  validateOnMount={false}
  debounceMs={300}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | **required** | Accessible label for the input |
| `description` | `string` | - | Optional description text |
| `onValidationChange` | `(result: ValidationResult) => void` | - | Callback when validation state changes |
| `onChange` | `(value: string) => void` | - | Callback when input value changes |
| `showPassword` | `boolean` | `false` | Whether to show/hide the password |
| `onShowPasswordChange` | `(show: boolean) => void` | - | Callback when show/hide toggle changes |
| `validateOnMount` | `boolean` | `false` | Validate immediately on mount |
| `debounceMs` | `number` | `300` | Debounce delay in ms |

All standard HTML input props are also supported (except `type` and `onChange`).

## Accessibility

This component follows WCAG 2.1 AAA guidelines:

- Semantic HTML elements
- ARIA labels and descriptions
- Live regions for validation feedback
- Keyboard navigation support
- Focus management

## Related Packages

- [`@sentinel-password/core`](https://www.npmjs.com/package/@sentinel-password/core) - Core validation engine (zero dependencies)
- [`@sentinel-password/react`](https://www.npmjs.com/package/@sentinel-password/react) - React hook for password validation

## License

MIT © Aleksei Kankov
