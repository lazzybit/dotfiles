---
name: web-search
description: "Search the web using DuckDuckGo. Use when you need up-to-date information, current events, or any knowledge beyond your training data."
---

# Web Search

## Usage

```bash
./scripts/search.sh QUERY [--page N] [--time d|w|m|y] [--region xx-xx]
```

| `-p`, `--page` | page number | 1 |
| `-t`, `--time` | time filter: d, w, m, y | (none) |
| `-r`, `--region` | region code | us-en |

Limited to ~10 text results per request.
