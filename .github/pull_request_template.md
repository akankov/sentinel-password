## Summary

Describe what this pull request changes and why.

## Type of Change

- [ ] feat: New feature
- [ ] fix: Bug fix
- [ ] refactor: Refactoring (no functional change)
- [ ] test: Tests only
- [ ] docs: Documentation only
- [ ] chore: Build/CI/tooling or other chores

## Details

- **Context / Motivation:**
- **Approach:**
- **Related issues:** (e.g. `Closes #123`)

## Breaking Changes

- [ ] Yes (describe below)
- [ ] No

If yes, explain the breaking changes and required migration steps:

## Security

- [ ] Affects password handling, validation, or entropy
- [ ] Touches cryptographic or other security-sensitive logic
- [ ] No security-impacting changes

If there is security impact, describe:

- Risk and potential impact
- Likely attack scenario
- Mitigations in this change
- How you validated the fix

Confirm:

- [ ] I reviewed `SECURITY.md` and this change follows the policy
- [ ] I did not add any logging of passwords, secrets, or other sensitive data

## Testing

Describe how you tested these changes:

- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] Other (describe):

## Core Package Constraints (for `@sentinel-password/core` changes)

- [ ] No new runtime dependencies were added
- [ ] Core bundle remains under 5KB gzipped (if applicable)

## Checklist

- [ ] I have not included any real passwords, secrets, or API keys
- [ ] I have updated or added tests where necessary
- [ ] I have updated documentation where necessary
- [ ] I have followed the existing code style and conventions
