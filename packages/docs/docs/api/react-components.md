# React Components API

The `@sentinel-password/react-components` package provides an accessible, headless `PasswordInput` component.

## Installation

```bash
npm install @sentinel-password/react-components @sentinel-password/core
```

**Peer Dependencies:**
- React 18+ or React 19+
- React DOM 18+ or React 19+

## Components

### `<PasswordInput />`

A headless password input that runs validation through `@sentinel-password/core` and exposes the result via callback.

**Features:**
- WCAG 2.1 AAA compliant
- Full ARIA support (`aria-invalid`, `aria-describedby`, `aria-live`, `aria-pressed`)
- Keyboard navigation, including `Escape` to clear
- Show/hide password toggle
- Real-time validation with debouncing
- Controlled and uncontrolled modes
- Completely unstyled — bring your own CSS

::: warning Validation runs with the default policy
The component currently runs `validatePassword(password)` with no options — it always uses the built-in defaults (min length 8, all `check*` flags on, no required character types, no `personalInfo`). If you need a custom policy, use the [`usePasswordValidator` hook](/api/react) and render your own input. A future release may add a `validatorOptions` prop.
:::

## Props

`PasswordInput` extends `Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'>`. Most standard input attributes are forwarded to the underlying `<input>` — but the component reserves several for its own a11y and controlled-state logic (see [Reserved props](#reserved-props) below).

**Forwarded** (consumer values reach the `<input>`): `name`, `placeholder`, `className`, `style`, `autoFocus`, `required`, `minLength`, `maxLength`, `pattern`, `inputMode`, `onFocus`, `onBlur`, `data-*`, etc.

```typescript
interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  // Required
  label: string

  // Optional content
  description?: string

  // Callbacks
  onChange?: (value: string) => void
  onValidationChange?: (result: ValidationResult) => void
  onShowPasswordChange?: (show: boolean) => void

  // Behavior
  showPassword?: boolean
  validateOnMount?: boolean   // Default: false
  validateOnChange?: boolean  // Default: true
  debounceMs?: number         // Default: 300

  // Visibility flags
  showValidationMessages?: boolean // Default: true
  showToggleButton?: boolean       // Default: true

  // Class names (each targets a specific subtree)
  containerClassName?: string
  labelClassName?: string
  descriptionClassName?: string
  inputWrapperClassName?: string
  toggleButtonClassName?: string
  validationClassName?: string
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — *(required)* | Accessible label rendered as `<label>` |
| `description` | `string` | — | Helper text below the label, linked via `aria-describedby` |
| `onChange` | `(value: string) => void` | — | Fired with the new string value (not the event) |
| `onValidationChange` | `(result: ValidationResult) => void` | — | Fired whenever validation completes |
| `showPassword` | `boolean` | uncontrolled | Controlled show/hide state |
| `onShowPasswordChange` | `(show: boolean) => void` | — | Fired when the toggle button changes state |
| `validateOnMount` | `boolean` | `false` | Validate the initial value once on mount — but **only if `value`/`defaultValue` is non-empty** (an empty initial input silently skips). Mount validation goes through the same debounce path as normal validation, so the result lands ~`debounceMs` after mount; set `debounceMs: 0` for synchronous mount validation. |
| `validateOnChange` | `boolean` | `true` | Validate on every change (debounced) |
| `debounceMs` | `number` | `300` | Debounce delay for validation. `0` validates synchronously. |
| `showValidationMessages` | `boolean` | `true` | Render the validation `<ul>` |
| `showToggleButton` | `boolean` | `true` | Render the show/hide button |
| `containerClassName` | `string` | `''` | Class on the outer `<div>` wrapper |
| `labelClassName` | `string` | `''` | Class on `<label>` |
| `descriptionClassName` | `string` | `''` | Class on the description `<div>` |
| `inputWrapperClassName` | `string` | `''` | Class on the `<input>` + toggle wrapper |
| `toggleButtonClassName` | `string` | `''` | Class on the show/hide `<button>` |
| `validationClassName` | `string` | `''` | Class on the validation messages `<div>` |
| `className` | `string` | — | Forwarded to the `<input>` itself (via spread) |
| ...standard input props | — | — | `name`, `placeholder`, `autoFocus`, `required`, etc. — see [Reserved props](#reserved-props) for what doesn't pass through |

### Reserved Props

The component owns these and overrides any consumer value. Passing them is harmless but has no effect:

| Prop | Why it's reserved |
|------|-------------------|
| `id` | Generated via `useId()` so the `<label>` can be associated with the input |
| `onChange` | Replaced with a `(value: string) => void` signature — see the `onChange` row above |
| `aria-describedby` | Built dynamically from `description` and validation message IDs |
| `aria-invalid` | Set automatically when validation fails |
| `autoComplete` | Hardcoded to `"new-password"` — appropriate for the password use case and prevents browsers from autofilling other credentials |
| `ref` | Not forwarded — the component is not wrapped in `React.forwardRef` |
| `type` | Toggled internally between `"password"` and `"text"`; `Omit`-ed from the props type so you can't pass it |

`onKeyDown` is **wrapped, not overridden**: the component handles `Escape` (clears the input) and then calls your handler for all keys, so user `onKeyDown` continues to receive events.

### Controlled vs Uncontrolled

`PasswordInput` decides controlled mode by checking `value !== undefined` — *not* by checking whether `onChange` is also supplied. The rule:

| What you pass | Mode | Notes |
|---------------|------|-------|
| Neither `value` nor `defaultValue` | Uncontrolled | Internal state starts as `""`. |
| `defaultValue="…"` only | Uncontrolled | Internal state seeded from `defaultValue`. |
| `value="…"` + `onChange` | Controlled | Standard React pattern. You own the state. |
| `value="…"` **without** `onChange` | Controlled — but **broken** | React owns the value but you never update it, so the input is effectively read-only. `defaultValue` is silently ignored in this case too. Almost always a bug. |

If you find yourself wanting `defaultValue` *and* `value` together, you actually want either fully controlled (drop `defaultValue`, lift state to your component) or fully uncontrolled (drop `value`, keep `defaultValue`).

## Basic Usage

### Simple

```tsx
import { PasswordInput } from '@sentinel-password/react-components'

function SignupForm() {
  return (
    <form>
      <PasswordInput
        label="Create Password"
        description="At least 8 characters"
        onValidationChange={(result) => console.log(result.strength)}
      />
    </form>
  )
}
```

### Controlled

```tsx
import { PasswordInput } from '@sentinel-password/react-components'
import { useState } from 'react'
import type { ValidationResult } from '@sentinel-password/core'

function SignupForm() {
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<ValidationResult | undefined>()

  return (
    <form>
      <PasswordInput
        label="Create Password"
        value={password}
        onChange={setPassword}
        onValidationChange={setResult}
      />

      <button type="submit" disabled={!result?.valid}>
        Create Account
      </button>
    </form>
  )
}
```

### Uncontrolled With Default Value

`PasswordInput` does not currently forward refs. For uncontrolled usage, give the input a `name` (it flows through to the underlying `<input>`) and read the value from `FormData` on submit:

```tsx
import { PasswordInput } from '@sentinel-password/react-components'

function ResetForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    console.log('Submitted:', data.get('password'))
  }

  return (
    <form onSubmit={handleSubmit}>
      <PasswordInput label="New Password" name="password" defaultValue="" />
      <button type="submit">Reset</button>
    </form>
  )
}
```

::: tip Refs are not forwarded
The component is a plain function component, not wrapped in `React.forwardRef`. Passing `ref={...}` will be silently ignored. Use the controlled pattern (`value` + `onChange`) when you need direct access to the value, or the `FormData` pattern above for uncontrolled forms.
:::

## Styling

The component renders only structural HTML and ARIA — every subtree gets its own `*ClassName` prop so you can attach styles selectively. There is no built-in CSS.

### Plain CSS

```tsx
<PasswordInput
  label="Password"
  containerClassName="password-field"
  labelClassName="password-label"
  inputWrapperClassName="password-wrapper"
  className="password-input"
  toggleButtonClassName="password-toggle"
  validationClassName="password-feedback"
