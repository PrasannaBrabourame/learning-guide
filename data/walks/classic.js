/* Walkthrough: the lab's own class, the new kid, and the four little machines, in tab order. */
(window.WALKS = window.WALKS || {}).classic = (function () {
  const data = { type: "db", x: -16, y: -10, label: "Class, labelled", tint: "violet" };
  const unl = { type: "db", x: -16, y: -10, label: "Class, no labels", tint: "slate" };
  const q = { type: "person", x: -18, y: 14, label: "The new kid", tint: "sand" };
  const machine = (label, glyph, tint, tags) => ({ type: "block", x: -2, y: 2, label, glyph, tint, tags });
  const out = (label, tint, tags) => ({ type: "block", x: 14, y: 2, label, glyph: "out", tint, s: 0.85, tags });
  const sheet = (lines, title) => ({ type: "panel", x: 14, y: 2, dx: 10, dy: -120, title, lines });
  const L = (from, to, extra) => Object.assign({ from, to, heads: "end" }, extra);
  const run = (src, m, o, p) => ({
    ents: { src, q, machine: m, out: o, sheet: p },
    links: { d: L("src", "machine", { label: "learn from", labelAt: 0.62 }), n: L("q", "machine", { via: [["q", "machine"]] }), a: L("machine", "out") },
    flows: [{ route: ["d"], rate: 0.4, kind: "write" }, { route: ["n", "a"], rate: 0.4, speed: 70 }],
  });
  return {
    title: "Four little machines, and how to pick one",
    summary: "A new kid joins the class. Ask the nearest neighbours, play twenty questions, park the food trucks or draw the 1958 line: four machines, one picture each, and the question that chooses between them.",
    plain: "long before chatbots, four small learning machines were doing most of the useful work, and they still are. One remembers every learner and asks the nearest ones. One plays twenty questions. One parks food trucks to find groups nobody labelled. One draws a single straight line, the way it was done in 1958. This walk sends the new kid from this lab&rsquo;s class through each, then asks the one question that picks the machine: what do you actually have?",
    reallife: "A new neighbour moves in and you want to guess their favourite sport. You could ask the three nearest houses. You could run through a flowchart of questions. You could notice the street already sorts itself into runners and cyclists without anyone saying so. Or you could draw one line on a chart of age against hours outdoors, runners on one side and cyclists on the other, and shift it each time you guess wrong.",
    startby: "Press Next to send the new kid through each machine and read how it decided. Arrow keys work too.",
    terms: [
      ["label", "the right answer recorded for a past learner: needs support or on track"],
      ["nearest neighbours", "a machine that remembers every past learner and answers for a new one by majority vote of the k most similar"],
      ["decision tree", "a machine that asks one yes-or-no question at a time until it reaches an answer; it can be read like a flowchart"],
      ["clustering", "grouping learners that look alike when nobody has labelled them; the machine finds the groups, you name them"],
      ["perceptron", "the 1958 machine: one straight line between two groups, tilted a little after each mistake"],
      ["k", "how many neighbours get a vote; too few and one odd learner decides, too many and everything blurs into the class majority"],
    ],
    metrics: [{ k: "have", label: "What you have" }, { k: "machine", label: "The machine" }, { k: "answer", label: "Its answer for the new kid" }],
    legend: [{ kind: "write", label: "learning from the class" }, { kind: "req", label: "the new kid" }, { kind: "res", label: "the verdict" }],
    goals: [
      { text: "The new kid: remember everything, ask the nearest", step: 1 },
      { text: "Twenty questions: a decision tree you can read", step: 2 },
      { text: "The food trucks: groups with no labels at all", step: 3 },
      { text: "The 1958 machine: one line, nudged by mistakes", step: 4 },
      { text: "The one question that picks the machine", step: 5 },
    ],
    steps: [
      {
        short: "The new kid", chapter: "technique", title: "Ask the new kid's nearest neighbours",
        body: ["A new kid joins the class: 22 minutes of reading a day, a comprehension score of 47. The first machine does not learn at all. It keeps all thirty-one past learners, each marked needs support or on track, and finds the five closest to the new kid on the chart. All five needed support. Verdict: needs support.", "Pick k, the number of neighbours, with care. k of 1 lets one wrongly recorded learner decide; k of 31 asks the whole class and just returns its majority."],
        callout: { kind: "idea", text: "The simplest machine is a filing cabinet and a tape measure. It is often good enough, and it is always worth running first." },
        metrics: { have: "31 labelled learners", machine: "nearest neighbours", answer: { v: "needs support (5 of 5)", tone: "red" } },
        scene: run(data, machine("Nearest neighbours", "k=5", "blue", [{ text: "5 nearest: 5 need support", tone: "blue" }]), out("Needs support", "rose"), sheet(["find 5 nearest learners", "5 need support", "0 on track", "= needs support"], "how it decided")),
      },
      {
        short: "20 questions", chapter: "technique", title: "Play twenty questions",
        body: ["The second machine learns a flowchart from the labelled class, picking each question that best sorts it. Its first question: <em>comprehension under 55?</em> The new kid scores 47: yes. Flag for support. One question was enough.", "A learner scoring 60 would face a second question: <em>fewer than 15 minutes a day?</em> You can read every decision aloud, which is why schools and doctors like it. It can also be rebuilt from top to bottom by one unusual learner."],
        changes: ["~ The same new kid through a decision tree"],
        metrics: { have: "labelled learners", machine: "decision tree", answer: { v: "needs support (1 question)", tone: "red" } },
        scene: run(data, machine("Decision tree", "tree", "green", [{ text: "comprehension? → minutes?", tone: "green" }]), out("Needs support", "rose"), sheet(["comprehension under 55?", "47: yes", "= flag for support", "# a 60 is asked next:", "# under 15 minutes?"], "the questions it asked")),
      },
      {
        short: "Food trucks", chapter: "technique", title: "Park the food trucks",
        body: ["Now take sixty learners at the start of the year, before any assessment: no labels at all. The third machine parks three food trucks on the chart. Every learner walks to the nearest truck, every truck drives to the middle of its crowd, and the two moves repeat until nothing moves.", "This is clustering. Three reading groups appear that nobody taught it: few minutes and low scores, middling, and many minutes with top scores. The new kid joins the nearest truck, the first group. Naming the groups is your job, and so is checking they are real."],
        callout: { kind: "warn", text: "Clustering always finds groups, even in random noise. Check that a group means something before you act on it." },
        changes: ["~ No labels: the machine finds the groups"],
        metrics: { have: "60 learners, no labels", machine: "food trucks", answer: { v: "joins group 1 of 3", tone: "violet" } },
        scene: run(unl, machine("Food trucks", "trucks", "violet", [{ text: "3 trucks, 2 moves", tone: "violet" }]), out("Joins group 1", "violet"), sheet(["group 1: 11 min, low 30s", "group 2: 42 min, mid 60s", "group 3: 52 min, high 80s", "# the names are yours"], "what it found")),
      },
      {
        short: "1958 machine", chapter: "technique", title: "Draw the 1958 line",
        body: ["Back to labelled learners. The fourth machine, the perceptron, draws one straight line across the chart: needs support on one side, on track on the other. It starts in the wrong place, with 17 of 24 learners on the wrong side. Each mistake tilts it a little away from that learner; a success never moves it.", "After 7 nudges no mistakes are left, and it stops for good. The new kid lands on the support side. Today&rsquo;s upgrade shades the chart instead of drawing a hard edge: the further from the line, the surer the verdict."],
        changes: ["~ Back to labels: one line splits the class"],
        metrics: { have: "24 labelled learners", machine: "the 1958 line", answer: { v: "needs support", tone: "red" } },
        scene: run(data, machine("The 1958 line", "line", "amber", [{ text: "tilts after each mistake", tone: "amber" }]), out("Needs support", "rose"), sheet(["start: 17 of 24 wrong", "each mistake tilts it", "7 nudges: 0 wrong", "= new kid: support side"], "the line")),
      },
      {
        short: "Which one", chapter: "insight", title: "The question that picks the machine",
        body: ["Before choosing, ask what you have. Learners already marked needs support or on track: the neighbours, the tree or the line. No marks yet: the food trucks.", "Then ask what you need. A verdict today with no training: the neighbours. A reason a teacher can read aloud: the tree. A confidence, fast and cheap: the line. Groups nobody has named yet: the trucks."],
        metrics: { have: "ask first", machine: "depends", answer: "depends" },
        scene: { ents: { data, unl: Object.assign({}, unl, { x: -16, y: 8, label: "No labels" }), m1: machine("Flag or not", "tree", "blue"), m2: Object.assign(machine("How sure", "line", "amber"), { x: 10, y: -8 }), m3: Object.assign(machine("What groups", "trucks", "violet"), { x: 10, y: 12 }) }, links: { a: L("data", "m1", { label: "labelled", labelAt: 0.65 }), b: L("data", "m2", { via: [["data", "m2"]] }), c: L("unl", "m3", { via: [["unl", "m3"]], label: "unlabelled", labelAt: 0.7 }) }, flows: [{ route: ["a"], rate: 0.3, kind: "write" }, { route: ["b"], rate: 0.3, kind: "write" }, { route: ["c"], rate: 0.3, kind: "write" }] },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["<b>The new kid</b>: nearest neighbours remember everything and let the k closest learners vote.", "<b>Twenty questions</b>: a decision tree you can read out loud.", "<b>The food trucks</b>: clustering finds groups with no labels; check they are real.", "<b>The 1958 machine</b>: one line, nudged by each mistake; today it also says how sure it is.", "Pick by what you <b>have</b> (labels or not) and what you <b>need</b> (a verdict, a reason, a confidence or groups)."],
        callout: { kind: "next", text: "The next four tabs run each machine in detail on the same class. Then comes the lamp-and-shadow trick for data with too many columns to chart, and which machine to reach for." },
        metrics: { have: "ask first", machine: "depends", answer: "depends" },
        scene: run(data, machine("Nearest neighbours", "k=5", "blue"), out("Needs support", "rose"), sheet(["what do you have?", "what do you need?"], "pick by")),
      },
    ],
  };
})();
