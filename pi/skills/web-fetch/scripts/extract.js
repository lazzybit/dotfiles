#!/usr/bin/env node
// Extract readable content from a URL using Mozilla Readability + JSDOM.
// Usage:
//   node extract.js <url>           # full extraction
//   node extract.js <url> --check   # only check if readerable

const { Readability, isProbablyReaderable } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');

const url = process.argv[2];
const checkOnly = process.argv.includes('--check');

if (!url) {
    console.error('Usage: node extract.js <url> [--check]');
    process.exit(1);
}

async function main() {
    // Fetch the page
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WebFetch/1.0)',
            'Accept': 'text/html,*/*'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const doc = new JSDOM(html, { url });

    if (checkOnly) {
        const readerable = isProbablyReaderable(doc.window.document, {
            minContentLength: 140,
            minScore: 20
        });
        console.log(JSON.stringify({ readerable }));
        return;
    }

    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (!article) {
        console.error('Readability could not extract content from this page.');
        process.exit(1);
    }

    console.log(JSON.stringify({
        title: article.title,
        textContent: article.textContent,
        excerpt: article.excerpt,
        byline: article.byline,
        siteName: article.siteName,
        length: article.length,
        url
    }, null, 2));
}

main().catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
});
