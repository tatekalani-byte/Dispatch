// Fetches every feed in Dispatch's starter packs (plus extra-feeds.txt) and writes one
// feeds.json the app can read without a CORS proxy. Run by .github/workflows/feeds.yml.
// Usage: node scripts/fetch-feeds.mjs OUTPUT.json [PREVIOUS.json]
// When a feed fails, the copy from PREVIOUS.json (the last snapshot) is kept, so a feed that
// is briefly rate-limited or down doesn't disappear from the app.
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "content.js"), "utf8"), sandbox);
const packs = sandbox.window.DISPATCH_PACKS;

// Keep in step with feedUrl() and redditUrls() in dispatch.js.
function feedUrl(type, value) {
  value = value.trim();
  if (type === "gnews") return "https://news.google.com/rss/search?q=" + encodeURIComponent(value) + "&hl=en-US&gl=US&ceid=US:en";
  if (type === "reddit") return "https://www.reddit.com/r/" + value.replace(/^\/?r\//i, "").replace(/\/$/, "") + "/.rss";
  if (type === "redditsearch") return "https://www.reddit.com/search.rss?sort=new&q=" + encodeURIComponent(value);
  if (type === "youtube") return /^https?:/.test(value) ? value : "https://www.youtube.com/feeds/videos.xml?channel_id=" + value;
  if (type === "substack") {
    const v = value.replace(/\/+$/, "").replace(/\/feed$/, "");
    if (/^https?:\/\//i.test(v)) return v + "/feed";
    return /\./.test(v) ? "https://" + v + "/feed" : "https://" + v.replace(/^@/, "") + ".substack.com/feed";
  }
  if (type === "rss") return value;
  return null; // bsky, mastodon and hn load fine straight from the browser
}

const wanted = new Map();
for (const p of packs) for (const [type, value, name] of p.sources) {
  const url = feedUrl(type, value);
  if (url) wanted.set(url, name);
}
const extra = path.join(root, "extra-feeds.txt");
if (fs.existsSync(extra)) {
  for (const line of fs.readFileSync(extra, "utf8").split("\n")) {
    const u = line.trim();
    if (u && !u.startsWith("#")) wanted.set(u, u);
  }
}

const REPO = process.env.GITHUB_REPOSITORY || "dispatch";
// Some sites block one kind of visitor but not another, so a refused fetch is retried as the next one.
const AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  "Feedly/1.0 (+http://www.feedly.com/fetcher.html; like FeedFetcher-Google)",
  "DispatchFeedReader/1.0 (+https://github.com/" + REPO + ")",
];
const REDDIT_UA = "web:dispatch-feed-reader:v1.0 (by github.com/" + REPO + ")";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_ITEMS = 30;

// Trim a feed to its newest items and drop full-article bodies, so feeds.json stays small.
const decode = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&amp;/g, "&");
const hasImage = (block) => /<(media:thumbnail|media:content)[^>]+url=|<enclosure[^>]+type=["']image/i.test(block);
// Each story keeps one picture: when the feed only has it inside the article body (which is
// dropped to save space), it's moved into an <enclosure> the app reads.
function keepImages(xml) {
  return xml.replace(/<(item|entry)[\s>][\s\S]*?<\/\1>/g, (block) => {
    if (hasImage(block)) return block;
    const body = decode((block.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/) || [])[1] || (block.match(/<(description|summary|content)[^>]*>([\s\S]*?)<\/\1>/) || [])[2] || "");
    const m = /<img[^>]+src=["']([^"']+)["']/i.exec(body.replace(/<!\[CDATA\[|\]\]>/g, ""));
    if (!m || !/^https?:/.test(m[1]) || /feedburner|pixel|tracking|1x1|gravatar/i.test(m[1])) return block;
    const url = m[1].replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    return block.replace(/<\/(item|entry)>$/, `<enclosure url="${url}" type="image/jpeg" length="0"/></$1>`);
  });
}
function itemLinks(xml) {
  const out = [];
  for (const m of xml.matchAll(/<(item|entry)[\s>][\s\S]*?<\/\1>/g)) {
    if (hasImage(m[0])) continue;
    const link = (m[0].match(/<link>([^<]+)<\/link>/) || m[0].match(/<link[^>]+href=["']([^"']+)["']/) || [])[1];
    if (link) out.push(decode(link.trim()));
  }
  return out;
}
function trim(xml) {
  xml = keepImages(xml);
  xml = xml.replace(/<content:encoded>[\s\S]*?<\/content:encoded>/g, "");
  const isAtom = /<feed[\s>]/i.test(xml.slice(0, 3000));
  const close = isAtom ? "</entry>" : "</item>";
  let idx = -1;
  for (let n = 0; n < MAX_ITEMS; n++) {
    const next = xml.indexOf(close, idx + 1);
    if (next < 0) return xml;
    idx = next;
  }
  return xml.slice(0, idx + close.length) + (isAtom ? "</feed>" : "</channel></rss>");
}

