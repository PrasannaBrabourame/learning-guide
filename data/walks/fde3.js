/* Walkthrough: judge it, climb it, pay for it. */
(window.WALKS = window.WALKS || {}).fde3 = (function () {
  const answers = { type: "queue", x: -18, y: 0, label: "Reports to grade", n: 6, dir: [0, 1] };
  const judge = { type: "model", x: -4, y: 0, label: "The judge", glyph: "AI", tint: "violet" };
  const person = { type: "person", x: 6, y: -16, label: "The analyst", tint: "sand" };
  const board = (title, lines, dy) => ({ type: "panel", x: 10, y: -10, dx: -30, dy: dy || -110, title, lines });
  const agent = { type: "block", x: 10, y: 2, label: "The agent", glyph: "agent", tint: "orange" };
  const harness = { type: "block", x: 16, y: -9, label: "The harness", glyph: "loop", tint: "teal", s: 0.9 };
  const bill = { type: "panel", x: 4, y: 12, dx: -30, dy: 10, title: "the bill, before", lines: ["tokens in   124,000", "tokens out   11,000", "= $0.23 a run"] };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const grading = () => ({
    ents: { answers, judge },
    links: { a: L("answers", "judge", { heads: "end" }) },
    flows: [{ route: ["a"], rate: 0.5 }],
  });
  return {
    title: "Judge it, climb it, pay for it",
    summary: "Follow the day's report agent: put its AI judge on trial against an analyst, then climb: change one thing in the harness, measure, keep what helped, and watch the bill while you do it.",
    plain: "by now the agent exists; here it writes investment reports on vacant lots. What is left is the uncomfortable part: deciding whether it is any good, making it better on purpose rather than by feel, and paying for it. An AI judge can grade the reports, but first you check the judge against a person. Then you climb: change one thing, measure, keep it if the score rose. And the bill is tokens, so fewer tokens is the cheapest improvement there is.",
    reallife: "A new examiner at a driving school. Before they grade anyone, they grade twenty tests the senior examiner already marked, and you compare. Only then do you let them score the learners, and only then does changing the lesson plan tell you anything. And every lesson costs fuel.",
    startby: "Press Next to put the judge on trial, then climb with it, then read the bill. Arrow keys work too.",
    terms: [
      ["coding agent", "an AI agent that writes and runs code itself, using the tools and instructions you give it"],
      ["judge", "a model that scores an answer against a rubric; it must itself be checked against people"],
      ["rubric", "the written scoring guide the judge follows: what a 5 looks like, what a 1 looks like"],
      ["criterion", "one thing the rubric scores, such as cost per acre"],
      ["calibrated", "a judge whose scores line up with what people would give; checked, not assumed"],
      ["skill", "a folder of written instructions the agent loads for one kind of task"],
      ["harness", "everything around the model you control: the skills, the tools, the retries, the limits; it is what you change to improve"],
      ["hill climbing", "change one thing, measure, keep it if the score rose, repeat"],
      ["token", "a piece of text about four letters long; models are billed per token in and per token out"],
      ["thinking", "the model's private working before it answers; billed as output tokens"],
    ],
    metrics: [{ k: "agree", label: "Judge agrees with people" }, { k: "score", label: "Means: cost · flood" }, { k: "cost", label: "Bill per run" }],
    legend: [{ kind: "req", label: "a report to grade" }, { kind: "write", label: "a score" }, { kind: "ping", label: "a human check" }, { kind: "res", label: "a change kept" }],
    goals: [
      { text: "Why a judge must be checked against people before it is trusted", step: 3 },
      { text: "Consistent is not the same as right", step: 3 },
      { text: "What the harness is and why it is what you change", step: 5 },
      { text: "Why fewer tokens is the cheapest improvement", step: 7 },
    ],
    steps: [
      {
        short: "Too many", chapter: "problem", title: "Six hundred scores, no time",
        body: ["The report agent writes investment reports on vacant lots. The analysts' rubric scores each report on nineteen criteria, so 32 reports make 608 scores. Every change to the agent means scoring them all again, and nobody has time to do that by hand.", "So a judge model grades them: it reads a report against one criterion and gives a score from 1 to 5."],
        callout: { kind: "idea", text: "A judge turns a pile of reports into a number. The question is whether the number means anything." },
        metrics: { agree: { v: "unknown", tone: "red" }, score: null, cost: null },
        scene: (() => { const s = grading(); s.ents.board = board("rubric: cost per acre", ["5  correct, working shown", "3  correct, no working", "1  wrong or missing"]); return s; })(),
      },
      {
        short: "Erratic", chapter: "problem", title: "The same report, fifteen scores",
        body: ["Give the judge one report fifteen times and ask about one criterion, cost per acre. It scores 2, 4, 3, 5, 1, 4... An analyst scored the same report by hand: 2.", "This judge is a dice roll. Any improvement it reports is noise until it agrees with itself and with people."],
        changes: ["+ Fifteen runs of the same report", "~ Scores from 1 to 5; 4 of 15 match the analyst"],
        metrics: { agree: { v: "4 of 15", tone: "red" }, score: null, cost: null },
        scene: (() => { const s = grading(); s.ents.person = person; s.ents.judge = Object.assign({}, judge, { state: "hot", tags: [{ text: "2 4 3 5 1 4 2 3 ... all over", tone: "red" }] }); s.links.p = L("judge", "person", { style: "dashed", label: "analyst said 2" }); s.flows = [{ route: ["p"], bounce: true, kind: "ping", rate: 0.4 }]; return s; })(),
      },
      {
        short: "Calibrate", chapter: "technique", title: "Calibrate: tighten the rubric until it lines up",
        body: ["Rewrite the criterion with an example report for a 2 and one for a 4. Run the fifteen again: 2, 2, 2, 2, 3, 2... Thirteen of fifteen match the analyst.", "Beware the other failure: a judge that says 4 every single time is perfectly consistent and simply wrong. Agreeing with itself is not the test. Agreeing with people is."],
        callout: { kind: "warn", text: "Check the judge on thirty reports an analyst has already scored. With no labels at all, repeated runs still show whether the judge agrees with itself, but only people can show it is right." },
        changes: ["~ Criterion rewritten with examples", "~ 13 of 15 match the analyst"],
        metrics: { agree: { v: "13 of 15", tone: "green" }, score: null, cost: null },
        scene: (() => { const s = grading(); s.ents.person = person; s.ents.judge = Object.assign({}, judge, { tags: [{ text: "2 2 2 2 3 2 2 2 ... lines up", tone: "green" }] }); s.links.p = L("judge", "person", { style: "dashed" }); s.flows = [{ route: ["a"], rate: 0.5 }, { route: ["p"], bounce: true, kind: "ping", rate: 0.3 }]; return s; })(),
      },
      {
        short: "A number", chapter: "technique", title: "Now the number means something",
        body: ["With a judge you trust, score the ten target reports on the two criteria the sponsors insist on: cost per acre and neighbouring flood risk. Both means come out at 2.1 out of 5. The bar is above four on both.", "That is the baseline, and for the first time it is a number you can defend. Every change from here is measured against it."],
        changes: ["+ Baseline: 2.1 and 2.1 across ten reports"],
        metrics: { agree: { v: "13 of 15", tone: "green" }, score: "2.1 · 2.1", cost: "$0.19 a run" },
        scene: (() => { const s = grading(); s.ents.agent = agent; s.links.g = L("agent", "answers", { heads: "end", via: [["agent", "answers"]] }); s.ents.board = board("baseline, ten reports", ["cost per acre    2.1", "flood risk       2.1", "= bar: above 4 on both"], -100); s.flows = [{ route: ["g"], kind: "res", rate: 0.5 }, { route: ["a"], rate: 0.5 }]; return s; })(),
      },
      {
        short: "Harness", chapter: "insight", title: "You climb by changing the harness, not the model",
        body: ["The model is a fixed thing you rent. What you own is the harness around it: the skills (its written instructions), which tools it has, how results are fed back, when it retries, when it stops.", "Read the judge's reasons for every lot at four or below. They name what the agent lacks: it took lot size in square feet, and it checked only the lot's own flood zone. Each reason points at one change to the harness."],
        callout: { kind: "idea", text: "Swapping the model is one change among many, and usually not the first to try. The harness is where the leverage is." },
        changes: ["+ The harness: skills, tools, retries"],
        metrics: { agree: { v: "13 of 15", tone: "green" }, score: "2.1 · 2.1", cost: "$0.19 a run" },
        scene: (s) => { s.ents.harness = Object.assign({}, harness, { tags: [{ text: "skills · tools · retries", tone: "blue" }] }); s.links.h = L("agent", "harness", { style: "dashed" }); return s; },
      },
      {
        short: "Climb", chapter: "solution", title: "Change one thing, measure, keep or drop",
        body: ["Fix the units (lot size arrives in square feet) and show the working: cost per acre 4.7. Keep. Look up flood zones for the neighbouring lots: flood risk 4.1. Keep, but one run that close to the bar can wobble under it. Cite the source for every number: 4.8. Keep. Cap reports at 400 words: flood risk falls to 4.2, because the neighbour analysis gets cut off. Drop it.", "Four changes, three kept, one dropped, and the means went from 2.1 to 4.7 and 4.8 on purpose."],
        changes: ["+ Units fixed: cost 4.7, kept", "+ Neighbours' zones: flood 4.1, kept", "+ Sources cited: flood 4.8, kept", "- 400 word cap: flood 4.2, dropped"],
        metrics: { agree: { v: "13 of 15", tone: "green" }, score: { v: "4.7 · 4.8", tone: "green" }, cost: "$0.23 a run" },
        scene: (s) => { s.ents.board = board("the climb, one run each", ["units:      cost  4.7 keep", "neighbours: flood 4.1 keep", "sources:    flood 4.8 keep", "400 words:  flood 4.2 drop"], -114); s.flows = [{ route: ["h"], bounce: true, kind: "res", rate: 0.4 }, { route: ["g"], kind: "res", rate: 0.5 }, { route: ["a"], rate: 0.5 }]; return s; },
      },
      {
        short: "The bill", chapter: "tradeoff", title: "Pay for it: the bill is tokens",
        body: ["Every run is billed in tokens. The ten reports send about 124,000 tokens in and get 11,000 back, thinking included. At the lab's prices for the Pro model ($1 per million in, $10 per million out) that is $0.23 a run, up from $0.19 before the climb.", "The cheapest improvement is usually fewer tokens: trim the skills, send only the neighbours' flood rows, think less on the look-ups. A run falls to $0.16, nearly a third less, and on lots you never tuned on both means stay above four."],
        callout: { kind: "tip", text: "Measure cost per run alongside the score. A change that lifts the score by a tenth and doubles the cost is usually a bad trade." },
        changes: ["~ Skills trimmed, only the neighbours' flood rows sent", "~ Means 4.6 and 4.5, bill $0.16 a run"],
        metrics: { agree: { v: "13 of 15", tone: "green" }, score: { v: "4.6 · 4.5", tone: "green" }, cost: { v: "$0.16 a run", tone: "green" } },
        scene: (s) => { s.ents.bill = bill; s.ents.board = board("fewer tokens", ["in   124,000 → 81,000", "out   11,000 →  8,000", "means 4.6 · 4.5", "= $0.16 a run"], -114); return s; },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["A <b>judge</b> turns reports into a number; check it against <b>people</b> first.", "<b>Consistent</b> is not <b>right</b>: a judge that always says 4 is useless.", "Improve by changing the <b>harness</b>: read the judge's reasons, change one thing, measure, keep or drop.", "The bill is <b>tokens</b>; fewer tokens is the cheapest improvement, and the means held."],
        callout: { kind: "next", text: "The rest of day three puts the judge on trial in detail, climbs with it, opens a coding agent's harness, meters the bill and keeps the whole thing honest." },
        metrics: { agree: { v: "13 of 15", tone: "green" }, score: { v: "4.6 · 4.5", tone: "green" }, cost: { v: "$0.16 a run", tone: "green" } },
      },
    ],
  };
})();
