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

No runtime behavior change.
