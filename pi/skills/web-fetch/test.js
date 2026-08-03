#!/usr/bin/env node
import { execFile } from "node:child_process";
import { recipes } from "./recipes.js";

let pass = 0;
let fail = 0;

function check(name, cond, detail = "") {
  if (cond) {
    pass++;
    console.log(`PASS  ${name}`);
  } else {
    fail++;
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function recipe(name) {
  const r = recipes.find((r) => r.name === name);
  check(`recipe "${name}" exists`, !!r);
  return r;
}

function unit(name, fn) {
  try {
    check(name, fn());
  } catch (e) {
    check(name, false, e.message);
  }
}

function runFetch(url) {
  return new Promise((resolve) => {
    execFile("./fetch.js", [url], { timeout: 60_000 }, (err, stdout, stderr) => {
      resolve({ code: err ? err.code : 0, stdout, stderr });
    });
  });
}

console.log("== recipes (offline) ==");

unit("github-blob matches blob URL and rewrites to raw", () => {
  const r = recipe("github-blob");
  const u = "https://github.com/octocat/Hello-World/blob/master/README";
  return (
    r.match(u) &&
    r.transform(u) === "https://raw.githubusercontent.com/octocat/Hello-World/master/README"
  );
});
unit("github-blob rejects profile page", () => {
  return !recipe("github-blob").match("https://github.com/octocat");
});
unit("github-repo matches repo root and rewrites to API", () => {
  const r = recipe("github-repo");
  const u = "https://github.com/octocat/Hello-World";
  return (
    r.match(u) && r.transform(u) === "https://api.github.com/repos/octocat/Hello-World"
  );
});
unit("github-repo rejects blob URL", () => {
  return !recipe("github-repo").match("https://github.com/octocat/Hello-World/blob/master/README");
});
unit("wikipedia matches and rewrites to API", () => {
  const r = recipe("wikipedia");
  const u = "https://en.wikipedia.org/wiki/Node.js";
  return (
    r.match(u) &&
    r.transform(u) ===
      "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=Node.js&format=json"
  );
});
unit("wikipedia keeps language subdomain", () => {
  const r = recipe("wikipedia");
  const u = "https://zh.wikipedia.org/wiki/Node.js";
  return r.match(u) && r.transform(u).startsWith("https://zh.wikipedia.org/w/api.php");
});
unit("wikipedia rejects homepage", () => {
  return !recipe("wikipedia").match("https://en.wikipedia.org/");
});
unit("reddit matches and appends .json", () => {
  const r = recipe("reddit");
  const u = "https://www.reddit.com/r/node/";
  return r.match(u) && r.transform(u) === "https://www.reddit.com/r/node.json";
});
unit("reddit rejects .json URLs", () => {
  return !recipe("reddit").match("https://www.reddit.com/r/node/.json");
});
unit("hacker-news matches item and rewrites to firebaseio", () => {
  const r = recipe("hacker-news");
  const u = "https://news.ycombinator.com/item?id=12345";
  return (
    r.match(u) && r.transform(u) === "https://hacker-news.firebaseio.com/v0/item/12345.json"
  );
});
unit("hacker-news rejects non-item pages", () => {
  return !recipe("hacker-news").match("https://news.ycombinator.com/news");
});
unit("stackexchange matches stackoverflow", () => {
  const r = recipe("stackexchange");
  const u = "https://stackoverflow.com/questions/11227809/why";
  return (
    r.match(u) &&
    r.transform(u) ===
      "https://api.stackexchange.com/2.3/questions/11227809?order=desc&sort=votes&site=stackoverflow&filter=withbody"
  );
});
unit("stackexchange matches other stackexchange sites", () => {
  const r = recipe("stackexchange");
  const u = "https://math.stackexchange.com/questions/123/foo";
  return r.match(u) && r.transform(u).includes("site=math");
});
unit("stackexchange rejects non-question pages", () => {
  return !recipe("stackexchange").match("https://stackoverflow.com/users/1/foo");
});
unit("npm matches package page and rewrites to registry", () => {
  const r = recipe("npm");
  const u = "https://www.npmjs.com/package/left-pad";
  return r.match(u) && r.transform(u) === "https://registry.npmjs.org/left-pad";
});
unit("npm rejects homepage", () => {
  return !recipe("npm").match("https://www.npmjs.com/");
});

console.log("== integration (network) ==");

let t = await runFetch("https://example.com");
check(
  "example.com: exit 0 with text",
  t.code === 0 && t.stdout.trim().length > 0,
  `code=${t.code} stderr=${t.stderr.trim()}`
);

t = await runFetch("https://example.com/nonexistent");
check(
  "example.com/nonexistent: exit 2, http 404",
  t.code === 2 && t.stdout.startsWith("http 404"),
  `code=${t.code} stdout=${t.stdout.trim()}`
);

t = await runFetch("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
check(
  "dummy.pdf: exit 2, binary",
  t.code === 2 && t.stdout.startsWith("binary: application/pdf"),
  `code=${t.code} stdout=${t.stdout.trim()}`
);

t = await runFetch("https://www.gutenberg.org/cache/epub/11/pg11.txt");
check(
  "pg11.txt: exit 2, too large with read path",
  t.code === 2 && t.stdout.startsWith("too large: read "),
  `code=${t.code} stdout=${t.stdout.trim().slice(0, 60)}`
);

t = await runFetch("https://en.wikipedia.org/wiki/Node.js");
check(
  "wikipedia: recipe JSON with extract",
  t.code === 0 && t.stdout.includes('"extract"'),
  `code=${t.code} stdout=${t.stdout.trim().slice(0, 60)}`
);

t = await runFetch("https://github.com/octocat/Hello-World/blob/master/README");
check(
  "github blob: recipe raw content",
  t.code === 0 && t.stdout.includes("Hello World"),
  `code=${t.code} stdout=${t.stdout.trim().slice(0, 60)}`
);

t = await runFetch("https://nodejs.org/en/learn/getting-started/introduction-to-nodejs");
check(
  "nodejs.org: readability extraction",
  t.code === 0 && t.stdout.trim().length > 100,
  `code=${t.code} stdout=${t.stdout.trim().slice(0, 60)}`
);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
