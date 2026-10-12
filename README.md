# Dispatch.

A journalist's toolkit that works on a laptop or as a home screen app, offline too. On a laptop it opens straight to the app; on a phone it first shows how to add it to the home screen.

- **Wire**: your niche news feeds in one stream, grouped by time and sorted into **desks** (Investigations, Press & media, Liberty & law, Tech & OSINT, World wire, Substack, plus any you make). Search it, show only unread, or show only **alerts**: stories that mention your alert words get flagged and highlighted, and stories with mute words are hidden. Every story has **Save** (to Clips), **Cite** (copies an AP-style citation), **Pitch** (starts a follow-up story idea) and **Archive** (saves a copy to the Wayback Machine).
- **Sources** (gear icon): add any website feed (RSS), a **Substack newsletter** (just its name, like `heathercoxrichardson`, or its own address), a **Google News keyword alert**, a **Reddit community** or a **Reddit-wide search**, a YouTube channel, a Hacker News search, a **Bluesky account** or a **Mastodon hashtag**. Starter packs add a whole desk at once. Sources that fail to load say why. Feeds can also be moved in and out as OPML.
- **Social**: subreddits and Reddit searches (with points and comment counts), Bluesky accounts and Mastodon hashtags as live posts. X has no free feed, so **Watch on X** keeps saved searches (with X's search operators) that open straight in X's Latest tab.
- **Tools**: **Search everywhere** (one query sent to news, X, Bluesky, Reddit, TikTok, court records, SEC filings, campaign money, the Federal Register, MuckRock and more), **Verify a link or image** (archive it, look up the domain, reverse image search, plus a SIFT checklist), **Draft check** (lede length, grade level, passive voice, words a copy editor would flag), **Headline test**, a **FOIA request letter** generator, and **Interview prep** questions.
- **Notebook**: **Pitches** that move from Idea to Reporting to Writing to Filed, **Clips** with notes and tags (exportable as Markdown), and a **Sources** list of people, stalest contact first.
- **Learn**: 15 short lessons (news values, the inverted pyramid, ledes, nut grafs, interviewing, attribution, sourcing terms, records requests, verification, ethics, libel, source safety, beats, pitching, clips). Each has a **Practice** set of real exercises: multiple choice, tap the buried lede or the loaded word, put paragraphs in order, and short writing tasks. Score 70% to pass a lesson. **Daily drills** add a lede drill plus news-value and headline-rewrite drills on real stories from your Wire. You also get a reading streak and a 7-day chart, plus links to training and legal help.
- **AI coach** (optional): paste your own Anthropic API key under **Settings → AI coach**, and Claude grades your written answers like an editor: a score out of 10, what works, what to fix, and a stronger version. It's needed for the real-story drills, since those have no answer key. Each graded answer costs about a cent or two. The key stays on your device and isn't included in backups.

Everything is stored on the device. **Settings → Save backup file** makes a copy you can restore on another phone.

## How feeds load
Browsers can't read most news feeds directly (the sites don't allow it), so Dispatch gets them three ways, in order:

1. **From GitHub.** The **Fetch feeds** action (`.github/workflows/feeds.yml`) runs every 30 minutes on GitHub's servers, fetches every feed in the starter packs, and saves them as `feeds.json` on the `feed-data` branch. The app reads that one file first. Its run log lists every feed as OK or FAIL, which makes broken addresses easy to spot. To have it fetch a feed you added yourself, put the feed's address on its own line in `extra-feeds.txt`.
2. **Directly.** Bluesky, Mastodon and Hacker News allow it, so they always load straight from the browser.
3. **Through a proxy.** Anything else goes through free public proxies, which can be slow or down. For those, you can run your own free proxy with a Cloudflare Worker (Workers → Create → paste this → Deploy), then paste its address into **Settings → Feed proxy** as `https://YOUR-WORKER.workers.dev/?url={url}`:

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

GitHub pauses scheduled actions in repositories with no activity for 60 days. If the wire goes stale, open the **Actions** tab and re-enable **Fetch feeds**.

## Run it
Plain HTML, CSS and JavaScript with no build step:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

It's published with GitHub Pages (Settings → Pages → deploy from the `main` branch, root folder).
