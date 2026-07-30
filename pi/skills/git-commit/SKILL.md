---
name: git-commit
description: "Generate a git commit message. Use when committing staged changes."
---

# Git Commit

## Step 1: Review Existing Style

Check recent history to match the project's conventions:

```bash
git log --oneline -20
```

Note prefix conventions, capitalization, punctuation, tense, issue references, and structure.

## Step 2: Generate Message

If a clear pattern exists, follow it exactly.

Otherwise, default to:

- Imperative mood ("Add", "Fix", "Remove")
- Lowercase first letter, no trailing period
- Single line, ideally under 72 characters
- English only

| ✅ Good | ❌ Avoid | Why |
|---------|----------|-----|
| `add user authentication` | `Added user auth` | wrong mood (use imperative) |
| `fix crash on empty search` | `Fixed a bug` | too vague |
| `add dark mode` | `add dark mode toggle in settings with CSS variables` | too detailed |
| `remove deprecated endpoints` | `Removed some stuff` | informal wording |

For complex changes, use a summary line + blank line + bullet points:

```
refactor payment processing pipeline

- extract validation into separate module
- add retry logic for transient failures
- update unit tests to cover edge cases
```