/>
```

```css
.password-field { margin-bottom: 1rem; }
.password-label { display: block; font-weight: 600; margin-bottom: 0.5rem; }
.password-wrapper { position: relative; }
.password-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
}
.password-input:focus { border-color: #3c8772; outline: none; }
.password-input[aria-invalid='true'] { border-color: #e53e3e; }
.password-toggle {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
}
.password-feedback { margin-top: 0.5rem; color: #e53e3e; font-size: 0.875rem; }
```

### Tailwind CSS

```tsx
<PasswordInput
  label="Password"
  containerClassName="mb-4"
  labelClassName="block text-sm font-medium text-gray-700 mb-2"
  inputWrapperClassName="relative"
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
  toggleButtonClassName="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm"
  validationClassName="mt-2 text-sm text-red-600"
/>
```

## Behavior Details

### Validation

The component calls `validatePassword(value)` from `@sentinel-password/core` with **no options** — only the default policy applies. The returned `ValidationResult` is forwarded to `onValidationChange` and rendered as a list of messages inside the `validationClassName` container.

If you need custom validation rules, use [`usePasswordValidator`](/api/react) and render your own input.

### Validation Messages

When `showValidationMessages` is true, the component renders:

```html
<div role="alert" aria-live="polite">
  <ul>
    <li data-severity="warning">{feedback.warning}</li>
    <li data-severity="error|success">{...feedback.suggestions}</li>
  </ul>
</div>
```

The `data-severity` attribute lets you style each message kind:

```css
li[data-severity='warning'] { color: orange; }
li[data-severity='error']   { color: red; }
li[data-severity='success'] { color: green; }
```

### Keyboard Shortcuts

- `Tab` / `Shift+Tab`: move between input, toggle button, and surrounding form controls
- `Escape`: clear the input and reset validation (only when input has focus)
- `Space` / `Enter` on the toggle button: show/hide the password

### Show/Hide Toggle

The toggle is a real `<button type="button">` with `aria-pressed` reflecting visibility. Hide it with `showToggleButton={false}` if you don't want it.

```tsx
<PasswordInput label="Password" showToggleButton={false} />
```

You can also control visibility yourself:

```tsx
const [show, setShow] = useState(false)

<PasswordInput
  label="Password"
  showPassword={show}
  onShowPasswordChange={setShow}
/>
```

## TypeScript

```typescript
import { PasswordInput } from '@sentinel-password/react-components'
import type {
  PasswordInputProps,
  ValidationMessage,
  ValidationMessageSeverity,
} from '@sentinel-password/react-components'
```

## See Also

- [Core API Reference](/api/core)
- [React Hook API](/api/react)
- [Accessibility Guide](/guide/accessibility)
- [Examples](/examples/)
