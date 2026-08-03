// Site recipes: ordered list of { name, match(url) -> bool, transform(url) -> string }.
// fetch.js tries every matching recipe in order; first 2xx response wins.
// If all matching recipes fail, fetch.js falls back to normal processing.

export const recipes = [
  {
    name: "github-blob",
    match: (url) => /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\//.test(url),
    transform: (url) =>
      url
        .replace(/^https:\/\/github\.com\//, "https://raw.githubusercontent.com/")
        .replace("/blob/", "/"),
  },
  {
    name: "github-repo",
    match: (url) => /^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(url),
    transform: (url) => {
      const [, owner, repo] = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)/);
      return `https://api.github.com/repos/${owner}/${repo}`;
    },
  },
  {
    name: "wikipedia",
    match: (url) => /^https:\/\/(?:[\w-]+\.)?wikipedia\.org\/wiki\//.test(url),
    transform: (url) => {
      const m = url.match(/^https:\/\/(?:([\w-]+)\.)?wikipedia\.org\/wiki\/(.+)$/);
      const lang = m[1] || "en";
      const title = decodeURIComponent(m[2]).replace(/_/g, " ");
      return `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(title)}&format=json`;
    },
  },
  {
    name: "reddit",
    match: (url) =>
      /^https:\/\/(?:www\.|old\.|new\.)?reddit\.com\//.test(url) && !/\.json([?#]|$)/.test(url),
    transform: (url) => {
      const u = new URL(url);
      u.pathname = u.pathname.replace(/\/+$/, "") + ".json";
      return u.toString();
    },
  },
  {
    name: "hacker-news",
    match: (url) => /^https:\/\/news\.ycombinator\.com\/item\?id=\d+$/.test(url),
    transform: (url) =>
      url.replace(
        /^https:\/\/news\.ycombinator\.com\/item\?id=/,
        "https://hacker-news.firebaseio.com/v0/item/"
      ) + ".json",
  },
  {
    name: "stackexchange",
    match: (url) =>
      /^https:\/\/(?:stackoverflow\.com|[\w-]+\.stackexchange\.com)\/questions\/\d+/.test(url),
    transform: (url) => {
      const m = url.match(
        /^https:\/\/(?:stackoverflow\.com|([\w-]+)\.stackexchange\.com)\/questions\/(\d+)/
      );
      const site = m[1] || "stackoverflow";
      return `https://api.stackexchange.com/2.3/questions/${m[2]}?order=desc&sort=votes&site=${site}&filter=withbody`;
    },
  },
  {
    name: "npm",
    match: (url) => /^https:\/\/www\.npmjs\.com\/package\/[^/]+/.test(url),
    transform: (url) =>
      `https://registry.npmjs.org/${encodeURIComponent(url.match(/package\/([^/]+)/)[1])}`,
  },
];
