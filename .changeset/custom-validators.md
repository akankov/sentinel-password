---
'@sentinel-password/core': minor
---

Add the long-promised `customValidators` option to `validatePassword`:

```typescript
validatePassword(password, {
  customValidators: {
    noDates: (pw) =>
      /\d{4}/.test(pw) ? { passed: false, message: 'No dates' } : { passed: true },
  },
})
```

Custom checks run after the seven built-ins and participate fully in the
result: they count toward `valid` and the strength score (denominator grows
to `7 + N`), appear in `result.checks` under their registered names, surface
structured `failures` (code defaults to `custom.<name>`), and their messages
join `feedback.suggestions`. Built-in check names are reserved (colliding
entries are skipped); a throwing or malformed validator is treated as a
failed check — `validatePassword` still never throws.

New exported types: `CustomValidator`, `CustomValidatorCheck`. Type-level
widenings: `ValidationResult.checks` gains a string index signature, and
`ValidationFailure.check`/`code` widen to also admit custom names/codes
(built-in literal unions are preserved for completions). The option flows
through the React packages' `validatorOptions` unchanged.
