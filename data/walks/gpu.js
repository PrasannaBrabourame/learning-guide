/* Walkthrough: the memory ladder. Where the data sits decides how fast the chip can work. */
(window.WALKS = window.WALKS || {}).gpu = (function () {
  const alu = { type: "block", x: -4, y: -4, label: "The arithmetic units", glyph: "math", tint: "orange" };
  const reg = { type: "db", x: 10, y: -13, label: "Registers", tint: "green", s: 0.8 };
  const shared = { type: "db", x: 16, y: -4, label: "Shared memory", tint: "teal", s: 0.9 };
  const l2 = { type: "db", x: 20, y: 5, label: "L2 cache", tint: "blue" };
  const hbm = { type: "db", x: 23, y: 14, label: "The card's main memory", tint: "violet", s: 1.1 };
  const host = { type: "db", x: -18, y: 14, label: "The computer's memory", tint: "slate", s: 1.2 };
  const crate = (at, text, dx) => Object.assign({}, at, { tags: [{ text, tone: "amber", dx: dx || 0 }] });
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const ladder = () => ({
    ents: { alu, reg, shared, l2, hbm, host },
    links: { r: L("alu", "reg", { via: [["alu", "reg"]] }), s: L("alu", "shared"), c: L("alu", "l2", { via: [["alu", "l2"]] }), h: L("alu", "hbm", { via: [["alu", "hbm"]] }), p: L("alu", "host", { via: [["alu", "host"]], style: "dashed", label: "over the link" }) },
    flows: [],
  });
  const fetchFrom = (id, speed, kind) => { const s = ladder(); s.flows = [{ route: [id], bounce: true, rate: 0.5, speed, kind: kind || "req" }]; return s; };
  return {
    title: "The memory ladder: where the data sits decides the speed",
    summary: "A graphics chip does its sums in one place, and the numbers it needs may be stored on any of five floors, each slower to reach than the one above: about 1 cycle at the top, about 10,000 at the bottom. Fetch from each floor and watch the clock.",
    plain: "a graphics chip can do thousands of sums at once, but only on numbers it is holding right now. Those numbers live on a ladder of memories: a tiny fast one next to the sums, then bigger and slower ones, down to the computer's own memory at the far end of the link that plugs the card in. Each rung down is slower: about 1 tick of the clock at the top, about 10,000 at the bottom. This walk fetches the same number from each rung and reads the clock, then shows what fast code does about it.",
    reallife: "A chef with a hand's reach of chopping board, a shelf behind, a fridge across the kitchen, a storeroom down the corridor, and a wholesaler across town. The knife work is the same speed everywhere; what decides the night is how often the chef has to walk.",
    startby: "Press Next to fetch a number from each floor in turn, top to bottom, and read the clock; then see what fast code does. Arrow keys work too.",
    terms: [
      ["HBM", "high-bandwidth memory: the card’s own main memory, 80 gigabytes on the A100, roomy but slow to reach"],
      ["arithmetic units", "the parts of the chip that actually do the sums; thousands of them, all at once"],
      ["registers", "the tiny store right next to the arithmetic units; the fastest memory there is and the smallest"],
      ["shared memory", "a small fast scratchpad a group of threads on the chip can share, one floor below registers"],
      ["cache", "a copy of recently used data kept closer to the sums than the main memory, so the next read is quicker"],
      ["cycle", "one tick of the chip's clock; a sum takes about one, a fetch from main memory takes hundreds"],
      ["bandwidth", "how much data can move between two floors per second; the real limit on most model code"],
      ["tiling", "cutting a big calculation into blocks small enough to live on the fast floors while they are worked on"],
    ],
    metrics: [{ k: "floor", label: "Fetching from" }, { k: "cycles", label: "Cycles to fetch" }, { k: "idle", label: "Sums waiting" }],
    legend: [{ kind: "req", label: "a fetch going out" }, { kind: "res", label: "data coming back" }, { kind: "heavy", label: "a large load moving" }],
    goals: [
      { text: "The five floors of memory and how far apart they are", step: 5 },
      { text: "Why the sums spend most of their time waiting", step: 6 },
      { text: "What fast code does: fetch once, reuse many times", step: 7 },
    ],
    steps: [
      {
        short: "The sums", chapter: "problem", title: "Thousands of sums, nothing to add",
        body: ["The chip's arithmetic units can do thousands of multiplications per tick of the clock. On their own, they are idle: a sum needs numbers, and the numbers are somewhere else.", "This is the graphics chip from the two machines above: it spent its silicon on sums, not on hiding slow memory, so where the numbers are decides everything."],
        callout: { kind: "idea", text: "A graphics chip is rarely limited by how fast it can add. It is limited by how fast it can be fed." },
        metrics: { floor: "nowhere yet", cycles: null, idle: { v: "all of them", tone: "red" } },
        scene: { ents: { alu: Object.assign({}, alu, { tags: [{ text: "waiting for numbers", tone: "amber" }] }) }, links: {}, flows: [] },
      },
      {
        short: "Registers", chapter: "technique", title: "Floor one: registers, about one cycle",
        body: ["The number is in a register, right beside the arithmetic unit. Fetching it takes about one tick. The sum happens at full speed.", "Registers are tiny: a few dozen numbers per thread. Everything cannot live here, so the question is what does."],
        changes: ["+ Fetch from registers: 1 cycle"],
        metrics: { floor: "registers", cycles: { v: "~1", tone: "green" }, idle: { v: "none", tone: "green" } },
        scene: (() => { const s = fetchFrom("r", 120); s.ents.reg = crate(reg, "1 cycle"); return s; })(),
      },
      {
        short: "Shared", chapter: "technique", title: "Floor two: shared memory, about thirty",
        body: ["One floor down: a scratchpad shared by the threads of one block. About thirty cycles to fetch.", "Still close. A sum that waits thirty cycles for every number runs at a thirtieth of full speed, unless the chip has other work queued to switch to meanwhile. That queue is how a graphics chip hides the wait."],
        changes: ["+ Fetch from shared memory: ~30 cycles"],
        metrics: { floor: "shared memory", cycles: { v: "~30", tone: "green" }, idle: "a few" },
        scene: (() => { const s = fetchFrom("s", 90); s.ents.shared = crate(shared, "~30 cycles"); return s; })(),
      },
      {
        short: "L2", chapter: "technique", title: "Floor three: the cache, about two hundred",
        body: ["The L2 cache holds copies of recently used data for the whole chip. About two hundred cycles away.", "Now the units are properly waiting. Two hundred ticks is two hundred sums that did not happen."],
        changes: ["+ Fetch from L2: ~200 cycles"],
        metrics: { floor: "L2 cache", cycles: { v: "~200", tone: "amber" }, idle: { v: "most", tone: "amber" } },
        scene: (() => { const s = fetchFrom("c", 60); s.ents.l2 = crate(l2, "~200 cycles"); return s; })(),
      },
      {
        short: "Main memory", chapter: "technique", title: "Floor four: the card's main memory, about 450",
        body: ["The card's main memory (HBM in the table above) is where the model's weights actually live: 80 gigabytes on the A100, about 450 cycles away.", "Every weight a model uses comes from here at least once. Fast code fetches each one once and reuses it many times on the upper floors."],
        callout: { kind: "tip", text: "The number that matters is how many sums you do per byte fetched from here. The A100 needs about 150, the number from the first card; fewer, and the chip waits." },
        changes: ["+ Fetch from the card's main memory: ~450 cycles"],
        metrics: { floor: "card's main memory", cycles: { v: "~450", tone: "amber" }, idle: { v: "nearly all", tone: "red" } },
        scene: (() => { const s = fetchFrom("h", 45); s.ents.hbm = crate(hbm, "~450 cycles · weights", -65); return s; })(),
      },
      {
        short: "Off the card", chapter: "problem", title: "Floor five: the computer's memory, about ten thousand",
        body: ["If the data is not on the card at all, it comes from the computer's own memory, over the link that plugs the card in. About ten thousand cycles.", "Code that fetches from here inside a loop is slow in a way no clever arithmetic can fix. Every such trip has to be designed out."],
        changes: ["+ Fetch over the link: ~10,000 cycles"],
        metrics: { floor: "the computer's memory", cycles: { v: "~10,000", tone: "red" }, idle: { v: "all of them", tone: "red" } },
        scene: (() => { const s = fetchFrom("p", 30, "heavy"); s.ents.host = crate(host, "~10,000 cycles"); s.ents.alu = Object.assign({}, alu, { state: "hot" }); return s; })(),
      },
      {
        short: "Fast code", chapter: "solution", title: "What fast code does: fetch once, reuse many times",
        body: ["Cut the calculation into tiles small enough to fit on the upper floors. Fetch a tile from main memory once, in one piece, then do every sum that needs it from shared memory and registers before fetching the next.", "The same sums, far fewer trips: with tiles 32 wide, each number comes up from main memory 32 times less often. That is the whole trick behind every fast kernel."],
        callout: { kind: "idea", text: "Count fetches, not sums. Then arrange the work so that each fetch from a slow floor feeds as many sums as possible." },
        changes: ["+ Each tile fetched once, in one piece", "~ Sums run from the top two floors"],
        metrics: { floor: "mostly the top two", cycles: { v: "~1 to 30", tone: "green" }, idle: { v: "few", tone: "green" } },
        scene: (() => { const s = ladder(); s.ents.hbm = crate(hbm, "one tile at a time", -65); s.ents.shared = crate(shared, "the tile, reused"); s.flows = [{ route: ["h"], reverse: true, kind: "heavy", rate: 0.15, speed: 45 }, { route: ["s"], bounce: true, rate: 0.9, speed: 110 }, { route: ["r"], bounce: true, rate: 1.1, speed: 130 }]; return s; })(),
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["The chip is limited by how fast it is <b>fed</b>, not how fast it adds.", "Five floors: <b>registers</b> ~1, <b>shared memory</b> ~30, <b>L2</b> ~200, <b>the card's main memory</b> ~450, <b>the computer's memory</b> ~10,000 cycles.", "Fast code <b>fetches once and reuses many times</b>: tiles on the upper floors.", "Count fetches, not sums."],
        callout: { kind: "next", text: "The memory ladder tab takes each floor in turn. The rest of this lab covers threads and warps, the roofline, access patterns, tiling, tensor cores, fusion and compilers." },
        metrics: { floor: "mostly the top two", cycles: { v: "~1 to 30", tone: "green" }, idle: { v: "few", tone: "green" } },
      },
    ],
  };
})();
