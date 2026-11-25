/* Walkthrough: rolling an AI assistant out to a whole company, from the sign-in decision to adoption. */
(window.WALKS = window.WALKS || {}).gemini = (function () {
  const staff = { type: "crowd", x: -18, y: 2, label: "Employees", tint: "sand", n: 4 };
  const assistant = { type: "block", x: -4, y: 0, label: "The assistant", glyph: "ask", tint: "orange" };
  const idpG = { type: "block", x: -4, y: -14, label: "Sign-in", glyph: "ID", tint: "blue", s: 0.85 };
  const wiki = { type: "db", x: 12, y: -11, label: "Wiki", tint: "violet" };
  const drive = { type: "db", x: 16, y: -2, label: "Shared drive", tint: "violet" };
  const crm = { type: "db", x: 16, y: 8, label: "Customer records", tint: "violet" };
  const mail = { type: "db", x: 12, y: 17, label: "Five years of email", tint: "violet" };
  const pipeline = { type: "block", x: -18, y: 14, label: "A nightly job", glyph: "job", tint: "slate", s: 0.85 };
  const armor = { type: "block", x: 6, y: 0, label: "Screening", glyph: "scan", tint: "teal", s: 0.85 };
  const champ = { type: "person", x: -27, y: -3, label: "A champion", tint: "sand" };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const connected = () => ({
    ents: { staff, assistant, idpG, wiki, drive, crm, mail },
    links: { u: L("staff", "assistant"), i: L("assistant", "idpG", { style: "dashed" }), a: L("assistant", "wiki", { via: [["assistant", "wiki"]] }), b: L("assistant", "drive"), c: L("assistant", "crm", { via: [["assistant", "crm"]] }), d: L("assistant", "mail", { via: [["assistant", "mail"]] }) },
    flows: [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["b"], bounce: true, rate: 0.35 }, { route: ["a"], bounce: true, rate: 0.3 }, { route: ["i"], bounce: true, kind: "ping", rate: 0.25 }],
  });
  return {
    title: "Rolling an assistant out to a whole company",
    summary: "One assistant for every employee: the sign-in decision that is hard to undo, the sources connected with each person's permissions, a screen on every word, and the people who make it stick.",
    plain: "a large company's knowledge is scattered across a wiki, a shared drive, customer records and years of email, and none of them talk to each other. An assistant that can search all of them is the obvious answer. Getting there starts with one decision that is hard to undo: which sign-in system proves who is asking. Then each source is connected with its permissions, every answer is screened, and someone has to make people actually use it.",
    reallife: "Opening a library for a whole town. The first decision is the membership card, because every shelf's rules depend on knowing who is holding it. Then the shelves are stocked, each book with its own borrower list, a librarian checks what goes out, and a few keen readers show everyone else that it is worth the walk.",
    startby: "Press Next to make the sign-in decision, connect each source and watch the screen stop a leaked password. Arrow keys work too.",
    terms: [
      ["identity provider", "the service that confirms who someone or something is and hands out a short-lived pass"],
      ["federation", "letting one sign-in system trust another, so people keep the login they already have"],
      ["workload identity", "an identity for a program rather than a person, so a nightly job can prove who it is without a staff login"],
      ["connector", "the piece that plugs one source, such as the wiki or the drive, into the assistant"],
      ["permissions", "which files and records a given person is allowed to see; the assistant inherits them, it never widens them"],
      ["screening", "checking every question and every answer for things that must not pass: leaked secrets, hidden instructions, abuse"],
      ["sponsor", "the senior person who backs the rollout and tells every team why it matters"],
      ["champion", "a willing colleague on a team who learns the tool first and shows the rest how it helps"],
    ],
    metrics: [{ k: "signin", label: "Sign-in" }, { k: "sources", label: "Sources connected" }, { k: "screen", label: "Screened" }, { k: "use", label: "Weekly users" }],
    legend: [{ kind: "req", label: "a question" }, { kind: "res", label: "an answer" }, { kind: "ping", label: "a sign-in check" }, { kind: "bad", label: "something stopped" }],
    goals: [
      { text: "Why the sign-in decision comes first and is hard to undo", step: 2 },
      { text: "Federation, and an identity for programs", step: 3 },
      { text: "Sources connected, with each person's permissions", step: 5 },
      { text: "Screening every question and answer", step: 6 },
      { text: "Why adoption is a people job", step: 7 },
    ],
    steps: [
      {
        short: "Scattered", chapter: "problem", title: "Four systems that do not talk",
        body: ["Someone asks <em>what did we promise this customer last year?</em> The answer is split between the wiki, a folder on the drive, the customer record and an email thread.", "Today they ask four colleagues and wait. An assistant that can search all four would answer in seconds, if it may."],
        callout: { kind: "idea", text: "The hard part is not searching. It is knowing who is asking, so the assistant only shows what that person may see." },
        metrics: { signin: { v: "undecided", tone: "red" }, sources: 0, screen: { v: "no", tone: "red" }, use: "0" },
        scene: { ents: { staff, wiki, drive, crm, mail }, links: {}, flows: [] },
      },
      {
        short: "Sign-in first", chapter: "technique", title: "The decision that is hard to undo",
        body: ["Before any source is connected, work out which identity system the assistant trusts. Every permission check for years will rest on it.", "The company runs on Google's own office suite, and that settles it: those sources only check permissions against a Google sign-in. Staff keep the login they already have. One login, one place to switch someone off when they leave."],
        changes: ["+ Google's own sign-in as the identity provider"],
        metrics: { signin: { v: "Google sign-in", tone: "green" }, sources: 0, screen: { v: "no", tone: "red" }, use: "0" },
        scene: { ents: { staff, assistant, idpG }, links: { u: L("staff", "assistant"), i: L("assistant", "idpG", { style: "dashed", label: "who is asking?" }) }, flows: [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["i"], bounce: true, kind: "ping", rate: 0.4 }] },
      },
      {
        short: "Other logins", chapter: "technique", title: "Federation, and an identity for programs",
        body: ["Had the company run on Microsoft 365 instead, with its files copied in, the data would force the other answer: federation. Google would trust the company's Microsoft directory, and people would keep the login they have. Here the data says Google, so nothing is federated.", "A nightly job that refreshes the sales summary is not a person. It gets a workload identity, so it can prove who it is without borrowing anyone's account."],
        callout: { kind: "tip", text: "Never let a program sign in as a person. When that person leaves, the job dies with them, or worse, keeps running under their name." },
        changes: ["+ A workload identity for the nightly job"],
        metrics: { signin: { v: "Google + job identity", tone: "green" }, sources: 0, screen: { v: "no", tone: "red" }, use: "0" },
        scene: (s) => { s.ents.pipeline = Object.assign({}, pipeline, { tags: [{ text: "workload identity", tone: "blue" }] }); s.ents.idpG = Object.assign({}, idpG, { tags: [{ text: "Google, chosen by the data", tone: "blue" }] }); s.links.p = L("pipeline", "assistant", { style: "dashed" }); s.flows.push({ route: ["p"], bounce: true, kind: "ping", rate: 0.3 }); return s; },
      },
      {
        short: "Connect", chapter: "technique", title: "Connect each source",
        body: ["Now the sources. Each gets a connector, and each connector makes one choice: copy the content into the assistant's own store, or ask the source live at the moment of the question.", "The wiki and the customer records are copied in, each file with its list of who may read it. The drive and the email are asked live; their own permissions already do the job. Four connectors, the question from step one has an answer, and a pilot team of twelve starts using it."],
        changes: ["+ Four connectors: two copied with reader lists, two asked live"],
        metrics: { signin: { v: "Google + job identity", tone: "green" }, sources: 4, screen: { v: "no", tone: "red" }, use: "12" },
        scene: connected(),
      },
      {
        short: "As you", chapter: "technique", title: "Each answer carries the asker's permissions",
        body: ["Two people ask about the customer. One works the account and sees the contract terms; one does not and sees only the public notes. Same assistant, same question, different answers.", "The assistant checks every result against the person asking: a copied file against the reader list that came with it, a live source by asking as that person. Nothing is widened."],
        callout: { kind: "warn", text: "Test this with two real accounts before launch. An assistant that shows one wrong file to one wrong person ends the rollout." },
        changes: ["~ Every source read as the person asking"],
        metrics: { signin: { v: "Google + job identity", tone: "green" }, sources: 4, screen: { v: "no", tone: "red" }, use: "12" },
        scene: (s) => { s.ents.staff = Object.assign({}, staff, { tags: [{ text: "account owner · sees terms", tone: "blue" }] }); s.links.c.label = "as this person"; s.links.c.labelAt = 0.68; s.flows = [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["c"], bounce: true, rate: 0.4 }, { route: ["i"], bounce: true, kind: "ping", rate: 0.3 }]; return s; },
      },
      {
        short: "Screen", chapter: "technique", title: "Screen every question and every answer",
        body: ["Put a screen in the path of every question and every answer. On the way in it catches questions that try to trick the assistant; on the way out it catches answers that would leak a card number or a password that sat in an old email.", "Both directions, every time, before anything is shown."],
        changes: ["+ Screening on questions and answers", "~ One leaked password stopped"],
        metrics: { signin: { v: "Google + job identity", tone: "green" }, sources: 4, screen: { v: "yes", tone: "green" }, use: "12" },
        scene: (s) => { s.ents.staff = staff; s.ents.armor = Object.assign({}, armor, { tags: [{ text: "stopped: a password in an old email", tone: "red" }] }); s.links.b = L("assistant", "armor"); s.links.b2 = L("armor", "drive"); s.links.d = L("armor", "mail", { via: [["armor", "mail"]] }); s.links.c = L("armor", "crm", { via: [["armor", "crm"]] }); s.links.a = L("armor", "wiki", { via: [["armor", "wiki"]] }); s.flows = [{ route: ["d"], reverse: true, kind: "bad", rate: 0.4, fail: 0.96 }, { route: ["b", "b2"], bounce: true, rate: 0.35 }]; return s; },
      },
      {
        short: "Make it stick", chapter: "solution", title: "Adoption is a people job",
        body: ["It works, and twelve people use it. The rest never got past the first unhelpful answer. A senior sponsor tells every team why it matters. Then pick a champion on each team, give them a week of help, and let them show their colleagues the three questions it answers best.", "Usage follows people, not announcements: weekly users climb from twelve to three hundred. Keep measuring every week and fix the sources behind the worst answers."],
        callout: { kind: "idea", text: "A rollout is finished when people reach for the assistant before they reach for a colleague. That takes a sponsor and champions, not emails." },
        changes: ["+ A sponsor, and a champion on each team", "~ Weekly usage reviewed, worst sources fixed first"],
        metrics: { signin: { v: "Google + job identity", tone: "green" }, sources: 4, screen: { v: "yes", tone: "green" }, use: { v: "300", tone: "green" } },
        scene: (s) => { s.ents.armor = armor; s.ents.champ = champ; s.links.ch = L("champ", "staff", { heads: "end" }); s.flows = [{ route: ["ch"], kind: "msg", rate: 0.4 }, { route: ["u"], bounce: true, rate: 0.5 }, { route: ["b", "b2"], bounce: true, rate: 0.4 }]; return s; },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["Decide the <b>sign-in</b> first; every permission check rests on it.", "Let the data pick the lane: Google sources mean Google's sign-in, Microsoft 365 means <b>federation</b>. Give programs a <b>workload identity</b>.", "Connect each source through a <b>connector</b>, copied with its reader lists or asked live; read everything <b>as the person asking</b>.", "<b>Screen</b> every question and answer, both directions.", "Adoption needs a <b>sponsor</b>, <b>champions</b> and weekly measurement, not announcements."],
        callout: { kind: "next", text: "The rest of this lab covers provisioning, networking, where the data lives, agents, search quality, tuning and governance, and change management." },
        metrics: { signin: { v: "Google + job identity", tone: "green" }, sources: 4, screen: { v: "yes", tone: "green" }, use: { v: "300", tone: "green" } },
      },
    ],
  };
})();
