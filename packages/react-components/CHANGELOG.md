# @sentinel-password/react-components

## 1.2.1

### Patch Changes

- Updated dependencies [[`2ac3ef3`](https://github.com/akankov/sentinel-password/commit/2ac3ef3da778afba3313145fb20ec5508af9f746)]:
  - @sentinel-password/core@1.2.1

## 1.2.0

### Minor Changes

- [#164](https://github.com/akankov/sentinel-password/pull/164) [`826c6be`](https://github.com/akankov/sentinel-password/commit/826c6be6d5eaca705ea8645d826c5ed67b287406) Thanks [@akankov](https://github.com/akankov)! - Close the i18n loop for `PasswordInput`. The component now accepts a nested
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

## 1.1.5

### Patch Changes

- Updated dependencies [[`43ef014`](https://github.com/akankov/sentinel-password/commit/43ef01485bbaf94f35fb958dddc10d43d1014fbc)]:
  - @sentinel-password/core@1.2.0

## 1.1.4

### Patch Changes

- [#157](https://github.com/akankov/sentinel-password/pull/157) [`f2005af`](https://github.com/akankov/sentinel-password/commit/f2005af0edd1ac1c5ef0cfbb9052c3c0da746b19) Thanks [@akankov](https://github.com/akankov)! - Correct the package README's claim that "All standard HTML input props are also
  supported (except `type` and `onChange`)." Several props are actually overridden
  by the component after the spread: `id`, `aria-describedby`, `aria-invalid`,
  `autoComplete`, and `ref`. `onKeyDown` is wrapped (the component handles
  `Escape` first, then calls the user handler).

  The README now lists what IS forwarded, what's reserved with the rationale,
  and links to the API reference for the full table and the controlled-vs-
  uncontrolled rules.

  Also corrected the `validateOnMount` row in the same README, which said
  "Validate immediately on mount". The mount validation actually only fires when
  `value`/`defaultValue` is non-empty, and runs through the same debounced path
  as normal validation (so the result lands ~`debounceMs` after mount unless
  `debounceMs: 0`).

  Softened the package README's WCAG claims from "Full accessibility compliance"
  to "Designed for WCAG 2.1 AAA". Conformance is a page-level property; the
  component supplies the building blocks (semantic HTML, ARIA primitives,
  keyboard support, live region) but the consumer owns CSS (contrast,
  focus-visible, reduced-motion), surrounding markup, and localization of the
  toggle button text. Added a "Known gaps" subsection that explicitly names the
  hardcoded English toggle text as a current limitation.

  Added a one-line note above the install commands clarifying that
  `@sentinel-password/core` is a regular `dependency` (not a peer), so the
  single-line install pulls it in transitively. Matches the parallel note added
  to `@sentinel-password/react`'s README and inoculates against future "fix"
  PRs that would add core back to the install command.

  Filled in the README's Props table — it previously omitted nine public
  props that the API reference documents: `validateOnChange`,
  `showValidationMessages`, `showToggleButton`, and all six `*ClassName`
  props (`containerClassName`, `labelClassName`, `descriptionClassName`,
  `inputWrapperClassName`, `toggleButtonClassName`, `validationClassName`).
  A reader landing on the npm page would have missed the entire
  headless-styling surface area. Also added `value`/`defaultValue` rows
  with a pointer to the controlled/uncontrolled rules.

  Tightened `showPassword`'s "Default: false" cell to "uncontrolled" —
  the prop has no default; when omitted the component uses internal
  state.

  Fixed a duplicate-rendering bug in the validation messages list.
  `feedback.warning` is always equal to `feedback.suggestions[0]` (it's the
  first failure message, surfaced by the aggregator for prominent display).
  The `PasswordInput` component previously pushed `feedback.warning` into
  the rendered messages list and then _also_ iterated all of
  `feedback.suggestions`, so `suggestions[0]` always appeared twice — once
  as the warning row and once as the first error row. The component now
  iterates `suggestions` exactly once and renders the first entry with
  `data-severity="warning"` and the rest with `data-severity="error"`,
  matching what the documented rendered-HTML samples (in
  `accessibility.md` and `api/react-components.md`) now describe.

  Fixed an Escape-key desync where `onValidationChange` was never fired
  after the user cleared the input with Escape. The handler called
  `setValidationResult(undefined)` internally, and the
  result-propagation effect was guarded with `if (validationResult)` so
  it skipped the `undefined` transition entirely. The visible symptom:
  consumers' submit gates stayed `true` (the last "valid" result they
  heard about) after the user dismissed the field via Escape, and they
  had to "optimistically invalidate" their parent state from the
  `onChange` handler to work around it (the Next.js example in
  `examples/nextjs/app/page.tsx` had an explicit workaround comment
  calling this out).

  The Escape handler now synchronously runs `validatePassword('')` and
  sets that as the new `validationResult` when `validateOnChange` is
  true (the default), so the existing propagation effect fires
  `onValidationChange` with a real, _invalid_ `ValidationResult` —
  mirroring what happens when the user backspaces to empty. When
  `validateOnChange` is false (manual-validation mode), Escape still
  clears without firing the callback. The public type
  `(result: ValidationResult) => void` stays accurate because the
  component never fires with `undefined`. The Next.js example's
  optimistic-invalidate workaround for the _debounce race_ (mid-type)
  stays, since that race is inherent to debounced validation.

- [#157](https://github.com/akankov/sentinel-password/pull/157) [`f2005af`](https://github.com/akankov/sentinel-password/commit/f2005af0edd1ac1c5ef0cfbb9052c3c0da746b19) Thanks [@akankov](https://github.com/akankov)! - Align package metadata and runtime deps with what's actually exported.
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
    matching the README/docs-site fix from claim [#6](https://github.com/akankov/sentinel-password/issues/6). These JSDoc strings ship
    in the bundled `.d.ts` and surface in IDE IntelliSense for hook users.
  - README's `setPassword` row no longer says it "triggers validation" outright.
    In manual mode (`debounceMs: 0` + `validateOnChange: false`) `setPassword`
    only updates state — the validate-on-change branches in
    `usePasswordValidator.ts:155-173` don't run. Row now points at the
    `debounceMs` / `validateOnChange` rows for the matrix and notes the
    `validate()` workaround for manual mode.

- Updated dependencies [[`f2005af`](https://github.com/akankov/sentinel-password/commit/f2005af0edd1ac1c5ef0cfbb9052c3c0da746b19), [`f2005af`](https://github.com/akankov/sentinel-password/commit/f2005af0edd1ac1c5ef0cfbb9052c3c0da746b19)]:
  - @sentinel-password/core@1.1.4

## 1.1.3

### Patch Changes

- [#155](https://github.com/akankov/sentinel-password/pull/155) [`303dd99`](https://github.com/akankov/sentinel-password/commit/303dd996487be759e08a88e25ab4ab3a70b879e3) Thanks [@akankov](https://github.com/akankov)! - Rebuild with refreshed toolchain devDependencies: `eslint` 10.2.1 → 10.3.0, `typescript-eslint` 8.59.1 → 8.59.2, `turbo` 2.9.8 → 2.9.9, `@changesets/changelog-github` 0.6.0 → 0.7.0. Example apps (`playground`, `vite-react`) also moved to ESLint 10 to align with the root; the Next.js example stays on ESLint 9 until `eslint-config-next` ships an ESLint 10 compatible plugin set. Published artifact bytes are unchanged; the provenance attestations attached to this release reflect the refreshed build environment and can be verified with `npm audit signatures`.

- Updated dependencies [[`303dd99`](https://github.com/akankov/sentinel-password/commit/303dd996487be759e08a88e25ab4ab3a70b879e3)]:
  - @sentinel-password/core@1.1.3
  - @sentinel-password/react@1.1.3 _(no longer a runtime dependency; removed in a subsequent release — see the entry generated from the `align-react-package-metadata` changeset.)_

## 1.1.2

### Patch Changes

- [#152](https://github.com/akankov/sentinel-password/pull/152) [`57fe9ab`](https://github.com/akankov/sentinel-password/commit/57fe9ab7c0dcc792dfaf7772002625122a3e533f) Thanks [@akankov](https://github.com/akankov)! - Drop the redundant `esbuild` pnpm override added in 1.1.1. The `>=0.25.0` floor it provided is already required naturally by every direct consumer of esbuild in the dependency graph (vite, storybook, vitest, tsup), so the GHSA-67mh-4wv8-2f99 patch level is still enforced. Removing the override prevents lockfile regenerations from collapsing two compatible vite versions onto a single esbuild that breaks vitepress's build. Published artifact bytes are unchanged from 1.1.1; the provenance attestations attached to this release reflect the simplified pnpm configuration and can be verified with `npm audit signatures`.

- Updated dependencies [[`57fe9ab`](https://github.com/akankov/sentinel-password/commit/57fe9ab7c0dcc792dfaf7772002625122a3e533f)]:
  - @sentinel-password/core@1.1.2
  - @sentinel-password/react@1.1.2

## 1.1.1

### Patch Changes

- [#147](https://github.com/akankov/sentinel-password/pull/147) [`5831576`](https://github.com/akankov/sentinel-password/commit/5831576beb356dae2ac810574f6e807d0347fd86) Thanks [@akankov](https://github.com/akankov)! - Rebuild with hardened toolchain: the build pipeline now pins `esbuild >= 0.25.0` (closing GHSA-67mh-4wv8-2f99) and constrains transitive `vite` to `>= 6.4.2` via a pnpm override (closing GHSA-4w7w-66w2-5vf9 / CVE-2026-39365). Published artifact bytes are unchanged; the provenance attestations attached to this release reflect the patched build environment and can be verified with `npm audit signatures`.

- Updated dependencies [[`5831576`](https://github.com/akankov/sentinel-password/commit/5831576beb356dae2ac810574f6e807d0347fd86)]:
  - @sentinel-password/core@1.1.1
  - @sentinel-password/react@1.1.1

## 1.1.0

### Minor Changes

- [#138](https://github.com/akankov/sentinel-password/pull/138) [`0adb392`](https://github.com/akankov/sentinel-password/commit/0adb3923f8530b1df79e66c591b9eac8a0ab9b7f) Thanks [@akankov](https://github.com/akankov)! - Publish pipeline now uses npm Trusted Publishing (OIDC) with provenance attestations enabled by default. Consumers can verify published packages with `npm audit signatures`. Release automation simplified — version bumps and publishes trigger automatically from merges to main, no manual workflow dispatch required.

### Patch Changes

- Updated dependencies [[`0adb392`](https://github.com/akankov/sentinel-password/commit/0adb3923f8530b1df79e66c591b9eac8a0ab9b7f)]:
  - @sentinel-password/core@1.1.0
  - @sentinel-password/react@1.1.0

## 1.0.1

### Patch Changes

- [#103](https://github.com/akankov/sentinel-password/pull/103) [`bb49910`](https://github.com/akankov/sentinel-password/commit/bb49910b0d7a3e41acdbd730875bf9e1b58f4874) Thanks [@akankov](https://github.com/akankov)! - chore: update all dependencies to latest versions

- Updated dependencies [[`bb49910`](https://github.com/akankov/sentinel-password/commit/bb49910b0d7a3e41acdbd730875bf9e1b58f4874)]:
  - @sentinel-password/core@1.0.1
  - @sentinel-password/react@1.0.1

## 1.0.0

### Major Changes

- [#120](https://github.com/akankov/sentinel-password/pull/120) [`b394e9d`](https://github.com/akankov/sentinel-password/commit/b394e9d79d86c59bdb9a9aa48154b44643898446) Thanks [@akankov](https://github.com/akankov)! - Release v1.0.0 — first stable release.

  Zero-dependency TypeScript password validation with React integration. Includes 7 built-in validators, bloom filter-based common password detection, headless accessible components, and comprehensive documentation.

### Patch Changes

- Updated dependencies [[`b394e9d`](https://github.com/akankov/sentinel-password/commit/b394e9d79d86c59bdb9a9aa48154b44643898446)]:
  - @sentinel-password/core@1.0.0
  - @sentinel-password/react@1.0.0

## 0.4.8

### Patch Changes

- Updated dependencies [[`e50ee82`](https://github.com/akankov/sentinel-password/commit/e50ee82a5b30739874b943d1f31d76c5b327a439)]:
  - @sentinel-password/core@0.4.6
  - @sentinel-password/react@0.5.8

## 0.4.7

### Patch Changes

- Add documentation site and playground links to package READMEs

- Updated dependencies []:
  - @sentinel-password/core@0.4.5
  - @sentinel-password/react@0.5.7

## 0.4.6

### Patch Changes

- Update to TypeScript 6.0 and typescript-eslint 8.58

- Updated dependencies []:
  - @sentinel-password/core@0.4.4
  - @sentinel-password/react@0.5.6

## 0.4.5

### Patch Changes

- Update homepage links in package metadata to point to the documentation site and playground

- Updated dependencies []:
  - @sentinel-password/core@0.4.3
  - @sentinel-password/react@0.5.5

## 0.4.4

### Patch Changes

- [#103](https://github.com/akankov/sentinel-password/pull/103) [`bb49910`](https://github.com/akankov/sentinel-password/commit/bb49910b0d7a3e41acdbd730875bf9e1b58f4874) Thanks [@akankov](https://github.com/akankov)! - Update development dependencies: ESLint 10, Turbo 2.9, Vitest 4.1.2

- Updated dependencies [[`bb49910`](https://github.com/akankov/sentinel-password/commit/bb49910b0d7a3e41acdbd730875bf9e1b58f4874)]:
  - @sentinel-password/core@0.4.2
  - @sentinel-password/react@0.5.4

## 0.4.3

### Patch Changes

- [#98](https://github.com/akankov/sentinel-password/pull/98) [`47dc1cc`](https://github.com/akankov/sentinel-password/commit/47dc1cc055055b87408f60e5d67f3474d9055d25) Thanks [@akankov](https://github.com/akankov)! - Update Vite to 8.x and @vitejs/plugin-react to 6.x

- Updated dependencies [[`47dc1cc`](https://github.com/akankov/sentinel-password/commit/47dc1cc055055b87408f60e5d67f3474d9055d25)]:
  - @sentinel-password/react@0.5.3

## 0.4.2

### Patch Changes

- [#95](https://github.com/akankov/sentinel-password/pull/95) [`2a3fbb9`](https://github.com/akankov/sentinel-password/commit/2a3fbb93410f9b78184675a7c7cb41ef09cdf8f1) Thanks [@akankov](https://github.com/akankov)! - Migrate Storybook from 8.x to 10.x

- Updated dependencies [[`2a3fbb9`](https://github.com/akankov/sentinel-password/commit/2a3fbb93410f9b78184675a7c7cb41ef09cdf8f1)]:
  - @sentinel-password/react@0.5.2

## 0.4.1

### Patch Changes

- [#91](https://github.com/akankov/sentinel-password/pull/91) [`1196993`](https://github.com/akankov/sentinel-password/commit/1196993adb762eeb5549d2888e4f7c24ee4efcd7) Thanks [@akankov](https://github.com/akankov)! - Update dependencies for minor release

- Updated dependencies [[`1196993`](https://github.com/akankov/sentinel-password/commit/1196993adb762eeb5549d2888e4f7c24ee4efcd7)]:
  - @sentinel-password/core@0.4.1
  - @sentinel-password/react@0.5.1

## 0.4.0

### Minor Changes

- [#84](https://github.com/akankov/sentinel-password/pull/84) [`e179fea`](https://github.com/akankov/sentinel-password/commit/e179fea1e2d324c30374a41e41842e447bed34d7) Thanks [@akankov](https://github.com/akankov)! - Update workspace dependencies to current compatible versions and refresh lockfile.

  This release also updates tooling across examples and docs to keep local development aligned with the latest ecosystem updates.

### Patch Changes

- Updated dependencies [[`e179fea`](https://github.com/akankov/sentinel-password/commit/e179fea1e2d324c30374a41e41842e447bed34d7)]:
  - @sentinel-password/core@0.4.0
  - @sentinel-password/react@0.5.0

## 0.3.0

### Minor Changes

- [#84](https://github.com/akankov/sentinel-password/pull/84) [`0599661`](https://github.com/akankov/sentinel-password/commit/0599661799f62dbb6a8e57d1d6a4639e3e836fcc) Thanks [@akankov](https://github.com/akankov)! - Update workspace dependencies to current compatible versions and refresh lockfile.

  This release also updates tooling across examples and docs to keep local development aligned with the latest ecosystem updates.

### Patch Changes

- Updated dependencies [[`0599661`](https://github.com/akankov/sentinel-password/commit/0599661799f62dbb6a8e57d1d6a4639e3e836fcc)]:
  - @sentinel-password/core@0.3.0
  - @sentinel-password/react@0.4.0

## 0.2.0

### Minor Changes

- [#77](https://github.com/akankov/sentinel-password/pull/77) [`d1fb2fe`](https://github.com/akankov/sentinel-password/commit/d1fb2fe5a5c943b21f4930cdb27daca58db8392a) Thanks [@akankov](https://github.com/akankov)! - Chores. Update dependencies

### Patch Changes

- Updated dependencies [[`d1fb2fe`](https://github.com/akankov/sentinel-password/commit/d1fb2fe5a5c943b21f4930cdb27daca58db8392a)]:
  - @sentinel-password/react@0.3.0
  - @sentinel-password/core@0.2.0

## 0.1.1

### Patch Changes

- # Release v0.1.0 - MVP Release

  ## Core Package

  ### Features
  - Add comprehensive integration tests for user workflows (21 tests)
  - Add performance benchmarks (20+ benchmarks, 47K-2.2M ops/sec)
  - Add interactive examples and playground

  ### Security Fixes
  - Fix esbuild CORS vulnerability (CVE-2025-0216) - update to >= 0.25.0
  - Fix potential ReDoS vulnerability in sequential pattern validator

  ### Documentation
  - Fix API examples to match actual implementation
  - Add VitePress documentation site

  ### Quality
  - 100% statement coverage, 98.34% branch coverage
  - 209 tests total (188 unit + 21 integration)
  - Zero security vulnerabilities
  - Bundle size: 5.41 KB gzipped

  ## React Package

  ### Features
  - usePasswordValidator hook with debouncing support
  - Manual validation and reset functions
  - Loading states for better UX

  ### Quality
  - 97.82% test coverage (22 tests)
  - 0.66 KB gzipped
  - Full TypeScript support

  ## React Components Package

  ### Features
  - Headless PasswordInput component
  - WCAG 2.1 AAA accessibility compliance
  - Controlled and uncontrolled modes
  - Show/hide password toggle
  - Comprehensive keyboard navigation

  ### Quality
  - 94.02% test coverage (26 tests)
  - 1.69 KB gzipped
  - Full ARIA support

- Updated dependencies []:
  - @sentinel-password/core@0.1.3
  - @sentinel-password/react@0.2.1

## 0.1.0

### Minor Changes

- Initial release of React components package
- Add headless PasswordInput component with WCAG 2.1 AAA accessibility
- Support for controlled and uncontrolled modes
- Comprehensive keyboard navigation
- Full TypeScript support with JSDoc documentation
