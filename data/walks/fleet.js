/* Walkthrough: four copies, one router. The layer above a single inference engine. */
(window.WALKS = window.WALKS || {}).fleet = (function () {
  const users = { type: "crowd", x: -18, y: 2, label: "Requests", tint: "sand", n: 4 };
  const router = { type: "block", x: -5, y: 0, label: "The router", glyph: "route", tint: "orange" };
  const copy = (i, x, y, tags, state) => ({ type: "block", x, y, label: "Copy " + i, glyph: "AI", tint: "violet", s: 0.85, tags, state });
  const copies = (tags, states) => ({ c1: copy(1, 8, -16, tags[0], states && states[0]), c2: copy(2, 14, -6, tags[1], states && states[1]), c3: copy(3, 20, 4, tags[2], states && states[2]), c4: copy(4, 26, 14, tags[3], states && states[3]) });
  const board = (lines, title) => ({ type: "panel", x: -5, y: 0, dx: -50, dy: -150, title: title || "this second", lines });
  const L = (from, to, extra) => Object.assign({ from, to, heads: "end" }, extra);
  const fleet = (tags, lines, rates, states) => ({
    ents: Object.assign({ users, router, board: board(lines) }, copies(tags, states)),
    links: { u: L("users", "router"), a: L("router", "c1", { via: [["router", "c1"]] }), b: L("router", "c2"), c: L("router", "c3"), d: L("router", "c4", { via: [["router", "c4"]] }) },
    flows: [{ route: ["u"], rate: 1.2 }, { route: ["a"], rate: rates[0] }, { route: ["b"], rate: rates[1] }, { route: ["c"], rate: rates[2] }, { route: ["d"], rate: rates[3] }].filter((f) => f.rate > 0),
  });
  const hit = { text: "remembers the start", tone: "green" };
  return {
    title: "Four copies, one router",
    summary: "Behind one address sit four copies of the model, and each only remembers what it has read. Route requests evenly, route them by memory, then weigh both; and see what happens when a copy dies.",
    plain: "one inference engine can only serve so many people, so behind one address sit several copies of the model. A router decides which copy takes each request. Each copy only remembers what it has already read, and most requests share the same long opening. Send a request to the copy that already read that opening and it skips the re-read. Send everything there and that copy drowns. This walk tries each rule, then kills a copy.",
    reallife: "Four tellers at a bank. One has already got your file open from last time. Send everyone to the shortest queue and your file gets re-fetched. Send everyone to the teller with their file and that teller has a queue out of the door. The good manager weighs both.",
    startby: "Press Next to try each routing rule, then watch a copy die and the fleet recover. Arrow keys work too.",
    terms: [
      ["router", "the piece in front of the copies that decides which one takes each request"],
      ["inference engine", "the program that runs a model for many users at once on one machine"],
      ["replica", "one running copy of the model; a fleet is several behind one address"],
      ["prefix", "the long shared opening of many prompts, such as the system instructions, that a copy can keep in memory"],
      ["cache hit", "finding the answer already stored, so no work is repeated"],
      ["round robin", "the simplest routing rule: each request to the next copy in turn"],
      ["autoscaling", "adding copies when the queue grows and removing them when it shrinks"],
      ["health check", "a regular small request to each copy to find out whether it is still alive"],
    ],
    metrics: [{ k: "rule", label: "Routing rule" }, { k: "hits", label: "Cache hits, of 12" }, { k: "load", label: "Load per copy" }],
    legend: [{ kind: "req", label: "a request" }, { kind: "res", label: "served from memory" }, { kind: "bad", label: "a request lost" }],
    goals: [
      { text: "Why one address needs several copies and a router", step: 1 },
      { text: "Round robin: even load, wasted memory", step: 2 },
      { text: "Cache-aware routing: hits, but one copy drowns", step: 3 },
      { text: "Weighing both, and recovering when a copy dies", step: 5 },
    ],
    steps: [
      {
        short: "The fleet", chapter: "problem", title: "One address, four copies",
        body: ["Twelve requests a second arrive at one address. One copy of the model can serve three. So four copies sit behind a router, and the router decides where each request goes.", "Every copy only remembers what it has read. Right now, copy 3 is the one that has read the long shared opening that every prompt starts with."],
        callout: { kind: "idea", text: "The engine decides what to run next on one chip. The router decides which chip. That is the layer this lab is about." },
        metrics: { rule: "none yet", hits: null, load: null },
        scene: fleet([null, null, [hit], null], ["12 requests a second", "3 per copy, if even"], [0, 0, 0, 0]),
      },
      {
        short: "Round robin", chapter: "technique", title: "Rule one: each request to the next copy in turn",
        body: ["Round robin: request one to copy 1, request two to copy 2, and so on. The load is perfectly even, three a second each.", "But only the requests that land on copy 3 skip re-reading the shared opening. Three of twelve. The other nine make a copy re-read a thousand tokens it did not have to."],
        changes: ["+ Round robin", "~ Load 3/3/3/3", "~ 3 of 12 hit the memory"],
        metrics: { rule: "round robin", hits: { v: 3, tone: "amber" }, load: { v: "3 / 3 / 3 / 3", tone: "green" } },
        scene: fleet([null, null, [hit], null], ["round robin", "load  3 3 3 3", "hits  3 of 12"], [0.3, 0.3, 0.3, 0.3]),
      },
      {
        short: "By memory", chapter: "technique", title: "Rule two: send everything to the copy that remembers",
        body: ["Route by memory: every request goes to copy 3, because it already holds the shared opening. Twelve hits out of twelve. Nothing is re-read.", "And copy 3 is doing all twelve a second while the other three sit idle. Its queue grows, every user waits, and the other copies' memory of anything fades."],
        callout: { kind: "warn", text: "Every request served from memory while one copy drowns is worse than no memory at all. Hits are not the goal; served requests are." },
        changes: ["~ Route by memory", "~ Load 0/0/12/0", "~ 12 of 12 hit, one copy drowning"],
        metrics: { rule: "by memory only", hits: { v: 12, tone: "green" }, load: { v: "0 / 0 / 12 / 0", tone: "red" } },
        scene: fleet([null, null, [{ text: "remembers · drowning", tone: "red" }], null], ["by memory only", "load  0 0 12 0", "hits  12 of 12"], [0, 0, 1.2, 0], [null, null, "hot", null]),
      },
      {
        short: "Weigh both", chapter: "solution", title: "Rule three: prefer the memory, until it costs too much",
        body: ["Weigh both: send a request to the copy that remembers unless its queue is more than a little longer than the others, then spill to the next. Copy 3 takes seven of the twelve, the rest spread.", "Seven hits instead of three, no copy drowning, and the spilled requests warm the other copies' memory for next time."],
        changes: ["~ Weighted rule: memory first, queue length second", "~ Load 2/2/7/1", "~ 7 of 12 hit"],
        metrics: { rule: "weighed", hits: { v: 7, tone: "green" }, load: { v: "2 / 2 / 7 / 1", tone: "green" } },
        scene: fleet([[{ text: "warming", tone: "amber" }], [{ text: "warming", tone: "amber" }], [hit], null], ["weighed", "load  2 2 7 1", "hits  7 of 12"], [0.2, 0.2, 0.7, 0.1]),
      },
      {
        short: "A copy dies", chapter: "problem", title: "Copy 3 dies at 2am",
        body: ["The chip under copy 3 fails. For a few seconds the router keeps sending it requests, and they vanish. Then the health check fails twice and the router stops.", "The other three take the load. Nobody remembers the shared opening any more, so every request re-reads it, and the wait doubles until the memory warms up again."],
        changes: ["- Copy 3", "~ Requests lost until the health check failed", "~ Load 4/4/0/4, hits 0"],
        metrics: { rule: "weighed", hits: { v: 0, tone: "red" }, load: { v: "4 / 4 / none / 4", tone: "amber" } },
        scene: fleet([null, null, [{ text: "no health check reply", tone: "red" }], null], ["copy 3 down", "load  4 4 - 4", "hits  0 of 12, warming"], [0.4, 0.4, 0.3, 0.4], [null, null, "dead", null]),
      },
      {
        short: "Autoscale", chapter: "solution", title: "Add a copy, warm it, carry on",
        body: ["The queue grew, so the fleet starts a fifth copy. Loading the model takes a minute; it joins the router when its health check passes. The router steers it a share of requests, and within a few seconds it remembers the shared opening too.", "The router's two inputs, memory and queue length, now cover the fleet growing, shrinking and breaking."],
        callout: { kind: "tip", text: "Warm a new copy with real traffic on purpose. A copy that joins cold and gets a full share makes everyone wait." },
        changes: ["+ A new copy, started on the queue growing", "~ Warmed, then given a full share"],
        metrics: { rule: "weighed", hits: { v: 9, tone: "green" }, load: { v: "3 / 3 / 3 / 3", tone: "green" } },
        scene: (() => { const s = fleet([[hit], [hit], [{ text: "new, warmed", tone: "green" }], [hit]], ["a new copy joined", "load  3 3 3 3", "hits  9 of 12"], [0.3, 0.3, 0.3, 0.3]); s.ents.c3 = copy(5, 20, 4, [{ text: "new, warmed", tone: "green" }]); return s; })(),
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["One address, several <b>copies</b>, one <b>router</b>.", "<b>Round robin</b>: even load, wasted memory.", "<b>By memory</b> only: every hit, one copy drowning.", "<b>Weigh both</b>: memory first, queue length second.", "A copy will die: <b>health checks</b> stop the loss, <b>autoscaling</b> adds a copy, warm it before it takes a full share."],
        callout: { kind: "next", text: "The rest of this lab covers discovery, moving the memory between copies, splitting the fleet by job, the planner and autoscaling, and what capacity to accept." },
        metrics: { rule: "weighed", hits: { v: 9, tone: "green" }, load: { v: "3 / 3 / 3 / 3", tone: "green" } },
      },
    ],
  };
})();
