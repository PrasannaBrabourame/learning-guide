/* Walkthrough: the lab's payments platform drawn four times, once per reader, at four depths. */
(window.WALKS = window.WALKS || {}).design = (function () {
  const users = { type: "crowd", x: -18, y: 2, label: "Customers", tint: "sand", n: 3 };
  const whole = { type: "zone", x: -8, y: -13, w: 28, d: 28, label: "the platform", tint: "slate", labelAt: "back" };
  const box = { type: "block", x: 6, y: 1, label: "Payments platform", glyph: "pay", tint: "orange" };
  const card = { type: "block", x: 24, y: -10, label: "Card network", glyph: "card", tint: "blue", s: 0.85 };
  const fraud = { type: "block", x: -2, y: -12, label: "Fraud service", glyph: "check", tint: "blue", s: 0.85 };
  const core = { type: "block", x: 18, y: 12, label: "Core banking", glyph: "bank", tint: "blue", s: 0.85 };
  const web = { type: "block", x: -1, y: -6, label: "Web app", glyph: "web", tint: "blue", s: 0.85 };
  const api = { type: "block", x: 10, y: -6, label: "Payments API", glyph: "pay", tint: "orange", s: 0.85 };
  const db = { type: "db", x: 10, y: 8, label: "Payments database", tint: "violet" };
  const q = { type: "queue", x: 0, y: 8, label: "Event queue", n: 4, dir: [1, 0] };
  const settle = { type: "block", x: -6, y: 13, label: "Settlement worker", glyph: "settle", tint: "orange", s: 0.8 };
  const handler = { type: "block", x: 10, y: -10, label: "Payment handler", glyph: "take", tint: "orange", s: 0.8 };
  const dup = { type: "db", x: 2, y: -2, label: "Duplicate check", tint: "amber" };
  const client = { type: "block", x: 18, y: -2, label: "Card client", glyph: "card", tint: "orange", s: 0.8 };
  const k8s = { type: "zone", x: -8, y: -14, w: 22, d: 18, label: "cluster, region A", tint: "teal", labelAt: "back" };
  const k8sB = { type: "zone", x: 12, y: 4, w: 14, d: 14, label: "region B, standby", tint: "teal", labelAt: "right" };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const context = () => ({
    ents: { users, box, card, fraud, core },
    links: { u: L("users", "box"), b: L("box", "card", { label: "payments" }), f: L("box", "fraud"), c: L("box", "core") },
  });
  return {
    title: "One diagram, one audience",
    summary: "The payments platform drawn four times, each for a different reader: the whole system for the sponsor, its parts for engineers, one part for the team that owns it, and where it all runs for the people on call.",
    plain: "a diagram is an argument aimed at somebody, so different readers need different pictures. The sponsor who signs it off wants the whole system and who uses it, in one box. Engineers want the parts inside. The team that owns one part wants that part opened up. The people on call want to know where it all runs. This walk draws the same payments platform four times, once for each reader, and shows what goes wrong when the levels mix.",
    reallife: "A house. The buyer wants one drawing: the house, the street, the garden. The builder wants the rooms and the walls. The electrician wants one room's wiring. The council wants to know where on the plot it sits. The same house, four drawings, and the buyer is not helped by the electrician's one.",
    startby: "Press Next to redraw the payments platform for the next reader; notice what each drawing leaves out on purpose. Arrow keys work too.",
    terms: [
      ["standby", "a second copy of the system kept ready in another place, to take over if the first one fails"],
      ["audience", "the one person or group a diagram is drawn for; it decides what goes in and what is left out"],
      ["context diagram", "the whole system as one box, with the people and outside systems around it"],
      ["container", "one running thing inside the system: a web app, a service, a database, a queue"],
      ["component", "one part inside a container, such as the duplicate check inside the payments API; the level the owning team works at"],
      ["deployment view", "where things run: machines, clusters, regions; drawn for the people on call"],
      ["zoom", "moving one level deeper into one box, without redrawing everything around it"],
      ["API", "the front door one program offers to others; the payments API is where payment requests arrive"],
      ["card network", "the outside network that carries card payments between shops and banks"],
      ["core banking", "the bank's own main system, where the accounts are kept"],
      ["settlement", "the later step that actually moves the money; the settlement worker sends approved payments on to the bank"],
      ["cluster", "a group of machines run together as one"],
      ["region", "one of the cloud provider's sites, far from the others, so a failure in one leaves the rest running"],
      ["replica", "a live copy of a database, kept up to date so it can take over"],
    ],
    metrics: [{ k: "for", label: "Drawn for" }, { k: "boxes", label: "Boxes on the page" }, { k: "shows", label: "What it answers" }],
    legend: [{ kind: "req", label: "a request" }, { kind: "res", label: "a reply" }, { kind: "msg", label: "a message" }],
    goals: [
      { text: "Why the reader decides what goes on the page", step: 1 },
      { text: "The four levels: context, containers, components, deployment", step: 5 },
      { text: "What goes wrong when levels mix", step: 6 },
    ],
    steps: [
      {
        short: "The ask", chapter: "problem", title: "Draw me the architecture",
        body: ["Someone asks for <em>the architecture diagram</em> of the payments platform. There is no such thing. There is a diagram for the sponsor who signs it off, one for the engineers, one for the team that owns the payments API, one for the people on call.", "Before drawing a box, ask who will read it and what question they are trying to answer."],
        callout: { kind: "idea", text: "A diagram with no reader in mind pleases nobody and is usually all of the levels at once." },
        metrics: { for: "nobody yet", boxes: 0, shows: "nothing" },
        scene: { ents: { users }, links: {}, flows: [] },
      },
      {
        short: "Sponsor", chapter: "technique", title: "For the sponsor: the whole system, one box",
        body: ["The sponsor is the executive who signs it off. One box: the payments platform. Around it, everyone it talks to: the customers, the card network, the fraud service and core banking. Nothing inside the box.", "The question it answers: what is this, who uses it, what does it depend on? Four boxes and the customers. Done."],
        changes: ["+ The payments platform as one box", "+ Customers and three outside systems around it"],
        metrics: { for: "the sponsor", boxes: 4, shows: "what, who, depends on" },
        scene: Object.assign(context(), { flows: [{ route: ["u"], bounce: true, rate: 0.35 }, { route: ["b"], bounce: true, rate: 0.3 }, { route: ["f"], bounce: true, rate: 0.25 }] }),
      },
      {
        short: "Engineers", chapter: "technique", title: "For engineers: open the box",
        body: ["Open the platform. Inside: a web app, the payments API, a payments database, and an event queue that feeds the settlement worker. The card network is still outside.", "The question: what runs, and what talks to what? Six boxes, each one a thing that is actually running somewhere."],
        changes: ["~ The platform opened into its containers", "+ Web app, payments API, database, queue, settlement worker"],
        metrics: { for: "engineers", boxes: 6, shows: "what runs, what talks to what" },
        scene: { ents: { whole, users, web, api, db, q, settle, card }, links: { u: L("users", "web"), w: L("web", "api"), d: L("api", "db"), e: L("api", "q", { heads: "end" }), s: L("q", "settle", { heads: "end" }), b: L("api", "card", { via: [["api", "card"]] }) }, flows: [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["w", "d"], bounce: true, rate: 0.35 }, { route: ["e", "s"], kind: "msg", rate: 0.4 }] },
      },
      {
        short: "One team", chapter: "technique", title: "For the team that owns the API: zoom into one box",
        body: ["The team that owns the payments API does not need the web app on their drawing. Zoom into their box: a payment handler, a duplicate check that remembers every payment so a retry is never charged twice, and a card client that talks to the card network.", "The payments database and the card network sit at the edge. The question: how does our part work?"],
        callout: { kind: "tip", text: "Zoom, do not redraw. The boxes around the edge keep the same names as on the engineers' drawing, so the two pictures agree." },
        changes: ["~ Zoomed into the payments API", "+ Payment handler, duplicate check, card client"],
        metrics: { for: "the API team", boxes: 5, shows: "how our part works" },
        scene: { ents: { whole: Object.assign({}, whole, { x: -4, y: -14, w: 24, d: 17, label: "inside the payments API" }), handler, dup, client, db, card }, links: { c: L("handler", "dup"), a: L("handler", "client"), d: L("handler", "db"), b: L("client", "card", { label: "charge the card" }) }, flows: [{ route: ["c"], bounce: true, rate: 0.35 }, { route: ["d"], bounce: true, rate: 0.3 }, { route: ["a", "b"], bounce: true, rate: 0.3 }] },
      },
      {
        short: "On call", chapter: "technique", title: "For the people on call: where it all runs",
        body: ["The people on call do not care how the payment handler is built. They want to know where it runs: a cluster in region A, a standby in region B, and the database copied live to a replica there.", "The question: when something fails, what is next to it, and what takes over? Five boxes in two places."],
        changes: ["~ Redrawn by location", "+ Cluster in region A, standby in region B"],
        metrics: { for: "on call", boxes: 5, shows: "where it runs, what takes over" },
        scene: { ents: { k8s, k8sB, web: Object.assign({}, web, { x: -2, y: -9 }), api: Object.assign({}, api, { x: 8, y: -9 }), db: Object.assign({}, db, { x: 2, y: -1 }), dbB: Object.assign({}, db, { x: 20, y: 14, label: "Replica", state: "dim" }), apiB: Object.assign({}, api, { x: 18, y: 7, label: "Standby API", state: "dim" }) }, links: { w: L("web", "api"), d: L("api", "db", { via: [["db", "api"]] }), r: L("db", "dbB", { heads: "end", style: "dashed", label: "replicated", labelAt: 0.75, via: [["db", "dbB"]] }) }, flows: [{ route: ["w", "d"], bounce: true, rate: 0.35 }, { route: ["r"], kind: "msg", rate: 0.3 }] },
      },
      {
        short: "Mixed", chapter: "problem", title: "What goes wrong when the levels mix",
        body: ["The usual diagram has the card network next to the duplicate check next to region B next to the customers, all on one page. Pieces from three levels, and every reader finds half of it irrelevant and the other half too shallow.", "If you cannot say which level a box is at, it is on the wrong drawing."],
        callout: { kind: "warn", text: "One page, one level, one reader. A box from another level is a sign that you are drawing for yourself." },
        metrics: { for: "everyone, so nobody", boxes: "4 from 3 levels", shows: "too much and too little" },
        scene: { ents: { users, box: Object.assign({}, box, { state: "dim" }), card, dup: Object.assign({}, dup, { x: 2, y: 10 }), k8sB: Object.assign({}, k8sB, { x: 14, y: 6, w: 10, d: 10, label: "region B" }), client: Object.assign({}, client, { x: -6, y: -8 }) }, links: { u: L("users", "box"), b: L("box", "card", { via: [["box", "card"]] }), c: L("box", "dup"), w: L("client", "box") }, flows: [] },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["Ask <b>who reads it</b> and what question they have, before any box.", "<b>Context</b> for the sponsor: one box and its neighbours.", "<b>Containers</b> for engineers: what runs and what talks to what.", "<b>Components</b> for the owning team: zoom into one box, keep the edge names.", "<b>Deployment</b> for the people on call: where it runs and what takes over. One page, one level."],
        callout: { kind: "next", text: "The next tab takes the four levels further. The rest of this lab covers the anatomy of a diagram, lines and boxes, what goes in them, what people leave out, surviving the review, and keeping it true." },
        metrics: { for: "one reader at a time", boxes: "as few as answer the question", shows: "one thing well" },
        scene: Object.assign(context(), { flows: [{ route: ["u"], bounce: true, rate: 0.3 }] }),
      },
    ],
  };
})();
