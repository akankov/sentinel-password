---
'@sentinel-password/breach': minor
---

`checkBreach` accepts a caller-provided `signal?: AbortSignal`, composed with
the internal `timeoutMs` signal via `AbortSignal.any` — whichever fires first
cancels the request. Lets UI layers (e.g. `usePasswordValidator`'s
`asyncChecks`) cancel superseded lookups. An abort resolves to
`{ status: 'error', reason: 'timeout' }`; the never-throws contract holds
even for an already-aborted signal.
