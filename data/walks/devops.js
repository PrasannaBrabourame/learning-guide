/* Walkthrough on the first tab: one small change, from a laptop to live, taking lines off the release-night checklist. */
(window.WALKS = window.WALKS || {}).devops = (function () {
  const dev = { type: "person", x: -21, y: 9, label: "A developer", tint: "sand" };
  const laptop = { type: "device", x: -21, y: -3, label: "Laptop", screen: "violet" };
  const repo = { type: "db", x: -13, y: -13, label: "Repository", tint: "violet" };
  const ci = { type: "block", x: 0, y: -18, label: "The pipeline", glyph: "build", tint: "orange" };
  const reg = { type: "db", x: 15, y: -15, label: "Registry", tint: "teal" };
  const stage = { type: "block", x: 11, y: -3, label: "Staging", glyph: "copy", tint: "blue", s: 0.85 };
  const prod = { type: "block", x: 9, y: 11, label: "Production", glyph: "live", tint: "green" };
  const users = { type: "crowd", x: -4, y: 18, label: "Customers", tint: "sand", n: 3 };
  const dash = { type: "block", x: 23, y: 7, label: "Dashboard", glyph: "watch", tint: "amber", s: 0.8 };
  const L = (from, to, extra) => Object.assign({ from, to }, extra);
  const tag = (e, text, tone) => Object.assign({}, e, { tags: [{ text, tone }] });
  const u = L("dev", "laptop", { heads: "both" }), c = L("users", "prod"), p = L("laptop", "repo", { label: "push" }), r = L("repo", "ci", { label: "on every push", labelAt: 0.3 });
  const g = L("ci", "reg", { label: "package", labelAt: 0.7 }), s = L("reg", "stage"), d = L("stage", "prod", { label: "same package", labelAt: 0.4 }), d2 = L("stage", "prod");
  const visits = { route: ["c"], bounce: true, rate: 0.5 };
  return {
    title: "One small change, from a laptop to live",
    summary: "Follow one small change, a discount code box, from a developer's laptop to the shop's customers, and watch each step take lines off the release-night checklist.",
    plain: "release night is forty changes pushed out together by hand, once a month. This walk follows one change instead: a discount code box for the shop's checkout. It is saved to a shared history, built and tested by a machine within minutes, sealed into one numbered package, rehearsed, and put in front of customers. Each step replaces lines of the old checklist until there are none left.",
    reallife: "A bakery that changes one recipe at a time. The change is written in the recipe book, the test kitchen bakes and tastes it, the loaf is boxed and numbered, a trial counter sells it first, and then the same box goes to the shops. The old way was forty new recipes on one morning.",
    startby: "Press Next to follow the discount code change from the laptop to the shop's customers. Arrow keys work too.",
    terms: [
      ["repository", "the shared store of the code and every change ever made to it, with who, when and why"],
      ["push", "send your saved changes from your laptop to the repository"],
      ["pipeline", "the automatic path a change travels: check, build, test, scan, package, put on the servers"],
      ["automated test", "a small program that checks the software still does what it should"],
      ["scan", "compare every library the app uses against a public list of known security holes"],
      ["package", "the sealed, numbered result of a build; what was tested is exactly what is shipped"],
      ["registry", "the shelf packages are kept on by version, so any server can fetch the right one"],
      ["staging", "a rehearsal copy of the real system that no customer can reach"],
      ["production", "the real system, the one customers use"],
      ["infrastructure as code", "describing servers and networks in a file, so a tool can build them the same way every time"],
      ["front door", "the part that shares arriving customers out across the servers"],
      ["dashboard", "a screen of charts showing how the system is behaving right now"],
      ["alert", "an alarm that phones somebody when a number crosses a line"],
      ["on call", "being the person who is phoned when the system breaks out of hours"],
    ],
    metrics: [{ k: "batch", label: "Changes per release" }, { k: "lead", label: "Saved to live" }, { k: "hand", label: "Steps done by hand" }, { k: "bad", label: "If it breaks" }],
    legend: [{ kind: "write", label: "a change or a package moving" }, { kind: "req", label: "a customer's request" }, { kind: "bad", label: "a failed check, sent back" }, { kind: "heavy", label: "forty changes at once" }],
    goals: [
      { text: "Why one small change beats forty", step: 2 },
      { text: "What the pipeline does on every push", step: 4 },
      { text: "Why the package is built once", step: 5 },
      { text: "How the way back stays short", step: 8 },
    ],
    steps: [
      {
        short: "Release night", chapter: "problem", title: "Release night",
        body: ["A team of three looks after an online shop. Once a month they release: forty changes bundled together, fourteen steps done by hand from a checklist, three hours after midnight.", "Something breaks. There are forty suspects, and customers have waited up to a month for work that was finished weeks ago."],
        callout: { kind: "warn", text: "Nobody here is careless. Big, rare, hand-made releases break because they are big, rare and made by hand." },
        metrics: { batch: { v: 40, tone: "red" }, lead: "up to a month", hand: { v: 14, tone: "red" }, bad: { v: "40 suspects", tone: "red" } },
        scene: { ents: { dev, laptop, prod: tag(prod, "shop 1.3", "muted"), users, night: { type: "panel", x: 9, y: 11, dx: 40, dy: -150, title: "release night", lines: ["40 changes, one go", "14 steps by hand", "3 hours, after midnight", "= which of 40 broke it?"] } },
          links: { u, c, h: L("laptop", "prod", { style: "dashed", label: "by hand, monthly" }) }, flows: [visits, { route: ["h"], kind: "heavy", rate: 0.15 }] },
      },
      {
        short: "Small, saved", chapter: "technique", title: "One small change, saved to a shared history",
        body: ["A developer adds a discount code box to the checkout: one change, about forty lines. It is saved with a note saying what it does and pushed to the repository, the shared store that keeps every change from everyone.", "If this change breaks something, there is one suspect. That is the whole trick, and the rest of the walk is how to afford it."],
        changes: ["+ Change 212, pushed to the repository"],
        metrics: { batch: { v: 1, tone: "green" }, lead: "up to a month", hand: 14, bad: { v: "1 suspect", tone: "green" } },
        scene: { ents: { dev, laptop: tag(laptop, "one small change", "violet"), repo: tag(repo, "change 212", "violet"), prod: tag(prod, "shop 1.3", "muted"), users }, links: { u, c, p }, flows: [visits, { route: ["p"], kind: "write", rate: 0.5 }] },
      },
      {
        short: "The build", chapter: "technique", title: "A machine builds it, every time",
        body: ["The push itself starts the pipeline. A clean machine fetches the code and builds it: two minutes, the same way every time, with nobody typing.", "Three of the fourteen checklist steps were fetching, installing and building. They are gone."],
        changes: ["+ The pipeline, started by every push", "~ Steps by hand: 14 → 11"],
        metrics: { batch: 1, lead: "up to a month", hand: 11, bad: "1 suspect" },
        scene: { ents: { dev, laptop, repo: tag(repo, "change 212", "violet"), ci: tag(ci, "built · 2 min", "green"), prod: tag(prod, "shop 1.3", "muted"), users }, links: { u, c, p, r }, flows: [visits, { route: ["p", "r"], kind: "write", rate: 0.5 }] },
      },
      {
        short: "The tests", chapter: "technique", title: "313 tests run before anyone else sees it",
        body: ["Next the pipeline runs 313 automated tests. One fails: with a 10% code the cart should total 90.00 and comes out at 81.00. The discount is being applied twice.", "The developer knows about six minutes after pushing, while the change is still fresh. On release night this would have surfaced weeks later, among forty suspects."],
        callout: { kind: "idea", text: "The pipeline is not there to slow you down. It tells you in minutes what release night told you in weeks." },
        changes: ["+ 313 tests on every change", "~ Steps by hand: 11 → 7"],
        metrics: { batch: 1, lead: "up to a month", hand: 7, bad: "1 suspect" },
        scene: { ents: { dev, laptop: tag(laptop, "fix it now", "amber"), repo, ci: tag(ci, "313 tests · 1 failed", "red"), prod: tag(prod, "shop 1.3", "muted"), users },
          links: { u, c, p, r, f: L("ci", "laptop", { style: "red", via: [["ci", "laptop"]], label: "back in 6 minutes", labelAt: 0.3 }) }, flows: [visits, { route: ["r"], kind: "write", rate: 0.4 }, { route: ["f"], kind: "bad", rate: 0.5 }] },
      },
      {
        short: "The package", chapter: "technique", title: "One package, numbered, on a shelf",
        body: ["The fix is pushed and every stage passes: check, build, test, scan. The last stage seals the result into one package, numbers it 1.4 and puts it in the registry, a shelf any server can fetch from.", "It is built once. Everything after this uses this exact package, so what was tested is what ships."],
        changes: ["+ Package shop:1.4 in the registry", "~ Steps by hand: 7 → 5"],
        metrics: { batch: 1, lead: "up to a month", hand: 5, bad: "1 suspect" },
        scene: { ents: { dev, laptop, repo, ci: tag(ci, "5 stages passed · 8 min", "green"), reg: tag(reg, "shop:1.4", "green"), prod: tag(prod, "shop 1.3", "muted"), users }, links: { u, c, p, r, g }, flows: [visits, { route: ["r", "g"], kind: "write", rate: 0.5 }] },
      },
      {
        short: "Deploy", chapter: "technique", title: "A rehearsal, then the real thing",
        body: ["The pipeline puts shop:1.4 on staging, a rehearsal copy no customer can reach, and checks it there. Then it puts the same package on production.", "Twelve minutes from push to live. The last five checklist steps are gone: copy, stop, swap, start, check."],
        changes: ["+ Staging, then production", "~ Steps by hand: 5 → 0", "~ Saved to live: 12 minutes"],
        metrics: { batch: 1, lead: { v: "12 minutes", tone: "green" }, hand: { v: 0, tone: "green" }, bad: "1 suspect" },
        scene: { ents: { dev, laptop, repo, ci, reg: tag(reg, "shop:1.4", "green"), stage: tag(stage, "1.4 · checked", "green"), prod: tag(prod, "shop 1.4", "green"), users }, links: { u, c, p, r, g, s, d }, flows: [visits, { route: ["s", "d"], kind: "write", rate: 0.5 }] },
      },
      {
        short: "The servers", chapter: "technique", title: "The servers come from a file too",
        body: ["A rehearsal only proves something if staging is built like production. So the servers themselves are written down in a file: three web servers, one database with backups, one front door.", "A tool builds both places from that file. This is infrastructure as code, and it has a tab of its own."],
        callout: { kind: "tip", text: "If staging was built by hand, a pass on staging tells you about staging." },
        changes: ["+ One file describes the servers", "+ Staging and production built from it"],
        metrics: { batch: 1, lead: "12 minutes", hand: 0, bad: "1 suspect" },
        scene: { ents: { dev, laptop, repo, ci, reg, stage: tag(stage, "built from the file", "blue"), prod: tag(prod, "built from the file", "blue"), users, file: { type: "panel", x: 9, y: 11, dx: 110, dy: 10, title: "the servers file", lines: ["web servers: 3", "database: 1, backups on", "front door: 1"] } },
          links: { u, c, p, r, g, s, d: d2 }, flows: [visits] },
      },
      {
        short: "Watch, undo", chapter: "solution", title: "Watch it, and keep the way back short",
        body: ["Live is not the end. A dashboard shows how many requests fail: 0.2%, as before. If that number climbed, an alert would phone whoever is on call.", "And 1.3 is still on the shelf. Putting it back is one command and two minutes, and it undoes one change, not forty."],
        changes: ["+ A dashboard and an alert", "+ A two-minute way back"],
        metrics: { batch: 1, lead: "12 minutes", hand: 0, bad: { v: "2 minutes to undo", tone: "green" } },
        scene: { ents: { dev, laptop, repo, ci, reg: tag(reg, "1.3 · 1.4", "green"), stage, prod: tag(prod, "shop 1.4", "green"), users, dash: tag(dash, "0.2% failing", "green") },
          links: { u, c, p, r, g, s, d: d2, w: L("prod", "dash", { style: "dashed" }) }, flows: [visits, { route: ["w"], kind: "ping", rate: 0.4 }] },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["<b>Small changes</b>: one suspect when something breaks.", "A <b>pipeline</b> builds, tests and packages every change, and stops at the first failure.", "One <b>package</b>, built once, goes from the <b>registry</b> to <b>staging</b> and then <b>production</b>.", "The servers come from a <b>file</b>, so the rehearsal is honest.", "<b>Watch</b> the numbers, and keep the old version on the shelf."],
        callout: { kind: "next", text: "The next tab names each part. After that: the pipeline up close, four ways to publish, infrastructure as code, and the four numbers that say how the team is doing." },
        metrics: { batch: 1, lead: "12 minutes", hand: 0, bad: "2 minutes to undo" },
      },
    ],
  };
})();
