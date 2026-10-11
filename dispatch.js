// Dispatch: a journalist's toolkit. Everything is stored on the device (localStorage).
(function () {
  "use strict";

  const PACKS = window.DISPATCH_PACKS;
  const KEY = "dispatch.v1";
  const CACHE_KEY = "dispatch.cache.v1";
  const STATUSES = ["Idea", "Reporting", "Writing", "Filed"];

  const TYPES = {
    rss: { label: "Website feed (RSS)", ph: "https://example.com/feed", help: "Most news sites and blogs have one. Try adding /feed or /rss to the site's address." },
    gnews: { label: "Keyword alert (Google News)", ph: "\"school board\" Ohio when:7d", help: "Any search. Use quotes for exact phrases, OR between options, and when:1d or when:7d for recent results only." },
    substack: { label: "Substack newsletter", ph: "heathercoxrichardson", help: "The name before .substack.com, or the newsletter's own web address if it has one." },
    reddit: { label: "Reddit community", ph: "Journalism", help: "The subreddit's name, without r/.", social: true },
    redditsearch: { label: "Reddit search", ph: "\"public records\" police", help: "New posts anywhere on Reddit that match your words.", social: true },
    youtube: { label: "YouTube channel", ph: "UCxxxxxxxxxxxxxxxxxxxxxx", help: "The channel ID, which starts with UC. On the channel page: About, Share channel, Copy channel ID." },
    hn: { label: "Hacker News search", ph: "surveillance", help: "Recent Hacker News stories that match your words." },
    bsky: { label: "Bluesky account", ph: "apnews.com", help: "The account's handle, without the @.", social: true },
    mastodon: { label: "Mastodon hashtag", ph: "journalism@mastodon.social", help: "Write it as tag@server. Shows public posts with that hashtag that the server knows about.", social: true },
  };

  // CORS proxies tried in order when a feed can't be read directly. Add your own in Settings.
  const PROXIES = [
    (u) => "https://api.allorigins.win/raw?url=" + encodeURIComponent(u),
    (u) => "https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(u),
    (u) => "https://corsproxy.io/?url=" + encodeURIComponent(u),
  ];

  // ---------- helpers ----------
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (id) => `<svg class="i" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const dayKey = (d = new Date()) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const isSocial = (s) => !!(TYPES[s.type] && TYPES[s.type].social);
  const AP_MONTHS = ["Jan.", "Feb.", "March", "April", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
  const apDate = (ms) => { const d = new Date(ms); return AP_MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear(); };

  function stripHtml(html) {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(String(html), "text/html");
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
  }
  function clip(s, n) { s = s || ""; return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s; }
  function ago(ms) {
    if (!ms) return "";
    const m = Math.round((Date.now() - ms) / 60000);
    if (m < 1) return "now";
    if (m < 60) return m + "m";
    const h = Math.round(m / 60);
    if (h < 24) return h + "h";
    const d = Math.round(h / 24);
    if (d < 7) return d + "d";
    return AP_MONTHS[new Date(ms).getMonth()] + " " + new Date(ms).getDate();
  }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } }
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove("show"), 2400);
  }
  async function copy(text, msg) {
    try { await navigator.clipboard.writeText(text); toast(msg || "Copied"); }
    catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast(msg || "Copied"); } catch (err) { toast("Couldn't copy"); }
      ta.remove();
    }
  }
  function download(name, text, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: type || "text/plain" }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function splitList(s) { return String(s || "").split(",").map((x) => x.trim()).filter(Boolean); }

  // ---------- state ----------
  function addPack(s, id) {
    const p = PACKS.find((x) => x.id === id);
    if (!p) return 0;
    let desk = s.desks.find((d) => d.name === p.name);
    if (!desk) { desk = { id: uid(), name: p.name }; s.desks.push(desk); }
    let added = 0;
    p.sources.forEach(([type, value, name]) => {
      if (s.sources.some((x) => x.type === type && x.value === value)) return;
      s.sources.push({ id: uid(), type, value, name, desk: desk.id, on: true });
      added++;
    });
    return added;
  }
  function fresh() {
    const s = {
      v: 2, desks: [], sources: [],
      xSearches: window.DISPATCH_X_SEARCHES.map((x) => ({ id: uid(), label: x.label, q: x.q })),
      alerts: ["FOIA", "subpoena", "leaked", "whistleblower", "lawsuit"], mutes: [],
      read: {}, clips: [], pitches: [], contacts: [], drills: [], lessons: {}, days: {},
      proxy: "", theme: "", tab: "wire", desk: "all", socialSrc: "all", nb: "pitches", pitchFilter: "all",
      unreadOnly: false, alertsOnly: false, lastRefresh: 0,
    };
    window.DISPATCH_DEFAULT_PACKS.forEach((id) => addPack(s, id));
    return s;
  }
  function loadJSON(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  let S = loadJSON(KEY);
  if (!S || !Array.isArray(S.sources)) S = fresh();
  S = Object.assign(fresh(), S, S.desks ? {} : { desks: [] });
  // Version 2 added Substack newsletters and made Reddit part of Social.
  if (S.v < 2) { ["substack", "community"].forEach((id) => addPack(S, id)); S.v = 2; }
  let C = loadJSON(CACHE_KEY) || {}; // sourceId -> { at, items, err }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); }
    catch (e) { toast("Storage is full. Save a backup, then delete old clips."); }
  }
  function saveCache() {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(C)); }
    catch (e) { // cache is disposable; drop the oldest half and try again
      const ids = Object.keys(C).sort((a, b) => (C[a].at || 0) - (C[b].at || 0));
      ids.slice(0, Math.ceil(ids.length / 2)).forEach((id) => delete C[id]);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(C)); } catch (err) { /* give up quietly */ }
    }
  }
  function pruneRead() {
    const ids = Object.keys(S.read);
    if (ids.length < 5000) return;
    ids.sort((a, b) => S.read[a] - S.read[b]).slice(0, ids.length - 4000).forEach((id) => delete S.read[id]);
  }
  function applyTheme() {
    if (S.theme) document.documentElement.setAttribute("data-theme", S.theme);
    else document.documentElement.removeAttribute("data-theme");
  }

  // ---------- fetching ----------
  async function timed(url, ms) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms || 12000);
    try {
      const r = await fetch(url, { signal: ctl.signal });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.text();
    } finally { clearTimeout(t); }
  }
  const looksLikeFeed = (t) => /<(rss|feed|rdf:RDF)[\s>]/i.test(t.slice(0, 6000));
  let proxyStart = 0;

  async function getFeedText(url) { return getText(url, looksLikeFeed); }
  async function getText(url, ok) {
    const tries = [];
    if (S.proxy) tries.push((u) => S.proxy.includes("{url}") ? S.proxy.replace("{url}", encodeURIComponent(u)) : S.proxy + encodeURIComponent(u));
    tries.push((u) => u);
    for (let i = 0; i < PROXIES.length; i++) tries.push(PROXIES[(proxyStart + i) % PROXIES.length]);
    for (const make of tries) {
      try {
        const text = await timed(make(url));
        if (ok(text)) {
          const pi = PROXIES.indexOf(make);
          if (pi >= 0) proxyStart = pi;
          return text;
        }
      } catch (e) { /* next */ }
    }
    return null;
  }

  function firstTag(el, ...names) {
    for (const n of names) {
      const x = el.getElementsByTagName(n)[0];
      if (x && x.textContent.trim()) return x.textContent.trim();
    }
    return "";
  }
  function imageOf(el, html) {
    for (const n of ["media:thumbnail", "media:content", "enclosure"]) {
      for (const x of el.getElementsByTagName(n)) {
        const u = x.getAttribute("url");
        const type = x.getAttribute("type") || x.getAttribute("medium") || "";
        if (u && (n === "media:thumbnail" || /image/.test(type) || /\.(jpe?g|png|webp|gif)(\?|$)/i.test(u))) return u;
      }
    }
    const m = /<img[^>]+src=["']([^"']+)["']/i.exec(html || "");
    return m ? m[1].replace(/&amp;/g, "&") : "";
  }

  function parseFeed(xml, src) {
    const doc = new DOMParser().parseFromString(xml.replace(/^﻿/, "").trim(), "text/xml");
    if (doc.getElementsByTagName("parsererror").length) throw new Error("This address isn't a readable feed");
    const out = [];
    const nodes = [...doc.getElementsByTagName("item"), ...doc.getElementsByTagName("entry")];
    nodes.slice(0, 40).forEach((el) => {
      let title = stripHtml(firstTag(el, "title"));
      let link = "";
      const links = [...el.getElementsByTagName("link")];
      const alt = links.find((l) => l.getAttribute("href") && (!l.getAttribute("rel") || l.getAttribute("rel") === "alternate"));
      if (alt) link = alt.getAttribute("href");
      else if (links[0]) link = links[0].textContent.trim() || links[0].getAttribute("href") || "";
      if (!link) link = firstTag(el, "guid", "id");
      const html = firstTag(el, "content:encoded", "description", "summary", "content", "media:description");
      const date = Date.parse(firstTag(el, "pubDate", "published", "updated", "dc:date")) || 0;
      let outlet = src.name;
      let summary = clip(stripHtml(html), 280);
      if (src.type === "gnews") {
        const so = el.getElementsByTagName("source")[0];
        const name = so ? so.textContent.trim() : "";
        if (name) { outlet = name; title = title.replace(new RegExp("\\s+-\\s+" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"), ""); }
        summary = "";
      }
      if (src.type === "reddit") summary = clip(summary.replace(/submitted by .*$/i, "").trim(), 280);
      if (!title || !link) return;
      out.push({
        id: src.id + "|" + link, sid: src.id, kind: "article", title, link, date, summary, outlet,
        author: firstTag(el, "dc:creator", "author"), image: imageOf(el, html),
      });
    });
    return out;
  }

  async function fetchRss(src) {
    const url = feedUrl(src);
    const text = await getFeedText(url);
    if (text) return parseFeed(text, src);
    // Last resort: rss2json turns a feed into JSON on its own servers.
    try {
      const j = JSON.parse(await timed("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(url)));
      if (j.status === "ok") {
        return j.items.map((it) => ({
          id: src.id + "|" + it.link, sid: src.id, kind: "article", title: stripHtml(it.title), link: it.link,
          date: Date.parse((it.pubDate || "").replace(" ", "T") + "Z") || 0, summary: clip(stripHtml(it.description), 280),
          outlet: src.name, author: it.author || "", image: it.thumbnail || (it.enclosure && it.enclosure.link) || "",
        }));
      }
    } catch (e) { /* fall through */ }
    throw new Error("Couldn't reach this feed. Check the address, or add a feed proxy in Settings.");
  }

  async function fetchHN(src) {
    const j = JSON.parse(await timed("https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=30&query=" + encodeURIComponent(src.value)));
    return j.hits.filter((h) => h.title).map((h) => ({
      id: src.id + "|" + h.objectID, sid: src.id, kind: "article", title: h.title,
      link: h.url || "https://news.ycombinator.com/item?id=" + h.objectID, date: (h.created_at_i || 0) * 1000,
      summary: (h.points || 0) + " points · " + (h.num_comments || 0) + " comments on Hacker News",
      outlet: h.url ? host(h.url) : "Hacker News", author: h.author || "", image: "",
    }));
  }

  async function fetchBsky(src) {
    const actor = src.value.replace(/^@/, "").trim();
    const j = JSON.parse(await timed("https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?limit=30&filter=posts_no_replies&actor=" + encodeURIComponent(actor)));
    return (j.feed || []).map((f) => {
      const p = f.post;
      const rkey = p.uri.split("/").pop();
      const e = p.embed || {};
      const media = e.media || e;
      const images = (media.images || []).map((i) => i.thumb).filter(Boolean);
      if (media.thumbnail) images.push(media.thumbnail);
      const ext = e.external || (e.media && e.media.external);
      const repost = f.reason && /reasonRepost/.test(f.reason.$type || "");
      return {
        id: src.id + "|" + p.uri, sid: src.id, kind: "post",
        link: "https://bsky.app/profile/" + p.author.handle + "/post/" + rkey,
        date: Date.parse((repost && f.reason.indexedAt) || p.record.createdAt || p.indexedAt) || 0,
        text: p.record.text || "", author: p.author.displayName || p.author.handle, handle: "@" + p.author.handle,
        avatar: p.author.avatar || "", images: images.slice(0, 4),
        card: ext ? { url: ext.uri, title: ext.title, desc: clip(ext.description, 160) } : null,
        repostBy: repost ? src.name : "", net: "Bluesky",
      };
    });
  }

  // Reddit: JSON first (directly, then through the proxies), its RSS feed as a fallback.
  function redditUrls(src) {
    if (src.type === "redditsearch") {
      const q = encodeURIComponent(src.value);
      return ["https://www.reddit.com/search.json?sort=new&limit=30&raw_json=1&q=" + q, "https://www.reddit.com/search.rss?sort=new&q=" + q];
    }
    const sub = src.value.replace(/^\/?r\//i, "").replace(/\/$/, "").trim();
    return ["https://www.reddit.com/r/" + sub + "/new.json?limit=30&raw_json=1", "https://www.reddit.com/r/" + sub + "/.rss"];
  }
  async function fetchReddit(src) {
    const [json, rss] = redditUrls(src);
    const text = await getText(json, (t) => /^\s*\{/.test(t) && t.includes('"children"'));
    if (text) {
      return JSON.parse(text).data.children.map((c) => c.data).filter((d) => d && d.title).map((d) => {
        const img = d.preview && d.preview.images && d.preview.images[0];
        const thumb = img ? (img.resolutions && img.resolutions[2] || img.resolutions && img.resolutions.slice(-1)[0] || img.source).url : "";
        const external = !d.is_self && d.url && !/reddit\.com|redd\.it/.test(host(d.url));
        return {
          id: src.id + "|" + d.name, sid: src.id, kind: "post", link: "https://www.reddit.com" + d.permalink,
          date: (d.created_utc || 0) * 1000, title: d.title, text: clip(d.selftext || "", 400),
          author: "u/" + d.author, handle: d.subreddit_name_prefixed, avatar: "",
          images: thumb && !external ? [thumb] : [],
          card: external ? { url: d.url, title: "Linked story", desc: "" } : null,
          stats: (d.score || 0) + " points · " + (d.num_comments || 0) + " comments", repostBy: "", net: "Reddit",
        };
      });
    }
    const feed = await getFeedText(rss);
    if (!feed) throw new Error("Reddit didn't answer. It often blocks public proxies; a proxy of your own (see Settings) fixes that.");
    return parseFeed(feed, src).map((a) => ({
      id: a.id, sid: src.id, kind: "post", link: a.link, date: a.date, title: a.title, text: a.summary,
      author: a.author ? a.author.replace(/^\/u\//, "u/") : "", handle: src.name, avatar: "", images: a.image ? [a.image] : [],
      card: null, repostBy: "", net: "Reddit",
    }));
  }

  async function fetchMastodon(src) {
    const [tag, server] = src.value.replace(/^#/, "").split("@");
    if (!tag || !server) throw new Error("Write it as tag@server, like journalism@mastodon.social");
    const list = JSON.parse(await timed("https://" + server + "/api/v1/timelines/tag/" + encodeURIComponent(tag) + "?limit=30"));
    return list.map((st) => {
      const p = st.reblog || st;
      return {
        id: src.id + "|" + p.uri, sid: src.id, kind: "post", link: p.url || p.uri, date: Date.parse(p.created_at) || 0,
        text: stripHtml((p.content || "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>\s*<p>/gi, "\n\n")),
        author: p.account.display_name || p.account.username, handle: "@" + p.account.acct, avatar: p.account.avatar || "",
        images: (p.media_attachments || []).filter((m) => m.preview_url).map((m) => m.preview_url).slice(0, 4),
        card: p.card ? { url: p.card.url, title: p.card.title, desc: clip(p.card.description, 160) } : null,
        repostBy: st.reblog ? st.account.display_name || st.account.username : "", net: "Mastodon",
      };
    });
  }

  function feedUrl(s) {
    if (s.type === "gnews") return "https://news.google.com/rss/search?q=" + encodeURIComponent(s.value) + "&hl=en-US&gl=US&ceid=US:en";
    if (s.type === "reddit" || s.type === "redditsearch") return redditUrls(s)[1];
    if (s.type === "substack") {
      const v = s.value.trim().replace(/\/+$/, "").replace(/\/feed$/, "");
      if (/^https?:\/\//i.test(v)) return v + "/feed";
      return /\./.test(v) ? "https://" + v + "/feed" : "https://" + v.replace(/^@/, "") + ".substack.com/feed";
    }
    if (s.type === "youtube") return /^https?:/.test(s.value) ? s.value : "https://www.youtube.com/feeds/videos.xml?channel_id=" + s.value.trim();
    return s.value.trim();
  }

  async function fetchSource(src) {
    try {
      let items;
      if (src.type === "hn") items = await fetchHN(src);
      else if (src.type === "bsky") items = await fetchBsky(src);
      else if (src.type === "mastodon") items = await fetchMastodon(src);
      else if (src.type === "reddit" || src.type === "redditsearch") items = await fetchReddit(src);
      else items = await fetchRss(src);
      C[src.id] = { at: Date.now(), items: items.slice(0, 40), err: "" };
    } catch (e) {
      const prev = C[src.id] || { items: [] };
      C[src.id] = { at: prev.at || 0, items: prev.items, err: e.name === "AbortError" ? "Timed out" : (e.message || "Couldn't load") };
    }
  }

  let refreshing = false;
  async function refreshAll(only) {
    if (refreshing) return;
    refreshing = true;
    $("#refresh-btn").classList.add("spin");
    const list = S.sources.filter((s) => s.on && (!only || only.includes(s.id)));
    let i = 0, lastPaint = 0;
    const worker = async () => {
      while (i < list.length) {
        await fetchSource(list[i++]);
        if (Date.now() - lastPaint > 700) { lastPaint = Date.now(); paintLists(); }
      }
    };
    await Promise.all(Array.from({ length: 6 }, worker));
    if (!only) S.lastRefresh = Date.now();
    refreshing = false;
    $("#refresh-btn").classList.remove("spin");
    save(); saveCache(); paintLists();
  }

  // ---------- item selection ----------
  function termsIn(text, terms) {
    const low = text.toLowerCase();
    return terms.filter((t) => low.includes(t.toLowerCase()));
  }
  function allItems(social) {
    const seen = new Set(), titles = new Set(), out = [];
    S.sources.forEach((s) => {
      if (!s.on || isSocial(s) !== social || !C[s.id]) return;
      C[s.id].items.forEach((it) => {
        const t = (it.title || it.text || "").toLowerCase().replace(/\W+/g, " ").trim().slice(0, 90);
        if (seen.has(it.link) || (it.kind === "article" && titles.has(t))) return;
        seen.add(it.link); titles.add(t);
        const hay = (it.title || "") + " " + (it.summary || "") + " " + (it.text || "");
        if (S.mutes.length && termsIn(hay, S.mutes).length) return;
        it._alerts = termsIn(hay, S.alerts);
        it._desk = s.desk;
        out.push(it);
      });
    });
    return out.sort((a, b) => b.date - a.date);
  }
  function highlight(text, terms, query) {
    let h = esc(text);
    const all = terms.concat(query ? [query] : []).filter((t) => t.length > 1);
    if (!all.length) return h;
    const re = new RegExp("(" + all.map((t) => esc(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")", "gi");
    return h.replace(re, "<mark>$1</mark>");
  }
  const clipFor = (link) => S.clips.find((c) => c.link === link);
  function markRead(id, counts) {
    if (S.read[id]) return;
    S.read[id] = Date.now();
    if (counts) { const k = dayKey(); S.days[k] = (S.days[k] || 0) + 1; }
    pruneRead();
  }
  function citation(it) {
    const outlet = it.outlet || it.net || "";
    return "“" + (it.title || clip(it.text, 80)) + ",” " + (outlet ? outlet + ", " : "") + (it.date ? apDate(it.date) + ", " : "") + it.link;
  }

  // ---------- views ----------
  const view = $("#view");
  let wireQuery = "", wireLimit = 120, clipQuery = "";

  function setTab(tab) {
    S.tab = tab; save();
    $$(".nav button").forEach((b) => b.setAttribute("aria-current", b.dataset.tab === tab ? "page" : "false"));
    ({ wire: renderWire, social: renderSocial, tools: renderTools, notebook: renderNotebook, learn: renderLearn })[tab]();
    window.scrollTo(0, 0);
  }
  function paintLists() {
    if (S.tab === "wire") paintWire();
    if (S.tab === "social") paintSocial();
  }

  // Wire
  function renderWire() {
    view.innerHTML = `
      <div class="search"><svg class="i"><use href="#i-search"/></svg><input class="field" id="wire-q" type="search" placeholder="Search your wire" value="${esc(wireQuery)}" autocomplete="off"></div>
      <div class="chips" id="desk-chips" style="margin-top:10px"></div>
      <div class="row" style="justify-content:space-between">
        <div class="row" style="gap:14px">
          <label class="toggle"><input type="checkbox" id="unread-only" ${S.unreadOnly ? "checked" : ""}>Unread</label>
          <label class="toggle"><input type="checkbox" id="alerts-only" ${S.alertsOnly ? "checked" : ""}>Alerts</label>
        </div>
        <button class="btn ghost sm" type="button" id="all-read">${icon("check")}Mark all read</button>
      </div>
      <div class="status" id="wire-status"></div>
      <div id="wire-list"></div>`;
    $("#wire-q").addEventListener("input", (e) => { wireQuery = e.target.value; wireLimit = 120; paintWire(); });
    $("#unread-only").addEventListener("change", (e) => { S.unreadOnly = e.target.checked; save(); paintWire(); });
    $("#alerts-only").addEventListener("change", (e) => { S.alertsOnly = e.target.checked; save(); paintWire(); });
    $("#all-read").addEventListener("click", () => { wireVisible().forEach((it) => markRead(it.id)); save(); paintWire(); toast("All caught up"); });
    paintWire();
  }
  function wireVisible() {
    const q = wireQuery.trim().toLowerCase();
    return allItems(false).filter((it) =>
      (S.desk === "all" || it._desk === S.desk) &&
      (!S.unreadOnly || !S.read[it.id]) &&
      (!S.alertsOnly || it._alerts.length) &&
      (!q || (it.title + " " + it.summary + " " + it.outlet).toLowerCase().includes(q)));
  }
  function statusLine(sources) {
    const failed = sources.filter((s) => s.on && C[s.id] && C[s.id].err);
    const never = sources.filter((s) => s.on && !C[s.id]).length;
    let h = refreshing ? "Checking your sources…" : S.lastRefresh ? "Updated " + ago(S.lastRefresh) + (ago(S.lastRefresh) === "now" ? "" : " ago") : never ? "Not loaded yet" : "";
    if (failed.length) {
      h += ` <details class="errors"><summary>${failed.length} source${failed.length > 1 ? "s" : ""} didn't load</summary><ul>` +
        failed.map((s) => `<li><b>${esc(s.name)}</b>: ${esc(C[s.id].err)}</li>`).join("") +
        `</ul><button type="button" data-act="retry">Try them again</button> · <button type="button" data-act="settings">Edit sources</button></details>`;
    }
    return h;
  }
  function paintWire() {
    const list = $("#wire-list");
    if (!list) return;
    const all = allItems(false);
    const wireSources = S.sources.filter((s) => !isSocial(s));
    const desks = S.desks.filter((d) => wireSources.some((s) => s.desk === d.id && s.on));
    if (S.desk !== "all" && !desks.some((d) => d.id === S.desk)) S.desk = "all";
    const unread = (deskId) => all.filter((it) => (deskId === "all" || it._desk === deskId) && !S.read[it.id]).length;
    $("#desk-chips").innerHTML = [{ id: "all", name: "All desks" }].concat(desks).map((d) =>
      `<button class="chip" type="button" data-desk="${d.id}" aria-pressed="${S.desk === d.id}">${esc(d.name)}<span class="n">${unread(d.id) || ""}</span></button>`).join("");
    $("#wire-status").innerHTML = statusLine(wireSources);

    const items = wireVisible();
    if (!items.length) {
      list.innerHTML = !wireSources.some((s) => s.on)
        ? `<div class="empty"><h3>No sources yet</h3><p>Add feeds, keyword alerts and communities to build your wire.</p><button class="btn primary" type="button" data-act="settings">${icon("plus")}Add sources</button></div>`
        : refreshing || !all.length ? `<div class="empty"><h3>Loading the wire…</h3><p>Pulling the latest from your sources.</p></div>`
        : `<div class="empty"><h3>Nothing here</h3><p>${S.unreadOnly ? "You've read everything on this desk." : "No stories match."}</p></div>`;
      return;
    }
    const now = Date.now(), today = new Date().setHours(0, 0, 0, 0);
    const bucket = (d) => !d ? "Undated" : now - d < 3600e3 ? "The past hour" : d >= today ? "Earlier today" : d >= today - 864e5 ? "Yesterday" : d >= today - 6 * 864e5 ? "This week" : "Older";
    let html = "", last = "";
    items.slice(0, wireLimit).forEach((it) => {
      const b = bucket(it.date);
      if (b !== last) { html += `<h3 class="group-h">${b}</h3>`; last = b; }
      html += storyHtml(it);
    });
    if (items.length > wireLimit) html += `<div style="text-align:center;padding:16px"><button class="btn" type="button" data-act="more">Show ${Math.min(120, items.length - wireLimit)} more</button></div>`;
    list.innerHTML = html;
  }
  function storyHtml(it) {
    const saved = !!clipFor(it.link);
    const q = wireQuery.trim();
    return `<article class="story${S.read[it.id] ? " read" : ""}" data-id="${esc(it.id)}">
      <div class="story-meta"><span class="src">${esc(it.outlet)}</span><span>${ago(it.date)}</span>${it._alerts.map((a) => `<span class="alert">⚑ ${esc(a)}</span>`).join("")}</div>
      <div><a class="story-title" href="${esc(it.link)}" target="_blank" rel="noopener" data-open>${highlight(it.title, it._alerts, q)}</a>
      ${it.summary ? `<p class="story-sum">${highlight(it.summary, it._alerts, q)}</p>` : ""}</div>
      ${it.image ? `<img class="story-img" src="${esc(it.image)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : ""}
      <div class="story-actions">
        <button class="act" type="button" data-act="save" aria-pressed="${saved}">${icon("bookmark")}${saved ? "Saved" : "Save"}</button>
        <button class="act" type="button" data-act="cite">${icon("copy")}Cite</button>
        <button class="act" type="button" data-act="pitch">${icon("bulb")}Pitch</button>
        <button class="act" type="button" data-act="archive">${icon("archive")}Archive</button>
      </div>
    </article>`;
  }
  function itemById(id) {
    const sid = id.split("|")[0];
    return C[sid] && C[sid].items.find((x) => x.id === id);
  }

  // Social
  function renderSocial() {
    view.innerHTML = `
      <div class="label">Watch on X</div>
      <p class="small muted" style="margin:-2px 0 10px">X doesn't offer a free feed, so these open saved searches straight in X's Latest tab.</p>
      <div class="launch" id="x-list"></div>
      <div class="label">Reddit, Bluesky &amp; Mastodon</div>
      <div class="chips" id="social-chips"></div>
      <div class="status" id="social-status"></div>
      <div class="stack" id="social-list"></div>`;
    paintX();
    paintSocial();
  }
  function paintX() {
    $("#x-list").innerHTML = S.xSearches.map((x) =>
      `<a href="https://x.com/search?q=${encodeURIComponent(x.q)}&f=live" target="_blank" rel="noopener">${esc(x.label)}<small>${esc(x.q)}</small><button class="x" type="button" data-act="x-del" data-id="${x.id}" aria-label="Remove ${esc(x.label)}">×</button></a>`).join("") +
      `<button type="button" data-act="x-add">${icon("plus")}Add a search<small>Keywords, accounts, filters</small></button>`;
  }
  function paintSocial() {
    const list = $("#social-list");
    if (!list) return;
    const srcs = S.sources.filter((s) => isSocial(s) && s.on);
    if (S.socialSrc !== "all" && !srcs.some((s) => s.id === S.socialSrc)) S.socialSrc = "all";
    $("#social-chips").innerHTML = [{ id: "all", name: "Everything" }].concat(srcs).map((s) =>
      `<button class="chip" type="button" data-ssrc="${s.id}" aria-pressed="${S.socialSrc === s.id}">${esc(s.name)}</button>`).join("");
    $("#social-status").innerHTML = statusLine(srcs);
    const items = allItems(true).filter((it) => S.socialSrc === "all" || it.sid === S.socialSrc).slice(0, 150);
    if (!items.length) {
      list.innerHTML = srcs.length ? `<div class="empty"><h3>${refreshing ? "Loading posts…" : "No posts yet"}</h3></div>`
        : `<div class="empty"><h3>Follow people and hashtags</h3><p>Add subreddits, Reddit searches, Bluesky accounts and Mastodon hashtags in Sources.</p><button class="btn primary" type="button" data-act="settings">${icon("plus")}Add sources</button></div>`;
      return;
    }
    list.innerHTML = items.map((p) => `<article class="post" data-id="${esc(p.id)}">
      <div class="post-head">${p.avatar ? `<img class="avatar" src="${esc(p.avatar)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : `<span class="avatar"></span>`}
        <div class="post-who"><b>${esc(p.author)}</b><span>${esc(p.handle)} · ${esc(p.net)} · ${ago(p.date)}${p.repostBy ? " · reposted" : ""}</span></div></div>
      ${p.title ? `<a class="post-title" href="${esc(p.link)}" target="_blank" rel="noopener" data-open>${highlight(p.title, p._alerts, "")}</a>` : ""}
      ${p.text ? `<div class="post-text${p.title ? " muted small" : ""}">${highlight(p.text, p._alerts, "")}</div>` : ""}
      ${p.images.length ? `<div class="post-imgs">${p.images.map((u) => `<img src="${esc(u)}" alt="" loading="lazy" referrerpolicy="no-referrer">`).join("")}</div>` : ""}
      ${p.stats ? `<p class="small muted" style="margin:6px 0 0">${esc(p.stats)}</p>` : ""}
      ${p.card && p.card.url ? `<a class="post-link" href="${esc(p.card.url)}" target="_blank" rel="noopener"><b>${esc(p.card.title || host(p.card.url))}</b><span class="muted">${esc(host(p.card.url))}</span></a>` : ""}
      <div class="story-actions">
        <a class="act" href="${esc(p.link)}" target="_blank" rel="noopener" data-open>${icon("ext")}Open</a>
        <button class="act" type="button" data-act="save" aria-pressed="${!!clipFor(p.link)}">${icon("bookmark")}${clipFor(p.link) ? "Saved" : "Save"}</button>
        <button class="act" type="button" data-act="cite">${icon("copy")}Cite</button>
        <button class="act" type="button" data-act="archive">${icon("archive")}Archive</button>
      </div></article>`).join("");
  }

  // Tools
  function renderTools() {
    view.innerHTML = `
      <div class="stack" style="gap:14px">
      <section class="tool">
        <h2>Search everywhere</h2>
        <p>One search, every place a story might be hiding: news, social, courts, filings and money.</p>
        <div class="search"><svg class="i"><use href="#i-search"/></svg><input class="field" id="sx-q" type="search" placeholder="A name, company, place or phrase" autocomplete="off"></div>
        <div class="launch" id="sx-out" style="margin-top:10px"></div>
      </section>

      <section class="tool">
        <h2>Verify a link or image</h2>
        <p>Archive it before it changes, see who's behind it, and find where an image first appeared.</p>
        <input class="field" id="vf-u" type="url" placeholder="Paste a page or image address" autocomplete="off">
        <div class="launch" id="vf-out" style="margin-top:10px"></div>
        <ul class="checklist">${window.DISPATCH_SIFT.map((t) => `<li><label><input type="checkbox"><span>${esc(t)}</span></label></li>`).join("")}</ul>
      </section>

      <section class="tool">
        <h2>Draft check</h2>
        <p>Paste a draft for a copy editor's first pass: lede length, readability, passive voice and loaded words.</p>
        <textarea class="field" id="dc-t" rows="7" placeholder="Paste or write your story here"></textarea>
        <div id="dc-out"></div>
      </section>

      <section class="tool">
        <h2>Headline test</h2>
        <p>Search results cut headlines off around 60 characters. Lead with the words people search for.</p>
        <input class="field" id="hl-t" placeholder="Write a headline">
        <div class="meter"><i id="hl-m"></i></div>
        <p class="small muted" id="hl-out" style="margin:6px 0 0">0 characters</p>
      </section>

      <section class="tool">
        <h2>Records request letter</h2>
        <p>A federal FOIA request, ready to send. For a state or city agency, swap in your state's public records law.</p>
        <div class="stack">
          <div class="grid2">
            <label class="f">Agency<input class="field" data-foia="agency" placeholder="e.g. U.S. Department of Education"></label>
            <label class="f">Date range<input class="field" data-foia="range" placeholder="e.g. Jan. 1, 2025, to the present"></label>
          </div>
          <label class="f">Records you want<textarea class="field" data-foia="records" rows="3" placeholder="Be specific: the document type, the office, the subject. For example: all emails between the regional director and any contractor that mention “school bus contract.”"></textarea></label>
          <div class="grid2">
            <label class="f">Your name<input class="field" data-foia="name"></label>
            <label class="f">Outlet (optional)<input class="field" data-foia="outlet" placeholder="Student paper, newsletter, freelance"></label>
          </div>
          <label class="f">Email<input class="field" data-foia="email" type="email"></label>
          <label class="toggle"><input type="checkbox" data-foia="waiver" checked>Ask for a news media fee waiver</label>
          <label class="toggle"><input type="checkbox" data-foia="expedite">Ask for expedited processing</label>
          <label class="f" id="foia-why" hidden>Why it's urgent<input class="field" data-foia="why" placeholder="e.g. the agency votes on the contract March 3"></label>
          <div class="output" id="foia-out"></div>
          <div class="row"><button class="btn primary" type="button" id="foia-copy">${icon("copy")}Copy letter</button>
            <a class="btn" href="https://www.foia.gov/agency-search.html" target="_blank" rel="noopener">Find the agency's FOIA office</a>
            <a class="btn" href="https://www.muckrock.com" target="_blank" rel="noopener">Send it through MuckRock</a></div>
        </div>
      </section>

      <section class="tool">
        <h2>Interview prep</h2>
        <p>A starting question list. Open questions get stories; yes-or-no questions get quotes you can't use.</p>
        <div class="grid2">
          <label class="f">Who<input class="field" id="iv-who" placeholder="e.g. the school board chair"></label>
          <label class="f">About<input class="field" id="iv-topic" placeholder="e.g. the library closures"></label>
        </div>
        <div class="output" id="iv-out" style="font-family:inherit"></div>
        <div class="row" style="margin-top:10px"><button class="btn" type="button" id="iv-copy">${icon("copy")}Copy questions</button></div>
      </section>
      </div>`;

    const sx = () => {
      const q = $("#sx-q").value.trim();
      $("#sx-out").innerHTML = window.DISPATCH_SEARCH.map((t) => q
        ? `<a href="${esc(t.url.replace("{q}", encodeURIComponent(q)))}" target="_blank" rel="noopener">${esc(t.name)}<small>${esc(host(t.url))}</small></a>`
        : `<a aria-disabled="true" style="opacity:.55;pointer-events:none">${esc(t.name)}<small>${esc(host(t.url))}</small></a>`).join("");
    };
    $("#sx-q").addEventListener("input", sx); sx();

    const vf = () => {
      let raw = $("#vf-u").value.trim();
      if (raw && !/^https?:\/\//i.test(raw)) raw = "https://" + raw;
      $("#vf-out").innerHTML = window.DISPATCH_VERIFY.map((t) => raw
        ? `<a href="${esc(t.url.replace("{raw}", raw).replace("{u}", encodeURIComponent(raw)).replace("{host}", host(raw)))}" target="_blank" rel="noopener">${esc(t.name)}<small>${esc(t.note)}</small></a>`
        : `<a aria-disabled="true" style="opacity:.55;pointer-events:none">${esc(t.name)}<small>${esc(t.note)}</small></a>`).join("");
    };
    $("#vf-u").addEventListener("input", vf); vf();

    $("#dc-t").addEventListener("input", (e) => { $("#dc-out").innerHTML = draftReport(e.target.value); });
    $("#hl-t").addEventListener("input", (e) => {
      const n = e.target.value.length, w = e.target.value.trim().split(/\s+/).filter(Boolean).length;
      $("#hl-m").style.width = Math.min(100, (n / 70) * 100) + "%";
      $("#hl-m").style.background = n > 60 ? "var(--accent)" : "var(--good)";
      $("#hl-out").textContent = n + " characters · " + w + " words" + (n > 60 ? " · may be cut off in search results" : n >= 40 ? " · good length" : "");
    });

    const foiaSaved = S.foia || {};
    $$("[data-foia]").forEach((el) => {
      const k = el.dataset.foia;
      if (k in foiaSaved) { if (el.type === "checkbox") el.checked = foiaSaved[k]; else el.value = foiaSaved[k]; }
      el.addEventListener("input", foia);
    });
    function foia() {
      const v = {};
      $$("[data-foia]").forEach((el) => { v[el.dataset.foia] = el.type === "checkbox" ? el.checked : el.value.trim(); });
      S.foia = { name: v.name, outlet: v.outlet, email: v.email, waiver: v.waiver }; save();
      $("#foia-why").hidden = !v.expedite;
      $("#foia-out").textContent = foiaLetter(v);
    }
    foia();
    $("#foia-copy").addEventListener("click", () => copy($("#foia-out").textContent, "Letter copied"));

    const iv = () => { $("#iv-out").textContent = interviewQs($("#iv-who").value.trim(), $("#iv-topic").value.trim()); };
    $("#iv-who").addEventListener("input", iv); $("#iv-topic").addEventListener("input", iv); iv();
    $("#iv-copy").addEventListener("click", () => copy($("#iv-out").textContent, "Questions copied"));
  }

  function syllables(w) {
    w = w.toLowerCase().replace(/[^a-z]/g, "");
    if (!w) return 0;
    if (w.length <= 3) return 1;
    w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
    const m = w.match(/[aeiouy]{1,2}/g);
    return Math.max(1, m ? m.length : 1);
  }
  function draftReport(text) {
    text = text.trim();
    if (!text) return "";
    const words = text.match(/[A-Za-z0-9'’-]+/g) || [];
    const sentences = text.split(/(?<=[.!?])["”’)]*\s+/).map((s) => s.trim()).filter((s) => /[A-Za-z0-9]/.test(s));
    const wc = words.length, sc = Math.max(1, sentences.length);
    const syl = words.reduce((n, w) => n + syllables(w), 0);
    const ease = Math.round(206.835 - 1.015 * (wc / sc) - 84.6 * (syl / Math.max(1, wc)));
    const grade = Math.max(0, Math.round((0.39 * (wc / sc) + 11.8 * (syl / Math.max(1, wc)) - 15.59) * 10) / 10);
    const lede = (sentences[0] || "").split(/\s+/).filter(Boolean).length;
    const long = sentences.filter((s) => s.split(/\s+/).length > 30).length;
    const passive = (text.match(/\b(am|is|are|was|were|be|been|being)\s+(\w+ly\s+)?\w+(ed|en)\b/gi) || []).length;
    const adverbs = (text.match(/\b\w{3,}ly\b/gi) || []).filter((w) => !/^(only|early|family|reply|apply|supply|likely|july|italy|daily|weekly|monthly|holy|ugly)$/i.test(w)).length;
    const paras = text.split(/\n\s*\n/).filter((p) => p.trim());
    const longParas = paras.filter((p) => (p.match(/\S+/g) || []).length > 70).length;
    const flags = [];
    window.DISPATCH_FLAGS.forEach(([pat, fix]) => {
      const m = text.match(new RegExp(pat, "gi"));
      if (m) flags.push(`<li><b>${esc(m[0])}</b>${m.length > 1 ? " (" + m.length + "×)" : ""} → ${esc(fix)}</li>`);
    });
    const stat = (v, l, warn) => `<div class="stat${warn ? " warn" : ""}"><b>${v}</b><span>${l}</span></div>`;
    return `<div class="stats">
      ${stat(wc, "words")}${stat(Math.max(1, Math.round(wc / 238)) + "m", "reading time")}
      ${stat(lede, "words in lede", lede > 35)}${stat(grade, "grade level", grade > 10)}
      ${stat(ease, "reading ease", ease < 50)}${stat(long, "sentences over 30 words", long > 0)}
      ${stat(passive, "possible passive", passive > 2)}${stat(adverbs, "-ly adverbs", adverbs > 4)}
    </div>
    <ul class="flags">
      ${lede > 35 ? `<li>Your lede is ${lede} words. Aim for 35 or fewer.</li>` : ""}
      ${grade > 10 ? `<li>Grade level ${grade}. Most news writing lands around 8 to 10; shorter sentences help.</li>` : ""}
      ${longParas ? `<li>${longParas} paragraph${longParas > 1 ? "s run" : " runs"} past 70 words. News paragraphs are usually 1 to 3 sentences.</li>` : ""}
      ${flags.join("")}
    </ul>`;
  }
  function foiaLetter(v) {
    const today = new Date();
    const lines = [
      AP_MONTHS[today.getMonth()].replace(".", "") + " " + today.getDate() + ", " + today.getFullYear(), "",
      "FOIA Officer", v.agency || "[Agency name]", "",
      "Re: Freedom of Information Act request", "",
      "Dear FOIA Officer:", "",
      "Under the Freedom of Information Act, 5 U.S.C. § 552, I request copies of the following records:", "",
      v.records || "[Describe the records as specifically as you can.]", "",
    ];
    if (v.range) lines.push("The time frame for this request is " + v.range + ".", "");
    lines.push("I ask that the records be provided electronically, by email if possible.", "");
    if (v.waiver) {
      lines.push("I am a journalist" + (v.outlet ? " with " + v.outlet : "") + ", and this request is made as part of news gathering and not for commercial use. I request a waiver of all fees because disclosure of the requested information is in the public interest and is likely to contribute significantly to public understanding of the operations or activities of the government. If my fee waiver is denied, I ask to be categorized as a representative of the news media for fee purposes, and to be told in advance if fees will exceed $25.", "");
    } else {
      lines.push("I am willing to pay fees of up to $25. Please tell me before incurring any higher costs.", "");
    }
    if (v.expedite) {
      lines.push("I request expedited processing. I am primarily engaged in disseminating information to the public, and there is an urgency to inform the public about actual or alleged federal government activity" + (v.why ? ": " + v.why : "") + ". I certify that these statements are true and correct to the best of my knowledge and belief.", "");
    }
    lines.push(
      "If any part of this request is denied, please cite the specific exemption for each withheld portion and release all reasonably segregable portions. I look forward to your response within 20 business days, as the statute requires.", "",
      "Thank you,", v.name || "[Your name]");
    if (v.outlet) lines.push(v.outlet);
    lines.push(v.email || "[Email]");
    return lines.join("\n");
  }
  function interviewQs(who, topic) {
    const t = topic || "this", w = who || "them";
    return [
      "WARM UP",
      "• How did you first get involved with " + t + "?",
      "• What does a typical day look like for you right now?",
      "",
      "THE FACTS",
      "• Walk me through what happened, from the beginning.",
      "• When did you first learn about " + t + "? From whom?",
      "• What numbers, documents or records show this? Can I see them?",
      "• Who else was in the room, or knows about this?",
      "",
      "THE WHY",
      "• Why was this decision made now?",
      "• What were the other options, and why were they rejected?",
      "• Who benefits from " + t + ", and who pays for it?",
      "",
      "ACCOUNTABILITY",
      "• Critics say ___. How do you respond?",
      "• What would you do differently, knowing what you know now?",
      "• What happens next, and when?",
      "",
      "CLOSE",
      "• Is there anything I didn't ask that I should have?",
      "• Who else should I talk to? Can you introduce me?",
      "• What's the best way to reach " + (who ? "you" : w) + " if I have a follow-up?",
    ].join("\n");
  }

  // Notebook
  function renderNotebook() {
    const tabs = [["pitches", "Pitches", S.pitches.length], ["clips", "Clips", S.clips.length], ["contacts", "Sources", S.contacts.length]];
    view.innerHTML = `<div class="seg" role="group" aria-label="Notebook section">${tabs.map(([k, l, n]) => `<button type="button" data-nb="${k}" aria-pressed="${S.nb === k}">${l}${n ? " · " + n : ""}</button>`).join("")}</div><div id="nb-body" style="margin-top:14px"></div>`;
    ({ pitches: nbPitches, clips: nbClips, contacts: nbContacts })[S.nb]();
  }
  function nbPitches() {
    const counts = STATUSES.map((s) => S.pitches.filter((p) => p.status === s).length);
    const list = S.pitches.filter((p) => S.pitchFilter === "all" || p.status === S.pitchFilter)
      .sort((a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status) || (a.due || "9").localeCompare(b.due || "9") || b.created - a.created);
    $("#nb-body").innerHTML = `
      <div class="row" style="justify-content:space-between"><div class="chips" style="margin:0;padding:0 0 6px;flex:1">
        <button class="chip" type="button" data-pf="all" aria-pressed="${S.pitchFilter === "all"}">All</button>
        ${STATUSES.map((s, i) => `<button class="chip" type="button" data-pf="${s}" aria-pressed="${S.pitchFilter === s}">${s}<span class="n">${counts[i] || ""}</span></button>`).join("")}
      </div><button class="btn primary sm" type="button" data-act="pitch-new">${icon("plus")}New</button></div>
      <div class="stack" style="margin-top:8px">${list.length ? list.map((p) => {
        const overdue = p.due && p.status !== "Filed" && p.due < dayKey();
        return `<article class="item" data-pid="${p.id}">
          <div class="item-meta"><span class="pill ${p.status === "Filed" ? "" : "hot"}">${esc(p.status)}</span>${p.due ? `<span class="${overdue ? "stale" : ""}">Due ${esc(p.due)}</span>` : ""}${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(host(p.link))}</a>` : ""}</div>
          <h3>${esc(p.title)}</h3>
          ${p.angle ? `<p>${esc(p.angle)}</p>` : ""}
          ${p.calls ? `<p class="muted small"><b>Call:</b> ${esc(p.calls)}</p>` : ""}
          ${p.docs ? `<p class="muted small"><b>Get:</b> ${esc(p.docs)}</p>` : ""}
          <div class="row"><button class="btn sm" type="button" data-act="pitch-edit">Edit</button>
            ${p.status !== "Filed" ? `<button class="btn sm" type="button" data-act="pitch-next">Move to ${STATUSES[STATUSES.indexOf(p.status) + 1]} →</button>` : ""}
            <button class="btn sm ghost" type="button" data-act="pitch-copy">${icon("copy")}Copy as pitch</button></div>
        </article>`;
      }).join("") : `<div class="empty"><h3>No pitches${S.pitchFilter !== "all" ? " here" : " yet"}</h3><p>Tap Pitch on any story in your Wire, or start one from scratch.</p></div>`}</div>`;
  }
  function pitchEditor(p) {
    const isNew = !p;
    p = p || { id: uid(), title: "", angle: "", calls: "", docs: "", notes: "", status: "Idea", due: "", link: "", created: Date.now() };
    openSheet(isNew ? "New pitch" : "Edit pitch", `
      <form class="stack" id="pf">
        <label class="f">Working headline<input class="field" name="title" required value="${esc(p.title)}" placeholder="A story, not a topic"></label>
        <label class="f">Why it matters, why now<textarea class="field" name="angle" rows="3" placeholder="Your nut graf in two sentences">${esc(p.angle)}</textarea></label>
        <label class="f">People to call<input class="field" name="calls" value="${esc(p.calls)}" placeholder="Names, roles, who's affected"></label>
        <label class="f">Documents and data to get<input class="field" name="docs" value="${esc(p.docs)}" placeholder="Records, filings, datasets"></label>
        <label class="f">Notes<textarea class="field" name="notes" rows="4">${esc(p.notes)}</textarea></label>
        <div class="grid2">
          <label class="f">Stage<select class="field" name="status">${STATUSES.map((s) => `<option${s === p.status ? " selected" : ""}>${s}</option>`).join("")}</select></label>
          <label class="f">Due<input class="field" type="date" name="due" value="${esc(p.due)}"></label>
        </div>
        <label class="f">Link<input class="field" name="link" type="url" value="${esc(p.link)}"></label>
        <div class="row"><button class="btn primary" type="submit">Save</button>${isNew ? "" : `<button class="btn danger" type="button" id="pdel">Delete</button>`}</div>
      </form>`, () => {
      $("#pf").addEventListener("submit", (e) => {
        e.preventDefault();
        Object.assign(p, Object.fromEntries(new FormData(e.target)));
        if (isNew) S.pitches.unshift(p);
        save(); closeSheet(); S.nb = "pitches"; if (S.tab === "notebook") renderNotebook(); else toast("Pitch saved to Notebook");
      });
      const del = $("#pdel");
      if (del) del.addEventListener("click", () => { if (!confirm("Delete this pitch?")) return; S.pitches = S.pitches.filter((x) => x.id !== p.id); save(); closeSheet(); renderNotebook(); });
    });
  }
  function nbClips() {
    const q = clipQuery.toLowerCase();
    const list = S.clips.filter((c) => !q || (c.title + " " + c.outlet + " " + c.note + " " + (c.tags || "")).toLowerCase().includes(q));
    $("#nb-body").innerHTML = `
      <div class="row"><div class="search grow"><svg class="i"><use href="#i-search"/></svg><input class="field" id="clip-q" type="search" placeholder="Search clips, notes and tags" value="${esc(clipQuery)}"></div>
      <button class="btn sm" type="button" data-act="clips-export">Export</button></div>
      <div class="stack" style="margin-top:10px" id="clip-list">${list.length ? list.map((c) => `<article class="item" data-cid="${c.id}">
        <div class="item-meta"><b>${esc(c.outlet)}</b>${c.date ? `<span>${apDate(c.date)}</span>` : ""}${(splitList(c.tags)).map((t) => `<span class="pill">${esc(t)}</span>`).join("")}</div>
        <h3><a href="${esc(c.link)}" target="_blank" rel="noopener">${esc(c.title)}</a></h3>
        ${c.note ? `<p>${esc(c.note)}</p>` : ""}
        <div class="row"><button class="btn sm" type="button" data-act="clip-edit">Note &amp; tags</button>
          <button class="btn sm ghost" type="button" data-act="clip-cite">${icon("copy")}Cite</button>
          <button class="btn sm ghost" type="button" data-act="clip-pitch">${icon("bulb")}Pitch</button>
          <button class="btn sm ghost danger" type="button" data-act="clip-del">Remove</button></div>
      </article>`).join("") : `<div class="empty"><h3>${S.clips.length ? "No matches" : "No clips yet"}</h3><p>Tap Save on any story or post to keep it here with your notes.</p></div>`}</div>`;
    $("#clip-q").addEventListener("input", (e) => {
      clipQuery = e.target.value;
      const pos = e.target.selectionStart;
      nbClips();
      const f = $("#clip-q"); f.focus(); f.setSelectionRange(pos, pos);
    });
  }
  function clipEditor(c) {
    openSheet("Clip notes", `<form class="stack" id="cf">
      <p class="small muted" style="margin:0">${esc(c.outlet)} · ${esc(c.title)}</p>
      <label class="f">Your notes<textarea class="field" name="note" rows="6" placeholder="Key facts, quotes worth following up, who to call">${esc(c.note)}</textarea></label>
      <label class="f">Tags (comma separated)<input class="field" name="tags" value="${esc(c.tags || "")}" placeholder="housing, city council"></label>
      <div class="row"><button class="btn primary" type="submit">Save</button></div></form>`, () => {
      $("#cf").addEventListener("submit", (e) => { e.preventDefault(); Object.assign(c, Object.fromEntries(new FormData(e.target))); save(); closeSheet(); renderNotebook(); });
    });
  }
  function nbContacts() {
    const daysSince = (d) => d ? Math.floor((Date.now() - new Date(d + "T12:00").getTime()) / 864e5) : null;
    const list = S.contacts.slice().sort((a, b) => (a.last || "").localeCompare(b.last || ""));
    $("#nb-body").innerHTML = `
      <div class="row" style="justify-content:space-between"><p class="small muted grow" style="margin:0">Your source list, stalest first. Kept only on this device.</p>
      <button class="btn primary sm" type="button" data-act="contact-new">${icon("plus")}Add</button></div>
      <div class="stack" style="margin-top:10px">${list.length ? list.map((c) => {
        const d = daysSince(c.last);
        return `<article class="item" data-kid="${c.id}">
          <div class="item-meta">${c.beat ? `<span class="pill">${esc(c.beat)}</span>` : ""}<span class="${d === null || d > 30 ? "stale" : ""}">${d === null ? "Never contacted" : d === 0 ? "Talked today" : "Last talked " + d + " day" + (d === 1 ? "" : "s") + " ago"}</span></div>
          <h3>${esc(c.name)}</h3>
          ${c.role ? `<p class="muted">${esc(c.role)}</p>` : ""}
          ${c.reach ? `<p class="small">${esc(c.reach)}</p>` : ""}
          ${c.notes ? `<p class="small muted">${esc(c.notes)}</p>` : ""}
          <div class="row"><button class="btn sm" type="button" data-act="contact-today">${icon("check")}Talked today</button><button class="btn sm ghost" type="button" data-act="contact-edit">Edit</button></div>
        </article>`;
      }).join("") : `<div class="empty"><h3>Build your source list</h3><p>Every beat runs on people. Keep track of who knows what, and check in before you need them.</p></div>`}</div>`;
  }
  function contactEditor(c) {
    const isNew = !c;
    c = c || { id: uid(), name: "", role: "", beat: "", reach: "", notes: "", last: "" };
    openSheet(isNew ? "New source" : "Edit source", `<form class="stack" id="kf">
      <label class="f">Name<input class="field" name="name" required value="${esc(c.name)}"></label>
      <label class="f">Role and organization<input class="field" name="role" value="${esc(c.role)}" placeholder="e.g. Union rep, County Transit"></label>
      <div class="grid2"><label class="f">Beat<input class="field" name="beat" value="${esc(c.beat)}" placeholder="e.g. Transit"></label>
      <label class="f">Last talked<input class="field" type="date" name="last" value="${esc(c.last)}"></label></div>
      <label class="f">How to reach them<input class="field" name="reach" value="${esc(c.reach)}" placeholder="Phone, email, Signal, best times"></label>
      <label class="f">Notes<textarea class="field" name="notes" rows="4" placeholder="What they know, terms you agreed on (on record, background)">${esc(c.notes)}</textarea></label>
      <p class="small muted" style="margin:0">For confidential sources, keep identifying details out of any app, including this one.</p>
      <div class="row"><button class="btn primary" type="submit">Save</button>${isNew ? "" : `<button class="btn danger" type="button" id="kdel">Delete</button>`}</div></form>`, () => {
      $("#kf").addEventListener("submit", (e) => { e.preventDefault(); Object.assign(c, Object.fromEntries(new FormData(e.target))); if (isNew) S.contacts.push(c); save(); closeSheet(); renderNotebook(); });
      const del = $("#kdel");
      if (del) del.addEventListener("click", () => { if (!confirm("Delete " + c.name + "?")) return; S.contacts = S.contacts.filter((x) => x.id !== c.id); save(); closeSheet(); renderNotebook(); });
    });
  }

  // Learn
  function streak() {
    let n = 0;
    const d = new Date();
    if (!S.days[dayKey(d)]) d.setDate(d.getDate() - 1);
    while (S.days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  let drillIdx = null;
  function renderLearn() {
    const L = window.DISPATCH_LESSONS;
    const done = L.filter((l) => S.lessons[l.id]).length;
    const week = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); week.push([d, S.days[dayKey(d)] || 0]); }
    const max = Math.max(5, ...week.map((w) => w[1]));
    const facts = window.DISPATCH_PRACTICE_FACTS;
    if (drillIdx === null) drillIdx = Math.floor(Date.now() / 864e5) % facts.length;
    const units = [...new Set(L.map((l) => l.unit))];
    view.innerHTML = `
      <div class="kpis">
        <div class="kpi"><b>${S.days[dayKey()] || 0}</b><span>read today</span></div>
        <div class="kpi"><b>${streak()}</b><span>day streak</span></div>
        <div class="kpi"><b>${done}/${L.length}</b><span>lessons</span></div>
      </div>
      <div class="card" style="margin-top:10px"><div class="small muted" style="font-weight:700">Stories read this week</div>
        <div class="bars">${week.map(([d, n]) => `<div><i style="height:${Math.round((n / max) * 100)}%" title="${n}"></i><span>${"SMTWTFS"[d.getDay()]}</span></div>`).join("")}</div></div>

      <div class="label">Lede drill</div>
      <div class="tool">
        <p style="margin:0 0 8px;color:var(--text)" class="prose">${esc(facts[drillIdx])}</p>
        <textarea class="field" id="lede-t" rows="3" placeholder="Write a hard-news lede: one sentence, 35 words or fewer."></textarea>
        <p class="small muted" id="lede-n" style="margin:6px 0">0 words</p>
        <ul class="checklist small">
          <li><label><input type="checkbox">It says who did what, and when.</label></li>
          <li><label><input type="checkbox">It leads with the consequence, not the meeting or announcement.</label></li>
          <li><label><input type="checkbox">The verb is active and specific.</label></li>
          <li><label><input type="checkbox">A reader who stops here still gets the news.</label></li>
        </ul>
        <div class="row" style="margin-top:10px"><button class="btn primary" type="button" id="lede-save">Save lede</button><button class="btn" type="button" id="lede-new">New facts</button></div>
        ${S.drills.length ? `<details style="margin-top:10px"><summary class="small" style="cursor:pointer;font-weight:700">Your past ledes (${S.drills.length})</summary><div class="stack" style="margin-top:8px">${S.drills.slice(0, 20).map((d) => `<div class="small"><span class="muted">${esc(d.day)} · ${d.words} words</span><br>${esc(d.text)}</div>`).join("")}</div></details>` : ""}
      </div>

      ${units.map((u) => `<div class="label">${esc(u)}</div><div class="stack" style="gap:6px">${L.filter((l) => l.unit === u).map((l) =>
        `<button class="lesson${S.lessons[l.id] ? " done" : ""}" type="button" data-lesson="${l.id}"><span class="dot">${S.lessons[l.id] ? icon("check") : ""}</span><b class="grow">${esc(l.title)}</b><span class="muted small">${S.lessons[l.id] ? "Done" : "Read"}</span></button>`).join("")}</div>`).join("")}

      <div class="label">Keep learning</div>
      <div class="launch">${window.DISPATCH_RESOURCES.map((r) => `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.name)}<small>${esc(r.note)}</small></a>`).join("")}</div>`;
    const t = $("#lede-t");
    t.addEventListener("input", () => {
      const n = t.value.trim().split(/\s+/).filter(Boolean).length;
      $("#lede-n").textContent = n + " words" + (n > 35 ? " · trim it under 35" : n ? " · good length" : "");
      $("#lede-n").style.color = n > 35 ? "var(--accent)" : "";
    });
    $("#lede-save").addEventListener("click", () => {
      const text = t.value.trim();
      if (!text) return toast("Write a lede first");
      S.drills.unshift({ day: dayKey(), text, words: text.split(/\s+/).length, facts: drillIdx });
      S.drills = S.drills.slice(0, 100);
      save(); toast("Lede saved"); renderLearn();
    });
    $("#lede-new").addEventListener("click", () => { drillIdx = (drillIdx + 1) % facts.length; renderLearn(); });
  }
  function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, "<i>$1</i>"); }
  function openLesson(id) {
    const l = window.DISPATCH_LESSONS.find((x) => x.id === id);
    openSheet(l.title, `<div class="stack">
      <p class="pill" style="align-self:flex-start;margin:0">${esc(l.unit)}</p>
      <div class="prose">${l.body.map((p) => `<p>${md(p)}</p>`).join("")}</div>
      <div class="card"><b>Remember</b><ul class="takeaways">${l.takeaways.map((t) => `<li>${md(t)}</li>`).join("")}</ul></div>
      <div class="tryit"><b>Try it:</b> ${md(l.tryit)}</div>
      <div class="row"><button class="btn primary" type="button" id="lesson-done">${S.lessons[id] ? "Mark as not done" : icon("check") + "Mark complete"}</button></div></div>`, () => {
      $("#lesson-done").addEventListener("click", () => {
        if (S.lessons[id]) delete S.lessons[id]; else S.lessons[id] = Date.now();
        save(); closeSheet(); renderLearn();
      });
    });
  }

  // ---------- sheet ----------
  const sheet = $("#sheet");
  function openSheet(title, html, mount) {
    $("#sheet-title").textContent = title;
    $("#sheet-body").innerHTML = html;
    if (!sheet.open) sheet.showModal();
    $(".sheet-in").scrollTop = 0;
    if (mount) mount();
  }
  function closeSheet() { if (sheet.open) sheet.close(); }
  $("#sheet-close").addEventListener("click", closeSheet);
  sheet.addEventListener("click", (e) => { if (e.target === sheet) closeSheet(); });

  // ---------- settings ----------
  function openSettings(focus) {
    const deskOpts = (sel) => S.desks.map((d) => `<option value="${d.id}"${d.id === sel ? " selected" : ""}>${esc(d.name)}</option>`).join("");
    const groups = S.desks.map((d) => ({ d, list: S.sources.filter((s) => s.desk === d.id) })).filter((g) => g.list.length);
    openSheet("Sources & settings", `
      <form class="tool stack" id="add-src">
        <h2 style="margin:0">Add a source</h2>
        <label class="f">Type<select class="field" name="type">${Object.entries(TYPES).map(([k, t]) => `<option value="${k}">${t.label}</option>`).join("")}</select></label>
        <label class="f"><span id="src-help"></span><input class="field" name="value" required autocomplete="off"></label>
        <div class="grid2">
          <label class="f">Name<input class="field" name="name" placeholder="Optional"></label>
          <label class="f">Desk<select class="field" name="desk">${deskOpts(S.desk !== "all" ? S.desk : "")}<option value="__new">+ New desk…</option></select></label>
        </div>
        <label class="f" id="new-desk" hidden>New desk name<input class="field" name="deskName" placeholder="e.g. My beat: Housing"></label>
        <div class="row"><button class="btn primary" type="submit">${icon("plus")}Add source</button></div>
      </form>

      <div class="label">Starter packs</div>
      ${PACKS.map((p) => {
        const have = p.sources.filter(([t, v]) => S.sources.some((s) => s.type === t && s.value === v)).length;
        return `<div class="pack"><div class="grow"><b>${esc(p.name)}</b><div class="small muted">${esc(p.blurb)} ${p.sources.length} sources.</div></div>
          ${have === p.sources.length ? `<span class="small muted">Added</span>` : `<button class="btn sm" type="button" data-pack="${p.id}">${icon("plus")}Add</button>`}</div>`;
      }).join("")}

      <div class="label">Your sources</div>
      ${groups.length ? groups.map((g) => `<div class="card" style="margin-bottom:10px;padding:6px 12px">
        <div class="row" style="padding:6px 0"><b class="grow">${esc(g.d.name)}</b>
          <button class="btn sm ghost" type="button" data-desk-rename="${g.d.id}">Rename</button>
          <button class="btn sm ghost danger" type="button" data-desk-del="${g.d.id}">Delete</button></div>
        ${g.list.map((s) => {
          const c = C[s.id];
          const st = !s.on ? "Off" : !c ? "Not loaded yet" : c.err ? `<span class="bad">${esc(c.err)}</span>` : c.items.length + " items · " + ago(c.at);
          return `<div class="src-row" data-sid="${s.id}">
            <input type="checkbox" data-src-on ${s.on ? "checked" : ""} aria-label="Show ${esc(s.name)}">
            <div class="grow"><b>${esc(s.name)}</b><small>${esc(TYPES[s.type].label)} · ${esc(s.value)}</small><small>${st}</small></div>
            <select class="field" data-src-desk style="width:auto;max-width:120px;padding:5px 6px;font-size:.78rem">${deskOpts(s.desk)}</select>
            <button class="btn sm ghost" type="button" data-src-edit aria-label="Rename">Edit</button>
            <button class="btn sm ghost danger" type="button" data-src-del aria-label="Remove ${esc(s.name)}">×</button>
          </div>`;
        }).join("")}</div>`).join("") : `<p class="muted">No sources yet. Add one above or start with a pack.</p>`}

      <div class="label">Alerts &amp; mutes</div>
      <div class="stack">
        <label class="f">Alert words: stories with these get flagged and highlighted<input class="field" id="set-alerts" value="${esc(S.alerts.join(", "))}" placeholder="FOIA, subpoena, your city"></label>
        <label class="f">Mute words: stories with these are hidden<input class="field" id="set-mutes" value="${esc(S.mutes.join(", "))}" placeholder="celebrity, crypto"></label>
      </div>

      <div class="label">Appearance</div>
      <div class="seg" role="group" aria-label="Theme">${[["", "Auto"], ["light", "Light"], ["dark", "Dark"]].map(([k, l]) => `<button type="button" data-theme-set="${k}" aria-pressed="${S.theme === k}">${l}</button>`).join("")}</div>

      <div class="label">Feed proxy</div>
      <p class="small muted" style="margin:0 0 8px">Browsers can't read most news feeds directly, so Dispatch passes them through free public proxies, which can be slow or down. For a reliable wire, run your own (the README shows a free Cloudflare Worker) and paste its address. Use {url} where the feed address goes, or leave it out to append it.</p>
      <input class="field" id="set-proxy" value="${esc(S.proxy)}" placeholder="https://your-worker.workers.dev/?url={url}">

      <div class="label">Your data</div>
      <p class="small muted" style="margin:0 0 8px">Everything lives on this device. Save a backup now and then, or to move to a new phone.</p>
      <div class="row">
        <button class="btn" type="button" id="bk-save">Save backup file</button>
        <label class="btn">Restore backup<input type="file" id="bk-load" accept=".json,application/json" hidden></label>
        <button class="btn" type="button" id="opml-out">Export OPML</button>
        <label class="btn">Import OPML<input type="file" id="opml-in" accept=".opml,.xml,text/xml" hidden></label>
        <button class="btn danger" type="button" id="reset">Start over</button>
      </div>`, () => mountSettings(focus));
  }
  function mountSettings(focus) {
    const f = $("#add-src");
    const F = f.elements;
    const help = () => { const t = TYPES[F.type.value]; $("#src-help").textContent = t.help; F.value.placeholder = t.ph; };
    F.type.addEventListener("change", help); help();
    F.desk.addEventListener("change", () => { $("#new-desk").hidden = F.desk.value !== "__new"; });
    if (!S.desks.length) { F.desk.value = "__new"; $("#new-desk").hidden = false; }
    if (focus === "add") setTimeout(() => F.value.focus(), 50);
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const type = F.type.value;
      let value = F.value.value.trim();
      if (type === "rss" && !/^https?:\/\//i.test(value)) value = "https://" + value;
      if (S.sources.some((s) => s.type === type && s.value === value)) return toast("You already follow that");
      let desk = F.desk.value;
      if (desk === "__new" || !desk) {
        const name = (F.deskName.value || "").trim() || "My desk";
        const d = { id: uid(), name }; S.desks.push(d); desk = d.id;
      }
      const name = F.name.value.trim() || (type === "rss" ? host(value) : type === "reddit" ? "r/" + value.replace(/^\/?r\//i, "") : type === "redditsearch" ? "Reddit: " + value : type === "substack" ? (/\./.test(value) ? host(/^https?:/i.test(value) ? value : "https://" + value) : value) : type === "mastodon" ? "#" + value.replace(/^#/, "").split("@")[0] : value);
      const src = { id: uid(), type, value, name, desk, on: true };
      S.sources.push(src); save();
      toast("Checking " + name + "…");
      fetchSource(src).then(() => {
        saveCache();
        const c = C[src.id];
        toast(c.err ? name + ": " + c.err : name + " added · " + c.items.length + " items");
        if (sheet.open) openSettings(); paintLists();
      });
      openSettings();
    });
    $$("[data-pack]").forEach((b) => b.addEventListener("click", () => {
      const n = addPack(S, b.dataset.pack); save();
      toast(n + " sources added");
      const p = PACKS.find((x) => x.id === b.dataset.pack);
      const ids = S.sources.filter((s) => p.sources.some(([t, v]) => s.type === t && s.value === v)).map((s) => s.id);
      openSettings(); refreshAll(ids);
    }));
    $$(".src-row").forEach((row) => {
      const s = S.sources.find((x) => x.id === row.dataset.sid);
      $("[data-src-on]", row).addEventListener("change", (e) => { s.on = e.target.checked; save(); paintLists(); if (s.on && !C[s.id]) refreshAll([s.id]); });
      $("[data-src-desk]", row).addEventListener("change", (e) => { s.desk = e.target.value; save(); openSettings(); paintLists(); });
      $("[data-src-edit]", row).addEventListener("click", () => {
        const name = prompt("Name", s.name); if (name === null) return;
        const value = prompt(TYPES[s.type].label, s.value); if (value === null) return;
        const changed = value.trim() !== s.value;
        s.name = name.trim() || s.name; s.value = value.trim() || s.value; save();
        if (changed) { delete C[s.id]; refreshAll([s.id]); }
        openSettings(); paintLists();
      });
      $("[data-src-del]", row).addEventListener("click", () => { S.sources = S.sources.filter((x) => x.id !== s.id); delete C[s.id]; save(); saveCache(); openSettings(); paintLists(); });
    });
    $$("[data-desk-rename]").forEach((b) => b.addEventListener("click", () => {
      const d = S.desks.find((x) => x.id === b.dataset.deskRename);
      const n = prompt("Desk name", d.name); if (!n || !n.trim()) return;
      d.name = n.trim(); save(); openSettings(); paintLists();
    }));
    $$("[data-desk-del]").forEach((b) => b.addEventListener("click", () => {
      const d = S.desks.find((x) => x.id === b.dataset.deskDel);
      const n = S.sources.filter((s) => s.desk === d.id).length;
      if (!confirm("Delete the " + d.name + " desk and its " + n + " sources?")) return;
      S.sources.filter((s) => s.desk === d.id).forEach((s) => delete C[s.id]);
      S.sources = S.sources.filter((s) => s.desk !== d.id);
      S.desks = S.desks.filter((x) => x.id !== d.id);
      save(); saveCache(); openSettings(); paintLists();
    }));
    $("#set-alerts").addEventListener("change", (e) => { S.alerts = splitList(e.target.value); save(); paintLists(); toast("Alerts updated"); });
    $("#set-mutes").addEventListener("change", (e) => { S.mutes = splitList(e.target.value); save(); paintLists(); toast("Mutes updated"); });
    $("#set-proxy").addEventListener("change", (e) => { S.proxy = e.target.value.trim(); save(); toast(S.proxy ? "Proxy saved. Refreshing…" : "Using public proxies"); refreshAll(); });
    $$("[data-theme-set]").forEach((b) => b.addEventListener("click", () => {
      S.theme = b.dataset.themeSet; save(); applyTheme();
      $$("[data-theme-set]").forEach((x) => x.setAttribute("aria-pressed", x === b));
    }));
    $("#bk-save").addEventListener("click", () => download("dispatch-backup-" + dayKey() + ".json", JSON.stringify(S, null, 1), "application/json"));
    $("#bk-load").addEventListener("change", async (e) => {
      const file = e.target.files[0]; if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (!Array.isArray(data.sources)) throw new Error();
        if (!confirm("Replace everything in Dispatch with this backup?")) return;
        S = Object.assign(fresh(), data); C = {}; save(); saveCache(); applyTheme();
        closeSheet(); setTab(S.tab); refreshAll(); toast("Backup restored");
      } catch (err) { toast("That isn't a Dispatch backup"); }
    });
    $("#opml-out").addEventListener("click", () => {
      const xmlEsc = (s) => esc(s);
      const body = S.desks.map((d) => {
        const list = S.sources.filter((s) => s.desk === d.id && !["hn", "bsky", "mastodon"].includes(s.type));
        if (!list.length) return "";
        return `  <outline text="${xmlEsc(d.name)}">\n` + list.map((s) => `    <outline type="rss" text="${xmlEsc(s.name)}" xmlUrl="${xmlEsc(feedUrl(s))}"/>`).join("\n") + "\n  </outline>";
      }).filter(Boolean).join("\n");
      download("dispatch-feeds.opml", `<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0">\n<head><title>Dispatch feeds</title></head>\n<body>\n${body}\n</body>\n</opml>\n`, "text/xml");
    });
    $("#opml-in").addEventListener("change", async (e) => {
      const file = e.target.files[0]; if (!file) return;
      const doc = new DOMParser().parseFromString(await file.text(), "text/xml");
      const outs = [...doc.querySelectorAll("outline[xmlUrl]")];
      if (!outs.length) return toast("No feeds found in that file");
      let added = 0;
      const ids = [];
      outs.forEach((o) => {
        const parent = o.parentElement && o.parentElement.getAttribute("text");
        const deskName = parent || "Imported";
        let d = S.desks.find((x) => x.name === deskName);
        if (!d) { d = { id: uid(), name: deskName }; S.desks.push(d); }
        const value = o.getAttribute("xmlUrl");
        if (S.sources.some((s) => s.value === value)) return;
        const s = { id: uid(), type: "rss", value, name: o.getAttribute("title") || o.getAttribute("text") || host(value), desk: d.id, on: true };
        S.sources.push(s); ids.push(s.id); added++;
      });
      save(); toast(added + " feeds imported"); openSettings(); refreshAll(ids);
    });
    $("#reset").addEventListener("click", () => {
      if (!confirm("Erase all your sources, clips, pitches, contacts and progress, and start fresh?")) return;
      S = fresh(); C = {}; save(); saveCache(); applyTheme(); closeSheet(); setTab("wire"); refreshAll();
    });
  }
  function addXSearch() {
    openSheet("Add an X search", `<form class="stack" id="xf">
      <label class="f">Label<input class="field" name="label" required placeholder="e.g. City council chatter"></label>
      <label class="f">Search<input class="field" name="q" required placeholder='e.g. "city council" (from:mayor OR to:mayor)'></label>
      <p class="small muted" style="margin:0">Handy operators: <b>from:</b>handle, <b>to:</b>handle, <b>"exact phrase"</b>, <b>OR</b>, <b>-word</b> to exclude, <b>filter:links</b>, <b>filter:media</b>, <b>min_faves:100</b>, <b>since:2026-01-01</b>, <b>near:"Chicago"</b>.</p>
      <div class="row"><button class="btn primary" type="submit">Save search</button></div></form>`, () => {
      $("#xf").addEventListener("submit", (e) => {
        e.preventDefault();
        const v = Object.fromEntries(new FormData(e.target));
        S.xSearches.push({ id: uid(), label: v.label.trim(), q: v.q.trim() }); save(); closeSheet(); paintX();
      });
    });
  }

  // ---------- events ----------
  function saveClip(it) {
    const existing = clipFor(it.link);
    if (existing) { S.clips = S.clips.filter((c) => c !== existing); save(); toast("Removed from clips"); return; }
    S.clips.unshift({ id: uid(), title: it.title || clip(it.text, 120), link: it.link, outlet: it.outlet || (it.author + " on " + it.net), date: it.date, note: "", tags: "", saved: Date.now() });
    save(); toast("Saved to clips");
  }
  function pitchFrom(it) {
    pitchEditor(null);
    const F = $("#pf").elements;
    F.link.value = it.link;
    F.notes.value = "Started from: " + citation(it);
    F.title.placeholder = "What's the follow-up? e.g. Who approved this, and what did it cost?";
    F.title.focus();
  }
  function archiveLink(url) { window.open("https://web.archive.org/save/" + url, "_blank", "noopener"); }

  document.addEventListener("click", (e) => {
    const nav = e.target.closest("[data-tab]");
    if (nav) return setTab(nav.dataset.tab);
    const chip = e.target.closest("[data-desk]");
    if (chip) { S.desk = chip.dataset.desk; wireLimit = 120; save(); paintWire(); return; }
    const sch = e.target.closest("[data-ssrc]");
    if (sch) { S.socialSrc = sch.dataset.ssrc; save(); paintSocial(); return; }
    const nb = e.target.closest("[data-nb]");
    if (nb) { S.nb = nb.dataset.nb; save(); renderNotebook(); return; }
    const pf = e.target.closest("[data-pf]");
    if (pf) { S.pitchFilter = pf.dataset.pf; save(); nbPitches(); return; }
    const les = e.target.closest("[data-lesson]");
    if (les) return openLesson(les.dataset.lesson);

    const open = e.target.closest("[data-open]");
    if (open) {
      const card = open.closest("[data-id]");
      if (card) { markRead(card.dataset.id, true); save(); setTimeout(paintLists, 300); }
      return;
    }
    const actEl = e.target.closest("[data-act]");
    if (!actEl) return;
    const act = actEl.dataset.act;
    const itemEl = actEl.closest("[data-id]");
    const it = itemEl && itemById(itemEl.dataset.id);
    const pitch = actEl.closest("[data-pid]") && S.pitches.find((p) => p.id === actEl.closest("[data-pid]").dataset.pid);
    const clipEl = actEl.closest("[data-cid]") && S.clips.find((c) => c.id === actEl.closest("[data-cid]").dataset.cid);
    const contact = actEl.closest("[data-kid]") && S.contacts.find((c) => c.id === actEl.closest("[data-kid]").dataset.kid);
    switch (act) {
      case "save": if (it) { saveClip(it); paintLists(); } break;
      case "cite": if (it) copy(citation(it), "Citation copied"); break;
      case "pitch": if (it) pitchFrom(it); break;
      case "archive": if (it) archiveLink(it.link); break;
      case "more": wireLimit += 120; paintWire(); break;
      case "retry": refreshAll(S.sources.filter((s) => C[s.id] && C[s.id].err).map((s) => s.id)); break;
      case "settings": openSettings("add"); break;
      case "x-add": e.preventDefault(); addXSearch(); break;
      case "x-del": e.preventDefault(); e.stopPropagation(); S.xSearches = S.xSearches.filter((x) => x.id !== actEl.dataset.id); save(); paintX(); break;
      case "pitch-new": pitchEditor(null); break;
      case "pitch-edit": pitchEditor(pitch); break;
      case "pitch-next": pitch.status = STATUSES[STATUSES.indexOf(pitch.status) + 1]; save(); nbPitches(); toast("Moved to " + pitch.status); break;
      case "pitch-copy": copy(pitch.title + "\n\n" + (pitch.angle || "") + (pitch.calls ? "\n\nI'll talk to: " + pitch.calls : "") + (pitch.docs ? "\nRecords and data: " + pitch.docs : ""), "Pitch copied"); break;
      case "clip-edit": clipEditor(clipEl); break;
      case "clip-cite": copy(citation(clipEl), "Citation copied"); break;
      case "clip-pitch": pitchFrom(clipEl); break;
      case "clip-del": S.clips = S.clips.filter((c) => c !== clipEl); save(); renderNotebook(); toast("Clip removed"); break;
      case "clips-export":
        download("dispatch-clips-" + dayKey() + ".md", "# Clips\n\n" + S.clips.map((c) => `## [${c.title}](${c.link})\n${c.outlet}${c.date ? ", " + apDate(c.date) : ""}${c.tags ? "\nTags: " + c.tags : ""}\n\n${c.note || ""}\n`).join("\n"), "text/markdown");
        break;
      case "contact-new": contactEditor(null); break;
      case "contact-edit": contactEditor(contact); break;
      case "contact-today": contact.last = dayKey(); save(); renderNotebook(); toast("Logged"); break;
    }
  });
  $("#refresh-btn").addEventListener("click", () => refreshAll());
  $("#settings-btn").addEventListener("click", () => openSettings());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && Date.now() - S.lastRefresh > 15 * 60e3) refreshAll();
  });

  // ---------- start ----------
  $("#mast-date").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  applyTheme();
  setTab(S.tab || "wire");
  if (Date.now() - S.lastRefresh > 10 * 60e3 || !Object.keys(C).length) refreshAll();
  else paintLists();

  window.Dispatch = { parseFeed, draftReport, foiaLetter, state: () => S }; // for tests and the console
})();
