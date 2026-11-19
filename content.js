// Dispatch: starter sources, search launchers and lessons. Plain data, no logic.

// Source types: rss (any RSS/Atom URL), gnews (Google News keyword search),
// substack (newsletter name or address), reddit (subreddit name), redditsearch (Reddit-wide search), youtube (channel id), hn (Hacker News search),
// bsky (Bluesky handle), mastodon (tag@instance).
window.DISPATCH_PACKS = [
  {
    id: "breaking", name: "Breaking",
    blurb: "Top stories and the wire services, for what's happening right now.",
    sources: [
      ["rss", "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en", "Google News Top Stories"],
      ["gnews", "site:apnews.com when:1d", "AP"],
      ["gnews", "site:reuters.com when:1d", "Reuters"],
      ["gnews", "breaking news when:1h", "Breaking news (all outlets)"],
      ["rss", "https://feeds.bbci.co.uk/news/rss.xml", "BBC News"],
      ["rss", "https://feeds.npr.org/1002/rss.xml", "NPR Latest"],
    ],
  },
  {
    id: "investigative", name: "Investigations",
    blurb: "Accountability reporting and the people who do it best.",
    sources: [
      ["rss", "https://www.propublica.org/feeds/propublica/main", "ProPublica"],
      ["rss", "https://www.themarshallproject.org/rss/recent.rss", "The Marshall Project"],
      ["rss", "https://revealnews.org/feed/", "Reveal"],
      ["rss", "https://www.icij.org/feed/", "ICIJ"],
      ["rss", "https://theintercept.com/feed/?lang=en", "The Intercept"],
      ["rss", "https://gijn.org/feed/", "GIJN"],
    ],
  },
  {
    id: "press", name: "Press & media",
    blurb: "The business, craft and future of journalism.",
    sources: [
      ["rss", "https://www.niemanlab.org/feed/", "Nieman Lab"],
      ["rss", "https://www.poynter.org/feed/", "Poynter"],
      ["rss", "https://www.cjr.org/feed", "Columbia Journalism Review"],
      ["rss", "https://pressgazette.co.uk/feed/", "Press Gazette"],
      ["gnews", "\"press freedom\" OR \"journalist arrested\" when:7d", "Press freedom watch"],
    ],
  },
  {
    id: "liberty", name: "Liberty & law",
    blurb: "Free speech, privacy, courts and civil liberties.",
    sources: [
      ["rss", "https://www.eff.org/rss/updates.xml", "EFF"],
      ["rss", "https://www.rcfp.org/feed/", "Reporters Committee"],
      ["rss", "https://www.scotusblog.com/feed/", "SCOTUSblog"],
      ["rss", "https://www.courthousenews.com/feed/", "Courthouse News"],
      ["rss", "https://www.techdirt.com/feed/", "Techdirt"],
      ["gnews", "\"First Amendment\" lawsuit when:7d", "First Amendment cases"],
      ["gnews", "FOIA OR \"public records\" lawsuit when:7d", "Public records fights"],
    ],
  },
  {
    id: "tech", name: "Tech & OSINT",
    blurb: "Surveillance, platforms, open-source investigation.",
    sources: [
      ["rss", "https://www.bellingcat.com/feed/", "Bellingcat"],
      ["rss", "https://www.404media.co/rss/", "404 Media"],
      ["rss", "https://themarkup.org/feeds/rss.xml", "The Markup"],
      ["rss", "https://restofworld.org/feed/latest", "Rest of World"],
      ["hn", "journalism", "Hacker News: journalism"],
    ],
  },
  {
    id: "local", name: "Statehouse & local",
    blurb: "Nonprofit newsrooms covering states and cities.",
    sources: [
      ["rss", "https://stateline.org/feed/", "Stateline"],
      ["rss", "https://calmatters.org/feed/", "CalMatters"],
      ["rss", "https://www.texastribune.org/feeds/main/", "Texas Tribune"],
    ],
  },
  {
    id: "world", name: "World wire",
    blurb: "The big picture, so niche never means narrow.",
    sources: [
      ["rss", "https://feeds.npr.org/1001/rss.xml", "NPR News"],
      ["rss", "https://feeds.bbci.co.uk/news/world/rss.xml", "BBC World"],
      ["rss", "https://www.theguardian.com/world/rss", "The Guardian World"],
      ["rss", "https://www.aljazeera.com/xml/rss/all.xml", "Al Jazeera"],
    ],
  },
  {
    id: "substack", name: "Substack",
    blurb: "Independent journalists and newsletters, from across the political spectrum.",
    sources: [
      ["substack", "heathercoxrichardson", "Letters from an American"],
      ["substack", "popular.info", "Popular Information"],
      ["substack", "www.thefp.com", "The Free Press"],
      ["substack", "www.racket.news", "Racket News"],
      ["substack", "seymourhersh", "Seymour Hersh"],
      ["substack", "www.thebulwark.com", "The Bulwark"],
      ["substack", "www.slowboring.com", "Slow Boring"],
      ["substack", "www.natesilver.net", "Silver Bulletin"],
      ["substack", "simonowens", "Simon Owens's media newsletter"],
    ],
  },
  {
    id: "community", name: "Reddit",
    blurb: "Where reporters, researchers and insiders talk shop.",
    sources: [
      ["reddit", "Journalism", "r/Journalism"],
      ["reddit", "journalismjobs", "r/journalismjobs"],
      ["reddit", "OSINT", "r/OSINT"],
      ["reddit", "foia", "r/foia"],
      ["reddit", "Substack", "r/Substack"],
      ["reddit", "news", "r/news"],
      ["redditsearch", "\"public records\" OR FOIA", "Reddit: records talk"],
    ],
  },
  {
    id: "social", name: "Social",
    blurb: "Newsroom accounts on Bluesky and journalist hashtags on Mastodon.",
    sources: [
      ["bsky", "apnews.com", "AP"],
      ["bsky", "reuters.com", "Reuters"],
      ["bsky", "npr.org", "NPR"],
      ["bsky", "propublica.org", "ProPublica"],
      ["bsky", "404media.co", "404 Media"],
      ["bsky", "niemanlab.org", "Nieman Lab"],
      ["mastodon", "journalism@journa.host", "#journalism on journa.host"],
      ["mastodon", "pressfreedom@mastodon.social", "#pressfreedom"],
      ["mastodon", "osint@mastodon.social", "#osint"],
    ],
  },
];

