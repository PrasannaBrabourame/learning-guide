/* Walkthrough: four little machines that still run the world, and how to pick one. */
(window.WALKS = window.WALKS || {}).classic = (function () {
  const data = { type: "db", x: -16, y: -10, label: "Past cases, labelled", tint: "violet" };
  const unl = { type: "db", x: -16, y: -10, label: "Past cases, no labels", tint: "slate" };
  const q = { type: "person", x: -18, y: 14, label: "A new case", tint: "sand" };
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
    summary: "A new case arrives. Ask the nearest neighbours, play twenty questions, draw a line through the dots, or sort by what clusters together: four machines, one picture each, and the question that chooses between them.",
    plain: "long before chatbots, four small learning machines were doing most of the useful work, and they still are. One remembers every example and asks the nearest ones. One plays twenty questions. One draws the best straight line through the dots. One groups things that look alike without being told what they are. This walk runs a new case through each, then asks the one question that picks the machine: what do you actually have?",
    reallife: "A new neighbour moves in and you want to guess their favourite sport. You could ask the three nearest houses. You could run through a flowchart of questions. You could plot age against hours outdoors for everyone you know and read off the line. Or you could notice the street sorts itself into runners and cyclists without anyone saying so.",
    startby: "Press Next to send the new case through each machine and read how it decided. Arrow keys work too.",
    terms: [
      ["label", "the right answer attached to a past case, such as paid or did not pay"],
      ["nearest neighbours", "a machine that remembers every past case and answers a new one by majority vote of the k most similar"],
      ["decision tree", "a machine that asks one yes-or-no question at a time until it reaches an answer; it can be read like a flowchart"],
      ["regression", "a machine that fits a line through past cases so a new one can be read off it as a number"],
      ["clustering", "grouping cases that look alike when nobody has labelled them; the machine invents the groups"],
      ["k", "how many neighbours get a vote; too few and one odd case decides, too many and everything blurs into the average"],
    ],
    metrics: [{ k: "have", label: "What you have" }, { k: "machine", label: "The machine" }, { k: "answer", label: "Its answer for the new case" }],
    legend: [{ kind: "write", label: "learning from past cases" }, { kind: "req", label: "the new case" }, { kind: "res", label: "the answer" }],
    goals: [
      { text: "Nearest neighbours: remember everything, ask the closest", step: 1 },
      { text: "A decision tree: twenty questions you can read", step: 2 },
      { text: "Regression: a line through the dots gives a number", step: 3 },
      { text: "Clustering: groups with no labels at all", step: 4 },
      { text: "The one question that picks the machine", step: 5 },
    ],
    steps: [
      {
        short: "Neighbours", chapter: "technique", title: "Ask the nearest neighbours",
        body: ["A loan application arrives. The first machine does not learn at all: it keeps every past application, with whether it was repaid, and finds the five most similar to this one. Four repaid, one did not. Answer: likely to repay.", "Pick k, the number of neighbours, with care. k of 1 lets one odd old case decide; k of 500 just returns the overall average."],
        callout: { kind: "idea", text: "The simplest machine is a filing cabinet and a tape measure. It is often good enough, and it is always worth running first." },
        metrics: { have: "labelled past cases", machine: "nearest neighbours", answer: { v: "repay (4 of 5 neighbours did)", tone: "green" } },
        scene: run(data, machine("Nearest neighbours", "k=5", "blue", [{ text: "5 most similar: 4 repaid", tone: "blue" }]), out("Likely to repay", "green"), sheet(["find the 5 most similar", "4 repaid, 1 did not", "= likely to repay"], "how it decided")),
      },
      {
        short: "Tree", chapter: "technique", title: "Play twenty questions",
        body: ["The second machine learns a flowchart from the past cases: <em>income above 30k? yes. Any missed payments last year? no. Loan under 10k? yes.</em> Answer: repay.", "You can read every decision it makes, which is why banks and doctors like it. It can also be fooled by one unusual question near the top."],
        changes: ["~ The same case through a decision tree"],
        metrics: { have: "labelled past cases", machine: "decision tree", answer: { v: "repay (3 questions)", tone: "green" } },
        scene: run(data, machine("Decision tree", "tree", "green", [{ text: "income? → missed payments? → size?", tone: "green" }]), out("Likely to repay", "green"), sheet(["income over 30k?     yes", "missed payments?     no", "loan under 10k?      yes", "= repay"], "the questions it asked")),
      },
      {
        short: "A line", chapter: "technique", title: "Draw a line through the dots",
        body: ["Suppose the question is not yes or no but <em>how much?</em> The third machine plots past cases, income against the amount they safely repaid, and fits the best straight line. Read the new applicant's income off the line: about 8,400.", "A number, with a sense of how sure it is from how tightly the dots hug the line."],
        changes: ["~ Asking how much, not yes or no"],
        metrics: { have: "labelled, with amounts", machine: "regression", answer: { v: "about 8,400", tone: "green" } },
        scene: run(data, machine("Regression", "line", "amber", [{ text: "best line through the dots", tone: "amber" }]), out("About 8,400", "amber"), sheet(["income     amount", " 24k         6,100", " 31k         7,900", " 38k         9,600", "= 33k → about 8,400"], "the line")),
      },
      {
        short: "Groups", chapter: "technique", title: "Sort into groups with no labels",
        body: ["Now there are no labels at all: ten thousand customers and what they bought. The fourth machine groups the ones that look alike and hands back the groups: weekend bulk buyers, weekday lunch buyers, once-a-year gift buyers.", "Nobody told it those groups existed. Naming them is your job, and so is deciding whether they are real."],
        callout: { kind: "warn", text: "Clustering always finds groups, even in random noise. Check that a group means something before you act on it." },
        changes: ["~ No labels: the machine invents the groups"],
        metrics: { have: "no labels", machine: "clustering", answer: { v: "3 groups found", tone: "amber" } },
        scene: run(unl, machine("Clustering", "sort", "violet", [{ text: "3 groups, named by you", tone: "violet" }]), out("Three groups", "violet"), sheet(["weekend bulk buyers", "weekday lunch buyers", "once-a-year gift buyers", "# are these real?"], "what it found")),
      },
      {
        short: "Which one", chapter: "insight", title: "The question that picks the machine",
        body: ["Before choosing, ask what you have. Labelled past cases and a yes-or-no question: neighbours or a tree. Labelled cases and a number to predict: a line. No labels: clustering.", "Then ask what you need: a number, a yes or no, or a reason you can read out. The tree is the only one that gives you the reason."],
        metrics: { have: "ask first", machine: "depends", answer: "depends" },
        scene: { ents: { data, unl: Object.assign({}, unl, { x: -16, y: 8, label: "No labels" }), m1: machine("Yes or no", "k=5", "blue"), m2: Object.assign(machine("How much", "line", "amber"), { x: 10, y: -8 }), m3: Object.assign(machine("What groups", "sort", "violet"), { x: 10, y: 12 }) }, links: { a: L("data", "m1", { label: "labelled", labelAt: 0.65 }), b: L("data", "m2", { via: [["data", "m2"]] }), c: L("unl", "m3", { via: [["unl", "m3"]], label: "unlabelled", labelAt: 0.7 }) }, flows: [{ route: ["a"], rate: 0.3, kind: "write" }, { route: ["b"], rate: 0.3, kind: "write" }, { route: ["c"], rate: 0.3, kind: "write" }] },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["<b>Nearest neighbours</b>: remember everything, let the k most similar vote.", "A <b>decision tree</b>: twenty questions you can read out loud.", "<b>Regression</b>: a line through the dots gives a number.", "<b>Clustering</b>: groups with no labels; check they are real.", "Pick by what you <b>have</b> (labels or not) and what you <b>need</b> (a number, a yes or no, a reason)."],
        callout: { kind: "next", text: "The rest of this lab runs each machine in detail, then the 1958 machine that led to today's networks, and which machine to reach for." },
        metrics: { have: "ask first", machine: "depends", answer: "depends" },
        scene: run(data, machine("Nearest neighbours", "k=5", "blue"), out("Likely to repay", "green"), sheet(["what do you have?", "what do you need?"], "pick by")),
      },
    ],
  };
})();
