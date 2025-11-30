# npm Token Setup Guide

This guide walks you through setting up the NPM_TOKEN required for automated releases.

> ⚠️ **Important**: npm classic token creation is now disabled. Classic tokens will be revoked on December 9, 2025. Use granular access tokens instead.

## Step 1: Create an npm Granular Access Token

### 1.1 Navigate to Access Tokens

1. **Log in to npm**: Go to https://www.npmjs.com and log in
2. **Access token settings**:
   - Click your profile icon → **Access Tokens**
   - Or visit: https://www.npmjs.com/settings/YOUR_USERNAME/tokens

### 1.2 Create New Token

1. Click **"Generate New Token"** button
2. Select **"Granular Access Token"**

### 1.3 Configure Token Settings

You'll see a form with several sections. Fill them out as follows:

#### **General Section**

**Token name** (required):
```
GitHub Actions - sentinel-password
```
*Provide a descriptive name to identify this token*

**Description** (optional):
```
Automated publishing for @sentinel-password packages via GitHub Actions
```
*Helps you remember what this token is for*

**Bypass two-factor authentication (2FA)**:
- ☐ Leave unchecked (more secure)

**Allowed IP ranges** (optional):
- Leave empty (GitHub Actions IPs change frequently)
- If needed, you can add CIDR notation IP ranges

#### **Packages and scopes Section**

**Permissions**:
1. Click the dropdown (currently shows "No access")
2. Select **"Read and write"**
   - This allows publishing and updating packages
   - Required for automated releases

**Note**: After selecting permissions, you may need to specify which packages this token can access. If you see a package selector:
- Select your package: `@sentinel-password/core`
- Or select your organization scope if publishing multiple packages

#### **Organizations Section**

**Permissions**:
1. Click the dropdown (currently shows "No access")  
2. For scoped packages (`@sentinel-password/*`):
   - Select **"Read and write"** or **"Read only"** based on your needs
   - Typically "Read only" is sufficient unless you need to manage org settings
3. For non-scoped packages:
   - Leave as "No access"

#### **Expiration Section**

**Expiration Date**:
1. Click the dropdown (default is "30 days")
2. Select an appropriate duration:
   - **30 days** - Most secure, requires frequent renewal
   - **60 days** - Good balance
   - **90 days** - Recommended for CI/CD
   - **1 year** - Less maintenance, slightly less secure
   - **Custom** - Set your own date

**Recommendation**: Choose **90 days** or **1 year** and set a calendar reminder to regenerate before expiration.

### 1.4 Review Summary

The **Summary** section shows:
- ✓ Provide no access to packages and scopes (will change to "Read and write" after you select packages)
- ✓ Provide no access to organizations (or your selected permission)
- ✓ Expires on [your selected date]

### 1.5 Generate Token

1. Review all settings carefully
2. Click **"Generate token"** button
3. **CRITICAL**: Copy the token immediately - you'll only see it once!
4. Store it temporarily in a secure location (password manager recommended)

## Step 2: Add Token to GitHub Secrets

### 2.1 Navigate to GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** (top navigation)
3. In left sidebar, click **Secrets and variables** → **Actions**
4. Or visit directly:
   ```
   https://github.com/akankov/sentinel-password/settings/secrets/actions
   ```

### 2.2 Create Repository Secret

1. Click **"New repository secret"** (green button)

2. Fill in the form:
   - **Name**: `NPM_TOKEN`
     - ⚠️ Must be exactly this (case-sensitive)
   - **Secret**: Paste the token you copied from npm
     - Make sure there are no extra spaces or newlines

3. Click **"Add secret"**

### 2.3 Verify Secret

- You should see `NPM_TOKEN` in your "Repository secrets" list
- The value will be hidden (shown as `***`)
- Updated timestamp should show "Updated now"

## Step 3: Verify Setup Works

### 3.1 Test the Workflow

```bash
# Create a test changeset
pnpm changeset:add

# Follow the prompts:
# - Select: @sentinel-password/core
# - Bump type: patch
# - Summary: Test automated release workflow

# Commit and push
git add .
git commit -m "chore: test release automation"
git push
```

### 3.2 Check GitHub Actions

1. Go to: https://github.com/akankov/sentinel-password/actions
2. Find the **"Release"** workflow
3. Click on the most recent run

**Expected Results**:
- ✅ Workflow runs successfully (green checkmark)
- ✅ No authentication errors
- ✅ A "Version Packages" PR is created automatically
- ✅ When you merge that PR, package publishes to npm

### 3.3 Troubleshoot if Needed

If you see errors, check the "Troubleshooting" section below.

## Token Security Best Practices

### ✅ DO:

- ✅ Use **Granular Access Tokens** (classic tokens are deprecated)
- ✅ Set an expiration date (30-90 days recommended)
- ✅ Use descriptive token names
- ✅ Store tokens only in secure locations (GitHub Secrets, password managers)
- ✅ Set a calendar reminder before token expiration
- ✅ Revoke tokens immediately if compromised
- ✅ Use minimum required permissions (Read and write for specific packages only)
- ✅ Review and audit tokens regularly

