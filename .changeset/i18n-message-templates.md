---
'@sentinel-password/core': minor
'@sentinel-password/react': minor
'@sentinel-password/react-components': patch
---

Pluggable i18n message templates. Validators now emit a stable `code` and
`params` alongside `message`, and `validatePassword` accepts two new options
for localization:

- `messages: Partial<Record<MessageCode, string>>` — partial template map
  keyed by stable codes. Templates support `{placeholder}` interpolation.
- `formatMessage: (code, params, defaultMessage) => string` — escape hatch
  for `react-intl`, `i18next`, `lingui`, FormatJS/ICU, etc.

Eight stable `MessageCode`s cover every validator failure:
`length.tooShort`, `length.tooLong`, `characterTypes.missing`,
`repetition.tooMany`, `sequential.found`, `keyboardPattern.found`,
`commonPassword.found`, `personalInfo.found`. New `MessageCode`,
`MessageParams`, `MessageFormatter` types and a `DEFAULT_TEMPLATES`
constant are exported.

```typescript
import { validatePassword } from '@sentinel-password/core'

// Pattern 1: simple template overrides
const result = validatePassword(password, {
  minLength: 12,
  messages: {
    'length.tooShort': 'La contraseña debe tener al menos {minLength} caracteres',
  },
})

// Pattern 2: integrate with an i18n library
const result2 = validatePassword(password, {
  formatMessage: (code, params, defaultMessage) =>
    intl.formatMessage({ id: `sentinelPassword.${code}`, defaultMessage }, params),
})
```

`@sentinel-password/react`'s `usePasswordValidator` accepts the same
options (transparent pass-through). `@sentinel-password/react-components`
forwards them to the underlying hook.

Fully backwards-compatible: the default English strings emitted on
`ValidatorCheck.message` are unchanged, so existing apps using the
lookup-table workaround documented in earlier releases keep working.

See the [i18n guide](https://akankov.github.io/sentinel-password/guide/i18n)
for full examples (Spanish catalog, `react-intl` integration,
re-localizing `characterTypes` via `params.missingTypes`, ICU pluralization).