async function get(url) {
  const reddit = /reddit\.com/.test(url);
  const agents = reddit ? [REDDIT_UA] : AGENTS;
  let res;
  for (let a = 0; a < agents.length; a++) {
    res = await getAs(url, agents[a]);
    if (res.ok || !/HTTP (401|403|406|429)/.test(res.error)) return res;
    if (reddit && a === 0) { await sleep(30000); res = await getAs(url, REDDIT_UA); return res; }
  }
  return res;
}

async function getAs(url, agent) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 25000);
  try {
    const r = await fetch(url, {
      signal: ctl.signal, redirect: "follow",
      headers: { "user-agent": agent, accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8" },
    });
    const text = await r.text();
    if (!r.ok) return { ok: false, error: "HTTP " + r.status };
    if (!/<(rss|feed|rdf:RDF)[\s>]/i.test(text.slice(0, 6000))) return { ok: false, error: "Not a feed (got " + (r.headers.get("content-type") || "unknown") + ")" };
    const items = (text.match(/<(item|entry)[\s>]/g) || []).length;
    return { ok: true, items, text: trim(text) };
  } catch (e) {
    return { ok: false, error: e.name === "AbortError" ? "Timed out" : String(e.message || e) };
  } finally { clearTimeout(t); }
}

const urls = [...wanted.keys()];
const feeds = {};
// Reddit rate-limits hard, so its feeds go one at a time, a few seconds apart, alongside everything else.
const reddit = urls.filter((u) => /reddit\.com/.test(u));
const others = urls.filter((u) => !/reddit\.com/.test(u));
let i = 0;
await Promise.all([
  ...Array.from({ length: 6 }, async () => {
    while (i < others.length) { const u = others[i++]; feeds[u] = await get(u); }
  }),
  (async () => {
    for (const u of reddit) { feeds[u] = await get(u); await sleep(20000); }
  })(),
]);

let previousFile = {};
try { previousFile = JSON.parse(fs.readFileSync(process.argv[3], "utf8")); } catch (e) { /* first run */ }
const previous = previousFile.feeds || {};
for (const u of urls) {
  const old = previous[u];
  if (!feeds[u].ok && old && old.ok) feeds[u] = { ...old, stale: feeds[u].error, fetchedAt: old.fetchedAt || null };
  else if (feeds[u].ok) feeds[u].fetchedAt = new Date().toISOString();
}

// Stories without a picture in their feed get the preview image the article itself shares
// (og:image). Found images are remembered between runs, so each article is looked up once.
const images = {};
const known = previousFile.images || {};
const todo = [];
for (const u of urls) {
  const f = feeds[u];
  if (!f.ok || /reddit\.com|news\.google\.com/.test(u)) continue;
  for (const link of itemLinks(f.text).slice(0, 8)) {
    if (known[link] !== undefined) images[link] = known[link];
    else if (/^https?:/.test(link) && !/news\.google\.com|reddit\.com|youtube\.com/.test(link)) todo.push(link);
  }
}
let found = 0, j = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (j < Math.min(todo.length, 200)) {
    const link = todo[j++];
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 8000);
    try {
      const r = await fetch(link, { signal: ctl.signal, redirect: "follow", headers: { "user-agent": AGENTS[0], accept: "text/html" } });
      const head = (await r.text()).slice(0, 200000);
      const m = head.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)(?::src)?["'][^>]*content=["']([^"']+)["']/i) || head.match(/<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:image|twitter:image)["']/i);
      images[link] = m ? new URL(decode(m[1]), link).href : "";
      if (m) found++;
    } catch (e) { images[link] = ""; } finally { clearTimeout(t); }
  }
}));

const out = { generatedAt: new Date().toISOString(), feeds, images };
fs.writeFileSync(process.argv[2] || "feeds.json", JSON.stringify(out));

const bad = urls.filter((u) => !feeds[u].ok);
for (const u of urls) {
  const f = feeds[u];
  console.log((f.stale ? "KEPT  " : f.ok ? "OK    " : "FAIL  ") + wanted.get(u).padEnd(34) + " " + (f.stale ? "kept last copy (" + f.stale + ")" : f.ok ? f.items + " items" : f.error) + "  " + u);
}
console.log(`\nPreview images: ${Object.values(images).filter(Boolean).length} stories have one (${found} found this run).`);
console.log(`\n${urls.length - bad.length} of ${urls.length} feeds fetched. feeds.json is ${Math.round(fs.statSync(process.argv[2] || "feeds.json").size / 1024)} KB.`);