### ❌ DON'T:

- ❌ Use classic tokens (they will be revoked December 9, 2025)
- ❌ Commit tokens to git
- ❌ Share tokens via email, Slack, or other insecure channels
- ❌ Use tokens with "All packages" permission unless necessary
- ❌ Set tokens to never expire
- ❌ Reuse the same token across multiple projects
- ❌ Store tokens in plain text files or code

## Troubleshooting

### ❌ "Invalid authentication token" or "401 Unauthorized"

**Problem**: Workflow fails with authentication error

**Solutions**:
1. ✓ Verify token is copied correctly (no extra spaces or newlines)
2. ✓ Check token hasn't expired (check expiration date on npm)
3. ✓ Ensure you created a "Granular Access Token" (not classic)
4. ✓ Verify the GitHub secret name is exactly `NPM_TOKEN`
5. ✓ Try regenerating a new token and updating GitHub secret
6. ✓ Make sure you didn't accidentally revoke the token on npm

### ❌ "403 Forbidden" or "Insufficient permissions"

**Problem**: Token doesn't have permission to publish

**Solutions**:
1. ✓ Verify you selected **"Read and write"** permissions in "Packages and scopes"
2. ✓ For scoped packages (`@sentinel-password/core`):
   - Ensure you're a member of the `@sentinel-password` organization on npm
   - Check organization permissions allow publishing
3. ✓ Verify you're listed as a maintainer on the package
4. ✓ Check that the package name in `package.json` matches the token permissions

### ❌ "Package not found" (first publish)

**Problem**: Publishing a package for the first time

**Solutions**:
1. ✓ For scoped packages, ensure the organization exists on npm
2. ✓ Verify package name in `package.json` is correct
3. ✓ Check package name availability: `npm view @sentinel-password/core`
4. ✓ Ensure token has permission for the specific package or organization

### ❌ Token Expired

**Problem**: Token expiration causes workflow to fail

**Solutions**:
1. Generate a new token (follow Step 1 again)
2. Update GitHub secret:
   - Go to: Settings → Secrets and variables → Actions
   - Click on `NPM_TOKEN`
   - Click **"Update secret"**
   - Paste new token value
   - Click **"Update secret"**
3. Set a new calendar reminder for expiration

### ❌ "Bypass 2FA is required"

**Problem**: Your npm account requires 2FA but token doesn't bypass it

**Solutions**:
1. When creating token, check **"Bypass two-factor authentication (2FA)"**
2. Or configure your account to allow automation tokens without 2FA bypass

## Token Types Comparison

### Granular Access Tokens ✅ (Use This)

- ✅ Fine-grained permissions per package
- ✅ Configurable expiration
- ✅ IP allowlist support
- ✅ Audit trail
- ✅ Can bypass 2FA for automation
- ✅ **Required after December 9, 2025**

### Classic Tokens ⚠️ (Deprecated)

- ⚠️ Full account access (security risk)
- ⚠️ No expiration options
- ⚠️ No IP restrictions
- ⚠️ Being phased out
- ⚠️ **Will be revoked December 9, 2025**
- ❌ **DO NOT USE**

## Maintenance

### Regular Token Rotation

Set calendar reminders to rotate tokens before expiration:

**30 days before expiration**:
- Warning reminder to prepare

**7 days before expiration**:
- Generate new token
- Update GitHub secret
- Test workflow

**Best Practice**: Rotate tokens every 90 days even if longer expiration is set.

### Token Audit Checklist

Review quarterly:
- [ ] All tokens have expiration dates
- [ ] Tokens use minimum required permissions
- [ ] Unused tokens are revoked
- [ ] Token names are descriptive
- [ ] Documentation is up-to-date

## Additional Resources

- [npm Granular Access Tokens Docs](https://docs.npmjs.com/creating-and-viewing-access-tokens#creating-granular-access-tokens-on-the-website)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [npm Publishing with CI/CD](https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow)
- [npm Token Best Practices](https://docs.npmjs.com/about-access-tokens)

## Pre-Merge Checklist

Before merging your release automation PR, verify:

- [ ] npm granular access token created
- [ ] Token name is descriptive (e.g., "GitHub Actions - sentinel-password")
- [ ] "Packages and scopes" permissions set to **"Read and write"**
- [ ] Expiration date set (90 days or 1 year recommended)
- [ ] Token added to GitHub Secrets as `NPM_TOKEN` (exact name)
- [ ] Secret name verified (case-sensitive)
- [ ] Test workflow completed successfully
- [ ] Calendar reminder set for token expiration
- [ ] Token rotation procedure documented

## Quick Reference

| Setting | Recommended Value |
|---------|------------------|
| Token name | `GitHub Actions - sentinel-password` |
| Packages and scopes | Read and write |
| Organizations | No access (or Read only if needed) |
| Expiration | 90 days or 1 year |
| IP ranges | Leave empty |
| Bypass 2FA | Unchecked (unless required) |
| GitHub Secret Name | `NPM_TOKEN` (exact) |

---

**Questions?** Open an issue or check the [npm token documentation](https://docs.npmjs.com/creating-and-viewing-access-tokens).
