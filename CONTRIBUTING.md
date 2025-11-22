# Contributing to Branch on Issue

Thank you for your interest in contributing!  
This document explains how to contribute effectively and consistently to this repository.

---

## Table of Contents

- [Commit Message Format](#commit-message-format)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Development Setup](#development-setup)
- [Questions](#questions)

---

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) convention to keep the commit history structured and machine-readable.

### Format

```text
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Examples

```text
feat(sanitizer): add German umlaut conversion support
fix(branch-manager): correct duplicate branch suffix logic
docs(readme): add sanitization process examples
chore(deps): update @actions/github to latest version
```

### Allowed Types

- **build** – Build system or dependency updates  
- **chore** – Maintenance, config, or tooling changes  
- **ci** – Continuous Integration related changes  
- **docs** – Documentation updates  
- **feat** – New features or functionality  
- **fix** – Bug fixes  
- **perf** – Performance improvements  
- **refactor** – Code restructuring without feature or fix  
- **style** – Formatting or stylistic changes  
- **test** – Adding or updating tests  

---

## Branch Naming Conventions

Branches should be named clearly and consistently to make it easy to identify the purpose of a change.

### Format

```text
<type>/<short-description>
```

### Examples

```text
feat/add-umlaut-conversion
fix/duplicate-branch-handling
docs/update-usage-examples
chore/update-dependencies
```

**Allowed types:**  
`build/`, `chore/`, `ci/`, `docs/`, `feat/`, `fix/`, `perf/`, `refactor/`, `style/`, `test/`

---

## Pull Request Guidelines

Before opening a pull request, please ensure the following:

1. Your branch is **rebased** on the latest `main`.  
2. The PR title follows the **Conventional Commit** format (`feat: short description`).  
3. The **Pull Request Template** has been filled out completely.  
4. The change is **small and focused** – aim for ≤ 500 lines where possible.  
5. The **size labeler** will automatically assign XS–XL labels based on lines changed.  
6. PRs exceeding **2000 lines (XL)** should be split into smaller parts.  
7. Documentation has been updated if behavior or configuration changed.  
8. All tests and CI checks pass successfully.

A valid PR should also include:

- A clear summary of the change in the *Description* section  
- The issue reference (e.g., `Fixes: #42`)  
- Confirmation that no secrets (tokens, passwords, etc.) are included  

Refer to the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) for the exact structure.

---

## Development Setup

To work on this action locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/lukas-kuntze/devx-action-branch-on-issue.git
   cd devx-action-branch-on-issue
   ```

2. Activate git hooks:
   ```bash
   git config core.hooksPath .githooks
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run linting and formatting:
   ```bash
   npm run lint      # Check code quality
   npm run format    # Format code with Prettier
   ```

5. Build the action:
   ```bash
   npm run build     # Compile TypeScript
   npm run package   # Bundle with ncc
   npm run all       # Run all steps (format, lint, build, package)
   ```

6. Test your changes:
   - Create a test repository
   - Create a test issue
   - Run the action locally or in a workflow
   - Verify branch creation and naming

---

## Questions

If you have questions, feedback, or ideas for improvement:  
Please open a [discussion](../../discussions) or create an [issue](../../issues).  

---

> **Note:** This project is maintained by **Lukas Kuntze – Software Development & IT Services Kuntze**.  
> External contributions are welcome but may not receive formal support.
