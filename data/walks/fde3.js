/* Walkthrough: judge it, climb it, pay for it. */
(window.WALKS = window.WALKS || {}).fde3 = (function () {
  const answers = { type: "queue", x: -18, y: 0, label: "Answers to grade", n: 6, dir: [0, 1] };
  const judge = { type: "model", x: -4, y: 0, label: "The judge", glyph: "AI", tint: "violet" };
  const person = { type: "person", x: 6, y: -16, label: "A person's scores", tint: "sand" };
  const board = (title, lines, dy) => ({ type: "panel", x: 10, y: -10, dx: -30, dy: dy || -110, title, lines });
  const agent = { type: "block", x: 10, y: 2, label: "The agent", glyph: "agent", tint: "orange" };
  const harness = { type: "block", x: 16, y: -9, label: "The harness", glyph: "loop", tint: "teal", s: 0.9 };
  const bill = { type: "panel", x: 4, y: 12, dx: -30, dy: 10, title: "the bill", lines: ["tokens in   12,400", "tokens out   1,100", "= $0.19 a run"] };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const grading = () => ({
    ents: { answers, judge },
    links: { a: L("answers", "judge", { heads: "end" }) },
    flows: [{ route: ["a"], rate: 0.5 }],
  });
  return {
    title: "Judge it, climb it, pay for it",
    summary: "Put the AI judge on trial against a person, then use it to climb: change one thing in the harness, measure, keep what helped, and watch the bill while you do it.",
    plain: "by now the agent exists. What is left is the uncomfortable part: deciding whether it is any good, making it better on purpose rather than by feel, and paying for it. An AI judge can grade answers, but first you check the judge against a person. Then you climb: change one thing, measure, keep it if the score rose. And the bill is tokens, so fewer tokens is the cheapest improvement there is.",
    reallife: "A new examiner at a driving school. Before they grade anyone, they grade twenty tests the senior examiner already marked, and you compare. Only then do you let them score the learners, and only then does changing the lesson plan tell you anything. And every lesson costs fuel.",
    startby: "Press Next to put the judge on trial, then climb with it, then read the bill. Arrow keys work too.",
    terms: [
      ["judge", "a model that scores an answer against a rubric; it must itself be checked against people"],
      ["rubric", "the written scoring guide the judge follows: what a 5 looks like, what a 1 looks like"],
      ["calibrated", "a judge whose scores line up with what people would give; checked, not assumed"],
      ["harness", "everything around the model you control: the prompt, the tools, the retries, the limits; it is what you change to improve"],
      ["hill climbing", "change one thing, measure, keep it if the score rose, repeat"],
      ["token", "a piece of text about four letters long; models are billed per token in and per token out"],
    ],
    metrics: [{ k: "agree", label: "Judge agrees with people" }, { k: "score", label: "Agent's score" }, { k: "cost", label: "Cost per run" }],
    legend: [{ kind: "req", label: "an answer to grade" }, { kind: "write", label: "a score" }, { kind: "ping", label: "a human check" }, { kind: "res", label: "a change kept" }],
    goals: [
      { text: "Why a judge must be checked against people before it is trusted", step: 3 },
      { text: "Consistent is not the same as right", step: 3 },
      { text: "What the harness is and why it is what you change", step: 5 },
      { text: "Why fewer tokens is the cheapest improvement", step: 7 },
    ],
    steps: [
      {
        short: "Too many", chapter: "problem", title: "Six hundred answers, one afternoon",
        body: ["The agent answered six hundred test questions. Someone has to say which answers are good. Reading six hundred by hand every time the prompt changes is not going to happen.", "So a judge model grades them: it reads each answer against a rubric and gives a score from 1 to 5."],
        callout: { kind: "idea", text: "A judge turns a pile of answers into a number. The question is whether the number means anything." },
        metrics: { agree: { v: "unknown", tone: "red" }, score: null, cost: null },
        scene: (() => { const s = grading(); s.ents.board = board("the rubric", ["5  answers, cites policy, nothing untrue", "3  answers, misses the policy", "1  wrong or made up"]); return s; })(),
      },
      {
        short: "Erratic", chapter: "problem", title: "The same answer, fifteen scores",
        body: ["Give the judge one answer fifteen times. It scores it 2, 4, 3, 5, 1, 4... A person gave it a 2.", "This judge is a dice roll. Any improvement it reports is noise until it agrees with itself and with people."],
        changes: ["+ Fifteen runs of the same answer", "~ Scores from 1 to 5; 4 of 15 match the person"],
        metrics: { agree: { v: "4 of 15", tone: "red" }, score: null, cost: null },
        scene: (() => { const s = grading(); s.ents.person = person; s.ents.judge = Object.assign({}, judge, { state: "hot", tags: [{ text: "2 4 3 5 1 4 2 3 ... all over", tone: "red" }] }); s.links.p = L("judge", "person", { style: "dashed", label: "person said 2" }); s.flows = [{ route: ["p"], bounce: true, kind: "ping", rate: 0.4 }]; return s; })(),
      },
      {
        short: "Calibrate", chapter: "technique", title: "Calibrate: tighten the rubric until it lines up",
        body: ["Rewrite the rubric with examples of a 2 and a 4. Run the fifteen again: 2, 2, 2, 3, 2, 2... Thirteen of fifteen match the person.", "Beware the other failure: a judge that says 4 every single time is perfectly consistent and simply wrong. Agreeing with itself is not the test. Agreeing with people is."],
        callout: { kind: "warn", text: "Check the judge on thirty answers a person has already scored. If it disagrees often, fix the judge before you measure anything with it." },
        changes: ["~ Rubric rewritten with examples", "~ 13 of 15 match the person"],
        metrics: { agree: { v: "13 of 15", tone: "green" }, score: null, cost: null },
        scene: (() => { const s = grading(); s.ents.person = person; s.ents.judge = Object.assign({}, judge, { tags: [{ text: "2 2 2 3 2 2 2 2 ... lines up", tone: "green" }] }); s.links.p = L("judge", "person", { style: "dashed" }); s.flows = [{ route: ["a"], rate: 0.5 }, { route: ["p"], bounce: true, kind: "ping", rate: 0.3 }]; return s; })(),
      },
      {
        short: "A number", chapter: "technique", title: "Now the number means something",
        body: ["With a calibrated judge, grade all six hundred. The agent averages 3.4 out of 5. That is the baseline, and for the first time it is a number you can defend.", "Every change from here is measured against it."],
        changes: ["+ Baseline: 3.4 of 5 across 600 answers"],
        metrics: { agree: { v: "13 of 15", tone: "green" }, score: "3.4", cost: "$0.19 a run" },
        scene: (() => { const s = grading(); s.ents.agent = agent; s.links.g = L("agent", "answers", { heads: "end", via: [["agent", "answers"]] }); s.ents.board = board("baseline", ["600 answers graded", "= 3.4 of 5"], -90); s.flows = [{ route: ["g"], kind: "res", rate: 0.5 }, { route: ["a"], rate: 0.5 }]; return s; })(),
      },
      {
        short: "Harness", chapter: "insight", title: "You climb by changing the harness, not the model",
        body: ["The model is a fixed thing you rent. What you own is the harness around it: the instructions, which tools it has, how results are fed back, when it retries, when it stops.", "Almost every improvement comes from the harness. Change one thing in it, grade six hundred answers, compare with 3.4."],
        callout: { kind: "idea", text: "Swapping the model is one change among many, and usually not the first to try. The harness is where the leverage is." },
        changes: ["+ The harness drawn around the model"],
        metrics: { agree: { v: "13 of 15", tone: "green" }, score: "3.4", cost: "$0.19 a run" },
        scene: (s) => { s.ents.harness = Object.assign({}, harness, { tags: [{ text: "prompt · tools · retries", tone: "blue" }] }); s.links.h = L("agent", "harness", { style: "dashed" }); return s; },
      },
      {
        short: "Climb", chapter: "solution", title: "Change one thing, measure, keep or drop",
        body: ["Add a line to the instructions telling the agent to quote the policy page. Grade again: 3.9. Keep it. Add a second tool: 3.8. Drop it. Make it retry on empty results: 4.1. Keep it.", "Three changes, two kept, one dropped, and the score went from 3.4 to 4.1 on purpose."],
        changes: ["+ Quote the policy: 3.9, kept", "- Second tool: 3.8, dropped", "+ Retry on empty: 4.1, kept"],
        metrics: { agree: { v: "13 of 15", tone: "green" }, score: { v: "4.1", tone: "green" }, cost: "$0.23 a run" },
        scene: (s) => { s.ents.board = board("the climb", ["quote the policy  3.9  keep", "second tool       3.8  drop", "retry on empty    4.1  keep"], -100); s.flows = [{ route: ["h"], bounce: true, kind: "res", rate: 0.4 }, { route: ["g"], kind: "res", rate: 0.5 }, { route: ["a"], rate: 0.5 }]; return s; },
      },
      {
        short: "The bill", chapter: "tradeoff", title: "Pay for it: the bill is tokens",
        body: ["Each run sends about 12,000 tokens in and gets 1,000 back, about 19 cents. The retry change pushed it to 23. Six hundred graded answers a day, every day, adds up.", "The cheapest improvement is usually fewer tokens: trim the instructions, send only the relevant policy page, cap the retries. The score often holds, and the bill drops by a third."],
        callout: { kind: "tip", text: "Measure cost per run alongside the score. A change that lifts the score by a tenth and doubles the cost is usually a bad trade." },
        changes: ["~ Instructions trimmed, one policy page instead of five", "~ Score 4.0, cost $0.14 a run"],
        metrics: { agree: { v: "13 of 15", tone: "green" }, score: { v: "4.0", tone: "green" }, cost: { v: "$0.14 a run", tone: "green" } },
        scene: (s) => { s.ents.bill = bill; s.ents.board = board("trimmed", ["tokens in  12,400 → 8,100", "score      4.1 → 4.0", "= a third cheaper"], -100); return s; },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["A <b>judge</b> turns answers into a number; check it against <b>people</b> first.", "<b>Consistent</b> is not <b>right</b>: a judge that always says 4 is useless.", "Improve by changing the <b>harness</b>: one change, measure, keep or drop.", "The bill is <b>tokens</b>; fewer tokens is the cheapest improvement, and the score often holds."],
        callout: { kind: "next", text: "The rest of day three puts the judge on trial in detail, climbs with it, opens the harness, and keeps the whole thing honest." },
        metrics: { agree: { v: "13 of 15", tone: "green" }, score: { v: "4.0", tone: "green" }, cost: { v: "$0.14 a run", tone: "green" } },
      },
    ],
  };
})();
