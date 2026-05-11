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

No runtime behavior change.
