---
'@sentinel-password/core': patch
'@sentinel-password/react': patch
'@sentinel-password/react-components': patch
---

Maintenance release: refresh development tooling (Storybook 10.4.6, Vitest
4.1.9, typescript-eslint 8.61.1, knip 6.17.1, eslint-plugin-react-refresh
0.5.3) and pin CI actions (actions/checkout v7, pnpm/action-setup v6.0.9).
No runtime changes — published code is identical in behavior to the previous
versions. entropy and breach are untouched since their last release and are
not bumped.
