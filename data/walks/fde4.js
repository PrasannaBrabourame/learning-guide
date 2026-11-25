/* Walkthrough: the front door. One company app, every source plugged in live, and the fences
   around it. Drawn by assets/walk.js. */
(window.WALKS = window.WALKS || {}).fde4 = (function () {
  const staff = { type: "crowd", x: -17, y: 2, label: "Everyone in the company", tint: "sand", n: 4 };
  const app = { type: "block", x: -6, y: 0, label: "The company app", glyph: "APP", tint: "orange" };
  const model = { type: "model", x: -6, y: -14, label: "The model", glyph: "AI", tint: "violet" };
  const drive = { type: "db", x: 12, y: -12, label: "Shared drive", tint: "violet" };
  const tickets = { type: "db", x: 16, y: -2, label: "Ticket tracker", tint: "violet" };
  const hr = { type: "db", x: 16, y: 9, label: "HR spreadsheet", tint: "rose" };
  const team = { type: "block", x: 12, y: 19, label: "A team's own tool", glyph: "TOOL", tint: "blue", s: 0.85 };
  const copy = { type: "db", x: 4, y: 14, label: "A copy of everything", tint: "amber" };
  const idp = { type: "block", x: -18, y: -12, label: "Sign-in", glyph: "ID", tint: "blue", s: 0.85 };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const live = () => ({
    ents: { staff, app, model, drive, tickets, hr },
    links: { u: L("staff", "app"), m: L("app", "model"), d: L("app", "drive", { label: "live, as this person" }), t: L("app", "tickets"), h: L("app", "hr", { via: [["app", "hr"]] }) },
    flows: [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["d"], bounce: true, rate: 0.35 }, { route: ["t"], bounce: true, rate: 0.3 }],
  });
  return {
    title: "One front door for the whole company",
    summary: "One app every employee uses, with each data source plugged in live, as that person, and the fences that decide what the model may see and where it may reach.",
    plain: "instead of a different AI assistant bolted onto every system, a company gives everyone one front door. Each source, the shared drive, the ticket tracker, the HR files, plugs in behind it and is read live, with the permissions of whoever is asking. Nothing is copied. This walk plugs the sources in one by one, then shows the fences: who gets in, what the model may see, and where the app may reach.",
    reallife: "A hotel reception. One desk, and behind it a key for every room. The receptionist does not photocopy every guest's passport into a drawer; they look at the real record when asked, and only the record of the person standing there. Some drawers are locked even to reception.",
    terms: [
      ["front door", "the one company app every employee uses to ask questions; every source is reached through it"],
      ["federation", "reaching a source live, where it already lives, instead of copying its data into the app"],
      ["permissions", "which files and records a given person is allowed to see; the app inherits them, it never widens them"],
      ["content policy", "a rule that stops certain data, such as HR files, from ever being sent to the model"],
      ["allow-list", "a list of the only things permitted; everything else is refused"],
      ["stale copy", "a duplicate of data that was correct when copied and has quietly gone out of date since"],
      ["tool server", "a small service that offers an app a set of tools it can call, with a description of each"],
    ],
    metrics: [{ k: "sources", label: "Sources reachable" }, { k: "copies", label: "Copies to keep fresh" }, { k: "fenced", label: "Fences in place" }],
    legend: [{ kind: "req", label: "a question" }, { kind: "res", label: "an answer" }, { kind: "bad", label: "something blocked" }, { kind: "write", label: "a copy being made" }],
    goals: [
      { text: "Why one front door beats one assistant per system", step: 2 },
      { text: "What federation is, and why copying data goes wrong", step: 4 },
      { text: "How each person's permissions carry through to the answer", step: 5 },
      { text: "The fences: sign-in, content policy, allow-list", step: 8 },
    ],
    steps: [
      {
        short: "Silos", chapter: "problem", title: "An assistant bolted onto everything",
        body: ["The shared drive has an assistant. The ticket tracker has an assistant. HR is thinking of getting one. Each answers questions about its own box and nothing else.", "Ask <em>which tickets mention the contract in the drive?</em> and no assistant can answer, because no assistant can see both."],
        callout: { kind: "idea", text: "Questions at work cross systems. An assistant that lives inside one system cannot follow them." },
        metrics: { sources: { v: "1 each", tone: "red" }, copies: 0, fenced: { v: "none", tone: "red" } },
        scene: { ents: { staff, drive: Object.assign({}, drive, { x: 3, y: -14, tags: [{ text: "its own assistant", tone: "muted" }] }), tickets: Object.assign({}, tickets, { x: 14, y: 1, tags: [{ text: "its own assistant", tone: "muted" }] }), hr: Object.assign({}, hr, { x: 6, y: 12, tags: [{ text: "no assistant", tone: "muted" }] }) }, links: { a: L("staff", "drive", { via: [["staff", "drive"]] }), b: L("staff", "tickets") }, flows: [{ route: ["a"], bounce: true, rate: 0.3 }, { route: ["b"], bounce: true, rate: 0.3 }] },
      },
      {
        short: "One door", chapter: "technique", title: "One front door for everyone",
        body: ["Replace them with one company app. Everyone asks it. It talks to the model, and it will reach every source from behind one desk.", "The app is the only thing employees need to learn, and the only thing that needs securing."],
        changes: ["+ The company app", "+ The model behind it", "- One assistant per system"],
        metrics: { sources: 0, copies: 0, fenced: { v: "none", tone: "red" } },
        scene: { ents: { staff, app, model }, links: { u: L("staff", "app"), m: L("app", "model") }, flows: [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["m"], bounce: true, rate: 0.45, speed: 70 }] },
      },
      {
        short: "Copy it?", chapter: "problem", title: "The tempting shortcut: copy everything in",
        body: ["The quick way to make the drive searchable is to copy every file into the app's own store, once a night. It works on day one. Then a contract is updated at ten in the morning, and until tonight's copy runs the app still quotes the old version.", "Worse: the drive's list of who may read what has to be copied too, and it goes stale the same way. Take someone off a file on the drive, and the copy still shows it to them until the next run."],
        changes: ["+ A copy of the drive", "~ Stale until the next copy", "~ Permissions copied, and stale too"],
        metrics: { sources: 1, copies: { v: 1, tone: "red" }, fenced: { v: "none", tone: "red" } },
        scene: { ents: { staff, app, model, drive, copy: Object.assign({}, copy, { state: "hot", tags: [{ text: "stale · old permissions", tone: "red" }] }) }, links: { u: L("staff", "app"), m: L("app", "model"), c: L("drive", "copy", { heads: "end", via: [["copy", "drive"]], style: "dashed", label: "copied nightly" }), r: L("app", "copy") }, flows: [{ route: ["c"], kind: "write", rate: 0.5 }, { route: ["r"], bounce: true, back: "bad", rate: 0.35 }] },
      },
      {
        short: "Live", chapter: "technique", title: "Federation: read it where it lives",
        body: ["Throw the copy away. Plug the drive in live: when someone asks, the app goes to the drive at that moment and reads the real file.", "Nothing to refresh, nothing to go stale, and the drive itself decides what each person may see."],
        callout: { kind: "idea", text: "A copy has to be kept fresh and kept safe. A live link is fresh and safe by definition, because it is the real thing." },
        changes: ["- The copy", "+ Shared drive, plugged in live"],
        metrics: { sources: 1, copies: { v: 0, tone: "green" }, fenced: { v: "none", tone: "red" } },
        scene: { ents: { staff, app, model, drive }, links: { u: L("staff", "app"), m: L("app", "model"), d: L("app", "drive", { label: "live" }) }, flows: [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["d"], bounce: true, rate: 0.4 }] },
      },
      {
        short: "As you", chapter: "technique", title: "Every answer carries your permissions",
        body: ["Two people ask the same question. One is in finance and may see the budget file; one is not. The app passes each person's identity through, so the drive returns the budget to one and not the other.", "The app never widens anyone's access. It only carries it."],
        changes: ["+ Ticket tracker, live", "~ Each request made as the person asking"],
        metrics: { sources: 2, copies: { v: 0, tone: "green" }, fenced: { v: "none", tone: "red" } },
        scene: (s) => { s.ents.tickets = tickets; s.links.t = L("app", "tickets"); s.links.d.label = "live, as this person"; s.ents.staff = Object.assign({}, staff, { tags: [{ text: "finance · can see the budget", tone: "blue" }] }); s.flows = [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["d"], bounce: true, rate: 0.35 }, { route: ["t"], bounce: true, rate: 0.3 }]; return s; },
      },
      {
        short: "Sign-in", chapter: "technique", title: "Fence one: who gets in",
        body: ["Permissions only mean something if the app knows who is asking. Everyone signs in through the company's own sign-in service, the same one that opens their laptop and email.", "No separate passwords for the app, and when someone leaves, their access ends everywhere at once."],
        changes: ["+ Company sign-in"],
        metrics: { sources: 2, copies: { v: 0, tone: "green" }, fenced: { v: 1, tone: "amber" } },
        scene: (s) => { s.ents.staff = staff; s.ents.idp = idp; s.links.i = L("staff", "idp", { style: "dashed", label: "who are you?", labelAt: 0.3 }); s.flows = [{ route: ["i"], bounce: true, kind: "ping", rate: 0.35 }, { route: ["u"], bounce: true, rate: 0.3 }]; return s; },
      },
      {
        short: "Locked", chapter: "technique", title: "Fence two: some data never reaches the model",
        body: ["Plug in the HR spreadsheet, and a content policy sits on the cable: salaries and health notes may never be sent to the model, whoever asks, whatever their permissions.", "The policy is checked on the way in. The model never sees the rows, so it cannot repeat them."],
        callout: { kind: "warn", text: "Permissions say who may see a file. A content policy says what may be shown to the model at all. You need both." },
        changes: ["+ HR spreadsheet, behind a content policy"],
        metrics: { sources: 3, copies: { v: 0, tone: "green" }, fenced: { v: 2, tone: "amber" } },
        scene: (s) => { s.ents.hr = Object.assign({}, hr, { tags: [{ text: "content policy", tone: "red" }] }); s.links.h = L("app", "hr", { via: [["app", "hr"]], style: "red" }); s.flows = [{ route: ["h"], reverse: true, kind: "bad", rate: 0.4, fail: 0.5 }, { route: ["d"], bounce: true, rate: 0.3 }]; return s; },
      },
      {
        short: "Approved", chapter: "solution", title: "Fence three: an allow-list for where it may reach",
        body: ["A team wants the app to use their own tool server. Fine, once its address is on the allow-list. Until then the app refuses to connect, however nicely the model asks.", "The list is short and reviewed. Everything not on it is unreachable, which is what keeps a hijacked request from calling out."],
        changes: ["+ A team's tool server, once allow-listed", "+ Allow-list of destinations"],
        metrics: { sources: 4, copies: { v: 0, tone: "green" }, fenced: { v: 3, tone: "green" } },
        scene: (s) => { s.ents.hr = Object.assign({}, hr, { tags: [{ text: "content policy", tone: "muted" }] }); s.links.h = L("app", "hr", { via: [["app", "hr"]], style: "off" }); s.ents.team = Object.assign({}, team, { tags: [{ text: "on the allow-list", tone: "green" }] }); s.links.w = L("app", "team", { via: [["app", "team"]], style: "green" }); s.flows = [{ route: ["w"], bounce: true, rate: 0.35 }, { route: ["u"], bounce: true, rate: 0.3 }]; return s; },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["One <b>front door</b> for everyone, instead of an assistant per system.", "<b>Federation</b>: read each source live, where it lives. Copies go stale, and so do the permission lists copied with them.", "Every request is made <b>as the person asking</b>; the app never widens access.", "Fences: company <b>sign-in</b>, a <b>content policy</b> on sensitive sources, an <b>allow-list</b> of destinations."],
        callout: { kind: "next", text: "The rest of day four follows the life of one query, screens every word, draws the perimeter, and shows what to do when it goes wrong." },
        metrics: { sources: 4, copies: { v: 0, tone: "green" }, fenced: { v: 3, tone: "green" } },
        scene: (s) => { s.ents.team = team; s.flows = [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["d"], bounce: true, rate: 0.3 }, { route: ["t"], bounce: true, rate: 0.3 }, { route: ["w"], bounce: true, rate: 0.25 }]; return s; },
      },
    ],
  };
})();
