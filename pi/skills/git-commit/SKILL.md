---
name: git-commit
description: "Generate a git commit message. Always review recent log first to match existing style; otherwise default to imperative mood, single-line English summary."
---

# Git Commit

Generate a concise, well-formatted git commit message in English.

## Step 1: Review Existing Style

Always check recent commit history first to match the project's established conventions:

```bash
git log --oneline -20
```

Look for patterns:
- **Prefix conventions**: e.g. `feat:`, `fix:`, `chore:`, `docs:` (Conventional Commits)
- **Capitalization**: initial uppercase vs lowercase
- **Punctuation**: trailing period or not
- **Tense/mood**: imperative ("Add") vs past ("Added") vs gerund ("Adding")
- **Issue references**: `(#123)`, `[JIRA-456]`, etc.
- **Length and structure**: always single-line? multi-line with body?

## Step 2: Generate Message

### If a clear pattern exists → follow it exactly.

### If no clear pattern → default style:

- **Mood**: Imperative mood (verb stem / 動詞原型開頭), as if giving a command
- **Capitalization**: Lowercase first letter
- **Punctuation**: No trailing period
- **Length**: Single line, ideally under 72 characters
- **Language**: English only

| ✅ Good | ❌ Avoid |
|---------|----------|
| `initialize project structure` | `Initialized project structure` |
| `add user authentication module` | `Added user auth` |
| `fix crash on empty search result` | `Fixed a bug` |
| `update dependencies to latest` | `Updating deps` |
| `remove deprecated API endpoints` | `Removed some stuff` |
| `refactor config loading logic` | `Refactored config` |

### When changes are too complex for one line

Provide a short summary line, then a blank line, then bullet points:

```
refactor payment processing pipeline

- extract validation into separate module
- add retry logic for transient failures
- update unit tests to cover edge cases
```

