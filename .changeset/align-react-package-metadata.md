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
- `@sentinel-password/react` README install command no longer asks consumers to
  install `@sentinel-password/core` alongside the React package. Core is a
  regular `dependency` (not a peer) of `@sentinel-password/react`, so package
  managers pull it in transitively — the old `npm install @sentinel-password/
  react @sentinel-password/core` form was redundant and implied a peer-dep
  relationship that doesn't exist.
