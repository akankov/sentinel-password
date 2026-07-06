---
'@sentinel-password/breach': patch
---

Honor the documented "never throws" contract in two edge cases:

- `checkBreach` no longer throws a `TypeError` when a user-injected
  `options.fetch` rejects with a nullish or primitive reason — it now
  resolves to `{ status: 'error', reason: 'network' }` as documented.
- A throwing or misbehaving user-supplied `options.cache` (e.g. a
  localStorage-backed cache hitting quota/security errors, or `get`
  returning a non-string) is treated as a cache miss; a failing
  `cache.set` after a successful fetch is ignored.