// Packs loaded on first run.
window.DISPATCH_DEFAULT_PACKS = ["breaking", "investigative", "press", "liberty", "tech", "world", "substack", "community", "social"];

window.DISPATCH_X_SEARCHES = [
  { label: "Breaking news", q: "breaking (news OR update) -filter:replies filter:links" },
  { label: "Press freedom", q: "\"press freedom\" OR \"journalist detained\"" },
  { label: "FOIA wins", q: "FOIA (released OR obtained) filter:links" },
  { label: "Eyewitness media", q: "(\"just now\" OR \"happening now\") filter:media" },
];

// "Search everywhere": {q} is the URL-encoded query.
window.DISPATCH_SEARCH = [
  { name: "Google News", url: "https://news.google.com/search?q={q}" },
  { name: "Google, past day", url: "https://www.google.com/search?q={q}&tbs=qdr:d" },
  { name: "X (Latest)", url: "https://x.com/search?q={q}&f=live" },
  { name: "Bluesky", url: "https://bsky.app/search?q={q}" },
  { name: "Threads", url: "https://www.threads.net/search?q={q}" },
  { name: "Reddit", url: "https://www.reddit.com/search/?q={q}&sort=new" },
  { name: "Substack", url: "https://substack.com/search/{q}?searching=all_posts" },
  { name: "YouTube", url: "https://www.youtube.com/results?search_query={q}&sp=CAI%253D" },
  { name: "TikTok", url: "https://www.tiktok.com/search?q={q}" },
  { name: "Court records", url: "https://www.courtlistener.com/?q={q}" },
  { name: "SEC filings", url: "https://www.sec.gov/edgar/search/#/q={q}" },
  { name: "Campaign money", url: "https://www.fec.gov/search/?query={q}" },
  { name: "Federal Register", url: "https://www.federalregister.gov/documents/search?conditions%5Bterm%5D={q}" },
  { name: "FOIA requests", url: "https://www.muckrock.com/foi/list/?q={q}" },
  { name: "Companies", url: "https://opencorporates.com/companies?q={q}" },
  { name: "Money in politics", url: "https://www.opensecrets.org/search?q={q}" },
  { name: "Academic papers", url: "https://scholar.google.com/scholar?q={q}" },
];

// Verify a link or image: {u} is the URL-encoded address, {raw} the address as typed.
window.DISPATCH_VERIFY = [
  { name: "Wayback history", url: "https://web.archive.org/web/*/{raw}", note: "Every saved copy of the page" },
  { name: "Save to Wayback", url: "https://web.archive.org/save/{raw}", note: "Preserve it before it changes" },
  { name: "archive.today", url: "https://archive.ph/{raw}", note: "Second archive, catches paywalls" },
  { name: "Domain lookup", url: "https://who.is/whois/{host}", note: "Who registered it, and when" },
  { name: "Google Lens", url: "https://lens.google.com/uploadbyurl?url={u}", note: "Reverse image search" },
  { name: "TinEye", url: "https://tineye.com/search?url={u}", note: "Oldest copy of an image" },
  { name: "Yandex Images", url: "https://yandex.com/images/search?rpt=imageview&url={u}", note: "Strong on faces and places" },
  { name: "Bing Visual", url: "https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:{u}", note: "Another reverse search" },
];

window.DISPATCH_SIFT = [
  "Stop. Notice your reaction before you share or write.",
  "Investigate the source: who made this, and what's their track record?",
  "Find better coverage: has a trusted outlet confirmed it?",
  "Trace it to the original: earliest post, full video, full document.",
  "Check the image: reverse search it and look for an older copy.",
  "Check the when and where: weather, shadows, signs, landmarks.",
  "Get a second, independent source before you publish.",
];

// Words a copy editor would flag. [pattern, suggestion]
window.DISPATCH_FLAGS = [
  ["\\butiliz(e|es|ed|ing)\\b", "use"],
  ["\\bin order to\\b", "to"],
  ["\\bvery\\b", "a stronger word"],
  ["\\breally\\b", "cut it"],
  ["\\birregardless\\b", "regardless"],
  ["\\balot\\b", "a lot"],
  ["\\b(stated|exclaimed|commented|remarked)\\b", "said"],
  ["\\b(claimed|admitted|insisted)\\b", "said (these imply judgment)"],
  ["\\bat this point in time\\b", "now"],
  ["\\bdue to the fact that\\b", "because"],
  ["\\bin the event that\\b", "if"],
  ["\\bcurrently\\b", "usually unneeded"],
  ["\\bcompletely (destroyed|eliminated|finished)\\b", "drop \"completely\""],
  ["\\bpast history\\b", "history"],
  ["\\bfuture plans\\b", "plans"],
  ["\\bsurrounding the\\b", "about"],
];

