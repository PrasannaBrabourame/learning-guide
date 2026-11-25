/* Walkthrough on the infrastructure tab: production built by hand, then written down in a file, planned, applied, copied and rebuilt. */
(window.WALKS = window.WALKS || {})["devops-iac"] = (function () {
  const eng = { type: "person", x: -20, y: 10, label: "An engineer", tint: "sand" };
  const laptop = { type: "device", x: -20, y: -2, label: "Laptop", screen: "violet" };
  const repo = { type: "db", x: -11, y: -12, label: "Repository", tint: "violet" };
  const tool = { type: "block", x: 0, y: -16, label: "The tool", glyph: "tool", tint: "orange", s: 0.85 };
  const prodZ = { type: "zone", x: 8, y: -22, w: 22, d: 14, label: "production", tint: "teal", labelAt: "back" };
  const web = { type: "block", x: 13, y: -15, label: "", glyph: "web", tint: "teal", s: 0.8 };
  const db = { type: "db", x: 24, y: -15, label: "", tint: "teal", s: 0.8 };
  const stageZ = { type: "zone", x: 8, y: 0, w: 22, d: 14, label: "staging", tint: "blue", labelAt: "front" };
  const sweb = { type: "block", x: 13, y: 7, label: "", glyph: "web", tint: "blue", s: 0.8 };
  const sdb = { type: "db", x: 24, y: 7, label: "", tint: "blue", s: 0.8 };
  const L = (from, to, extra) => Object.assign({ from, to }, extra);
  const tag = (e, text, tone) => Object.assign({}, e, { tags: [{ text, tone }] });
  const file = (lines, title) => ({ type: "panel", x: -20, y: 10, dx: -20, dy: 34, title: title || "the file", lines });
  const FILE = ["web servers: 3, small", "database: medium", "backups: on", "front door: 1"];
  const u = L("eng", "laptop", { heads: "both" }), p = L("laptop", "repo", { label: "push" }), r = L("repo", "tool"), t1 = L("tool", "web", { style: "dashed", via: [["web", "tool"]] }), t2 = L("tool", "sweb", { style: "dashed", via: [["tool", "sweb"]] });
  const both = (wt, dt, st, sdt) => ({ prodZ, web: wt ? tag(web, wt[0], wt[1]) : web, db: dt ? tag(db, dt[0], dt[1]) : db, stageZ, sweb: st ? tag(sweb, st[0], st[1]) : sweb, sdb: sdt ? tag(sdb, sdt[0], sdt[1]) : sdb });
  return {
    title: "Infrastructure from a file",
    summary: "The shop's servers were built by hand and nobody is sure how. Write them down in a file, let a tool plan and apply it, build staging from the same file, and rebuild everything after a disaster.",
    plain: "the shop's servers were set up two years ago by clicking through a cloud provider's web pages. They work, and nobody could build them again. This walk writes them down in a file instead. A tool reads the file, shows a plan of what it would change, and makes the change when a colleague approves. The same file then builds a true copy for rehearsals, takes changes one reviewed line at a time, shows when somebody has changed things by hand, and rebuilds the lot after a disaster.",
    reallife: "A bakery built by a builder who has retired, with no drawings. It works, but nobody can open a second branch that matches, and nobody knows which wall holds the roof up. Draw the floor plan once and every branch can be built from it, checked against it, and rebuilt after a fire.",
    startby: "Press Next to turn a production built by hand into one built from a file. Arrow keys work too.",
    terms: [
      ["infrastructure", "everything the software runs on: servers, networks, databases, the front door, permissions"],
      ["production", "the real system, the one customers use"],
      ["staging", "a rehearsal copy of the real system that no customer can reach"],
      ["repository", "the shared store of the code and every change ever made to it"],
      ["plan", "a dry run: the tool lists every change it would make and touches nothing"],
      ["apply", "the tool makes the changes in the plan, for real"],
      ["state", "the tool's own record of what it built, and which real thing matches which line of the file"],
      ["pull request", "a change shown to a colleague for review before it joins the main copy"],
      ["drift", "the real system no longer matching the file, because somebody changed it by hand"],
      ["remote login", "a way for an engineer to open a command line on a server from anywhere"],
      ["backup", "a spare copy of the data kept somewhere else, so a mistake or a failure does not lose it"],
      ["region", "one of the places in the world where a cloud provider keeps its computers"],
      ["front door", "the part that shares arriving customers out across the servers"],
    ],
    metrics: [{ k: "how", label: "Built by" }, { k: "match", label: "Staging matches production" }, { k: "rebuild", label: "Time to rebuild" }, { k: "known", label: "Who knows how it is built" }],
    legend: [{ kind: "write", label: "the file moving" }, { kind: "ping", label: "the tool comparing or changing" }, { kind: "bad", label: "a change made by hand" }],
    goals: [
      { text: "Why servers built by hand cannot be trusted or rebuilt", step: 2 },
      { text: "What plan and apply each do", step: 5 },
      { text: "How one file gives a true copy and reviewed changes", step: 7 },
      { text: "What drift is, and how a rebuild works", step: 9 },
    ],
    steps: [
      {
        short: "By hand", chapter: "problem", title: "Built by hand, two years ago",
        body: ["Production was built by clicking through the cloud provider's web pages, two years ago, by someone who has since left. Three web servers, a database, a front door. Nobody is sure of every setting.", "Staging was built later, also by hand, and is said to be nearly the same."],
        metrics: { how: { v: "clicking, by hand", tone: "red" }, match: "nearly", rebuild: { v: "days of guessing", tone: "red" }, known: { v: "one person, who left", tone: "red" } },
        scene: { ents: Object.assign({ eng, laptop }, both(["3 web · built by hand", "amber"], null, ["1 web · nearly the same", "amber"], null)), links: { u, h: L("laptop", "web", { style: "dashed", label: "clicks", labelAt: 0.4 }) }, flows: [{ route: ["h"], kind: "bad", rate: 0.2 }] },
      },
      {
        short: "The surprise", chapter: "problem", title: "It worked in staging",
        body: ["Version 1.4 of the shop passes every check on staging and fails in production. The cause is one database setting that differs between the two, chosen by hand months ago.", "The rehearsal told the truth about staging. It said nothing about production, because the two were never the same."],
        callout: { kind: "warn", text: "A rehearsal copy that is nearly the same is a different system." },
        metrics: { how: "clicking, by hand", match: { v: "no", tone: "red" }, rebuild: "days of guessing", known: "one person, who left" },
        scene: { ents: Object.assign({ eng, laptop }, both(null, ["1.4 fails here", "red"], null, ["1.4 passes here", "green"])), links: { u }, flows: [] },
      },
      {
        short: "Write it down", chapter: "technique", title: "Write production down in a file",
        body: ["The team writes what production should be in a file: three small web servers, one medium database with backups, one front door. It says what should exist, not the steps to make it.", "The file is pushed to the repository, beside the code. From now on a change to the servers is a change to this file."],
        changes: ["+ The file, in the repository"],
        metrics: { how: "clicking, by hand", match: "no", rebuild: "days of guessing", known: { v: "anyone who reads the file", tone: "green" } },
        scene: { ents: Object.assign({ eng, laptop: tag(laptop, "the file", "amber"), repo, f: file(FILE) }, both()), links: { u, p }, flows: [{ route: ["p"], kind: "write", rate: 0.5 }] },
      },
      {
        short: "Plan", chapter: "technique", title: "Plan: look before anything is touched",
        body: ["A tool reads the file, looks at what really exists, and prints a plan: what it would add, change or destroy. Nothing is touched.", "For production it finds everything already there, with one difference. Backups were never switched on, and nobody knew. The plan reads: 0 to add, 1 to change, 0 to destroy."],
        changes: ["+ The tool, and its plan", "~ Found: backups were off"],
        metrics: { how: "clicking, by hand", match: "no", rebuild: "days of guessing", known: "anyone who reads the file" },
        scene: { ents: Object.assign({ eng, laptop, repo, tool: tag(tool, "plan", "amber"), f: file(["~ database: backups on", "Plan: 0 to add,", "1 to change,", "0 to destroy"], "the plan") }, both(null, ["backups: off", "red"])), links: { u, p, r, t1 }, flows: [{ route: ["r"], kind: "write", rate: 0.4 }, { route: ["t1"], kind: "ping", rate: 0.5 }] },
      },
      {
        short: "Apply", chapter: "technique", title: "Apply: the tool makes it so",
        body: ["A colleague reads the plan and approves it. Apply makes the one change. The tool notes what it now looks after in its state, its own record.", "Run apply again and it reports nothing to do, because the real system already matches the file. That is what makes it safe to run as often as you like."],
        callout: { kind: "idea", text: "Plan is the question. Apply is the answer. A person reads the question first." },
        changes: ["~ Backups switched on", "+ Production now matches the file"],
        metrics: { how: { v: "a file", tone: "green" }, match: "no", rebuild: "days of guessing", known: "anyone who reads the file" },
        scene: { ents: Object.assign({ eng, laptop, repo, tool: tag(tool, "apply", "green"), f: file(FILE) }, both(["3 web · matches", "green"], ["backups: on", "green"])), links: { u, p, r, t1 }, flows: [{ route: ["t1"], kind: "ping", rate: 0.5 }] },
      },
      {
        short: "A true copy", chapter: "technique", title: "The same file builds staging",
        body: ["The old staging is thrown away and built again from the same file, with one number changed: one web server instead of three. Eight minutes.", "Now a pass on staging means something, because staging and production are the same shape, made by the same tool from the same words."],
        changes: ["+ Staging rebuilt from the file", "~ Eight minutes, not a week"],
        metrics: { how: "a file", match: { v: "yes", tone: "green" }, rebuild: "8 minutes for staging", known: "anyone who reads the file" },
        scene: { ents: Object.assign({ eng, laptop, repo, tool: tag(tool, "apply", "green") }, both(["3 web · matches", "green"], null, ["1 web · from the file", "green"], ["same settings", "green"])), links: { u, p, r, t1, t2 }, flows: [{ route: ["t2"], kind: "ping", rate: 0.5 }] },
      },
      {
        short: "One line", chapter: "technique", title: "A change is one line, reviewed",
        body: ["December is coming. Someone changes 3 to 5 in the file and opens a pull request with the plan attached: 2 to add, 1 to change, 0 to destroy. Two servers, and the front door told about them.", "A colleague reads it and approves, and apply adds the two servers. The repository now records who made production bigger, when and why."],
        changes: ["~ web servers: 3 → 5", "+ Two servers, by pull request"],
        metrics: { how: "a file", match: "yes", rebuild: "8 minutes for staging", known: "anyone who reads the file" },
        scene: { ents: Object.assign({ eng, laptop, repo: tag(repo, "3 → 5, reviewed", "violet"), tool: tag(tool, "apply", "green"), f: file(["+ create 2 web servers", "~ update the front door", "Plan: 2 to add,", "1 to change, 0 to destroy"], "the plan") }, both(["5 web · matches", "green"])), links: { u, p, r, t1 }, flows: [{ route: ["p", "r"], kind: "write", rate: 0.4 }, { route: ["t1"], kind: "ping", rate: 0.5 }] },
      },
      {
        short: "Drift", chapter: "tradeoff", title: "Drift: somebody clicks at 2am",
        body: ["At 2am a tired engineer opens remote login to the whole internet by hand, just for tonight, and forgets. The file still says closed. That gap is drift, and nothing announces it.", "The next plan shows it: 0 to add, 1 to change, 0 to destroy. Apply closes the door again. Had the change been right, the fix would be to write it into the file instead."],
        callout: { kind: "tip", text: "Run a plan on a timetable, not only when you are changing something. It is the only thing that notices drift." },
        changes: ["~ A change made by hand", "+ Found by the next plan"],
        metrics: { how: { v: "a file, plus one click", tone: "amber" }, match: { v: "not until apply", tone: "amber" }, rebuild: "8 minutes for staging", known: "anyone who reads the file" },
        scene: { ents: Object.assign({ eng, laptop, repo, tool: tag(tool, "plan: 1 to change", "amber") }, both(["remote login: open", "red"])), links: { u, r, t1, h: L("laptop", "web", { style: "red", label: "by hand, 2am", labelAt: 0.4 }) }, flows: [{ route: ["h"], kind: "bad", rate: 0.3 }, { route: ["t1"], kind: "ping", rate: 0.4 }] },
      },
      {
        short: "Rebuild", chapter: "solution", title: "The day a whole region goes dark",
        body: ["The cloud provider's region fails and production is gone. The team points the same file at another region and applies.", "Twenty minutes later there are five web servers, a database and a front door, set up exactly as before. The orders come back from the backups the first plan switched on."],
        changes: ["+ Production rebuilt in another region", "~ Twenty minutes, from the file"],
        metrics: { how: "a file", match: "yes", rebuild: { v: "20 minutes", tone: "green" }, known: "anyone who reads the file" },
        scene: { ents: Object.assign({ eng, laptop, repo, tool: tag(tool, "apply", "green") }, both(["5 web · rebuilt", "green"], ["restored from backup", "green"]), { prodZ: Object.assign({}, prodZ, { label: "production, new region" }) }), links: { u, r, t1 }, flows: [{ route: ["r"], kind: "write", rate: 0.4 }, { route: ["t1"], kind: "ping", rate: 0.6 }] },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["Servers built by hand cannot be <b>reviewed</b>, <b>copied</b> or <b>rebuilt</b>.", "The <b>file</b> says what should exist. <b>Plan</b> shows the difference; <b>apply</b> makes it so.", "The same file builds <b>staging</b>, so the rehearsal is honest.", "A change is <b>one reviewed line</b>, with its author and reason kept.", "<b>Drift</b> is found by the next plan, and a disaster is one more apply."],
        callout: { kind: "next", text: "The two simulations below let you edit the file and read the plan, and decide what to do about three changes somebody made by hand." },
        metrics: { how: "a file", match: "yes", rebuild: "20 minutes", known: "anyone who reads the file" },
      },
    ],
    page: "devops", pane: "diac",
  };
})();
