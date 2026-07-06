---
'@sentinel-password/react': minor
'@sentinel-password/react-components': minor
---

React layer hardening:

- **Both packages** now emit a `'use client'` banner in their bundles, so they
  can be imported directly in React Server Components environments (Next.js
  App Router) without a consumer-side client wrapper file.
- **react**: `usePasswordValidator` re-validates the current password when
  validator options change (locale/`messages`/`formatMessage`/policy switch) —
  previously the rendered `result` stayed stale until the next keystroke.
  Validator options are also stabilized by shallow value comparison, so inline
  options literals no longer destroy `validate`/`setPassword` callback
  identity on every render.
- **react-components**: `PasswordInput`'s validation live region is now
  always mounted with `role="status"` (implicit polite), replacing the
  conflicting `role="alert"` + `aria-live="polite"` combination on a
  conditionally-mounted node that screen readers announced unreliably.
- **react-components**: externally-changed controlled `value` (form reset,
  "generate password" button) now re-validates, so `aria-invalid` and the
  message list no longer describe the previous value. Respects
  `validateOnChange: false`.
- **react-components**: `autoComplete` is now a default (`"new-password"`)
  instead of hardcoded — pass `autoComplete="current-password"` (login) or
  `"off"` and it is respected.
