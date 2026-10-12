// Dispatch: practice exercises for each lesson. All stories and people here are made up.
//
// Exercise types:
//   choice  - one right answer.          { q, passage?, options, answer: index, why }
//   multi   - pick every right answer.   { q, passage?, options, answer: [indexes], why }
//   spot    - tap the sentence or paragraph that answers the question.
//             { q, parts: [text...], answer: index, why }
//   order   - put the pieces in order.   { q, items: [in the correct order], why }
//   write   - write something short. Checked by rules, and by the AI coach when it's on.
//             { q, passage?, placeholder?, checks: [[label, kind, arg]], model, rubric }
//   Check kinds: maxWords, minWords, has (regex), not (regex), oneSentence, noPassive.
window.DISPATCH_PRACTICE = {
  "news-values": [
    {
      type: "choice",
      q: "Which news value drives this story most?",
      passage: "Starting Jan. 1, the state sales tax rises from 6% to 8%, adding about $400 a year to a typical family's spending.",
      options: ["Prominence", "Impact", "Novelty", "Conflict"],
      answer: 1,
      why: "It changes what nearly everyone in the state pays. That's impact: how many people are affected, and how much.",
    },
    {
      type: "choice",
      q: "Which news value drives this story most?",
      passage: "A 91-year-old retired mail carrier finished the city marathon Sunday, 62 years after running her first one.",
      options: ["Novelty", "Impact", "Conflict", "Prominence"],
      answer: 0,
      why: "It's unusual and human. Nobody's life changes because of it, but people want to read it. That's novelty (and human interest).",
    },
    {
      type: "choice",
      q: "Which news value drives this story most?",
      passage: "Sen. Dana Whitfield's campaign paid $40,000 to a consulting firm owned by her husband, filings show.",
      options: ["Novelty", "Proximity", "Prominence", "Human interest"],
      answer: 2,
      why: "The same payment by a private citizen wouldn't be news. A senator's position makes it news, and accountability work focuses on people with power.",
    },
    {
      type: "choice",
      q: "Which news value drives this story most?",
      passage: "Teachers and the school board remain deadlocked over pay as the union schedules a strike vote for Thursday.",
      options: ["Conflict", "Novelty", "Prominence", "Human interest"],
      answer: 0,
      why: "Two sides are fighting over money, and something will happen Thursday. Conflict (with timeliness) drives it.",
    },
    {
      type: "multi",
      q: "Select every news value present in this story.",
      passage: "Mayor Ana Ruiz fired her police chief Tuesday, days after the city recorded its deadliest summer for shootings in 20 years.",
      options: ["Prominence", "Timeliness", "Conflict", "Impact", "Celebrity gossip", "Seasonal weather"],
      answer: [0, 1, 2, 3],
      why: "A mayor (prominence) fired someone Tuesday (timeliness), a clash at the top (conflict), over violence that affects the whole city (impact). The last two are distractors.",
    },
    {
      type: "write",
      q: "Editors always ask \"why now?\" Write one sentence that gives this story a reason to run this week.",
      passage: "Story idea: potholes on Main Street.",
      placeholder: "e.g. The city's repair budget runs out Friday, with 300 potholes still unfixed…",
      checks: [["One sentence", "oneSentence"], ["At least 10 words", "minWords", 10], ["Includes a time or a number", "has", "\\d|today|tomorrow|this week|monday|tuesday|wednesday|thursday|friday|saturday|sunday|deadline|vote|month"]],
      model: "The city council votes Thursday on whether to cut its street repair budget in half, even as 300 reported potholes on Main Street remain unfixed.",
      rubric: "A strong answer ties the topic to a specific, current event or deadline (a vote, a budget, a new number, an accident) and shows who is affected. Vague answers like \"potholes are a problem\" score low.",
    },
  ],

  pyramid: [
    {
      type: "order",
      q: "Put these paragraphs in inverted pyramid order, most important first.",
      items: [
        "A fire destroyed the Riverside Apartments early Saturday, leaving 40 residents homeless. No one was seriously injured.",
        "Fire Chief Mel Ortiz said the blaze started in a second-floor unit around 2 a.m. and spread through the attic.",
        "\"I grabbed my kids and my cat and ran,\" said resident Tia Brooks, 34. \"Everything else is gone.\"",
        "The Red Cross is housing displaced families at the Lincoln Community Center through Wednesday.",
        "The 1962 building passed its last fire inspection in March, city records show.",
      ],
      why: "What happened and who was hurt comes first, then how it happened, then the human voice, then what's next for readers, then background. An editor could cut from the bottom and the story still works.",
    },
    {
      type: "spot",
      q: "This story buries its news. Tap the sentence that should be the lede.",
      parts: [
        "The Oak County Commission held its regular monthly meeting Tuesday evening.",
        "Commissioners approved the minutes from last month and heard a report on park maintenance.",
        "Commissioner Raj Patel led the Pledge of Allegiance.",
        "In a 3-2 vote, the commission eliminated the county's free bus service, which carries about 2,000 riders a day.",
      ],
      answer: 3,
      why: "The vote changes life for 2,000 daily riders. The meeting, the minutes and the pledge are not news.",
    },
    {
      type: "choice",
      q: "Your fire story runs long. Which paragraph should the editor cut first?",
      options: [
        "The number of people left homeless",
        "Where the displaced families can get help",
        "The building's construction date and inspection history",
        "The fire chief's account of how it started",
      ],
      answer: 2,
      why: "Background is least essential, so it goes at the bottom, where it can be trimmed. (Though if the inspection record looked suspicious, it might become the story.)",
    },
    {
      type: "choice",
      q: "When is it most acceptable to break the inverted pyramid?",
      options: ["Breaking news", "A profile or feature story", "A court verdict", "A storm warning"],
      answer: 1,
      why: "Features can open with a scene or person, since readers aren't scanning for urgent facts. Breaking news, verdicts and warnings must put the news first.",
    },
  ],

  ledes: [
    {
      type: "choice",
      q: "Which is the strongest hard-news lede?",
      options: [
        "The Westfield school board met Monday night to discuss next year's budget.",
        "In a meeting that stretched past midnight, there was a lot of debate about money.",
        "The Westfield school board voted Monday to lay off 45 teachers, closing a $6 million budget gap.",
        "Budget season is never easy, and this year was no exception for Westfield.",
      ],
      answer: 2,
      why: "It names who, what they did, when, and the consequence, in 18 words with an active verb. The others lead with the meeting or with throat-clearing.",
    },
    {
      type: "choice",
      q: "What's the main problem with this lede?",
      passage: "On Thursday, a press conference was held by the Metro Transit Authority at its downtown headquarters.",
      options: [
        "It's too short",
        "It leads with the event and a passive verb instead of the news",
        "It doesn't include a quote",
        "It names the location",
      ],
      answer: 1,
      why: "Nobody cares that a press conference happened. What was announced? Lead with that, using an active verb: \"Metro Transit will raise fares 50 cents in March, officials said Thursday.\"",
    },
    {
      type: "spot",
      q: "Tap the weakest lede.",
      parts: [
        "A gas leak forced the evacuation of 300 students from Hamilton Middle School on Wednesday.",
        "Hamilton Middle School students got an unexpected break Wednesday.",
        "Firefighters evacuated Hamilton Middle School on Wednesday after a gas line ruptured near the cafeteria.",
      ],
      answer: 1,
      why: "It's cute, but it hides the news (a gas leak and an evacuation) and treats a safety scare as a treat.",
    },
    {
      type: "write",
      q: "Write a hard-news lede for these facts. One sentence, 35 words or fewer.",
      passage: "Thursday. University board of trustees. Approved 9% tuition increase, the largest in 15 years. In-state tuition will be $14,200. Student government called for a walkout.",
      placeholder: "Who did what, and why it matters…",
      checks: [["One sentence", "oneSentence"], ["35 words or fewer", "maxWords", 35], ["Includes the increase", "has", "9|nine|tuition"], ["Says when", "has", "thursday"], ["No passive voice", "noPassive"]],
      model: "University trustees raised tuition 9% on Thursday, the largest increase in 15 years, pushing in-state costs to $14,200 and prompting student leaders to call for a walkout.",
      rubric: "Lede should lead with the action and consequence (tuition rising 9%), name the actor, include when, use an active verb and stay under 35 words. Extra credit for working in the student reaction or the 15-year context without bloating it.",
    },
  ],

  nutgraf: [
    {
      type: "spot",
      q: "Tap the nut graf.",
      parts: [
        "Maria Delgado wakes at 4 a.m. to catch the first bus, the only way to reach her job at the hospital laundry by 6.",
        "Last month the bus came 40 minutes late. She lost a day's pay.",
        "Delgado is one of about 11,000 riders affected as Metro Transit has cut early-morning service by a third since 2024, according to agency records — a squeeze that falls hardest on low-wage shift workers.",
        "Metro spokesperson Lee Grant said the cuts were driven by a shortage of drivers.",
      ],
      answer: 2,
      why: "It widens the frame from one rider to 11,000, gives the evidence (agency records, a third), and says why it matters (it falls hardest on shift workers).",
    },
    {
      type: "choice",
      q: "Which nut graf best follows an opening about one family's eviction?",
      options: [
        "Evictions are a sad part of life for many people.",
        "The Johnsons' story is very interesting and worth telling.",
        "Evictions in the county have doubled since a state renter protection expired in June, court records show, with more than 900 cases filed in September alone.",
        "Housing is a topic that many experts have studied.",
      ],
      answer: 2,
      why: "It connects the family to a measurable trend, explains why now (the protection expired), and cites evidence.",
    },
    {
      type: "write",
      q: "This feature opens with an anecdote. Write the nut graf: why does this matter, and why now?",
      passage: "Opening: Coach Ray Thompson has run the Eastside Rec Center basketball league for 22 years, unlocking the gym himself every Saturday at 7 a.m. Facts: City plans to close 4 of its 9 rec centers in January to save $2.3 million. Eastside is one of them. About 1,500 kids use the four centers weekly.",
      placeholder: "Thompson's Saturday league is one of…",
      checks: [["At least 25 words", "minWords", 25], ["Uses a number from the facts", "has", "4|four|1,500|2\\.3|nine|9"], ["Says when", "has", "january|next year|this winter"]],
      model: "Thompson's league is one of dozens of programs at risk as the city prepares to close four of its nine recreation centers in January to save $2.3 million — a cut that would leave about 1,500 children a week without a place to play.",
      rubric: "A strong nut graf widens from Thompson to the citywide closures, includes the key numbers (4 of 9 centers, $2.3 million, 1,500 kids), and makes clear the timing (January) and who's affected.",
    },
  ],

  interviewing: [
    {
      type: "multi",
      q: "Select every open-ended question.",
      options: [
        "Did the cuts hurt your department?",
        "Walk me through what happened the night of the fire.",
        "Are you happy with the decision?",
        "How did you decide which programs to cut?",
        "Is it true you were warned in March?",
        "What has changed for your patients since the clinic closed?",
      ],
      answer: [1, 3, 5],
      why: "Open questions (how, what, walk me through) can't be answered with yes or no, so they get stories, details and quotable answers.",
    },
    {
      type: "choice",
      q: "A city manager answers your question with: \"We're looking into it.\" What's the best follow-up?",
      options: [
        "Thank them and move on",
        "\"Who is looking into it, since when, and when will you have an answer?\"",
        "\"So you're admitting there's a problem?\"",
        "Write that the city refused to comment",
      ],
      answer: 1,
      why: "Push for specifics politely: names, dates and deadlines. \"Looking into it\" isn't an answer, and it isn't a refusal either.",
    },
    {
      type: "choice",
      q: "When should you usually ask the toughest question?",
      options: [
        "First, before they can prepare",
        "Never, it damages the relationship",
        "Later in the interview, after you've gotten the basics, but always before you leave",
        "Only by email afterward",
      ],
      answer: 2,
      why: "Get the information you need first, in case they end the interview. But you must ask it; the toughest question is often the reason for the interview.",
    },
    {
      type: "write",
      q: "Rewrite this closed question as an open one.",
      passage: "\"Did the budget cuts hurt your department?\"",
      placeholder: "How… / What… / Walk me through…",
      checks: [["Starts with an open word", "has", "^\\s*[\"“]?(how|what|walk|tell|describe|why|which|who|where|when)"], ["Ends with a question mark", "has", "\\?\\s*[\"”]?\\s*$"], ["Not a yes/no opener", "not", "^\\s*[\"“]?(did|do|does|is|are|was|were|has|have|will|would|can|could)\\b"]],
      model: "\"What has your department had to stop doing since the budget was cut?\"",
      rubric: "Must be open-ended (can't be answered yes or no), neutral (not leading), and invite concrete examples.",
    },
  ],

  attribution: [
    {
      type: "spot",
      q: "Tap the sentence with a loaded attribution verb.",
      parts: [
        "\"We will reopen the bridge by June,\" said Transportation Director Kim Lee.",
        "Lee admitted the project is $3 million over budget.",
        "The contractor, Delta Build, said steel prices caused the delay.",
      ],
      answer: 1,
      why: "\"Admitted\" implies Lee confessed to wrongdoing. Unless that's literally true and fair, use \"said.\"",
    },
    {
      type: "choice",
      q: "Which is best?",
      options: [
        "Said Chief Ortiz, \"The fire started in the kitchen. It spread fast.\"",
        "\"The fire started in the kitchen,\" Chief Ortiz said. \"It spread fast.\"",
        "\"The fire started in the kitchen. It spread fast,\" stated Chief Ortiz.",
        "Chief Ortiz exclaimed, \"The fire started in the kitchen. It spread fast.\"",
      ],
      answer: 1,
      why: "Attribution goes after the first sentence of the quote, with the plain verb \"said,\" name before verb.",
    },
    {
      type: "choice",
      q: "A source says: \"The budget for fiscal 2027 is $4.2 million, up from $3.9 million.\" Should you quote it directly?",
      options: [
        "Yes, always use direct quotes",
        "No, paraphrase it, since it's a dry fact",
        "No, leave it out entirely",
        "Yes, but put it in the headline",
      ],
      answer: 1,
      why: "Quote what's vivid, emotional or contested. Paraphrase facts and numbers: \"The budget will grow to $4.2 million next year, the director said.\"",
    },
    {
      type: "choice",
      q: "You arrived at a fire after it was out. Which sentence handles attribution correctly?",
      options: [
        "The fire started around 2 a.m. in a bedroom.",
        "The fire started around 2 a.m. in a bedroom, Fire Marshal Dee Park said.",
        "The fire apparently started around 2 a.m. in a bedroom.",
        "Everyone knows the fire started around 2 a.m.",
      ],
      answer: 1,
      why: "You didn't see it, so attribute it to the person who knows. \"Apparently\" just hides the source.",
    },
    {
      type: "write",
      q: "Rewrite this sentence so it's neutral.",
      passage: "The mayor claimed the budget is balanced, but critics insisted it relies on accounting tricks.",
      placeholder: "The mayor said…",
      checks: [["Uses \"said\"", "has", "\\bsaid\\b"], ["No loaded verbs", "not", "\\b(claim|claimed|insist|insisted|admit|admitted)\\b"], ["Keeps both sides", "has", "critic|opponent|council|others"]],
      model: "The mayor said the budget is balanced, but critics said it relies on accounting tricks.",
      rubric: "Should replace the loaded verbs with neutral attribution and keep both the mayor's claim and the critics' view without the writer taking sides. Bonus for naming who the critics are.",
    },
  ],

  terms: [
    {
      type: "choice",
      q: "A source lets you use what she says, attributed to \"a senior city official,\" but not her name. That's:",
      options: ["On the record", "On background", "Off the record", "Deep background"],
      answer: 1,
      why: "On background means you can use it with a description, not a name.",
    },
    {
      type: "choice",
      q: "A source tells you something you can't publish at all, but you can use it to find other people who will confirm it on the record. That's:",
      options: ["On the record", "On background", "Off the record", "Embargoed"],
      answer: 2,
      why: "Off the record: you can't publish it, but it can point your reporting in the right direction.",
    },
    {
      type: "choice",
      q: "After a 30-minute recorded interview, a source says: \"By the way, all of that was off the record.\" You never agreed to that. What's the standard view?",
      options: [
        "You must treat it all as off the record",
        "Terms are set before the information is shared, so it's on the record. Still weigh any real risk to the source and tell them clearly where you stand",
        "Delete the recording",
        "Publish it and don't tell them",
      ],
      answer: 1,
      why: "A source can't declare terms after the fact. Most newsrooms treat it as on the record, but good reporters are clear and honest about that, and consider genuine harm.",
    },
    {
      type: "choice",
      q: "When should you agree on terms like \"on background\"?",
      options: ["After the interview", "Before the information is shared", "When the story is published", "Only if the source asks twice"],
      answer: 1,
      why: "Always before. And make sure you both mean the same thing by the words, because newsrooms define them differently.",
    },
  ],

  records: [
    {
      type: "choice",
      q: "Which records request is most likely to get a fast, useful answer?",
      options: [
        "All records about the police department.",
        "Any emails about problems.",
        "All use-of-force reports filed by the Springfield Police Department from Jan. 1, 2025, to the present.",
        "Everything the chief has ever written.",
      ],
      answer: 2,
      why: "It names the record type, the agency and the date range. Vague requests get delayed, narrowed or denied as too broad.",
    },
    {
      type: "choice",
      q: "The federal Freedom of Information Act covers:",
      options: [
        "Every part of the federal government, including Congress and the courts",
        "Federal executive branch agencies, like the EPA or the Department of Education",
        "State and city governments",
        "Private companies that get government contracts",
      ],
      answer: 1,
      why: "FOIA applies to federal executive agencies. Congress and the federal courts aren't covered, and state and local records fall under each state's own public records law.",
    },
    {
      type: "choice",
      q: "Under the federal FOIA, how long does an agency generally have to respond to a request?",
      options: ["5 business days", "20 business days", "90 days", "There's no deadline"],
      answer: 1,
      why: "20 business days, with extensions possible in \"unusual circumstances.\" Many agencies run late, which is why you track your deadlines and follow up.",
    },
    {
      type: "write",
      q: "Rewrite this vague request so it's specific.",
      passage: "\"Send me everything about the new jail contract.\"",
      placeholder: "The contract between… from… to…",
      checks: [["Names a document type", "has", "contract|email|invoice|bid|proposal|memo|minutes|agreement|correspondence"], ["Includes a date range", "has", "\\d{4}|january|february|march|april|may|june|july|august|september|october|november|december|from .* to"], ["At least 15 words", "minWords", 15]],
      model: "The signed contract between Lake County and SafeCell Corp. for jail operations, all bids received for that contract, and emails between the sheriff's office and SafeCell from Jan. 1, 2025, to the present.",
      rubric: "Should name specific record types (contract, bids, emails), the parties or office, and a date range. More specific is better, but it shouldn't be so narrow it misses the key documents.",
    },
  ],

  verification: [
    {
      type: "order",
      q: "Put the SIFT steps in order.",
      items: ["Stop", "Investigate the source", "Find better coverage", "Trace claims to the original context"],
      why: "Stop before reacting, check who's behind it, look for trusted coverage, then trace quotes, images and claims back to where they first appeared.",
    },
    {
      type: "choice",
      q: "A dramatic photo is going viral, captioned as today's flood downtown. What should you do first?",
      options: [
        "Share it with a note that it's unconfirmed",
        "Run a reverse image search to see if it appeared online before today",
        "Ask your followers if it's real",
        "Use it if it has more than 10,000 shares",
      ],
      answer: 1,
      why: "Old photos get recycled during every disaster. A reverse image search (Tools, Verify) can find earlier copies in seconds.",
    },
    {
      type: "multi",
      q: "Which clues can help you confirm where a photo was taken?",
      options: ["Street signs and storefronts", "The angle of shadows", "How many likes it has", "Landmarks and mountains in the background", "License plates", "The poster's bio says they live there"],
      answer: [0, 1, 3, 4],
      why: "Physical details in the image can be checked against maps and street views. Likes and a self-written bio prove nothing.",
    },
    {
      type: "choice",
      q: "An account created yesterday, with 40,000 followers and no profile photo, posts a \"leaked memo.\" Biggest red flag?",
      options: ["No profile photo", "A brand-new account with a huge, sudden following", "The word \"leaked\"", "It posted a document"],
      answer: 1,
      why: "Real accounts rarely gain tens of thousands of followers in a day. That pattern suggests bought followers or a coordinated campaign. Check the account's history before touching the memo.",
    },
  ],

  ethics: [
    {
      type: "choice",
      q: "Which of these is NOT one of the four principles of the SPJ Code of Ethics?",
      options: ["Seek truth and report it", "Minimize harm", "Always remain anonymous", "Act independently", "Be accountable and transparent"],
      answer: 2,
      why: "The four are: seek truth and report it, minimize harm, act independently, and be accountable and transparent.",
    },
    {
      type: "choice",
      q: "A restaurant you're reviewing offers you a free dinner. What do you do?",
      options: ["Accept, it's polite", "Accept but don't mention it", "Decline and pay your own way", "Accept and give a good review"],
      answer: 2,
      why: "Acting independently means refusing gifts and favors that could compromise your work, or appear to.",
    },
    {
      type: "choice",
      q: "Police arrest a 15-year-old in a vandalism case and release the name by mistake. What do most newsrooms do?",
      options: ["Publish the name, it's public", "Generally don't name juveniles accused of minor crimes", "Publish a photo instead", "Name the parents"],
      answer: 1,
      why: "Minimize harm: minors deserve special care, especially for minor offenses, even when a name is technically available.",
    },
    {
      type: "choice",
      q: "You discover a wrong number in a story published yesterday. What's right?",
      options: [
        "Quietly fix it and hope no one noticed",
        "Leave it, it's already out",
        "Fix it and add a visible correction saying what was wrong",
        "Delete the story",
      ],
      answer: 2,
      why: "Be accountable and transparent: correct errors quickly and say so openly. Quiet edits erode trust when people notice.",
    },
  ],

  libel: [
    {
      type: "choice",
      q: "A city council member sues over your story. What must they generally prove about the falsehoods?",
      options: [
        "That you made a typo",
        "Actual malice: you knew it was false or recklessly disregarded whether it was true",
        "That they were offended",
        "Nothing, the burden is on you",
      ],
      answer: 1,
      why: "Public officials and public figures must show actual malice (New York Times v. Sullivan, 1964). Private people usually only need to show negligence.",
    },
    {
      type: "choice",
      q: "What's the strongest defense against a libel claim?",
      options: ["You used the word \"allegedly\"", "Truth", "You deleted the story", "You didn't mean any harm"],
      answer: 1,
      why: "A true statement can't be libelous. That's why you document every fact.",
    },
    {
      type: "spot",
      q: "Tap the sentence most likely to create a libel risk if it turned out to be false.",
      parts: [
        "Tony's Pizza serves the worst slice in town.",
        "Tony's Pizza failed two health inspections this year, county records show.",
        "Tony's owner, Sal Greco, has been stealing from his employees.",
      ],
      answer: 2,
      why: "It's a statement of fact accusing a named person of a crime, with no source. The first is opinion; the second is a sourced public record.",
    },
    {
      type: "choice",
      q: "Does writing \"allegedly\" protect you from libel?",
      options: ["Yes, always", "Not by itself. You still need to say who is alleging it, and report it fairly and accurately", "Only in headlines", "Only for public figures"],
      answer: 1,
      why: "\"Allegedly\" isn't a magic shield. Attribute the allegation to a source, such as charging documents or a lawsuit, and report it fairly.",
    },
  ],

  safety: [
    {
      type: "choice",
      q: "What's the safest way to talk with a confidential source at a government agency?",
      options: [
        "Their work email",
        "An encrypted messaging app with disappearing messages, on personal devices",
        "A phone call to their office line",
        "Direct messages on social media",
      ],
      answer: 1,
      why: "Work devices and accounts can be monitored by the employer. Encrypted, disappearing messages on personal devices leave the least trail.",
    },
    {
      type: "choice",
      q: "In the U.S., can you photograph police officers doing their jobs from a public sidewalk?",
      options: ["No, never", "Generally yes, as long as you don't interfere", "Only with written permission", "Only if you have press credentials"],
      answer: 1,
      why: "Courts have broadly recognized a right to record police in public. Don't physically interfere, and know who to call if you're detained.",
    },
    {
      type: "choice",
      q: "Where should you keep a confidential source's real name?",
      options: ["A shared team spreadsheet", "Your newsroom's chat app", "Ideally nowhere written down, or offline and protected", "Your email drafts"],
      answer: 2,
      why: "Anything stored online can be subpoenaed, hacked or leaked. The fewer places a source's identity exists, the safer they are.",
    },
  ],

  beat: [
    {
      type: "choice",
      q: "Which beat is most likely to give a new reporter a steady stream of original stories?",
      options: [
        "National politics, like everyone else",
        "Celebrity news",
        "The county's water and sewer authority, which no local outlet covers",
        "General \"interesting stuff\"",
      ],
      answer: 2,
      why: "Underserved beats have fewer competitors, real public impact, and documents nobody else is reading.",
    },
    {
      type: "choice",
      q: "When should you reach out to sources on your beat?",
      options: ["Only when you need a quote", "Regularly, including when you don't need anything", "Only after publishing", "Never in person"],
      answer: 1,
      why: "Relationships built in quiet times are what make people call you first when something happens.",
    },
    {
      type: "write",
      q: "Pick a beat you'd like to cover. Write three questions about it that you don't know the answers to and that would make good stories.",
      placeholder: "Beat: …\n1. …\n2. …\n3. …",
      checks: [["At least 30 words", "minWords", 30], ["Asks questions", "has", "\\?"]],
      model: "Beat: Lake County jail.\n1. How many people died in custody in the last five years, and were any deaths not reported to the state?\n2. Who holds the jail's health care contract, and how many complaints have been filed against it?\n3. How long do people wait in jail before trial, compared with neighboring counties?",
      rubric: "Good questions are specific, answerable with reporting (records, data, interviews), and point to accountability or impact on people. Vague questions (\"what's going on with the jail?\") score low.",
    },
  ],

  pitching: [
    {
      type: "choice",
      q: "Which is a story, not just a topic?",
      options: [
        "I want to write about homelessness.",
        "Climate change and our city.",
        "Three county shelters have turned away 600 people since January because of a staffing freeze, records show.",
        "A look at local schools.",
      ],
      answer: 2,
      why: "It has a finding, a number, a source and a reason it matters now. Editors buy stories, not topics.",
    },
    {
      type: "spot",
      q: "Tap the part of this pitch an editor would most want cut.",
      parts: [
        "Lake County has paid $2.1 million to settle jail-death lawsuits since 2023, court records show.",
        "I've obtained the settlements and interviewed two families.",
        "I have always been passionate about justice and have loved writing since I was a child.",
        "I can file 1,200 words in two weeks.",
      ],
      answer: 2,
      why: "Editors care about the story and whether you can deliver it. Your passion is implied by the reporting you've already done.",
    },
    {
      type: "write",
      q: "Write a one-sentence hook for a pitch, 30 words or fewer, from these facts.",
      passage: "Your reporting: The city's 311 complaint data shows pothole reports in the three lowest-income wards take an average of 41 days to fix, versus 9 days in the three wealthiest wards.",
      placeholder: "Potholes in…",
      checks: [["One sentence", "oneSentence"], ["30 words or fewer", "maxWords", 30], ["Uses the numbers", "has", "41|9|nine|four times|4x|4 times"]],
      model: "Potholes in the city's poorest neighborhoods stay unfixed more than four times longer than in its wealthiest — 41 days versus nine, according to 311 data.",
      rubric: "Hook should state the finding plainly, include the striking comparison (41 vs 9 days), name the source (311 data) and be under 30 words.",
    },
  ],

  clips: [
    {
      type: "choice",
      q: "You have no published work yet. What's the best first step?",
      options: [
        "Pitch The New York Times",
        "Wait until you finish a degree",
        "Write for student media, a local outlet that takes freelancers, or your own newsletter",
        "Only post on social media",
      ],
      answer: 2,
      why: "Start where the door is open. Published local work is real experience, and editors hire from clips.",
    },
    {
      type: "choice",
      q: "How should you keep your published clips?",
      options: ["Trust the outlet to keep them online", "Save PDFs and archived links (like the Wayback Machine)", "Screenshot the headline only", "Email them to yourself"],
      answer: 1,
      why: "Outlets close, paywall and redesign. A PDF and an archived link keep your work available forever.",
    },
    {
      type: "choice",
      q: "Which kind of local story teaches the most reporting skills?",
      options: ["A movie review", "A city council budget vote", "A listicle of best coffee shops", "A personal essay"],
      answer: 1,
      why: "Government stories force you to read documents, find sources, explain numbers and hit deadlines. Those skills transfer everywhere.",
    },
  ],
};

// Wire practice uses real stories from your feeds.
window.DISPATCH_NEWS_VALUES = ["Timeliness", "Impact", "Proximity", "Prominence", "Conflict", "Novelty", "Human interest"];
