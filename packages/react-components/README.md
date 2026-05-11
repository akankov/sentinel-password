# @sentinel-password/react-components

[![npm version](https://img.shields.io/npm/v/@sentinel-password/react-components.svg)](https://www.npmjs.com/package/@sentinel-password/react-components)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Accessible, headless React components for password validation, built on top of `@sentinel-password/core`.

**[Documentation](https://akankov.github.io/sentinel-password/)** | **[Interactive Playground](https://akankov.github.io/sentinel-password/playground/)** | **[API Reference](https://akankov.github.io/sentinel-password/api/react-components.html)**

## Features

- **Headless & Unstyled** - Bring your own styles
- **Designed for WCAG 2.1 AAA** - Semantic HTML, ARIA live region, full keyboard support, `useId()`-linked label. Page-level conformance depends on the consumer's CSS (contrast) and surrounding markup — see [Accessibility](#accessibility) below.
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
| `validateOnMount` | `boolean` | `false` | Run validation once on mount **only if an initial value is present** (`value` or `defaultValue` non-empty — an empty initial input silently skips). The mount validation goes through the same debounced path as normal change validation, so the result lands ~`debounceMs` after mount (set `debounceMs: 0` for synchronous mount validation). |
| `debounceMs` | `number` | `300` | Debounce delay in ms |

Most standard HTML input attributes are forwarded to the underlying `<input>` — for example `name`, `placeholder`, `className`, `style`, `autoFocus`, `required`, `minLength`, `maxLength`, `pattern`, `inputMode`, `onFocus`, `onBlur`, and `data-*`.

A handful are **reserved** by the component for its a11y and controlled-state internals — passing them is harmless but has no effect at runtime:

- `id` — generated via `useId()` so the `<label>` can be associated correctly
- `aria-describedby` / `aria-invalid` — managed for validation feedback
- `autoComplete` — hardcoded to `"new-password"`
- `ref` — not forwarded (the component is not wrapped in `React.forwardRef`)
- `type` — toggled internally between `"password"` and `"text"`; omitted from the props type
- `onChange` — replaced with the `(value: string) => void` signature documented above

`onKeyDown` is **wrapped** (the component handles `Escape` to clear the input, then calls your handler for all keys) rather than overridden.

See the [API reference](https://akankov.github.io/sentinel-password/api/react-components#reserved-props) for the full table and the controlled-vs-uncontrolled rules.

## Accessibility

The component is designed to *meet* WCAG 2.1 AAA criteria when integrated correctly. It provides:

- Semantic HTML (`<label htmlFor>` linked to the input via `useId()`)
- ARIA attributes managed by the component: `aria-invalid` (`true`/omitted), `aria-describedby`, `aria-pressed` on the toggle button
- A live region (`role="alert" aria-live="polite" aria-atomic="true"`) that mounts only when there's feedback to announce
- Keyboard support: `Tab` between input and toggle, `Escape` to clear the input, `Space`/`Enter` on the toggle button
- Focus management for the input and toggle

The consumer is responsible for:

- **Color contrast** — the component is headless, so CSS is yours. WCAG AAA requires 7:1 for normal text and 4.5:1 for large text.
- **Surrounding markup** — heading structure, landmarks, form semantics, and overall page conformance.
- **Reduced-motion / forced-colors / focus-visible** — these depend on your stylesheet.
- **Localization of toggle text** — see "Known gaps" below.

### Known gaps

- **Toggle button text is hardcoded English.** The visible label ("Show"/"Hide") and `aria-label` ("Show password"/"Hide password") on the visibility toggle are not configurable today. For non-English locales, swap `showToggleButton={false}` and render your own localized toggle, or stay tuned for `toggleShowText`/`toggleHideText` props in a future release.

## Related Packages

- [`@sentinel-password/core`](https://www.npmjs.com/package/@sentinel-password/core) - Core validation engine (zero dependencies)
- [`@sentinel-password/react`](https://www.npmjs.com/package/@sentinel-password/react) - React hook for password validation

## License

MIT © Aleksei Kankov
