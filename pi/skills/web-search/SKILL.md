---
name: web-search
description: "Search the web using DuckDuckGo. Use when you need up-to-date information, current events, or any knowledge beyond your training data."
---

# Web Search

## Usage

```bash
bash ~/.pi/agent/skills/web-search/scripts/search "query"
bash ~/.pi/agent/skills/web-search/scripts/search "query" --page 2
bash ~/.pi/agent/skills/web-search/scripts/search "query" --time w
bash ~/.pi/agent/skills/web-search/scripts/search "query" --region zh-tw
```

## Parameters

| Parameter | Values | Default |
|-----------|--------|---------|
| `--page`, `-p` | 1, 2, 3, ... | 1 |
| `--time`, `-t` | d, w, m, y | (none) |
| `--region`, `-r` | us-en, zh-tw, uk-en, jp-jp, ... | us-en |

## Output

```
1.
    Title: Page title
    URL:   https://...
    Desc:  Snippet text

2.
    ...
```

Limited to ~10 text results per request. No image/news/video search.
