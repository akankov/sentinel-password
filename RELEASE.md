# Release Process

This document describes the automated release process for sentinel-password using Changesets and GitHub Actions.

## Overview

We use [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs. The process is highly automated:

1. Developers add changesets describing their changes
2. GitHub Actions creates/updates a "Version Packages" PR
3. When merged, packages are automatically published to npm and GitHub releases are created

## How to Release

### 1. Add a Changeset (Required for every PR with user-facing changes)

When you make changes that should trigger a release, add a changeset:

```bash
pnpm changeset:add
```

Follow the prompts:
- **Select packages**: Choose which packages are affected (e.g., `@sentinel-password/core`)
- **Select bump type**: 
  - `patch` - Bug fixes (0.1.0 → 0.1.1)
  - `minor` - New features (0.1.0 → 0.2.0)
  - `major` - Breaking changes (0.1.0 → 1.0.0)
- **Write summary**: Describe the change from a user's perspective

This creates a file in `.changeset/` that should be committed with your PR.

### 2. Merge Changes to Main

Once your PR with the changeset is merged to `main`, the GitHub Actions workflow automatically:

1. Detects the changeset
2. Creates or updates a PR titled **"chore: version packages"**
3. This PR includes:
   - Updated version numbers in `package.json`
   - Updated `CHANGELOG.md` files
   - Consumed changesets (moved to `.changeset/.changeset`)

### 3. Review and Merge the Version PR

When you're ready to release:

1. Review the **"chore: version packages"** PR
2. Verify the version bumps are correct
3. Check the generated CHANGELOG entries
4. Merge the PR

### 4. Automatic Publishing

Once the version PR is merged, GitHub Actions automatically:

1. ✅ Builds all packages
2. ✅ Runs all tests
3. ✅ Publishes to npm (with `--access public`)
4. ✅ Creates GitHub releases with auto-generated notes
5. ✅ Creates git tags (e.g., `@sentinel-password/core@0.2.0`)

## Manual Release (Emergency)

If you need to publish manually:

```bash
# 1. Version packages
pnpm version

# 2. Review changes
git diff

# 3. Commit version changes
git add .
git commit -m "chore: version packages"

# 4. Publish to npm
pnpm release

# 5. Push changes and tags
git push
git push --tags
```

## Setup Requirements

### GitHub Secrets

The following secrets must be configured in your GitHub repository settings:

1. **`NPM_TOKEN`** (Required for npm publishing)
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Create a new "Automation" token
   - Add to GitHub: Settings → Secrets and variables → Actions → New repository secret
   - Name: `NPM_TOKEN`
   - Value: Your npm token

### GitHub Permissions

The workflow requires these permissions (already configured in `.github/workflows/release.yml`):
- `contents: write` - Create releases and tags
- `pull-requests: write` - Create/update version PRs
- `id-token: write` - Publish to npm with provenance

## Workflow Details

### Release Workflow (`.github/workflows/release.yml`)

**Trigger**: Push to `main` branch

**Steps**:
1. Checkout code
2. Setup pnpm and Node.js
3. Install dependencies
4. Build packages
5. Run Changesets action:
   - If changesets exist → Create/update version PR
   - If version PR merged → Publish to npm
6. Create GitHub releases for published packages

## Best Practices

### When to Add Changesets

✅ **Do add changesets for**:
- New features
- Bug fixes
- Breaking changes
- Performance improvements
- Dependency updates that affect users

❌ **Don't add changesets for**:
- Documentation updates
- Internal refactoring (no API changes)
- Test improvements
- CI/CD changes
- Development tooling changes

### Writing Good Changeset Summaries

**Good examples**:
```
Add bloom filter-based common password validation

Improves performance by 10x for common password checking
using a probabilistic bloom filter instead of array lookups.
```

```
Fix TypeScript types for validatePassword return value

Previously the return type didn't include the `checks` property.
This fix ensures full type safety when accessing validation results.
```

**Bad examples**:
```
Fixed bug
```

```
Update code
```

```
Made changes to validator
```

### Version Bump Guidelines

- **Patch (0.1.0 → 0.1.1)**: 
  - Bug fixes
  - Documentation updates
  - Internal improvements with no API changes

- **Minor (0.1.0 → 0.2.0)**:
  - New features
  - New optional parameters
  - Deprecations (with backward compatibility)
  - Non-breaking performance improvements

- **Major (0.1.0 → 1.0.0)**:
  - Breaking API changes
  - Removing deprecated features
  - Changing function signatures
  - Changing default behavior

## Troubleshooting

### Version PR Not Created

**Problem**: Merged a changeset but no version PR appeared

**Solutions**:
1. Check GitHub Actions logs
2. Verify changeset file is in `.changeset/` directory
3. Ensure changeset file has correct format
4. Check that the workflow has necessary permissions

### Publishing Failed

**Problem**: Version PR merged but publishing failed

**Solutions**:
1. Check `NPM_TOKEN` is valid and not expired
2. Verify npm account has publish permissions
3. Check package name is not already taken
4. Review GitHub Actions logs for specific error

### Wrong Version Bumped

**Problem**: Version bump was too high or too low

**Solutions**:
1. Don't merge the version PR
2. Close it and add a new changeset with correct bump type
3. Changesets will create a new version PR with combined changes

## Checking Release Status

### View Pending Changesets
```bash
pnpm changeset:status
```

### View Current Versions
```bash
pnpm list --depth 0
```

### View Published Versions
```bash
npm view @sentinel-password/core versions
```

## Additional Resources

- [Changesets Documentation](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
