---
'@sentinel-password/react': minor
---

`usePasswordValidator` gains first-class async check support:

```tsx
const { result, asyncResults, isValidatingAsync } = usePasswordValidator({
  asyncChecks: {
    breach: async (password, signal) => {
      const r = await checkBreach(password)
      if (r.status === 'error') throw new Error(r.reason)
      return r.breached ? { passed: false, message: '…' } : { passed: true }
    },
  },
})
```

Named checks — `(password, signal) => Promise<{ passed, message? }>` — run
whenever validation fires (sharing the same debounce). Per-check state
(`pending`/`passed`/`failed`/`error`) surfaces on the new `asyncResults`
return value with `isValidatingAsync` alongside; the synchronous `result` is
unaffected, so consumers decide how to combine verdicts (including fail-open
vs fail-closed on `'error'`). In-flight checks are aborted via the provided
`AbortSignal` when the password changes again, on `reset()`, and on unmount;
late results from superseded runs never overwrite newer state. New exported
types: `AsyncCheck`, `AsyncCheckResult`, `AsyncCheckState`.

Also replaces the documented `initialPassword` example that modeled echoing a
user's stored plaintext password (an anti-pattern) with a draft-restore flow,
and documents clearing state via `reset()` after submit.