window.DISPATCH_LESSONS = [
  {
    id: "news-values", unit: "Foundations", title: "What makes something news",
    body: [
      "Editors judge stories by a handful of news values. **Timeliness**: it's new or newly relevant. **Impact**: it changes people's lives, money, safety or rights. **Proximity**: it's close to your audience. **Prominence**: it involves powerful or well-known people. **Conflict**: there's a fight over resources, power or ideas. **Novelty**: it's unusual. **Human interest**: it moves people.",
      "The strongest stories hit several at once. Accountability journalism adds one more test: *is someone with power doing something the public has a right to know about?*",
    ],
    takeaways: ["Ask: who is affected, and how much?", "Impact beats novelty for serious work.", "\"Why now?\" should always have an answer."],
    tryit: "Pick three items from your Wire. For each, name the two strongest news values in it.",
  },
  {
    id: "pyramid", unit: "Foundations", title: "The inverted pyramid",
    body: [
      "Hard news puts the most important information first and the least important last. A reader who stops after one paragraph should still know what happened.",
      "Order: **lede** (the core news) → **nut graf** or context (why it matters) → **key evidence and quotes** → **background** → **secondary details**. Editors trim from the bottom, so nothing essential should live there.",
      "Features break this rule on purpose, but they still answer the reader's question (\"why am I reading this?\") within the first few paragraphs.",
    ],
    takeaways: ["Most important first.", "Each paragraph should be less essential than the one before.", "Never bury the news."],
    tryit: "Take a story from your Wire and list its paragraphs by importance. Did the writer follow the pyramid?",
  },
  {
    id: "ledes", unit: "Foundations", title: "Writing the lede",
    body: [
      "A **hard-news lede** is one sentence, usually under 35 words, built on who did what, plus when and where. Lead with the action and its consequence, not the meeting or the press release.",
      "Weak: *The city council met Tuesday to discuss the budget.* Strong: *The city council voted Tuesday to close two libraries, cutting $1.2 million from next year's budget.*",
      "A **delayed** or **anecdotal lede** opens with a person or scene, then turns to the news within a few paragraphs. Use it for features, never for breaking news.",
    ],
    takeaways: ["Active verb, real subject.", "Under 35 words.", "The news, not the event that produced it."],
    tryit: "Do today's Lede drill in Learn and keep your lede under 35 words.",
  },
  {
    id: "nutgraf", unit: "Foundations", title: "The nut graf",
    body: [
      "The nut graf tells the reader *why this story matters and why now*. It usually sits within the first three to five paragraphs, especially after an anecdotal lede.",
      "A good nut graf widens the frame: one family's eviction becomes a citywide trend, backed by a number. It makes the story's promise: this is what you'll learn by reading on.",
    ],
    takeaways: ["Why it matters, why now.", "Connect the specific to the larger pattern.", "Back the claim with evidence."],
    tryit: "Find the nut graf in a feature from your Wire. Rewrite it in one sentence.",
  },
  {
    id: "interviewing", unit: "Reporting", title: "Interviewing",
    body: [
      "Prepare: read everything the person has said publicly, and know what you need from them. Then ask **open questions** (\"How did…\", \"What happened when…\", \"Walk me through…\") that can't be answered yes or no.",
      "Listen more than you talk. Silence after an answer often gets a better second answer. Ask for specifics: names, dates, numbers, documents. Save the hard question for later in the interview, but make sure you ask it.",
      "End with: *Is there anything I didn't ask that I should have?* and *Who else should I talk to?*",
    ],
    takeaways: ["Open questions.", "Ask for documents and specifics.", "Always ask who else to call."],
    tryit: "Use the Interview prep tool in Tools to draft questions for a source on your beat.",
  },
  {
    id: "attribution", unit: "Reporting", title: "Attribution and quotes",
    body: [
      "Readers should always know where information came from. Attribute anything you didn't witness or can't independently prove.",
      "Use **said**. It's neutral and invisible. Verbs like *claimed*, *admitted* or *insisted* imply a judgment about the speaker. Put attribution after the first sentence of a quote, not before it.",
      "Quote what's vivid, emotional or contested. Paraphrase facts and jargon. Never change a direct quote's meaning; if you trim it, use ellipses honestly.",
    ],
    takeaways: ["\"Said\" is almost always right.", "Quote color, paraphrase facts.", "Attribute what you didn't see."],
    tryit: "Paste a draft into Draft check. It flags loaded attribution verbs.",
  },
  {
    id: "terms", unit: "Reporting", title: "On the record, off the record",
    body: [
      "**On the record**: everything can be published with the source's name. **On background**: you can use the information, attributed to a description (\"a city official\"), not a name. **Deep background**: you can use it, but can't attribute it at all. **Off the record**: you can't publish it; you can only use it to find other sources.",
      "Different newsrooms define these slightly differently, so **agree on terms before the information is shared**, not after. A source can't declare something off the record retroactively unless you agree.",
    ],
    takeaways: ["Set terms first.", "Make sure you and the source mean the same thing.", "Anonymity is for protecting people, not for convenience."],
    tryit: "Write down, in one sentence each, how you'd explain these four terms to a nervous first-time source.",
  },
  {
    id: "records", unit: "Reporting", title: "Public records and FOIA",
    body: [
      "The federal Freedom of Information Act (5 U.S.C. § 552) lets anyone request records from federal agencies. Every state has its own public records law with its own deadlines and exemptions.",
      "Be **specific**: name the record type, date range and office. Ask for electronic copies. As a journalist you can request a **fee waiver** and, for urgent stories, **expedited processing**.",
      "Expect delays. Track your deadlines, follow up politely and in writing, and appeal denials. Look at MuckRock to see what others have already requested.",
    ],
    takeaways: ["Specific requests get faster answers.", "Ask for a media fee waiver.", "Denials can be appealed."],
    tryit: "Draft a request with the FOIA letter tool in Tools.",
  },
  {
    id: "verification", unit: "Reporting", title: "Verification",
    body: [
      "Use the **SIFT** method: **Stop**, **Investigate** the source, **Find** better coverage, **Trace** claims to the original context.",
      "For photos and video, reverse-image search for older copies, check metadata where available, and geolocate using landmarks, signs, terrain and shadows. For accounts, check creation date, posting history and who follows them.",
      "Verification isn't a step at the end. It's the discipline of the whole job. If you can't confirm it, you can't report it as fact.",
    ],
    takeaways: ["Trace everything to the original.", "Archive pages before they vanish.", "Unconfirmed means unpublished."],
    tryit: "Run a viral post's image through the Verify tool and find its oldest copy.",
  },
  {
    id: "ethics", unit: "Ethics & law", title: "The SPJ Code of Ethics",
    body: [
      "The Society of Professional Journalists' code rests on four principles: **Seek truth and report it. Minimize harm. Act independently. Be accountable and transparent.**",
      "Minimizing harm means weighing the public's need to know against the harm to people in the story, especially private individuals, minors and victims. Acting independently means refusing gifts and favors and disclosing unavoidable conflicts.",
      "Being accountable means correcting errors quickly and visibly, and explaining your choices to the audience.",
    ],
    takeaways: ["Four principles: truth, harm, independence, accountability.", "Private people deserve more care than public officials.", "Correct mistakes fast and in public."],
    tryit: "Find a published correction from a newsroom. What went wrong, and how was it fixed?",
  },
  {
    id: "libel", unit: "Ethics & law", title: "Libel basics",
    body: [
      "Defamation is a false statement of fact that harms someone's reputation. To win, a plaintiff generally must show the statement was **published**, **about them**, **false**, **defamatory**, and made with **fault**.",
      "Public officials and public figures must prove **actual malice**: that you knew it was false or recklessly disregarded whether it was true (New York Times v. Sullivan, 1964). Private people usually only need to show negligence.",
      "**Truth is a defense.** Pure opinion that can't be proven true or false is generally protected. Fair reports of official proceedings are protected in most states. This is an overview, not legal advice. For real questions, the Reporters Committee for Freedom of the Press runs a free legal hotline.",
    ],
    takeaways: ["Truth is the best defense.", "Public figures face a higher bar.", "Document everything you report."],
    tryit: "Look at a story about an accusation. Find how the writer attributed each claim.",
  },
  {
    id: "safety", unit: "Ethics & law", title: "Protecting sources and yourself",
    body: [
      "If a source could be hurt by being identified, protect them from the start. Use end-to-end encrypted messaging with disappearing messages, avoid work devices and work email for sensitive contacts, and keep notes about them off cloud services you don't control.",
      "Know your rights when covering protests: in the U.S. you can generally photograph anything visible from public spaces, including police. Carry ID and press credentials if you have them, and know who to call if detained.",
      "The Freedom of the Press Foundation publishes free digital security guides for journalists.",
    ],
    takeaways: ["Protect sources before they're exposed.", "Encrypted, disappearing messages for sensitive talks.", "Know your rights before you go."],
    tryit: "Audit your phone: which apps would you use to talk to a confidential source?",
  },
  {
    id: "beat", unit: "Craft & career", title: "Building a beat",
    body: [
      "A beat is a topic you own. Pick one that's **underserved** and that you're curious about for years, not weeks.",
      "Read everything: the trade press, the court dockets, the agency meeting agendas, the subreddit where insiders vent. Build a source list and talk to people when you *don't* need a story, so they call you when something happens.",
      "Keep a running list of story ideas and questions. Patterns you notice across months become your best stories.",
    ],
    takeaways: ["Underserved + genuinely curious.", "Talk to sources before you need them.", "Document patterns over time."],
    tryit: "Make a desk in Dispatch for your beat and add five sources to it.",
  },
  {
    id: "pitching", unit: "Craft & career", title: "Pitching an editor",
    body: [
      "A pitch is short: a **headline-like hook**, two or three sentences on what you found and why it matters now, what reporting you've done and will do, why you're the person to write it, and a suggested length and timeline.",
      "Read the publication first and pitch the section editor, not the general inbox. Show the story, don't describe the topic: *\"Three county jails stopped reporting deaths\"* beats *\"I want to write about jail conditions.\"*",
      "Follow up once after about a week. Then pitch it somewhere else.",
    ],
    takeaways: ["A story, not a topic.", "Why now, why you.", "Keep it under 250 words."],
    tryit: "Turn one of your Pitches in Notebook into a 150-word pitch email.",
  },
  {
    id: "clips", unit: "Craft & career", title: "Getting clips",
    body: [
      "Editors hire people with published work. Start where the door is open: student media, local outlets that take freelancers, community newsletters, your own newsletter or blog.",
      "Local stories are the best training: meetings, courts, schools and police logs teach you records, sourcing and deadlines. Save every clip as a PDF and an archived link, since outlets close and pages disappear.",
      "Join groups like SPJ, IRE, NAHJ, NABJ, AAJA or ONA. Many offer student rates, fellowships and job boards.",
    ],
    takeaways: ["Publish somewhere, anywhere, and keep going.", "Local reporting is real training.", "Archive your own clips."],
    tryit: "Find two local outlets that accept freelance pitches and save them to your Notebook.",
  },
];

