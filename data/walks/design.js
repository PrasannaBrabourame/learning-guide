/* Walkthrough: one diagram per audience, drawn as the same system at four depths. */
(window.WALKS = window.WALKS || {}).design = (function () {
  const users = { type: "crowd", x: -18, y: 2, label: "Customers", tint: "sand", n: 3 };
  const whole = { type: "zone", x: -8, y: -13, w: 28, d: 28, label: "the system", tint: "slate", labelAt: "back" };
  const box = { type: "block", x: 6, y: 1, label: "The shop", glyph: "shop", tint: "orange" };
  const bank = { type: "block", x: 24, y: -10, label: "The bank", glyph: "bank", tint: "blue", s: 0.85 };
  const web = { type: "block", x: -1, y: -6, label: "Website", glyph: "web", tint: "blue", s: 0.85 };
  const orders = { type: "block", x: 10, y: -6, label: "Orders service", glyph: "order", tint: "orange", s: 0.85 };
  const db = { type: "db", x: 10, y: 8, label: "Orders database", tint: "violet" };
  const q = { type: "queue", x: 0, y: 8, label: "Email queue", n: 4, dir: [1, 0] };
  const api = { type: "block", x: 10, y: -10, label: "Order handler", glyph: "take", tint: "orange", s: 0.8 };
  const worker = { type: "block", x: 2, y: -2, label: "Payment worker", glyph: "pay", tint: "orange", s: 0.8 };
  const cache = { type: "db", x: 18, y: -2, label: "Cache", tint: "amber" };
  const k8s = { type: "zone", x: -8, y: -14, w: 22, d: 18, label: "cluster, region A", tint: "teal", labelAt: "back" };
  const k8sB = { type: "zone", x: 12, y: 4, w: 14, d: 14, label: "region B, standby", tint: "teal", labelAt: "right" };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  return {
    title: "One diagram, one audience",
    summary: "The same shop drawn four times, each for a different reader: the whole system for an executive, its parts for engineers, one part for the team that owns it, and where it all runs for operations.",
    plain: "a diagram is an argument aimed at somebody, so different readers need different pictures. An executive wants the whole system and who uses it, in one box. Engineers want the parts inside. The team that owns one part wants that part opened up. Operations wants to know where it all runs. This walk draws the same shop four times, each time for one reader, and shows what goes wrong when the levels mix.",
    reallife: "A house. The buyer wants one drawing: the house, the street, the garden. The builder wants the rooms and the walls. The electrician wants one room's wiring. The council wants to know where on the plot it sits. The same house, four drawings, and nobody is helped by the electrician's one.",
    startby: "Press Next to redraw the shop for the next reader; notice what each drawing leaves out on purpose. Arrow keys work too.",
    terms: [
      ["audience", "the one person or group a diagram is drawn for; it decides what goes in and what is left out"],
      ["context diagram", "the whole system as one box, with the people and outside systems around it"],
      ["container", "one running thing inside the system: a website, a service, a database, a queue"],
      ["component", "one part inside a container: a module, a worker, a cache; the level the owning team works at"],
      ["deployment view", "where things run: machines, clusters, regions; drawn for the people who operate it"],
      ["zoom", "moving one level deeper into one box, without redrawing everything around it"],
    ],
    metrics: [{ k: "for", label: "Drawn for" }, { k: "boxes", label: "Boxes on the page" }, { k: "shows", label: "What it answers" }],
    legend: [{ kind: "req", label: "an order" }, { kind: "res", label: "a reply" }, { kind: "msg", label: "a message" }],
    goals: [
      { text: "Why the reader decides what goes on the page", step: 1 },
      { text: "The four levels: context, containers, components, deployment", step: 5 },
      { text: "What goes wrong when levels mix", step: 6 },
    ],
    steps: [
      {
        short: "The ask", chapter: "problem", title: "Draw me the architecture",
        body: ["Someone asks for <em>the architecture diagram.</em> There is no such thing. There is a diagram for the board, one for the engineers, one for the team that owns payments, one for the people on call.", "Before drawing a box, ask who will read it and what question they are trying to answer."],
        callout: { kind: "idea", text: "A diagram with no reader in mind pleases nobody and is usually all of the levels at once." },
        metrics: { for: "nobody yet", boxes: 0, shows: "nothing" },
        scene: { ents: { users }, links: {}, flows: [] },
      },
      {
        short: "Executive", chapter: "technique", title: "For the executive: the whole system, one box",
        body: ["One box: the shop. Around it, the people and systems it talks to: customers, and the bank that takes payments. Nothing inside the box.", "The question it answers: what is this, who uses it, what does it depend on? Three boxes, done."],
        changes: ["+ The shop as one box", "+ Customers and the bank around it"],
        metrics: { for: "the executive", boxes: 3, shows: "what, who, depends on" },
        scene: { ents: { users, box, bank }, links: { u: L("users", "box"), b: L("box", "bank", { via: [["box", "bank"]], label: "payments" }) }, flows: [{ route: ["u"], bounce: true, rate: 0.35 }, { route: ["b"], bounce: true, rate: 0.3 }] },
      },
      {
        short: "Engineers", chapter: "technique", title: "For engineers: open the box",
        body: ["Open the shop. Inside: a website, an orders service, an orders database, and a queue that feeds the email sender. The bank is still outside.", "The question: what runs, and what talks to what? Six boxes, each one a thing that is actually running somewhere."],
        changes: ["~ The shop opened into its containers", "+ Website, orders service, database, email queue"],
        metrics: { for: "engineers", boxes: 6, shows: "what runs, what talks to what" },
        scene: { ents: { whole, users, web, orders, db, q, bank }, links: { u: L("users", "web"), w: L("web", "orders"), d: L("orders", "db"), e: L("orders", "q", { heads: "end", via: [["orders", "q"]] }), b: L("orders", "bank", { via: [["orders", "bank"]] }) }, flows: [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["w", "d"], bounce: true, rate: 0.35 }, { route: ["e"], kind: "msg", rate: 0.4 }] },
      },
      {
        short: "One team", chapter: "technique", title: "For the team that owns orders: zoom into one box",
        body: ["The orders team does not need the website on their drawing. Zoom into their service: an order handler, a payment worker that talks to the bank, and a cache in front of the database.", "Everything outside the service becomes a label on the edge. The question: how does our part work?"],
        callout: { kind: "tip", text: "Zoom, do not redraw. The boxes around the edge keep the same names as on the engineers' drawing, so the two pictures agree." },
        changes: ["~ Zoomed into the orders service", "+ Order handler, payment worker, cache"],
        metrics: { for: "the orders team", boxes: 5, shows: "how our part works" },
        scene: { ents: { whole: Object.assign({}, whole, { label: "inside the orders service" }), api, worker, cache, db, bank }, links: { a: L("api", "worker", { via: [["worker", "api"]] }), c: L("api", "cache"), d: L("cache", "db", { via: [["cache", "db"]] }), b: L("worker", "bank", { via: [["worker", "bank"]], label: "charge the card" }) }, flows: [{ route: ["a"], bounce: true, rate: 0.35 }, { route: ["c", "d"], bounce: true, rate: 0.3 }, { route: ["b"], bounce: true, rate: 0.3 }] },
      },
      {
        short: "Operations", chapter: "technique", title: "For operations: where it all runs",
        body: ["The people on call do not care how the order handler is built. They want to know where it runs: a cluster in region A, a standby in region B, the database replicated between them.", "The question: when something fails, what is next to it, and what takes over?"],
        changes: ["~ Redrawn by location", "+ Cluster in region A, standby in region B"],
        metrics: { for: "operations", boxes: 6, shows: "where it runs, what takes over" },
        scene: { ents: { k8s, k8sB, web: Object.assign({}, web, { x: -2, y: -9 }), orders: Object.assign({}, orders, { x: 8, y: -9 }), db: Object.assign({}, db, { x: 2, y: -1 }), dbB: Object.assign({}, db, { x: 20, y: 14, label: "Replica", state: "dim" }), ordersB: Object.assign({}, orders, { x: 18, y: 7, label: "Orders, standby", state: "dim" }) }, links: { w: L("web", "orders"), d: L("orders", "db", { via: [["db", "orders"]] }), r: L("db", "dbB", { heads: "end", style: "dashed", label: "replicated", labelAt: 0.75, via: [["db", "dbB"]] }) }, flows: [{ route: ["w", "d"], bounce: true, rate: 0.35 }, { route: ["r"], kind: "msg", rate: 0.3 }] },
      },
      {
        short: "Mixed", chapter: "problem", title: "What goes wrong when the levels mix",
        body: ["The usual diagram has the bank next to the cache next to region B next to the customer, all on one page. Every reader finds half of it irrelevant and the other half too shallow.", "If you cannot say which level a box is at, it is on the wrong drawing."],
        callout: { kind: "warn", text: "One page, one level, one reader. A box from another level is a sign that you are drawing for yourself." },
        metrics: { for: "everyone, so nobody", boxes: 12, shows: "too much and too little" },
        scene: { ents: { users, box: Object.assign({}, box, { state: "dim" }), bank, cache: Object.assign({}, cache, { x: 2, y: 10 }), k8sB: Object.assign({}, k8sB, { x: 14, y: 6, w: 10, d: 10, label: "region B" }), worker: Object.assign({}, worker, { x: -6, y: -8 }) }, links: { u: L("users", "box"), b: L("box", "bank", { via: [["box", "bank"]] }), c: L("box", "cache"), w: L("worker", "box") }, flows: [] },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["Ask <b>who reads it</b> and what question they have, before any box.", "<b>Context</b> for the executive: one box and its neighbours.", "<b>Containers</b> for engineers: what runs and what talks to what.", "<b>Components</b> for the owning team: zoom into one box, keep the edge names.", "<b>Deployment</b> for operations: where it runs and what takes over. One page, one level."],
        callout: { kind: "next", text: "The rest of this lab covers the anatomy of a diagram, lines and boxes, what goes in them, what people leave out, surviving the review, and keeping it true." },
        metrics: { for: "one reader at a time", boxes: "as few as answer the question", shows: "one thing well" },
        scene: { ents: { users, box, bank }, links: { u: L("users", "box"), b: L("box", "bank", { via: [["box", "bank"]] }) }, flows: [{ route: ["u"], bounce: true, rate: 0.3 }] },
      },
    ],
  };
})();
