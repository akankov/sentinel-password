---
'@sentinel-password/react': minor
---

Add `initialPassword` option to `usePasswordValidator` so the hook can be
seeded with a non-empty value on mount (e.g. password-reset or edit-profile
flows that echo a value back to the user).

This fills a real API gap: `validateOnMount` already existed but was
documented as a no-op because the hook hard-initialized `password` to `''`
and the mount effect only ran when `password.length > 0`. With
`initialPassword`, `validateOnMount: true` now does what its name implies —
validates the seeded value on first render. The input stays fully
controlled by `setPassword` afterwards.

```tsx
const { password, setPassword, result } = usePasswordValidator({
  initialPassword: existingPassword,
  validateOnMount: true,
  minLength: 8,
})
// `result` is populated on first render with the validation of
// `existingPassword`; subsequent edits go through `setPassword`.
```

Backwards-compatible: `initialPassword` defaults to `''`, so the hook
still starts empty unless the caller opts in, and `validateOnMount`
remains a no-op when the seed is empty.
