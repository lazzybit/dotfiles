---
name: web-fetch
description: "Fetch web content efficiently. Use when reading URLs, documentation, or any web page."
---

# Web Fetch

**Always probe first, never dump raw HTML into context.**

All paths below are relative to this skill directory.

## Step 0: Probe

```bash
./scripts/probe.sh "<url>"
# → one word: fetch_markdown, try_site_api_or_extract, probe_failed, …
```

| suggestion | Action |
|---|---|
| `fetch_markdown` | `curl -sL -H "Accept: text/markdown" "<url>"` |
| `fetch_json` | `curl -sL "<url>"`, parse JSON |
| `fetch_small_html` | `curl -sL "<url>" \| sed 's/<[^>]*>//g' \| sed '/^$/d'` |
| `fetch_direct` | `curl -sL "<url>"` |
| `try_site_api_or_extract` | Check site-recipes → extract.js → strip fallback |
| `try_site_api_only` | Check site-recipes only, skip full fetch |
| `probe_failed` | HEAD rejected or network error → try site-recipes or small GET directly |

## Direct Markdown Fetch

Only when probe returns `fetch_markdown`:

```bash
curl -sL -H "Accept: text/markdown" "<url>"
```

## Site-Specific APIs

For `try_site_api_or_extract` / `try_site_api_only`: check `./references/site-recipes.md` for clean endpoints (GitHub raw, Wikipedia API, Reddit `.json`, etc.).

## Readability Extraction

One-time setup: `./scripts/setup.sh`

```bash
# Check if page is worth parsing:
./scripts/extract.js "<url>" --check
# If readerable: true → extract:
./scripts/extract.js "<url>"
# → JSON, use .textContent field
```

If not readerable, fall back to stripping tags:

```bash
curl -sL "<url>" | sed 's/<[^>]*>//g' | sed '/^$/d' | head -n 500
```