window.DISPATCH_RESOURCES = [
  { name: "Poynter", url: "https://www.poynter.org", note: "Training, ethics and newsroom news" },
  { name: "Knight Center courses", url: "https://journalismcourses.org", note: "Free online journalism courses" },
  { name: "GIJN Resource Center", url: "https://gijn.org/resources/", note: "Investigative how-to guides" },
  { name: "SPJ Code of Ethics", url: "https://www.spj.org/ethicscode.asp", note: "The standard ethics code" },
  { name: "IRE", url: "https://www.ire.org", note: "Investigative Reporters & Editors" },
  { name: "Reporters Committee", url: "https://www.rcfp.org", note: "Legal help, including a free hotline" },
  { name: "Freedom of the Press Foundation", url: "https://freedom.press", note: "Digital security guides" },
  { name: "Student Press Law Center", url: "https://splc.org", note: "Legal help for student journalists" },
  { name: "Bellingcat guides", url: "https://www.bellingcat.com/category/resources/", note: "Open-source investigation" },
  { name: "FOIA.gov", url: "https://www.foia.gov", note: "Where to send federal requests" },
  { name: "MuckRock", url: "https://www.muckrock.com", note: "File and track records requests" },
];

window.DISPATCH_PRACTICE_FACTS = [
  "Facts: Tuesday night. County school board. Vote 5-2. Closes Lincoln and Hayes elementary schools next fall. 640 students reassigned. Saves $3.1 million a year. Parents protested outside before the vote.",
  "Facts: Friday. State health department report. Overdose deaths fell 18% last year, to 1,204. First drop in nine years. Officials credit naloxone distribution. Rural counties saw an increase.",
  "Facts: Monday morning. Water main break downtown. 3 blocks of Main Street closed. 12 businesses without water. City says repairs take 4 days. The pipe was installed in 1921.",
  "Facts: Federal judge ruling, Wednesday. City's ban on filming police within 25 feet is unconstitutional. Lawsuit brought by two local reporters. City says it will appeal.",
  "Facts: University announces tuition rises 9% next year, largest increase in 15 years. Board approved Thursday. In-state tuition will be $14,200. Student government called for a walkout.",
  "Facts: Records obtained by request: city police paid $4.7 million in misconduct settlements over 5 years. 60% involved 11 officers. 8 of those officers are still on the force.",
];

