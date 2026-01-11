# Branch on Issue

A lightweight GitHub Action that automatically creates branches when issues are created.
Features intelligent name sanitization, German umlaut conversion, automatic issue linking, and robust duplicate handling.

---

## Features

- **Automated Branch Creation** – Creates branches automatically when issues are opened
- **Automatic Issue Linking** – Links branches to issues in the Development section (GraphQL)
- **Auto-Assign Author** – Optionally assign the issue author automatically when branch is created
- **Custom Prefixes** – Add custom prefixes like "feature/" or "bugfix/"
- **Duplicate Handling** – Appends numeric suffixes (-1, -2, etc.) for duplicate branch names
- **Enterprise Support** – Works with GitHub Enterprise Server
- **German Umlaut Support** – Converts ä→ae, ö→oe, ü→ue, ß→ss
- **Issue Comments** – Optionally post branch name to issue as comment
- **Label-Based Prefixes** – Optionally use issue labels as branch prefixes
- **Skip Labels** – Prevent branch creation for specific labels
- **Smart Sanitization** – Removes special characters, normalizes spacing, enforces lowercase

---

## Usage

### Basic Setup

```yaml
name: Create Branch on Issue
on:
  issues:
    types: [opened]

jobs:
  create-branch:
    permissions:
      contents: write
      issues: write
    runs-on: ubuntu-latest
    steps:
      - name: Create branch from issue
        uses: lukas-kuntze/devx-action-branch-on-issue@main
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

---

## Configuration

### Inputs

| Input | Description | Required | Default |
|--------|-------------|-----------|----------|
| `add_comment` | Add comment to issue with branch name | ❌ No | `true` |
| `auto_assign` | Automatically assign issue author as assignee | ❌ No | `false` |
| `base_branch` | Base branch to create new branches from | ❌ No | `main` |
| `branch_prefix` | Custom prefix for branch names (e.g., "feature") | ❌ No | `''` |
| `github_token` | GitHub token for authentication | ✅ Yes | - |
| `link_to_issue` | Link branch to issue in Development section | ❌ No | `true` |
| `max_length` | Maximum branch name length | ❌ No | `100` |
| `skip_labels` | Comma-separated labels to skip branch creation | ❌ No | `''` |
| `use_label_prefix` | Use first issue label as branch prefix | ❌ No | `false` |

### Outputs

| Output | Description |
|--------|-------------|
| `branch_name` | Final name of the created branch |
| `linked_to_issue` | Whether the branch was successfully linked to the issue |
| `original_name` | Sanitized name before duplicate handling |
| `was_duplicate` | Whether the branch name was modified due to duplication |

---

## Examples

### Example: Basic Usage

```yaml
- name: Create branch from issue
  uses: lukas-kuntze/devx-action-branch-on-issue@main
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
```

**Issue:** `FEAT-789 Neue Suchfunktion für Übersicht`
**Branch:** `feat-789-neue-suchfunktion-fuer-uebersicht`

---

### Example: Custom Prefix

```yaml
- name: Create feature branch
  uses: lukas-kuntze/devx-action-branch-on-issue@main
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    branch_prefix: feature
```

**Issue:** `Add user authentication`
**Branch:** `feature/add-user-authentication`

---

### Example: Label-Based Prefix

```yaml
- name: Create branch with label prefix
  uses: lukas-kuntze/devx-action-branch-on-issue@main
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    use_label_prefix: true
```

**Issue:** `Implement dark mode`
**Labels:** `enhancement`, `ui`
**Branch:** `enhancement/implement-dark-mode`

---

### Example: Skip Labels

```yaml
- name: Create branch (skip certain labels)
  uses: lukas-kuntze/devx-action-branch-on-issue@main
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    skip_labels: 'wontfix, duplicate, invalid'
```

**Skips branch creation if issue has any of these labels.**

---

### Example: Custom Base Branch

```yaml
- name: Create branch from develop
  uses: lukas-kuntze/devx-action-branch-on-issue@main
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    base_branch: develop
```

---

### Example: Without Comment

```yaml
- name: Create branch silently
  uses: lukas-kuntze/devx-action-branch-on-issue@main
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    add_comment: false
```

---

### Example: Custom Max Length

```yaml
- name: Create short branch names
  uses: lukas-kuntze/devx-action-branch-on-issue@main
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    max_length: 50
```

---

### Example: Disable Issue Linking

```yaml
- name: Create branch without linking
  uses: lukas-kuntze/devx-action-branch-on-issue@main
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    link_to_issue: false
```

**Creates branch via REST API without linking to issue.**

---

### Example: Auto-Assign Issue Author

```yaml
- name: Create branch and assign author
  uses: lukas-kuntze/devx-action-branch-on-issue@main
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    auto_assign: true
```

**Automatically assigns the issue author as the assignee when the branch is created.**

---

## Sanitization Process

The action performs the following transformations:

1. **Convert Umlauts** – `ä→ae`, `ö→oe`, `ü→ue`, `ß→ss`, `Ä→Ae`, `Ö→Oe`, `Ü→Ue`
2. **Lowercase** – Convert entire string to lowercase
3. **Normalize Spacing** – Replace spaces and underscores with hyphens
4. **Remove Special Characters** – Keep only `a-z`, `0-9`, `-`, `/`
5. **Collapse Hyphens** – Replace multiple consecutive hyphens with single hyphen
6. **Trim Hyphens** – Remove leading and trailing hyphens
7. **Add Prefix** – Add custom or label-based prefix (optional)
8. **Truncate** – Limit to maximum length (default: 100 characters)

### Sanitization Examples

| Input | Output |
|-------|--------|
| `FEAT-789 Neue Suchfunktion für Übersicht` | `feat-789-neue-suchfunktion-fuer-uebersicht` |
| `Feature: Neue Übersicht für Benutzer` | `feature-neue-uebersicht-fuer-benutzer` |
| `Fix Bug in Größenberechnung` | `fix-bug-in-groessenberechnung` |
| `Add User Authentication & Authorization` | `add-user-authentication-authorization` |

---

## Duplicate Handling

If a branch with the sanitized name already exists, the action automatically appends a numeric suffix:

- First duplicate: `branch-name-1`
- Second duplicate: `branch-name-2`
- Third duplicate: `branch-name-3`
- And so on...

**Example:**

| Attempt | Branch Name |
|---------|-------------|
| 1st issue | `fix-login-bug` |
| 2nd issue (duplicate) | `fix-login-bug-1` |
| 3rd issue (duplicate) | `fix-login-bug-2` |

---

## Issue Linking

By default, the action links created branches to issues in the **Development** section using GitHub's GraphQL API.

**Benefits:**
- ✅ Branches appear in the issue's Development section
- ✅ Automatic tracking of related branches and PRs
- ✅ Better visibility in GitHub UI

**How it works:**
1. If `link_to_issue: true` (default), uses GraphQL `createLinkedBranch` mutation
2. If GraphQL fails, falls back to REST API (branch created without linking)
3. If `link_to_issue: false`, uses REST API directly

**Example with linking disabled:**
```yaml
- name: Create branch without linking
  uses: lukas-kuntze/devx-action-branch-on-issue@main
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    link_to_issue: false
```

---

## GitHub Enterprise Support

```yaml
- name: Create branch (Enterprise)
  uses: lukas-kuntze/devx-action-branch-on-issue@main
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    github_api_url: 'https://github.company.com/api/v3'
```

---

## How It Works

1. **Read Inputs** – Loads configuration from action inputs
2. **Validate** – Ensures token, base branch, and max length are valid
3. **Extract Issue Context** – Gets issue number, title, labels, and author
4. **Check Skip Labels** – Skips branch creation if issue has skip labels
5. **Sanitize Name** – Converts title to valid Git branch name
6. **Check Duplicates** – Appends numeric suffix if branch exists
7. **Create Branch** – Creates branch via GraphQL (with linking) or REST API (fallback)
8. **Auto-Assign** – Assigns issue author as assignee (optional)
9. **Add Comment** – Posts branch name to issue (optional)
10. **Set Outputs** – Provides branch name and metadata

---

## Requirements

- `contents: write` permission (to create branches)
- `issues: write` permission (to add comments, if enabled)
- Triggered by `issues` event with `opened` type

---

## Author

Created and maintained by **Lukas Kuntze**  
Software Developer · Software Development & IT Services Kuntze  
GitHub: [lukas-kuntze](https://github.com/lukas-kuntze)
