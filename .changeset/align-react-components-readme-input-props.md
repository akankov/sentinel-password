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
the rendered messages list and then *also* iterated all of
`feedback.suggestions`, so `suggestions[0]` always appeared twice — once
as the warning row and once as the first error row. The component now
iterates `suggestions` exactly once and renders the first entry with
`data-severity="warning"` and the rest with `data-severity="error"`,
matching what the documented rendered-HTML samples (in
`accessibility.md` and `api/react-components.md`) now describe.
