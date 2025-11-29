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

Run all tests:
```bash
pnpm test
```

Run tests for a specific file:
```bash
pnpm test -- path/to/file.test.ts
```

Run tests in watch mode:
```bash
cd packages/core
pnpm test:watch
```

### Linting and Formatting

Check code style:
```bash
pnpm lint
```

Auto-fix lint issues:
```bash
pnpm lint:fix
```

### Type Checking

Run TypeScript strict mode checks:
```bash
pnpm typecheck
```

## Code Style

This project follows strict code style guidelines:

- **TypeScript 5+ strict mode** - no `any` types in production code
- **Imports**: Use `@sentinel-password/*` package aliases; prefer named exports
- **Formatting**: Prettier defaults; no trailing semicolons preferred
- **Naming**: camelCase for functions/vars, PascalCase for types/classes/components
- **Error handling**: Return detailed error objects, never throw in validators
- **JSDoc**: Required for all public APIs

### Security and Performance

- **Never log passwords** - even in debug mode
- Use constant-time comparisons for security-sensitive code
- Core package must remain **< 5KB gzipped** and **zero dependencies**
- Lazy-load dictionaries - never bundle in core

### Accessibility and Internationalization

- Support i18n from day one - no hardcoded English strings
- WCAG 2.1 AAA accessibility compliance required

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
2. Ensure code is properly formatted: `pnpm lint`
3. Ensure TypeScript checks pass: `pnpm typecheck`
4. Update documentation if needed
5. Create a pull request with a clear description of the changes
6. Reference any related issues in the PR description
7. Wait for review and address any feedback

### Pull Request Template

When creating a PR, please include:

- **Description**: What does this PR do?
- **Motivation**: Why is this change needed?
- **Testing**: How was this tested?
- **Screenshots**: If applicable (for UI changes)
- **Breaking changes**: Document any breaking changes

## Project Structure

This is a pnpm workspace monorepo:

- `packages/core` - Zero-dependency password validation engine
- `packages/react` - React hook and headless input component (planned)
- `.github/` - GitHub workflows and templates
- `.changeset/` - Changesets for versioning

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
