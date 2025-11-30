# Changesets

This directory contains changeset files that describe changes made to packages in this repository.

## Quick Start

To add a changeset for your changes:

```bash
pnpm changeset:add
```

Follow the interactive prompts to describe your changes.

## What is a Changeset?

A changeset is a file that describes:
- Which packages are affected by your changes
- Whether it's a major, minor, or patch change
- A summary of what changed

When changesets are merged to `main`, our automated workflow:
1. Creates a "Version Packages" PR with updated versions and CHANGELOGs
2. When that PR is merged, automatically publishes to npm and creates GitHub releases

## When to Add a Changeset

✅ Add a changeset when you:
- Add a new feature
- Fix a bug
- Make a breaking change
- Update dependencies that affect users
- Improve performance in a user-visible way

❌ Don't add a changeset for:
- Documentation-only changes
- Internal refactoring (no API changes)
- Test improvements
- CI/CD changes
- Development tooling changes

## Examples

### Adding a Feature (minor version bump)
```bash
pnpm changeset:add
# Select: @sentinel-password/core
# Select: minor
# Summary: Add new validateStrength() function for custom strength scoring
```

### Fixing a Bug (patch version bump)
```bash
pnpm changeset:add
# Select: @sentinel-password/core
# Select: patch
# Summary: Fix TypeScript types for validatePassword return value
```

### Breaking Change (major version bump)
```bash
pnpm changeset:add
# Select: @sentinel-password/core
# Select: major
# Summary: Change validatePassword to return Promise instead of sync result
```

## More Information

See [RELEASE.md](../RELEASE.md) for the complete release process documentation.

---

*Original documentation: https://github.com/changesets/changesets*
