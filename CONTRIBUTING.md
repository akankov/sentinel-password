# Contributing to sentinel-password

Thank you for your interest in contributing to sentinel-password! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

This project adheres to the Contributor Covenant [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm (see `packageManager` in `package.json`)

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sentinel-password.git
   cd sentinel-password
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Create a new branch for your work:
   ```bash
   git checkout -b feat/your-feature-name
   ```

## Development Workflow

### Building

Build all packages:
```bash
pnpm build
```

### Testing

Run all tests across the workspace:

```bash
pnpm test
```

Run tests for one package (path is relative to that package, not the repo root):

```bash
pnpm --filter @sentinel-password/core test tests/validators/length.test.ts
```

> Notes:
>
> - **Always scope with `--filter`.** The bare `pnpm test -- path/to/file.test.ts` form does *not* work from the repo root: the root `test` script is `turbo run test`, which forwards the path to every workspace's `vitest run`. Each workspace resolves the path relative to its own cwd, so most workspaces produce noise instead of the focused run you expected.
> - **Pass positional args directly, without `--`.** When a package's `test` script is `vitest run`, `pnpm --filter <pkg> test <path>` correctly appends `<path>` to vitest. Adding `--` in between swallows the path silently — vitest then runs the whole test suite instead of just that file.

Run tests in watch mode for one package:

```bash
pnpm --filter @sentinel-password/core test:watch
```

Run the core package's coverage gate (100% statements/branches/functions/lines required — fails on regression):

```bash
pnpm --filter @sentinel-password/core test:coverage
```

### Linting and Formatting

`pnpm lint` runs ESLint only. Prettier is a separate gate.

Check ESLint:
```bash
pnpm lint
```

Auto-fix ESLint issues:
```bash
pnpm lint:fix
```

Check Prettier formatting:
```bash
pnpm format:check
```

Auto-format with Prettier:
```bash
pnpm format
```

### Type Checking

Run TypeScript strict mode checks:
```bash
pnpm typecheck
```

## Code Style

This project follows strict code style guidelines:

- **TypeScript 6+ strict mode** - no `any` types in production code
- **Imports**: Use `@sentinel-password/*` package aliases; prefer named exports
- **Formatting**: Prettier defaults; no semicolons preferred
- **Naming**: camelCase for functions/vars, PascalCase for types/classes/components
- **Error handling**: Return detailed error objects, never throw in validators
- **JSDoc**: Required for all public APIs

### Security and Performance

- **Never log passwords** - even in debug mode
- Use constant-time comparisons for security-sensitive code
- Core package must stay under the **10 KB gzipped CI ceiling** enforced by `.github/workflows/ci.yml` (currently ~5.5 KB) and remain **zero-dependency**
- Lazy-load dictionaries - never bundle in core

### Accessibility and Internationalization

- **Accessibility**: write components that *can meet* WCAG 2.1 AAA — semantic HTML, ARIA primitives, keyboard support, live regions, `useId()`-linked labels. Page-level conformance (contrast, focus-visible, reduced-motion, surrounding markup) is the consumer's responsibility. If your change adds a gap (e.g., a hardcoded user-facing string that can't be localized today), document it in the [Accessibility guide's Known Gaps section](packages/docs/docs/guide/accessibility.md#known-gaps).
- **Internationalization**: validators emit a stable `MessageCode` plus a `params` object alongside an English-default `message`. Consumers localize via `ValidatorOptions.messages` (template map) or `ValidatorOptions.formatMessage` (callback for react-intl / i18next / FormatJS); see the [i18n guide](packages/docs/docs/guide/i18n.md). When you add a new validator message:
  - Add a new `MessageCode` to `packages/core/src/types.ts` and a default English template to `DEFAULT_TEMPLATES` in `packages/core/src/messages.ts`. Use `{placeholder}` tokens for dynamic values and pass them via `params` from the validator.
  - Keep the default English **short and stable** — the legacy lookup-table workaround still works because defaults don't change in patch/minor releases. Renaming or rephrasing an existing default English string is a **major** version change.
  - The `MessageCode` itself is part of the public API contract — never rename a code; only add new ones.

## Commit Guidelines

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `test:` - Test additions or updates
- `refactor:` - Code refactoring

### Commit Message Format

- **Subject line**: Max 50 characters, imperative mood
- **Body**: Max 72 characters per line (optional)
- **Footer**: Reference issues or breaking changes (optional)

Example:
```
feat: add keyboard pattern detection validator

Implements detection of common keyboard patterns like "qwerty" and
"asdfgh" to improve password strength validation.

Closes #123
```

## Pull Request Process

1. Ensure all tests pass: `pnpm test`
2. Ensure ESLint passes: `pnpm lint`
3. Ensure Prettier formatting passes: `pnpm format:check`
4. Ensure TypeScript checks pass: `pnpm typecheck`
5. Update documentation if needed
6. Create a pull request with a clear description of the changes
7. Reference any related issues in the PR description
8. Wait for review and address any feedback

### Pull Request Template

When creating a PR, please include:

- **Description**: What does this PR do?
- **Motivation**: Why is this change needed?
- **Testing**: How was this tested?
- **Screenshots**: If applicable (for UI changes)
- **Breaking changes**: Document any breaking changes

## Project Structure

This is a pnpm workspace monorepo:

**Published packages** (`packages/*`):

- `packages/core` — Zero-dependency password validation engine (`@sentinel-password/core`)
- `packages/react` — `usePasswordValidator` React hook (`@sentinel-password/react`)
- `packages/react-components` — Headless `PasswordInput` component (`@sentinel-password/react-components`)

**Internal packages** (not published — listed in `.changeset/config.json` `ignore`):

- `packages/docs` — VitePress documentation site

**Runnable examples** (`examples/*`, all `private: true`):

- `examples/nextjs` — Signup form with App Router and Tailwind CSS
- `examples/vite-react` — Signup form with custom CSS
- `examples/express-backend` — Server-side `/signup` validation with Express 5
- `examples/playground` — Interactive demo of the `PasswordInput` component

**Repo plumbing:**

- `.github/` — GitHub workflows and templates
- `.changeset/` — Changesets for versioning

## Testing Guidelines

- Write tests for all new features and bug fixes
- Aim for high code coverage
- Use descriptive test names that explain what is being tested
- Follow the AAA pattern: Arrange, Act, Assert
- Test edge cases and error conditions

## Documentation

- Update JSDoc comments for public APIs
- Update README.md if adding new features
- Add examples for new functionality
- Keep documentation clear and concise

## Questions?

If you have questions or need help, feel free to:

- Open an issue for discussion
- Check existing issues and documentation
- Review the [README](README.md) for basic information

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
