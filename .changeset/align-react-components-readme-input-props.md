---
'@sentinel-password/react-components': patch
---

Correct the package README's claim that "All standard HTML input props are also
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

No runtime behavior change.
