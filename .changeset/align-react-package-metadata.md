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
- `usePasswordValidator` JSDoc + the `validateOnMount` / `validateOnChange`
  JSDoc in `types.ts` now honestly describe current behavior. `validateOnMount`
  is documented as a no-op (the hook initializes `password` to `''` and there
  is no `initialPassword` option, so the gate `password.length > 0` is never
  true on mount); the example shows the workaround of calling `validatePassword`
  from core directly. `validateOnChange` carries the full behavior matrix
  matching the README/docs-site fix from claim #6. These JSDoc strings ship
  in the bundled `.d.ts` and surface in IDE IntelliSense for hook users.
- README's `setPassword` row no longer says it "triggers validation" outright.
  In manual mode (`debounceMs: 0` + `validateOnChange: false`) `setPassword`
  only updates state — the validate-on-change branches in
  `usePasswordValidator.ts:155-173` don't run. Row now points at the
  `debounceMs` / `validateOnChange` rows for the matrix and notes the
  `validate()` workaround for manual mode.