// Approximate political lean of outlets' news coverage, on a five-point scale, drawn from
// public media-bias ratings such as AllSides and Ad Fontes Media. Ratings are judgment calls,
// change over time and differ between raters, so the app labels them "approximate" and lets
// the reader change any of them. Keys are outlet names as they appear in feeds; the domain
// list helps match outlets that show up under a different name.
// L = left, LL = lean left, C = center, LR = lean right, R = right.
window.DISPATCH_LEANS = {
  L: [
    ["HuffPost", "huffpost.com"], ["MSNBC", "msnbc.com"], ["The Intercept", "theintercept.com"], ["Vox", "vox.com"],
    ["Mother Jones", "motherjones.com"], ["The Nation", "thenation.com"], ["Jacobin", "jacobin.com"],
    ["Democracy Now!", "democracynow.org"], ["Slate", "slate.com"], ["The Daily Beast", "thedailybeast.com"],
    ["The New Yorker", "newyorker.com"], ["Rolling Stone", "rollingstone.com"], ["Salon", "salon.com"],
    ["The New Republic", "newrepublic.com"], ["Common Dreams", "commondreams.org"],
  ],
  LL: [
    ["The New York Times", "nytimes.com"], ["The Washington Post", "washingtonpost.com"], ["NPR", "npr.org"],
    ["CNN", "cnn.com"], ["NBC News", "nbcnews.com"], ["CBS News", "cbsnews.com"], ["ABC News", "abcnews.go.com"],
    ["Associated Press", "apnews.com"], ["Bloomberg", "bloomberg.com"], ["The Guardian", "theguardian.com"],
    ["Politico", "politico.com"], ["Axios", "axios.com"], ["TIME", "time.com"], ["The Atlantic", "theatlantic.com"],
    ["Los Angeles Times", "latimes.com"], ["USA Today", "usatoday.com"], ["Business Insider", "businessinsider.com"],
    ["ProPublica", "propublica.org"], ["Al Jazeera", "aljazeera.com"], ["Yahoo News", "news.yahoo.com"],
    ["The Independent", "independent.co.uk"], ["PBS NewsHour", "pbs.org"], ["Vanity Fair", "vanityfair.com"],
  ],
  C: [
    ["Reuters", "reuters.com"], ["BBC News", "bbc.com"], ["The Hill", "thehill.com"],
    ["The Wall Street Journal", "wsj.com"], ["Forbes", "forbes.com"], ["MarketWatch", "marketwatch.com"],
    ["The Christian Science Monitor", "csmonitor.com"], ["NewsNation", "newsnationnow.com"], ["Newsweek", "newsweek.com"],
  ],
  LR: [
    ["New York Post", "nypost.com"], ["Washington Examiner", "washingtonexaminer.com"],
    ["The Washington Times", "washingtontimes.com"], ["Reason", "reason.com"], ["The Dispatch", "thedispatch.com"],
    ["The Free Press", "thefp.com"], ["Fox Business", "foxbusiness.com"], ["RealClearPolitics", "realclearpolitics.com"],
    ["The Telegraph", "telegraph.co.uk"], ["Daily Mail", "dailymail.co.uk"],
  ],
  R: [
    ["Fox News", "foxnews.com"], ["Breitbart", "breitbart.com"], ["The Daily Wire", "dailywire.com"],
    ["Newsmax", "newsmax.com"], ["The Federalist", "thefederalist.com"], ["National Review", "nationalreview.com"],
    ["The Daily Caller", "dailycaller.com"], ["TheBlaze", "theblaze.com"], ["One America News", "oann.com"],
    ["The Epoch Times", "theepochtimes.com"], ["Washington Free Beacon", "freebeacon.com"], ["Townhall", "townhall.com"],
    ["PJ Media", "pjmedia.com"], ["The Gateway Pundit", "thegatewaypundit.com"],
  ],
};
window.DISPATCH_LEAN_LABELS = { L: "Left", LL: "Lean left", C: "Center", LR: "Lean right", R: "Right" };
// Extra names feeds use for the same outlets.
window.DISPATCH_LEAN_ALIASES = {
  "ap news": "Associated Press", "ap": "Associated Press", "the associated press": "Associated Press",
  "nytimes": "The New York Times", "new york times": "The New York Times", "washington post": "The Washington Post",
  "bbc": "BBC News", "bbc world": "BBC News", "msnbc news": "MSNBC", "usa today": "USA Today", "time": "TIME",
  "wsj": "The Wall Street Journal", "wall street journal": "The Wall Street Journal", "bloomberg.com": "Bloomberg",
  "npr news": "NPR", "fox news channel": "Fox News", "daily wire": "The Daily Wire", "the guardian world": "The Guardian",
  "guardian": "The Guardian", "pbs": "PBS NewsHour", "ny post": "New York Post", "the new york post": "New York Post",
  "the free beacon": "Washington Free Beacon", "the blaze": "TheBlaze", "epoch times": "The Epoch Times",
};

