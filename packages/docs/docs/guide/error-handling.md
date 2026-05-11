# Error Handling

`validatePassword` doesn't *throw* — it returns a structured result with a boolean verdict, a strength score, and human-readable feedback. This guide documents the actual shape of that result and the patterns for handling it in practice. Per-message severity is still on the [roadmap](#whats-not-here-yet); stable error codes and custom message overrides shipped in v1.2.0 — see the [i18n guide](/guide/i18n) and [Core API](/api/core#messagecode-messageparams-messageformatter).

## What you get back

```typescript
interface ValidationResult {
  valid: boolean
  score: StrengthScore // 0 | 1 | 2 | 3 | 4
  strength: StrengthLabel // 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong'
  feedback: {
    warning?: string
    suggestions: readonly string[]
  }
  checks: Record<CheckId, boolean>
}
```

| Field | Use it for |
|-------|------------|
| `valid` | The single source of truth for "is this password acceptable?" Use it to gate submit. |
| `score` / `strength` | UX cues — strength meter, color coding. **Not** acceptance decisions: `strength` can be `'very-strong'` while `valid` is `false`. See [Scoring caveat](#scoring-caveat) below. |
| `feedback.warning` | The first suggestion in aggregator order, surfaced for prominent display. |
| `feedback.suggestions` | All failure messages, in [aggregator order](#aggregator-ordering). Each entry is a rendered string (default English unless you supplied `messages` / `formatMessage`). Stable per-failure codes are available on `result.checks` keys and on each underlying `ValidatorCheck.code`; per-message severity is not yet exposed. |
| `checks` | Per-validator pass/fail map. Inspect this when you want to know *which* check rejected the input. |

## Acceptance gating

Always gate submit on `valid`, never on `strength`:

```tsx
const result = validatePassword(password, options)

// ✅ Correct: valid is true only if every check passed.
if (!result.valid) return

// ❌ Wrong: 'strong' or 'very-strong' can both still have valid=false.
if (result.strength === 'strong' || result.strength === 'very-strong') {
  /* … */
}
```

## Surfacing failures to the user

`feedback.suggestions` is the list to render. Each entry is a plain English string suitable for display. The `feedback.warning` field is just `suggestions[0]` — surface it prominently if you want a single "headline" message:

```tsx
{result && !result.valid && (
  <div role="alert" aria-live="polite">
    {result.feedback.warning && <p className="error-headline">{result.feedback.warning}</p>}
    <ul>
      {result.feedback.suggestions.map((msg, i) => (
        <li key={i}>{msg}</li>
      ))}
    </ul>
  </div>
)}
```

For accessibility, the wrapping element should be a live region (`role="alert" aria-live="polite"`) so screen readers announce updates as the user types.

## Aggregator ordering

`validatePassword` runs all seven validators on every call, in this fixed order, and collects failure messages into `suggestions`:

1. `length`
2. `characterTypes`
3. `repetition`
4. `sequential`
5. `commonPassword`
6. `personalInfo`
7. `keyboardPattern`

So `feedback.warning` (== `suggestions[0]`) is always the *first failure in this order*, not the most important one. For an input like `'john1234!'` with `personalInfo: ['john@example.com']`, three checks fail (`sequential`, `personalInfo`, `keyboardPattern`) — `warning` is the sequential message because `sequential` runs before `personalInfo` in the order, not because sequential is "more critical."

If you need to react to a *specific* failure, inspect `result.checks`:

```tsx
if (!result.checks.commonPassword) {
  // Flag rejected by the common-password validator specifically.
}
```

## Scoring caveat

`score` is purely a passed-check ratio: `Math.min(4, Math.floor((passedChecks / 7) * 5))`. So a password that fails *only one* check (e.g., is a known common password but otherwise excellent) still scores 4 / `'very-strong'` while `valid` is `false`. The strength label communicates "how much of the policy this passes," not "is this acceptable." Treat them as orthogonal signals.

## Server-side handling

For backend code, `validatePassword` returns the same shape — render `feedback.warning` / `feedback.suggestions` as the response body and let the client display them. See the [Server-Side Usage guide](/guide/server-side) for the full Express / Fastify / NestJS patterns.

Critical: **never log the password or the full result in production.** The result includes password-derived inferences (`checks`, `suggestions`) — leaking the failure shape from logs can help an attacker who later obtains the logs. Store only the bit you act on (`valid`):

```typescript
const result = validatePassword(req.body.password, options)
if (!result.valid) {
  return res.status(400).json({
    suggestions: result.feedback.suggestions, // OK to send to the requester
  })
}
// Do NOT: logger.info({ result }) — captures the failure shape in logs.
```

## What's shipped, what's not

Shipped in v1.2.0:

- **Stable error codes** on each `ValidatorCheck.code` (`'length.tooShort'`, `'characterTypes.missing'`, etc.) plus `params` for interpolation values. See [`MessageCode`](/api/core#messagecode-messageparams-messageformatter).
- **Custom message overrides** via `ValidatorOptions.messages` (template map) and `ValidatorOptions.formatMessage` (callback for react-intl / i18next / ICU). See the [i18n guide](/guide/i18n).

Still on the roadmap (does not exist yet):

- **Per-message severity.** All `suggestions` are at the same level. The `ValidationMessageSeverity` type in `@sentinel-password/react-components` includes `'warning' | 'error' | 'success'`, but the `PasswordInput` component only ever emits `'warning'` and `'error'` today (see [react-components API: Validation Messages](/api/react-components#validation-messages)).

## See Also

- [Validators](/guide/validators) — what each check rejects and how to relax it
- [Core API](/api/core) — the full `ValidationResult` and option types
- [Internationalization](/guide/i18n) — translating the English messages
- [Server-Side Usage](/guide/server-side) — handling results outside the browser
