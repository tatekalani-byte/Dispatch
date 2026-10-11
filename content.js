// Dispatch: starter sources, search launchers and lessons. Plain data, no logic.

// Source types: rss (any RSS/Atom URL), gnews (Google News keyword search),
// reddit (subreddit name), youtube (channel id), hn (Hacker News search),
// bsky (Bluesky handle), mastodon (tag@instance).
window.DISPATCH_PACKS = [
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
    id: "community", name: "Communities",
    blurb: "Where reporters and researchers talk shop.",
    sources: [
      ["reddit", "Journalism", "r/Journalism"],
      ["reddit", "OSINT", "r/OSINT"],
      ["reddit", "foia", "r/foia"],
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
window.DISPATCH_DEFAULT_PACKS = ["investigative", "press", "liberty", "tech", "world", "social"];

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
