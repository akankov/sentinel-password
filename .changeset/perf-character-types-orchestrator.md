---
'@sentinel-password/core': patch
---

Two internal perf optimizations to close the gap vs `check-password-strength` and `password-validator`:

1. **`validateCharacterTypes`** — replace up to 4 separate `RegExp.test()` scans
   of the password with one `charCodeAt` loop + a `Set<number>` of symbol code
   points. Early-exit once every required class is satisfied. Lazy-allocate the
   failure-message arrays only on the failure path. ~38 % faster
   individually (12 M → 16.6 M ops/s). The exported `hasUppercase`,
   `hasLowercase`, `hasDigit`, `hasSymbol` single-purpose helpers are unchanged.

2. **`validatePassword`** orchestrator — eliminate three redundant
   `Object.values(checks)` iterations, merge `passedChecks`/`valid` into a
   single accumulator, and lazy-allocate `feedback.suggestions` (share a frozen
   empty array on the success path).

Combined: ~10–30 % faster on `validatePassword` end-to-end. Bundle gains ~330
bytes gzipped (6.1 KB → 6.4 KB, still well under the 10 KB CI cap). All 250
existing tests pass unchanged; 100 % statement / branch / function / line
coverage maintained. Public API surface (`ValidationResult` shape, validator
exports, message contents) is byte-identical.