// Words that signal slant or sensationalism in a headline. [pattern, category, note]
window.DISPATCH_LOADED = [
  ["\\b(slams?|slammed|blasts?|blasted|rips?|ripped|torches|torched|eviscerates?|destroys?|demolishes|obliterates?|owns|owned|shreds?)\\b", "Combat verb", "Turns disagreement into a fight. What did they actually say?"],
  ["\\b(meltdown|chaos|frenzy|firestorm|bombshell|explosive|shocking|stunning|jaw-dropping|outrageous|disaster|catastrophic|nightmare|unhinged)\\b", "Sensational", "Emotion instead of information."],
  ["\\b(admits?|admitted|concedes?|conceded|confesses?|claims?|claimed|insists?|insisted|alleges?|refuses?|refused|caves?|caved)\\b", "Slanted attribution", "Implies the writer's judgment of the speaker. Neutral: \"said.\""],
  ["\\b(radical|extremist|far-left|far-right|ultra-left|ultra-right|militant|fringe|woke|regime|thugs?|elites?)\\b", "Loaded label", "A characterization, not a fact. Who says so?"],
  ["\\bso-called\\b", "Scare phrase", "Signals doubt without saying why."],
  ["\\b(illegal aliens?|illegals|undocumented immigrants?|pro-life|pro-choice|anti-abortion|abortion rights|gun rights|gun control|death tax|tax relief|climate denier|climate alarmist)\\b", "Contested term", "Each side prefers its own wording. Notice whose term is used."],
  ["\\b(furious|fury|outrage|outraged|livid|seething|panic|panicked|desperate|humiliat\\w*)\\b", "Emotional framing", "Describes feelings the reporter probably can't verify."],
];

