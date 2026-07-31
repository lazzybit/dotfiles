---
name: dotfiles-sync
description: Sync dotfiles between this repo and local paths. Use when user asks to sync a module (e.g. "sync pi", "sync bash").
---

# dotfiles-sync

Sync a module between the repo and its corresponding local path, applying changes in whichever direction makes sense after analyzing the diff.

## Path Mapping

Consult [map.txt](map.txt) for repo → local path mappings. Maintain this file when modules are added or paths change.

Identify differing files between the repo module and its local counterpart. Skip noise like `node_modules`, `.git`, etc. Diff only the actual content files.

## Analysis

Use `diff -u` on each differing file. The judgment is symmetric — there is no preferred direction:

- Are the changes on one side purely additive (new features, fixes) relative to the other? i.e., one side is a feature superset.
- Or are there interlaced additions and deletions on both sides, indicating divergent edits?

### Git History as a Signal

Run `./scripts/check-history.sh <file> <repo-path>` to check whether a file matches a historical version:

- `MATCH_HEAD` — file matches current HEAD
- `HISTORICAL` — file matches a past commit (likely old version)
- `NEW` — file content has never been committed

If all changed files on one side are `HISTORICAL`, that side is likely older — a signal, not a rule. Check for revert commits with `git log --oneline -i --grep='revert'` before assuming a side is older.

## Decision

- One side is a feature superset → sync the superset to the subset.
- Divergent edits → present diffs to the user and let them decide.
- Uncertain → ask.

When syncing local → repo: do NOT add files or directories that exist locally but are not already tracked in the repo module, unless the user explicitly requests it. Only update existing repo files.

## After Sync

Summarize what was changed and in which direction. Mention any skipped items and why.
