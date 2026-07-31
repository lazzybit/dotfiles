#!/usr/bin/env bash
set -euo pipefail

file="$1"
repo_path="$2"

if [ ! -f "$file" ]; then
  echo "ERROR: file not found: $file" >&2
  exit 2
fi

if [ -z "$repo_path" ]; then
  echo "ERROR: repo path required" >&2
  exit 2
fi

blob=$(git hash-object "$file" 2>/dev/null) || {
  echo "ERROR: git hash-object failed for $file" >&2
  exit 2
}

head_blob=$(git ls-tree HEAD -- "$repo_path" 2>/dev/null | awk '{print $3}' || echo "")

if [ "$blob" = "$head_blob" ]; then
  echo "MATCH_HEAD  $file  (blob=$blob)"
  exit 0
fi

found_commit=$(git log --all --find-object="$blob" --pretty=format:'%h %s' 2>/dev/null | head -1)

if [ -n "$found_commit" ]; then
  echo "HISTORICAL  $file  (blob=$blob)  found in: $found_commit"
  exit 0
fi

echo "NEW  $file  (blob=$blob)  not found in git history"
exit 1