// More lessons, added with the 12-week plan.
window.DISPATCH_LESSONS.push(
  {
    id: "headlines", unit: "Foundations", title: "Writing headlines",
    body: [
      "A news headline tells the reader what happened in about 10 words. Write it in **present tense** for things that already happened (*Council approves budget*), use an **active verb**, and put the most important words first.",
      "Headlines drop most articles (*a*, *an*, *the*) and use numerals. They must be **accurate to the story**: a headline that overpromises breaks trust even if the story is fine.",
      "Online, the headline is also how people find the story, so use the words a reader would search for. Keep it to about 60 to 70 characters so it isn't cut off. Avoid question headlines; if you knew the answer, you'd say it.",
    ],
    takeaways: ["Present tense, active verb.", "Accurate before clever.", "About 60 to 70 characters."],
    tryit: "Do the Headline rewrite drill in Learn on three stories from your Wire.",
  },
  {
    id: "ap-style", unit: "Craft & career", title: "AP style essentials",
    body: [
      "Most U.S. newsrooms follow the **Associated Press Stylebook**, so editors expect it. A few rules cover most of what you'll write:",
      "**Numbers**: spell out one through nine, use numerals for 10 and up. Ages are always numerals (*a 5-year-old*). Use the % sign with numerals (*5%*). **Dates**: abbreviate Jan., Feb., Aug., Sept., Oct., Nov. and Dec. when used with a date; spell out March through July. Never add *th* or *st* (*Oct. 21*, not *Oct. 21st*). **Times**: *7 p.m.*, not *7:00 PM*.",
      "**Titles**: capitalize a formal title before a name (*Mayor Ana Ruiz*), lowercase it after (*Ana Ruiz, the mayor*). **Lists**: no comma before the final *and* in a simple series. **States**: spell out state names in the body of a story.",
    ],
    takeaways: ["One to nine in words, 10 and up in numerals.", "Oct. 21, not October 21st.", "Title before the name is capitalized."],
    tryit: "Take your last practice lede and fix every number, date and title to AP style.",
  },
  {
    id: "features", unit: "Craft & career", title: "Feature writing",
    body: [
      "Features explain, explore or bring people to life. They often open with an **anecdotal lede**, a short scene with a real person, then widen out in the **nut graf** to say why it matters.",
      "**Show, don't tell**: instead of *she was dedicated*, write that she unlocked the gym at 7 a.m. every Saturday for 22 years. Specific details and dialogue do the work adjectives can't.",
      "Common structures: the **hourglass** (news first, then a chronological retelling), **chronological** for a narrative, and **point-by-point** for explainers. End with a **kicker**, often a quote or image that echoes the opening.",
    ],
    takeaways: ["Scene, then nut graf.", "Specific details beat adjectives.", "End with a kicker."],
    tryit: "Rewrite one sentence of your own that tells a quality (*brave*, *busy*) so it shows it instead.",
  },
  {
    id: "editing", unit: "Craft & career", title: "Editing your own copy",
    body: [
      "Every story gets at least one more pass than you think it needs. **Read it out loud**: you'll hear clunky sentences and missing words your eyes skip.",
      "Then do an **accuracy check**: confirm the spelling of every name against a source, re-do every calculation, check every date against a calendar, and make sure each quote matches your notes or recording word for word.",
      "Finally **cut**: delete *very*, *really*, *in order to* and throat-clearing first sentences. Most drafts get better at about 80% of their length.",
    ],
    takeaways: ["Read it aloud.", "Check every name, number and quote.", "Cut 20%."],
    tryit: "Paste a draft into Draft check in Tools, then fix every flag.",
  },
  {
    id: "numbers", unit: "Reporting", title: "Numbers for journalists",
    body: [
      "Numbers make stories credible, and errors in them destroy credibility. Know the difference between a **percentage point** and a **percent**: a rate that rises from 4% to 6% went up 2 percentage points, which is a 50% increase.",
      "**Median** (the middle value) is usually more honest than the **average** (mean) for money, because a few very large values pull the average up. **Per capita** (per person) lets you compare places of different sizes.",
      "Context matters: compare to last year, to other places, to the size of the budget. And **correlation isn't causation**: two things rising together doesn't mean one caused the other. Always ask where a number came from.",
    ],
    takeaways: ["Points vs. percent.", "Median for money.", "Compare, and ask the source."],
    tryit: "Find a statistic in a story on your Wire and check it against the original source.",
  },
  {
    id: "polls", unit: "Reporting", title: "Reporting on polls",
    body: [
      "Before reporting a poll, find out **who did it** and who paid for it, **who was asked** (all adults, registered voters or likely voters), **how many** people, **when**, and **how the questions were worded**.",
      "Every poll has a **margin of error**. If a candidate leads 48% to 46% and the margin is plus or minus 3 points, the race is **too close to call**; don't write that one candidate is ahead. The margin applies to each number, so the gap has to be larger still to be a real lead.",
      "One poll is a snapshot. Averages of many polls are more reliable, and changes within the margin of error aren't trends.",
    ],
    takeaways: ["Who, how many, when, what wording.", "Inside the margin = too close to call.", "One poll is a snapshot."],
    tryit: "Find a poll in the news and write down its sample, dates, margin of error and sponsor.",
  },
  {
    id: "meetings", unit: "Government & courts", title: "Covering a public meeting",
    body: [
      "Read the **agenda and the meeting packet** before you go; they're usually posted online days ahead. That's where the real story is often hiding, in a contract, a budget line or a consent item.",
      "At the meeting, record **every vote and the count** (5-2, with who voted which way), get exact quotes, and note what residents said in public comment. The **consent agenda** passes many items in one vote without discussion; scan it closely.",
      "Lead with **what was decided and what it means for residents**, not with the fact that a meeting happened. Afterward, call the people affected and anyone who voted no.",
    ],
    takeaways: ["Read the packet first.", "Get every vote and count.", "Lead with the decision's impact."],
    tryit: "Find your city council's next agenda. Add the agenda page to Watch, Pages.",
  },
  {
    id: "courts", unit: "Government & courts", title: "Covering courts",
    body: [
      "**Criminal** cases are brought by the government; a defendant is found **guilty** or **not guilty**. **Civil** cases are disputes between parties; a defendant is found **liable** or not, and a plaintiff may win damages. Don't mix the terms.",
      "In criminal cases, people are **charged** (by complaint or a grand jury **indictment**), **arraigned**, and enter a **plea**. AP style: they *pleaded* not guilty (not *pled*), and write *not guilty* rather than *innocent*. Until a verdict, a person is **accused**, not guilty.",
      "Read the actual filings. Federal records are on PACER, many are free on CourtListener, and state courts have their own systems. Court records are generally protected for fair, accurate reporting, but attribute every allegation.",
    ],
    takeaways: ["Guilty (criminal) vs. liable (civil).", "Pleaded, not pled.", "Read the filings, attribute allegations."],
    tryit: "Search a case in Tools, Search everywhere, Court records, and summarize where it stands in three sentences.",
  },
);

