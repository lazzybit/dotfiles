---
name: web-fetch
description: "Fetch web content efficiently. Use when reading URLs, documentation, or any web page."
---

# Web Fetch

**Critical: NEVER dump raw HTML into context. Always probe first, then fetch.**

## Step 0: Probe Before Fetching

Always start with a HEAD request to inspect headers. Do NOT run a full GET until you know what you're getting.

```bash
curl -sI -L -H "Accept: text/markdown" "<url>"
```

Check these headers before proceeding:

| Header | Decision |
|---|---|
| `content-type` starts with `text/markdown` | → Tier 1: fetch with `curl -sL -H "Accept: text/markdown" "<url>"` |
| `content-type` starts with `application/json` | → fetch and parse JSON directly |
| `content-length` > 100 KB (100000 bytes) | → skip full fetch, jump to Tier 2 or 3 (site recipe / extract) |
| `content-type` is `text/html` and `content-length` < 10 KB | → small page, safe to fetch and strip tags |
| `content-type` is `text/html` and `content-length` > 10 KB | → skip full GET, jump to Tier 2 or Tier 3 |
| Other / unknown content-type | → jump to Tier 2 |

**If the HEAD response has no `content-type` header, assume HTML and proceed cautiously (Tier 2 or Tier 3 only).**

## Tier 1: `Accept: text/markdown` (only after probe confirms markdown)

Cloudflare-enabled sites and some CDNs return clean markdown. Only use this after Step 0 confirms `text/markdown` content-type.

```bash
curl -sL -H "Accept: text/markdown" "<url>"
```

Check `x-markdown-tokens` / `x-original-tokens` response headers to gauge cost.

## Tier 2: Site-specific APIs

When Step 0 indicates HTML or large content, consult `references/site-recipes.md` for clean endpoints (GitHub raw, Wikipedia API, Reddit `.json`, etc.). This is the preferred path for supported sites.

## Tier 3: Readability extraction (last resort for HTML)

Run once: `cd ~/.pi/agent/skills/web-fetch && bash scripts/setup.sh`

```bash
# ALWAYS check first if the page is worth parsing:
node ~/.pi/agent/skills/web-fetch/scripts/extract.js "<url>" --check

# Only if --check says readerable: true, then extract:
node ~/.pi/agent/skills/web-fetch/scripts/extract.js "<url>"
# → outputs JSON, use .textContent field
```

If `--check` returns `readerable: false`, fall back to a last resort:

```bash
# Strip HTML tags, limit to first 500 lines / 20 KB:
curl -sL "<url>" | sed 's/<[^>]*>//g' | sed '/^$/d' | head -n 500
```

## Complete Decision Flow

```
0. curl -sI -L -H "Accept: text/markdown" <url>  ← ALWAYS START HERE
   ↓
   Check content-type + content-length headers
   ↓
1. text/markdown? → curl -sL -H "Accept: text/markdown" <url> → DONE
2. application/json? → curl -sL <url> → parse JSON → DONE
3. site-recipes.md has a match? → use clean API endpoint → DONE
4. content-length < 10KB HTML? → curl -sL <url> | sed strip → DONE
5. extract.js --check → readerable? → extract.js → DONE
6. Last resort: curl -sL <url> | sed strip | head -n 500
```

**Never skip Step 0. Never run a full GET on unknown content.**
