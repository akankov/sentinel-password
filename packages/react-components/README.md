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

`@sentinel-password/core` is a regular `dependency` of this package (not a peer), so installing `@sentinel-password/react-components` automatically pulls in core. You only need to add core explicitly if you're importing from it directly elsewhere in your app.

```bash
npm install @sentinel-password/react-components
# or
pnpm add @sentinel-password/react-components
# or
yarn add @sentinel-password/react-components
```

**Peer dependencies:** React 18 or 19 and React DOM 18 or 19 — bring your own.

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
| `label` | `string` | **required** | Accessible label rendered as `<label>` |
| `description` | `string` | — | Helper text linked via `aria-describedby` |
| `value` | `string` | — | Controlled value. Any *defined* value flips the component to controlled mode — see the [Controlled vs Uncontrolled rules](https://akankov.github.io/sentinel-password/api/react-components#controlled-vs-uncontrolled). |
| `defaultValue` | `string` | — | Uncontrolled initial value. Silently ignored if `value` is defined. |
| `onChange` | `(value: string) => void` | — | Fired with the new string value (not the event) |
| `onValidationChange` | `(result: ValidationResult) => void` | — | Fired whenever validation completes |
| `onShowPasswordChange` | `(show: boolean) => void` | — | Fired when the show/hide toggle changes state |
| `showPassword` | `boolean` | uncontrolled | Controlled show/hide state — omit for uncontrolled toggle |
| `validateOnMount` | `boolean` | `false` | Validate the initial value once on mount — **only if `value`/`defaultValue` is non-empty**. Uses the debounced path; set `debounceMs: 0` for synchronous mount validation. |
| `validateOnChange` | `boolean` | `true` | Validate on every change (debounced). Set to `false` to disable change-driven validation. |
| `debounceMs` | `number` | `300` | Debounce delay in milliseconds. `0` validates synchronously. |
| `showValidationMessages` | `boolean` | `true` | Render the validation messages `<div role="alert">`. Set to `false` to suppress the messages and render your own. |
| `showToggleButton` | `boolean` | `true` | Render the show/hide password button. Set to `false` to suppress (e.g., for a localized custom toggle). |
| `containerClassName` | `string` | `''` | Class on the outer `<div>` wrapper |
| `labelClassName` | `string` | `''` | Class on `<label>` |
| `descriptionClassName` | `string` | `''` | Class on the description `<div>` |
| `inputWrapperClassName` | `string` | `''` | Class on the `<input>` + toggle wrapper |
| `toggleButtonClassName` | `string` | `''` | Class on the show/hide `<button>` |
| `validationClassName` | `string` | `''` | Class on the validation messages `<div>` |
| `className` (and other standard input attrs) | — | — | Forwarded to the underlying `<input>` (`className`, `name`, `placeholder`, `autoFocus`, etc.). See the "reserved" list below for the exceptions. |

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
