---
name: web-fetch
description: "Fetch web content efficiently. Use when reading URLs, documentation, or any web page."
---

# Web Fetch

## Setup

```bash
./setup.sh
```

## Usage

```bash
./fetch.js "<url>"
```

## Recipes

When you discover a site whose HTML is hard to parse but has a clean
endpoint (API, `.json`, raw file), add it to `recipes.js` as
`{ name, match(url), transform(url) }`. Then verify with `./test.js`.

## Testing

```bash
./test.js
```

Unit-tests recipes (offline) and runs fetch.js against live URLs (network required).
