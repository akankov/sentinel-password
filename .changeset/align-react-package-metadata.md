---
'@sentinel-password/react': patch
'@sentinel-password/react-components': patch
---

Align package metadata and runtime deps with what's actually exported.

- `@sentinel-password/react`: description, keywords, and the bundled `.d.ts` header
  no longer claim the package ships components — it only exports the
  `usePasswordValidator` hook.
- `@sentinel-password/react-components`: removed the unused
  `@sentinel-password/react` runtime dependency (the package never imported it),
  and the README no longer claims the components are "built on" it. The
  components import `validatePassword` directly from `@sentinel-password/core`.
  Consumers now install one fewer transitive package.
