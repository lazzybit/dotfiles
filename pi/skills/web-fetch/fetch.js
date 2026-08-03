#!/usr/bin/env node
import { Readability, isProbablyReaderable } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { createHash } from "node:crypto";
import { createWriteStream, writeFileSync, writeSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { recipes } from "./recipes.js";

const UA = "Mozilla/5.0 (compatible; WebFetch/1.0)";
const TIMEOUT_MS = 15_000;
const MAX_CHARS = 100_000; // output cap: above this, save to TMPDIR and print path
const MAX_HTML_BYTES = 5_000_000; // safety valve: above this, stream raw HTML to file (no jsdom)
const ACCEPT = "text/markdown, text/html;q=0.9, application/json;q=0.8, text/plain;q=0.7, */*;q=0.5";

const url = process.argv[2];
if (!url) {
  writeSync(2, "usage: fetch.js <url>\n");
  process.exit(1);
}

function fail(msg) {
  writeSync(2, `error: ${msg}\n`);
  process.exit(1);
}

function directive(line) {
  writeSync(1, `${line}\n`);
  process.exit(2);
}

function tempFile() {
  const hash = createHash("sha256").update(url).digest("hex").slice(0, 16);
  return join(tmpdir(), `web-fetch-${hash}.txt`);
}

function output(text) {
  if (!text.trim()) directive(`empty: ${url} (page has no extractable text)`);
  if (text.length > MAX_CHARS) {
    const file = tempFile();
    writeFileSync(file, text);
    directive(`too large: read ${file}`);
  }
  writeSync(1, text.endsWith("\n") ? text : `${text}\n`);
  process.exit(0);
}

async function streamToFile(res) {
  const file = tempFile();
  const ws = createWriteStream(file);
  for await (const chunk of res.body) ws.write(chunk);
  await new Promise((resolve, reject) => ws.end((err) => (err ? reject(err) : resolve())));
  directive(`too large: ${file}`);
}

function rawFetch(u, { method = "GET", accept = ACCEPT } = {}) {
  return fetch(u, {
    method,
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "User-Agent": UA, Accept: accept },
  });
}

async function get(u, opts) {
  try {
    return await rawFetch(u, opts);
  } catch (e) {
    fail(e.message);
  }
}

const ct = (res) => (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
const len = (res) => {
  const v = res.headers.get("content-length");
  return v ? parseInt(v, 10) : null;
};
const isText = (t) =>
  t.startsWith("text/markdown") || t.startsWith("application/json") || t.startsWith("text/plain");
const isHtml = (t) => t.startsWith("text/html");

function stripHtml(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|noscript|svg|head|iframe)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/(p|div|h[1-6]|li|tr|section|article|pre|blockquote)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

async function handleText(res) {
  const size = len(res);
  if (size !== null && size > MAX_CHARS) return streamToFile(res);
  output(await res.text());
}

async function handleHtml(html) {
  const doc = new JSDOM(html, { url }).window.document;
  if (isProbablyReaderable(doc, { minContentLength: 140, minScore: 20 })) {
    const article = new Readability(doc).parse();
    if (article) {
      output((article.title ? `# ${article.title}\n\n` : "") + article.textContent);
    }
  }
  output(stripHtml(html));
}

// Try every matching recipe in order; first 2xx wins. All fail -> no recipe.
async function tryRecipes() {
  for (const r of recipes) {
    if (!r.match(url)) continue;
    let res;
    try {
      res = await rawFetch(r.transform(url));
    } catch {
      continue;
    }
    if (!res.ok) continue;
    const size = len(res);
    if (size !== null && size > MAX_CHARS) return streamToFile(res);
    output(await res.text());
  }
}

async function main() {
  // Probe (HEAD): classify cheaply, avoid GET for binary.
  let head = null;
  try {
    head = await rawFetch(url, { method: "HEAD" });
  } catch {
    head = null; // HEAD unreachable -> classify from a single GET below
  }

  if (head && head.ok) {
    const type = ct(head);
    if (isText(type)) {
      const res = await get(url);
      if (!res.ok) directive(`http ${res.status}: ${url}`);
      return handleText(res);
    }
    if (isHtml(type)) {
      await tryRecipes();
      const res = await get(url, { accept: "text/html, */*;q=0.5" });
      if (!res.ok) directive(`http ${res.status}: ${url}`);
      const size = len(res);
      if (size !== null && size > MAX_HTML_BYTES) return streamToFile(res);
      return handleHtml(await res.text());
    }
    directive(
      type
        ? `binary: ${type} (${len(head) ?? "unknown"} bytes, not text)`
        : `unknown content-type: ${url}`
    );
  }

  // HEAD rejected (403/405/501) or failed -> recipes are URL-pattern based,
  // try them before GETting the original (e.g. sites that block our UA).
  await tryRecipes();

  if (head && !head.ok && ![403, 405, 501].includes(head.status)) {
    directive(`http ${head.status}: ${url}`);
  }
  const res = await get(url);
  if (!res.ok) directive(`http ${res.status}: ${url}`);
  const type = ct(res);
  if (isText(type)) return handleText(res);
  if (isHtml(type)) {
    // recipes already tried above
    const size = len(res);
    if (size !== null && size > MAX_HTML_BYTES) return streamToFile(res);
    return handleHtml(await res.text());
  }
  directive(
    type
      ? `binary: ${type} (${len(res) ?? "unknown"} bytes, not text)`
      : `unknown content-type: ${url}`
  );
}

main();
