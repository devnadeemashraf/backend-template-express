# Contributing to Backend Template Express

Thank you for considering contributing to Backend Template Express! This document outlines the guidelines for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by its terms.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers understand your report, reproduce the behavior, and find related reports.

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title** for the issue
- **Describe the exact steps to reproduce the problem** in as much detail as possible
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots or animated GIFs** if possible
- **If the problem wasn't triggered by a specific action**, describe what you were doing before the problem happened

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

- **Use a clear and descriptive title** for the issue
- **Provide a step-by-step description of the suggested enhancement** in as much detail as possible
- **Provide specific examples to demonstrate the steps** or point to similar features in other apps
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why
- **Explain why this enhancement would be useful** to most users

### Pull Requests

- Fill in the required template
- Do not include issue numbers in the PR title
- Include screenshots and animated GIFs in your pull request whenever possible
- Follow the TypeScript and JavaScript styleguides
- Include unit tests
- Document new code
- End all files with a newline

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Consider starting the commit message with an applicable emoji:
  - 🎨 `:art:` when improving the format/structure of the code
  - 🐎 `:racehorse:` when improving performance
  - 🚱 `:non-potable_water:` when plugging memory leaks
  - 📝 `:memo:` when writing docs
  - 🐛 `:bug:` when fixing a bug
  - 🔥 `:fire:` when removing code or files
  - 💚 `:green_heart:` when fixing the CI build
  - ✅ `:white_check_mark:` when adding tests
  - 🔒 `:lock:` when dealing with security
  - ⬆️ `:arrow_up:` when upgrading dependencies
  - ⬇️ `:arrow_down:` when downgrading dependencies
  - 👕 `:shirt:` when removing linter warnings

### TypeScript Styleguide

- Use 2 spaces for indentation
- Prefer `const` over `let` or `var`
- Use PascalCase for types, interfaces, and classes
- Use camelCase for variables, functions, and method names
- Use snake_case for database field names
- Use explicit types rather than relying on type inference

### Testing Styleguide

- Test file names should match the file they are testing with a `.test.ts` suffix
- One assertion per test case when possible
- Be descriptive with your test naming:
  - Bad: `it('works')`
  - Good: `it('returns 404 when user is not found')`

## Setting up your development environment

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/backend-template-express.git`
3. Install dependencies: `npm install`
4. Create a branch for your changes: `git checkout -b your-branch-name`
5. Make your changes
6. Run tests: `npm test`
7. Push to your fork and submit a pull request

Thank you for contributing!
