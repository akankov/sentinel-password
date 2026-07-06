---
'@sentinel-password/core': minor
---

Fix three validator precision bugs that wrongly rejected or accepted passwords:

- **keyboardPattern**: removed the 2-character column pattern `0p`, which failed
  any password containing `0p` or `p0` (matched reversed, case-insensitively) —
  e.g. `Deskt0p`, `Temp0rary!`, `MyLapt0p`. All remaining patterns are 3+ chars.
- **sequential**: only letter and digit runs count as sequences now. ASCII
  symbol/punctuation runs that happen to be code-point-consecutive (`()*`,
  `?@A`, `[\]`) — typical of password-manager output — are no longer flagged.
  Non-ASCII alphabets (e.g. Cyrillic `абв`) are still detected.
- **length**: `minLength`/`maxLength` now count Unicode code points instead of
  UTF-16 code units, matching the repetition validator and NIST 800-63B's
  user-perceived-character guidance. Four emoji no longer satisfy `minLength: 8`.

No API or message-string changes; only validation outcomes on the affected
edge cases differ.