// The 12-week plan. Each task is one of:
//   pass: a lesson's practice, done when you score 70% or more
//   drill: a daily drill in Learn (lede, values, headline)
//   habit: read stories on your Wire on 5 different days that week
//   assignment: real-world reporting, which you mark done (and can get AI feedback on)
window.DISPATCH_PLAN = [
  { title: "What makes news", goal: "Learn to spot a story and why it matters.", tasks: [
    { kind: "pass", lesson: "news-values" }, { kind: "drill", drill: "values", label: "News values drill on real stories" }, { kind: "habit" },
    { kind: "assignment", id: "w1a", label: "Read three local news stories. For each, write down its two strongest news values and who it affects.", feedback: "List three local stories with their two strongest news values and who each affects. A strong answer names specific values (impact, timeliness, proximity, prominence, conflict, novelty, human interest) and explains why each fits." },
  ] },
  { title: "Ledes and the inverted pyramid", goal: "Write the top of a news story.", tasks: [
    { kind: "pass", lesson: "pyramid" }, { kind: "pass", lesson: "ledes" }, { kind: "drill", drill: "lede", label: "Lede drill, three times this week" }, { kind: "habit" },
    { kind: "assignment", id: "w2a", label: "Find a press release from a local agency or company and turn it into a 300-word news story.", feedback: "A 300-word news story written from a press release. A strong story leads with the news (not the announcement), uses the inverted pyramid, attributes claims to the organization, and cuts promotional language." },
  ] },
  { title: "Nut grafs and features", goal: "Tell a story about a person that means something bigger.", tasks: [
    { kind: "pass", lesson: "nutgraf" }, { kind: "pass", lesson: "features" }, { kind: "habit" },
    { kind: "assignment", id: "w3a", label: "Write a 600-word profile of someone in your community: open with a scene, add a nut graf, end with a kicker.", feedback: "A 600-word profile. A strong one opens with a specific scene, has a clear nut graf by the fourth paragraph, shows rather than tells, uses quotes well and ends with a kicker." },
  ] },
  { title: "Interviews and quotes", goal: "Get people talking, and quote them fairly.", tasks: [
    { kind: "pass", lesson: "interviewing" }, { kind: "pass", lesson: "attribution" }, { kind: "pass", lesson: "terms" }, { kind: "habit" },
    { kind: "assignment", id: "w4a", label: "Interview two people about one local issue (use Tools, Interview prep). Write 400 words using quotes from both.", feedback: "A 400-word story built on interviews with two people. A strong one uses open-ended material, attributes with 'said', quotes the vivid parts and paraphrases facts, and fairly represents both sources." },
  ] },
  { title: "Headlines and AP style", goal: "Polish copy the way an editor expects.", tasks: [
    { kind: "pass", lesson: "headlines" }, { kind: "pass", lesson: "ap-style" }, { kind: "drill", drill: "headline", label: "Headline rewrite drill" }, { kind: "habit" },
    { kind: "assignment", id: "w5a", label: "Edit your week 2 story to AP style and write three possible headlines for it.", feedback: "A story edited to AP style plus three headlines. Check numbers, dates, titles and attribution against AP style, and judge whether each headline is accurate, active, present tense and under 70 characters." },
  ] },
  { title: "Editing and accuracy", goal: "Catch your own mistakes before anyone else does.", tasks: [
    { kind: "pass", lesson: "editing" }, { kind: "habit" },
    { kind: "assignment", id: "w6a", label: "Fact-check one of your stories line by line: list every name, number, date and quote and how you confirmed each.", feedback: "A line-by-line fact-check list. A strong one covers every name, number, date and quote, and says exactly how each was confirmed (source document, recording, calendar) rather than 'checked'." },
  ] },
  { title: "Numbers and polls", goal: "Report numbers without getting them wrong.", tasks: [
    { kind: "pass", lesson: "numbers" }, { kind: "pass", lesson: "polls" }, { kind: "habit" },
    { kind: "assignment", id: "w7a", label: "Find a statistic or poll in the news. Trace it to its original source and write what the story got right or wrong.", feedback: "An analysis of one statistic or poll traced to its original source. A strong answer identifies the source, sample or method, margin of error where relevant, and whether the news story represented it accurately." },
  ] },
  { title: "Verification and ethics", goal: "Know what's true, and treat people fairly.", tasks: [
    { kind: "pass", lesson: "verification" }, { kind: "pass", lesson: "ethics" }, { kind: "habit" },
    { kind: "assignment", id: "w8a", label: "Pick a viral image or claim. Verify it with Tools, Verify, and write up what you found and how.", feedback: "A verification write-up of a viral image or claim. A strong one follows SIFT, traces to the original source, uses reverse image search or archives, and clearly states what is confirmed, false or unknown." },
  ] },
  { title: "Public records and the law", goal: "Get documents, and stay out of legal trouble.", tasks: [
    { kind: "pass", lesson: "records" }, { kind: "pass", lesson: "libel" }, { kind: "habit" },
    { kind: "assignment", id: "w9a", label: "File a real public records request with the letter tool in Tools. Add the deadline to your Notebook as a pitch.", feedback: "A public records request letter. A strong one names the specific records, office and date range, cites the right law, asks for electronic copies and a fee waiver, and is concise." },
  ] },
  { title: "Covering government", goal: "Turn a public meeting into a story readers need.", tasks: [
    { kind: "pass", lesson: "meetings" }, { kind: "habit" },
    { kind: "assignment", id: "w10a", label: "Attend or livestream a city council or school board meeting. Write 400 words within 2 hours of it ending.", feedback: "A 400-word meeting story written on deadline. A strong one leads with the most important decision and its impact on residents, includes vote counts, quotes officials and the public, and doesn't lead with the meeting itself." },
  ] },
  { title: "Courts and staying safe", goal: "Report on the justice system accurately.", tasks: [
    { kind: "pass", lesson: "courts" }, { kind: "pass", lesson: "safety" }, { kind: "habit" },
    { kind: "assignment", id: "w11a", label: "Look up a local court case (Tools, Search everywhere, Court records). Summarize where it stands in 250 words.", feedback: "A 250-word court case summary. A strong one uses correct terms (criminal vs. civil, charged, pleaded, liable), attributes every allegation to the filing, and explains what happens next." },
  ] },
  { title: "Your beat and your first pitch", goal: "Get published.", tasks: [
    { kind: "pass", lesson: "beat" }, { kind: "pass", lesson: "pitching" }, { kind: "pass", lesson: "clips" }, { kind: "habit" },
    { kind: "assignment", id: "w12a", label: "Choose your beat and pitch your best story idea to a real outlet: a student paper, local site or newsletter.", feedback: "A pitch email to an editor. A strong one is under 250 words, leads with a specific story (not a topic), explains why now and why you, notes reporting done, and proposes length and timing." },
  ] },
];
