# Dispatch.

A journalist's toolkit that works on a laptop or as a home screen app, offline too. On a laptop it opens straight to the app; on a phone it first shows how to add it to the home screen.

- **Wire**: your niche news feeds in one stream, grouped by time and sorted into **desks** (Investigations, Press & media, Liberty & law, Tech & OSINT, World wire, plus any you make). Search it, show only unread, or show only **alerts**: stories that mention your alert words get flagged and highlighted, and stories with mute words are hidden. Every story has **Save** (to Clips), **Cite** (copies an AP-style citation), **Pitch** (starts a follow-up story idea) and **Archive** (saves a copy to the Wayback Machine).
- **Sources** (gear icon): add any website feed (RSS), a **Google News keyword alert**, a Reddit community, a YouTube channel, a Hacker News search, a **Bluesky account** or a **Mastodon hashtag**. Starter packs add a whole desk at once. Sources that fail to load say why. Feeds can also be moved in and out as OPML.
- **Social**: Bluesky accounts and Mastodon hashtags as live posts. X has no free feed, so **Watch on X** keeps saved searches (with X's search operators) that open straight in X's Latest tab.
- **Tools**: **Search everywhere** (one query sent to news, X, Bluesky, Reddit, TikTok, court records, SEC filings, campaign money, the Federal Register, MuckRock and more), **Verify a link or image** (archive it, look up the domain, reverse image search, plus a SIFT checklist), **Draft check** (lede length, grade level, passive voice, words a copy editor would flag), **Headline test**, a **FOIA request letter** generator, and **Interview prep** questions.
- **Notebook**: **Pitches** that move from Idea to Reporting to Writing to Filed, **Clips** with notes and tags (exportable as Markdown), and a **Sources** list of people, stalest contact first.
- **Learn**: stories read today, a daily streak and a 7-day chart, a daily **lede drill**, 15 short lessons (news values, ledes, interviewing, attribution, records requests, verification, ethics, libel, source safety, beats, pitching, clips), and links to training and legal help.

Everything is stored on the device. **Settings → Save backup file** makes a copy you can restore on another phone.

## Making feeds reliable
Browsers can't read most news feeds directly (the sites don't allow it), so Dispatch passes them through free public proxies. Those can be slow or down. For a dependable wire, make your own free proxy with a Cloudflare Worker (Workers → Create → paste this → Deploy), then paste its address into **Settings → Feed proxy** as `https://YOUR-WORKER.workers.dev/?url={url}`:

```js
export default {
  async fetch(request) {
    const target = new URL(request.url).searchParams.get("url");
    if (!target || !/^https?:\/\//.test(target)) return new Response("Add ?url=", { status: 400 });
    const res = await fetch(target, { headers: { "User-Agent": "Mozilla/5.0 Dispatch feed reader" }, cf: { cacheTtl: 300 } });
    const out = new Response(res.body, res);
    out.headers.set("Access-Control-Allow-Origin", "*");
    return out;
  },
};
```

Bluesky, Mastodon and Hacker News load directly and don't need a proxy.

## Run it
Plain HTML, CSS and JavaScript with no build step:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

It's published with GitHub Pages (Settings → Pages → deploy from the `main` branch, root folder).
