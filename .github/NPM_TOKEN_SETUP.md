# npm Token Setup — Obsolete

> **This guide is no longer applicable.** Releases use [npm Trusted Publishing (OIDC)](https://docs.npmjs.com/trusted-publishers), not a long-lived `NPM_TOKEN`.

The release workflow (`.github/workflows/release.yml`) requests an OIDC token from GitHub at publish time, exchanges it with npm for short-lived publish credentials, and emits build provenance via `NPM_CONFIG_PROVENANCE=true`. There is **no `NPM_TOKEN` secret** in this repository and none is required to release.

See [`RELEASE_QUICK_START.md`](../RELEASE_QUICK_START.md) for the actual release procedure.

If you need the historical token-setup instructions (for example, you're forking this repo to a registry that doesn't yet support Trusted Publishing), `git log -- .github/NPM_TOKEN_SETUP.md` shows the original ~322-line guide.
