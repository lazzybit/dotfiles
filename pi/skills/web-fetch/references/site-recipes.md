# Site Recipes

Quick reference for clean API endpoints. Always prefer these over raw HTML.

## GitHub

- Repo README (raw): `https://raw.githubusercontent.com/<owner>/<repo>/main/README.md`
- Any file (raw): `https://raw.githubusercontent.com/<owner>/<repo>/main/<path>`
- Repo API: `https://api.github.com/repos/<owner>/<repo>`

## Wikipedia

- Plain text API: `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=<Title>&format=json`
- Raw wikitext: `https://en.wikipedia.org/w/index.php?title=<Title>&action=raw`

## Reddit

- Append `.json` to any URL

## StackOverflow

- API: `https://api.stackexchange.com/2.3/questions/<id>?order=desc&sort=votes&site=stackoverflow&filter=withbody`

## Hacker News

- Item: `https://hacker-news.firebaseio.com/v0/item/<id>.json`

## NPM

- Package: `https://registry.npmjs.org/<package-name>`
