# npm Token Setup Guide

This guide walks you through setting up the NPM_TOKEN required for automated releases.

## Step 1: Create an npm Token

1. **Log in to npm**:
   ```bash
   npm login
   ```

2. **Go to npm token settings**:
   - Visit: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Or click your profile → Access Tokens

3. **Generate a new token**:
   - Click **"Generate New Token"**
   - Select **"Automation"** type (for CI/CD)
   - **Important**: Copy the token immediately - you won't see it again!

## Step 2: Add Token to GitHub Secrets

1. **Go to your GitHub repository**:
   ```
   https://github.com/akankov/sentinel-password/settings/secrets/actions
   ```

2. **Click "New repository secret"**

3. **Add the secret**:
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token from Step 1
   - Click "Add secret"

## Step 3: Verify Setup

1. **Test the workflow**:
   - Make a small change
   - Add a changeset: `pnpm changeset:add`
   - Commit and push to main
   - Check GitHub Actions: https://github.com/akankov/sentinel-password/actions

2. **Expected behavior**:
   - Workflow runs successfully
   - "Version Packages" PR is created automatically

## Token Security

✅ **Do**:
- Use "Automation" type tokens for CI/CD
- Store tokens only in GitHub Secrets
- Regenerate tokens periodically
- Revoke tokens if compromised

❌ **Don't**:
- Commit tokens to git
- Share tokens via email/chat
- Use "Publish" type tokens (less secure)
- Reuse tokens across projects

## Troubleshooting

### "Invalid token" error

**Problem**: Workflow fails with authentication error

**Solutions**:
1. Verify token is copied correctly (no extra spaces)
2. Check token hasn't expired
3. Ensure you selected "Automation" type
4. Try generating a new token

### "Insufficient permissions" error

**Problem**: Can't publish package

**Solutions**:
1. Verify you own the package name on npm
2. Check you're a maintainer of the package
3. For scoped packages (@org/pkg), ensure you own the org
4. For first publish, ensure package name isn't taken

## Alternative: Using npm granular access tokens

For better security, you can use granular access tokens (recommended):

1. Go to: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Click "Generate New Token" → "Granular Access Token"
3. Configure:
   - **Name**: "GitHub Actions - sentinel-password"
   - **Expiration**: 90 days (or custom)
   - **Packages and scopes**: Select specific packages
     - Read and write permissions for `@sentinel-password/core`
   - **IP ranges**: Optional, restrict to GitHub Actions IPs
4. Copy token and add to GitHub Secrets as `NPM_TOKEN`

## Need Help?

- [npm token documentation](https://docs.npmjs.com/creating-and-viewing-access-tokens)
- [GitHub Secrets documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
