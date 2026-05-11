---
'@sentinel-password/react-components': minor
---

Close the i18n loop for `PasswordInput`. The component now accepts a nested
`validatorOptions` prop that forwards to every internal `validatePassword(...)`
call — covering both validator policy (`minLength`, `requireUppercase`,
`personalInfo`, …) and the v1.2.0 i18n options (`messages`, `formatMessage`):

```tsx
<PasswordInput
  label="Contraseña"
  validatorOptions={{
    minLength: 12,
    messages: { 'length.tooShort': 'Mínimo {minLength} caracteres' },
  }}
/>
```

`validatorOptions` is nested rather than spread because the component's prop
type already extends `React.InputHTMLAttributes<HTMLInputElement>`, which
defines `minLength` / `maxLength` as HTML attributes — a flat spread would
collide. Memoize the object in the consumer if it contains closures like
`formatMessage`, otherwise the component re-validates whenever the
reference changes.

Four new props localize the visibility toggle's English text:

- `toggleShowText` / `toggleHideText` — visible button label (default `'Show'` / `'Hide'`)
- `toggleShowLabel` / `toggleHideLabel` — `aria-label` (default `'Show password'` / `'Hide password'`)

Closes the gap documented in `packages/react-components/README.md`'s
"Known gaps" section since `1.0.0`.

Backwards-compatible: every new prop is optional and defaults to the
previous behaviour (default core policy, English toggle text).
