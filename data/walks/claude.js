/* Walkthrough on the first tab: the shop's returns policy page, taken through the four habits. Its numbers are the brief and draft simulations' on the next tab. */
(window.WALKS = window.WALKS || {}).claude = (function () {
  const lead = { type: "person", x: -21, y: 9, label: "Team lead", tint: "sand" };
  const chat = { type: "device", x: -21, y: -3, label: "Chat app", screen: "violet" };
  const claude = { type: "model", x: -6, y: -15, label: "Claude", glyph: "model", tint: "violet" };
  const draft = { type: "block", x: 10, y: -12, label: "The draft", glyph: "draft", tint: "amber" };
  const site = { type: "block", x: 8, y: 10, label: "Shop website", glyph: "site", tint: "green" };
  const cust = { type: "crowd", x: -6, y: 19, label: "Customers", tint: "sand", n: 3 };
  const L = (from, to, extra) => Object.assign({ from, to }, extra);
  const tag = (e, text, tone) => Object.assign({}, e, { tags: [{ text, tone }] });
  const note = (title, lines, low) => ({ type: "panel", x: 8, y: 10, dx: low ? 170 : 96, dy: low ? -6 : -58, title, lines });
  const who = (text, tone) => Object.assign({}, lead, { tags: [{ text, tone, dx: 10 }] });
  const RULES = ["returns: within 30 days", "refunds: 5 working days", "sale items: exchange only", "postage paid: faulty only"];
  const noPage = tag(site, "no returns page yet", "muted");
  const u = L("lead", "chat", { heads: "both" }), v = L("cust", "site"), d = L("claude", "draft");
  const brief = (label) => L("chat", "claude", { label });
  const back = (label, style) => L("draft", "lead", { style, label, labelAt: 0.5 });
  const pub = (label, style) => L("draft", "site", { style, label, labelAt: 0.5 });
  const visits = { route: ["v"], bounce: true, rate: 0.4 };
  const ask = { route: ["b"], kind: "req", rate: 0.5 }, reply = { route: ["d"], kind: "res", rate: 0.5 };
  return {
    title: "One returns page, through the four habits",
    summary: "Follow the shop's returns policy page from a one-line request to the website, through delegation, description, discernment and diligence.",
    plain: "the team lead wants a returns policy page for the shop and opens the chat app to get it written. This walk follows that one page through the four habits. Delegation decides who does which part. Description turns a one-line request into a brief. Discernment reads what comes back, line by line. Diligence is the team lead's name on the page once it is out.",
    reallife: "A brilliant new colleague on their first day, asked to write the returns page. They write fast and well, and they have never seen your rules. You decide which part of the job is theirs, brief them properly, read what they hand back, and put your own name on what goes out.",
    startby: "Press Next to follow the returns page from a one-line request to the shop's website. Arrow keys work too.",
    terms: [
      ["Claude", "an AI model made by Anthropic that reads and writes text and can use tools it is given"],
      ["chat app", "a conversation with Claude in a browser or on a phone: you type, attach files and read the reply"],
      ["delegation", "deciding what you do yourself, what you do with AI and what you hand over to it"],
      ["description", "saying what you want: the result, how to go about it and how to behave while doing it"],
      ["discernment", "judging what comes back, and how it was reached, before you use it"],
      ["diligence", "owning the result: choosing tools with care, being honest about AI's part and checking what you send out"],
      ["brief", "everything you give the AI before it starts: the request, the facts and how you want the job done; engineers call it a prompt"],
      ["draft", "a first version, handed back for you to judge"],
      ["round", "one message from you and one reply; each fault you spot costs another"],
      ["product", "what the result should be; when you judge it, whether it is accurate, fitting and complete"],
      ["process", "how the AI goes about the job; when you judge it, whether a step was skipped or a check claimed but not done"],
      ["performance", "how the AI behaves while working with you; when you judge it, whether that was useful or only agreeable"],
      ["assumption", "something the AI decided for itself because nobody told it"],
      ["publish", "put the page on the shop's website, where customers will rely on it"],
      ["creation", "choosing with care which AI tools you use, what you give them and how you work with them"],
      ["transparency", "being honest about AI's part in the work with everyone who needs to know"],
      ["deployment", "putting AI-made work to use or sending it out, after checking it and being ready to vouch for it"],
    ],
    metrics: [{ k: "brief", label: "Pieces of the brief" }, { k: "rounds", label: "Rounds until it is right" }, { k: "read", label: "Lines read" }, { k: "caught", label: "Faults caught" }],
    legend: [{ kind: "req", label: "a request, or a customer's visit" }, { kind: "res", label: "a draft coming back" }, { kind: "bad", label: "a fault, found late or sent out" }, { kind: "write", label: "a checked page going live" }],
    goals: [
      { text: "What to keep and what to hand over", step: 2 },
      { text: "Why a brief beats a bare request", step: 5 },
      { text: "The three kinds of fault to read for", step: 8 },
      { text: "What a name on the page stands for", step: 9 },
    ],
    steps: [
      {
        short: "The job", chapter: "problem", title: "A page customers will rely on",
        body: ["A team of three runs a small online shop. This month the team lead opens the chat app to write the shop's returns policy page: about 250 words for customers, under four short headings.", "Claude, the model behind the chat app, is fast and well read. It has also never heard of this shop. It does not know the returns window, who pays the postage, or what the team agreed yesterday."],
        callout: { kind: "idea", text: "Four habits decide how this goes: delegation, description, discernment and diligence. This walk takes one page through all four." },
        metrics: { brief: "0 of 5", rounds: null, read: null, caught: null },
        scene: { ents: { lead, chat, claude: tag(claude, "has never seen the shop", "muted"), site: noPage, cust, job: note("the job", ["a returns policy page", "about 250 words", "four short headings"]) }, links: { u, v }, flows: [visits] },
      },
      {
        short: "Delegation", chapter: "technique", title: "Delegation: decide who does which part",
        body: ["Before any typing, the team lead splits the job. Claude drafts and tidies, because turning rules into clear sentences is quick work for it.", "The team lead supplies the shop's four rules and decides what is fair to customers. Only someone at the shop knows the rules, and only a person can answer for them."],
        callout: { kind: "tip", text: "Delegation has three parts: know your goal, know what the tool can and cannot do, and split the work sensibly between you and it." },
        changes: ["+ Claude: drafts and tidies", "+ Team lead: the rules, and what is fair"],
        metrics: { brief: "0 of 5", rounds: null, read: null, caught: null },
        scene: { ents: { lead: who("keeps the rules", "amber"), chat, claude: tag(claude, "drafts and tidies", "violet"), site: noPage, cust, rules: note("the four rules", RULES) }, links: { u, v }, flows: [visits] },
      },
      {
        short: "Bare request", chapter: "problem", title: "Description: the bare request",
        body: ["The team lead types what most people type: \"Write a returns policy page for our shop.\" A draft comes back at once, with seven faults in it.", "It invents a 14-day window, promises free returns on everything and runs to 900 words of legal language. None of the seven is Claude being slow. Each is something it was never told.", "The first draft is one round, and each fault costs another: one message and one reply, about four minutes. That is 8 rounds and about 32 minutes of \"no, not like that\"."],
        changes: ["+ A one-line request", "+ A first draft, with 7 faults"],
        metrics: { brief: "0 of 5", rounds: { v: 8, tone: "red" }, read: null, caught: null },
        scene: { ents: { lead, chat, claude, draft: tag(draft, "7 faults", "red"), site: noPage, cust, wrong: note("what is wrong", ["a 14-day window, invented", "free returns on everything", "900 words, legal language", "a rule on gifts, made up", "a clash settled in silence", "a stiff, formal voice", "5 days, not working days"]) },
          links: { u, v, b: brief("one line"), d, r: back("8 rounds · 32 min", "red") }, flows: [visits, ask, reply, { route: ["r"], kind: "bad", rate: 0.5 }] },
      },
      {
        short: "The rules", chapter: "technique", title: "First, the facts it cannot know",
        body: ["The team lead adds the shop's real rules to the request. Returns within 30 days of delivery. Refunds paid within 5 working days. Sale items exchanged but not refunded. Return postage paid only when the item is faulty.", "Two faults go at once: the invented 14-day window and the free returns on everything. Five are left, which means 6 rounds and about 27 minutes."],
        callout: { kind: "idea", text: "Nothing about how you ask can replace facts Claude was never given." },
        changes: ["+ The shop's real rules, 3 minutes to write", "~ Faults in the first draft: 7 → 5", "~ Rounds: 8 → 6"],
        metrics: { brief: "1 of 5", rounds: { v: 6, tone: "amber" }, read: null, caught: null },
        scene: { ents: { lead, chat, claude, draft: tag(draft, "5 faults", "amber"), site: noPage, cust, rules: note("the four rules", RULES) },
          links: { u, v, b: brief("the request + the rules"), d, r: back("6 rounds · 27 min", "dashed") }, flows: [visits, ask, reply, { route: ["r"], kind: "bad", rate: 0.4 }] },
      },
      {
        short: "Full brief", chapter: "solution", title: "Description: product, process, performance",
        body: ["Now the three parts of description. The product: a web page for customers, four short headings, about 250 words, plain friendly English. The process: use only the rules, and list anything assumed.", "The performance: be brief, and say so before writing if two rules clash or one looks unfair. Last, an example to match: a line from the shop's delivery page, for the voice.", "Nine minutes of writing in all. The first draft now shows one fault where it showed seven, and the page looks right in 2 rounds and 17 minutes, not 8 rounds and 32."],
        callout: { kind: "warn", text: "One fault survives every brief. The draft says refunds take 5 days, and the rule says 5 working days. No brief prevents that one. Reading finds it." },
        changes: ["+ The product, the process, the performance", "+ An example to match", "~ Faults in the first draft: 5 → 1", "~ Rounds: 6 → 2"],
        metrics: { brief: { v: "5 of 5", tone: "green" }, rounds: { v: 2, tone: "green" }, read: null, caught: null },
        scene: { ents: { lead, chat, claude, draft: tag(draft, "1 fault", "amber"), site: noPage, cust, pieces: note("the brief, five pieces", ["the shop's real rules", "the product", "the process", "the performance", "an example to match", "= 9 minutes to write"]) },
          links: { u, v, b: brief("the full brief"), d, r: back("2 rounds · 17 min", "green") }, flows: [visits, ask, reply, { route: ["r"], kind: "res", rate: 0.4 }] },
      },
      {
        short: "Unread?", chapter: "problem", title: "Discernment: the draft sounds sure of itself",
        body: ["The draft reads well and sounds sure of itself. With it come Claude's note on how it worked and the conversation so far: nine lines in all.", "Suppose the team lead puts the page on the website without reading any of them closely. Six faults go out with it, not one.", "Customers chase refunds on day 6 that are not due until a weekend later. A customer with a sale kettle in the wrong colour is wrongly turned away.", "A good brief removes the faults that come from not being told. It cannot promise that everything it asked for was done."],
        callout: { kind: "warn", text: "A confident tone is not evidence." },
        changes: ["~ Published without a close read", "~ 6 of 6 faults go out with the page"],
        metrics: { brief: "5 of 5", rounds: 2, read: { v: "0 of 9", tone: "red" }, caught: { v: "0 of 6", tone: "red" } },
        scene: { ents: { lead: who("does not read it", "red"), chat, claude, draft: tag(draft, "sounds sure", "amber"), site: tag(site, "published unread", "red"), cust, out: note("published unread", ["6 of 6 faults go out", "refunds chased on day 6", "a sale kettle turned away"], true) },
          links: { u, v, b: brief("the full brief"), d, p: pub("unread", "red") }, flows: [{ route: ["p"], kind: "bad", rate: 0.5 }, { route: ["v"], kind: "bad", bounce: true, back: "bad", rate: 0.4 }] },
      },
      {
        short: "Read the page", chapter: "technique", title: "Discernment: hold the page against the rules",
        body: ["So the team lead reads all nine lines: four on the page, two in Claude's note on how it worked, and three from the conversation.", "First the product, the page itself, one line against one rule. Line 1, 30 days: fine. Line 2 says refunds arrive within 5 days, and the rule says 5 working days.", "Line 3 says sale items cannot be returned, and the rule says they can be exchanged. Line 4, postage on a faulty item: fine. Two product faults, and both are fixed in the page."],
        callout: { kind: "tip", text: "Line 2 is the fault no brief prevents. Line 3 is an assumption: Claude decided for itself what \"exchange only\" means." },
        changes: ["+ Four lines of the page, read against the four rules", "~ Product faults found: 2"],
        metrics: { brief: "5 of 5", rounds: 2, read: "4 of 9", caught: "2 of 6" },
        scene: { ents: { lead: who("reads every line", "green"), chat, claude, draft: tag(draft, "2 of 4 lines wrong", "red"), site: noPage, cust, lines: note("the page, four lines", ["1  30 days: fine", "2  5 days: a fault", "3  no returns: a fault", "4  postage: fine"]) },
          links: { u, v, b: brief("the full brief"), d, r: back("read against the rules", "dashed") }, flows: [visits, { route: ["r"], kind: "res", rate: 0.5 }] },
      },
      {
        short: "Read the rest", chapter: "technique", title: "Discernment: the process and the performance",
        body: ["Next the process, how the draft was made. Claude's note says it checked the page against the live website, which a chat has no way to open. It also says it assumed nothing, when line 3 was an assumption.", "Then the performance, how Claude behaved. Asked whether 5 working days is slow, it answered with flattery. Asked to be brief, it wrote four paragraphs on the history of consumer law. One line is fine: it raised a clash between two rules.", "Six faults in nine lines. These last four never show on the page, and they are why the next page would go wrong the same way."],
        callout: { kind: "idea", text: "A product fault is fixed in the page. A process or performance fault is fixed in the brief." },
        changes: ["+ The note and the conversation, read as carefully as the page", "~ Faults found: 2 product, 2 process, 2 performance"],
        metrics: { brief: "5 of 5", rounds: 2, read: { v: "9 of 9", tone: "green" }, caught: { v: "6 of 6", tone: "green" } },
        scene: { ents: { lead: who("reads every line", "green"), chat, claude: tag(claude, "its note is read too", "amber"), draft: tag(draft, "6 of 9 faulty", "red"), site: noPage, cust, kinds: note("nine lines, by kind", ["fine           3", "product        2", "process        2", "performance    2"]) },
          links: { u, v, b: brief("the full brief"), d, r: back("all nine lines", "dashed") }, flows: [visits, { route: ["r"], kind: "res", rate: 0.5 }] },
      },
      {
        short: "Own it", chapter: "solution", title: "Diligence: a name on the page",
        body: ["The two faulty lines are put right, and every sentence is checked against the four rules. Then the page goes on the shop's website with the team lead's name on it.", "That name stands for the three parts of diligence. Creation: no customer details were pasted into the chat. Transparency: the team is told how the page was made. Deployment: every sentence was checked, so the team lead answers for every line."],
        callout: { kind: "idea", text: "A tool cannot be answerable. Whoever sends the work out vouches for it." },
        changes: ["~ Lines 2 and 3 put right", "+ The page is live, with the team lead's name on it"],
        metrics: { brief: "5 of 5", rounds: 2, read: "9 of 9", caught: "6 of 6" },
        scene: { ents: { lead: who("answers for it", "green"), chat, claude, draft: tag(draft, "2 lines put right", "green"), site: tag(site, "live, with a name on it", "green"), cust, name: note("a name on the page", ["no customer details in", "the team told how", "every line checked"], true) },
          links: { u, v, b: brief("the full brief"), d, p: pub("checked, then published", "green") }, flows: [visits, { route: ["p"], kind: "write", rate: 0.5 }] },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["<b>Delegation</b>: Claude drafts and tidies. The team lead keeps the rules and decides what is fair.", "<b>Description</b>: the bare request left 7 faults and 8 rounds. The full brief left 1 fault and 2 rounds.", "<b>Discernment</b>: nine lines read and six faults found, of three kinds: product, process and performance.", "<b>Diligence</b>: the team lead's name on the page, with creation, transparency and deployment behind it.", "Delegation comes before the loop of describing and judging. Diligence comes after it."],
        callout: { kind: "next", text: "The two simulations below ask which habit slipped in ten small disasters, and how ten jobs should be shared. On the next tab you can build this brief and check this draft yourself." },
        metrics: { brief: "5 of 5", rounds: 2, read: "9 of 9", caught: "6 of 6" },
      },
    ],
  };
})();
