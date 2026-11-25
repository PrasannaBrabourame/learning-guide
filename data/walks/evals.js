/* Walkthrough: is the new version better? One run lies; many runs, a judge and a loop tell the truth. */
(window.WALKS = window.WALKS || {}).evals = (function () {
  const cases = { type: "queue", x: -18, y: 0, label: "Test cases", n: 6, dir: [0, 1] };
  const old = { type: "block", x: -4, y: -9, label: "Old version", glyph: "v1", tint: "slate" };
  const neu = { type: "block", x: -4, y: 9, label: "New version", glyph: "v2", tint: "orange" };
  const judge = { type: "model", x: 10, y: 0, label: "The judge", glyph: "AI", tint: "violet" };
  const human = { type: "person", x: 10, y: -14, label: "A person", tint: "sand" };
  const board = { type: "panel", x: 22, y: -2, dx: -10, dy: -70, title: "scoreboard", lines: ["old   0.70", "new   0.58", "= new looks worse"] };
  const board5 = { type: "panel", x: 22, y: -2, dx: -10, dy: -84, title: "after 5 runs each", lines: ["old   0.71", "new   0.78", "= new is better"] };
  const prod = { type: "crowd", x: 22, y: 12, label: "Real users", tint: "sand", n: 4 };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const base = () => ({
    ents: { cases, old, neu, judge },
    links: { a: L("cases", "old", { heads: "end" }), b: L("cases", "neu", { heads: "end" }), c: L("old", "judge", { heads: "end" }), d: L("neu", "judge", { heads: "end" }) },
    flows: [{ route: ["a"], rate: 0.4 }, { route: ["b"], rate: 0.4 }, { route: ["c"], rate: 0.4, kind: "res" }, { route: ["d"], rate: 0.4, kind: "res" }],
  });
  return {
    title: "Is the new version better? One run cannot tell you",
    summary: "Change a prompt, run the test cases through the old and new versions, let a judge score them, and watch one run point the wrong way before five runs settle it.",
    plain: "you change a prompt and want to know if it got better. Ordinary software gives the same answer every time, so one test settles it. An agent gives a different answer each run, so one run is a coin toss. This walk sends the same test cases through the old and new versions and scores them with a judge. It shows the first run pointing the wrong way, runs enough times to trust the result, then closes the loop by changing the prompt again.",
    reallife: "Deciding whether a new recipe is better by cooking it once. One tasting on one evening tells you about that evening. Cook both recipes five times for the same panel and you learn something about the recipes.",
    startby: "Press Next to send the test cases through both versions, score them, and watch the verdict change as the runs add up. Arrow keys work too.",
    terms: [
      ["evaluation", "measuring how well an agent does its job against a fixed set of test cases, so changes can be compared"],
      ["test case", "one question with a known good answer, kept in a set that is run again after every change"],
      ["baseline", "the current version, the one every change is compared against"],
      ["candidate", "the new version being tested against the baseline"],
      ["judge", "a model that scores an answer against a rubric; it must itself be checked against people"],
      ["rubric", "the written scoring guide the judge follows: what a 5 looks like, what a 1 looks like"],
      ["hill climbing", "change one thing, measure, keep it if the score rose, repeat"],
    ],
    metrics: [{ k: "runs", label: "Runs each" }, { k: "old", label: "Baseline" }, { k: "new", label: "Candidate" }, { k: "verdict", label: "Verdict" }],
    legend: [{ kind: "req", label: "a test case" }, { kind: "res", label: "an answer to score" }, { kind: "write", label: "a score" }, { kind: "ping", label: "a human check" }],
    goals: [
      { text: "Why one run of an agent proves nothing", step: 3 },
      { text: "What a judge is and why it needs a rubric and a human check", step: 4 },
      { text: "How many runs it takes before the verdict holds", step: 5 },
      { text: "The loop: measure, change, measure again", step: 6 },
    ],
    steps: [
      {
        short: "A change", chapter: "problem", title: "You changed the prompt. Better or worse?",
        body: ["You rewrote the agent's instructions to be friendlier. It feels better. Feelings are not a release process.", "You have twenty test cases with known good answers. Run them through the old version, your baseline, and the new one, the candidate, and compare."],
        callout: { kind: "idea", text: "A test set is a fixed ruler. Without one, every comparison is between two memories." },
        metrics: { runs: 0, old: null, new: null, verdict: null },
        scene: { ents: { cases, old, neu: Object.assign({}, neu, { tags: [{ text: "new prompt", tone: "amber" }] }) }, links: {}, flows: [] },
      },
      {
        short: "Score it", chapter: "technique", title: "A judge scores every answer",
        body: ["Forty answers is too many to read by hand every time. A judge model reads each answer against a rubric and gives a score from 1 to 5.", "The rubric is the point: <em>a 5 answers the question, cites the policy, and says nothing untrue.</em> Without it the judge just reacts.", "Each average below is shown as a share of the top mark, so 1.00 would mean a 5 on every case."],
        changes: ["+ A judge with a written rubric"],
        metrics: { runs: 0, old: null, new: null, verdict: null },
        scene: base(),
      },
      {
        short: "One run", chapter: "problem", title: "After one run, the new version looks worse",
        body: ["Run one: the old version averages 0.70, the new one 0.58. Ship the old one and move on?", "An agent gives a different answer every time it is asked. One run per case is one sample from a noisy process. The scoreboard is telling you about this run, not about the versions."],
        callout: { kind: "warn", text: "Treat a single run of an agent the way you would treat a single coin toss: as no information about the coin." },
        changes: ["+ Run 1 scored"],
        metrics: { runs: 1, old: "0.70", new: { v: "0.58", tone: "red" }, verdict: { v: "worse?", tone: "red" } },
        scene: (s) => { s.ents.board = board; s.links.e = L("judge", "board", { heads: "end" }); s.flows.push({ route: ["e"], kind: "write", rate: 0.5 }); return s; },
      },
      {
        short: "The judge", chapter: "technique", title: "Is the judge any good?",
        body: ["Before trusting the scores, check the judge against a person. Take thirty answers a person has already scored and see how often the judge agrees.", "Here it agrees on 27 of the 30, nine times in ten, so its scores mean something. If it agreed far less often, you would fix the rubric before running anything else."],
        changes: ["+ Thirty answers scored by a person", "~ Judge agreement checked"],
        metrics: { runs: 1, old: "0.70", new: { v: "0.58", tone: "red" }, verdict: { v: "worse?", tone: "red" } },
        scene: (s) => { s.ents.human = human; s.links.h = L("judge", "human", { style: "dashed", label: "agrees 27 of 30", labelAt: 0.3 }); s.flows = [{ route: ["h"], bounce: true, kind: "ping", rate: 0.4 }]; return s; },
      },
      {
        short: "Five runs", chapter: "solution", title: "Five runs each, and the verdict settles",
        body: ["Run every case five times through each version and average. The old version lands at 0.71, the new one at 0.78, and the gap holds from run three onwards.", "The new version is better. Run one was the outlier, and you would have thrown away the improvement on its say-so."],
        callout: { kind: "tip", text: "Look at the spread as well as the average. A version that scores 0.78 on average but 0.3 on one case has a failure you need to read." },
        changes: ["+ Runs 2 to 5", "~ Verdict reversed"],
        metrics: { runs: 5, old: "0.71", new: { v: "0.78", tone: "green" }, verdict: { v: "better", tone: "green" } },
        scene: (s) => { delete s.ents.human; delete s.links.h; s.ents.board = board5; s.flows = [{ route: ["a"], rate: 0.5 }, { route: ["b"], rate: 0.5 }, { route: ["c"], rate: 0.5, kind: "res" }, { route: ["d"], rate: 0.5, kind: "res" }, { route: ["e"], kind: "write", rate: 0.6 }]; return s; },
      },
      {
        short: "The loop", chapter: "technique", title: "Close the loop: change, measure, keep or drop",
        body: ["Now the new version is the baseline. Read its worst-scoring cases, change one thing, run five times, compare. Keep the change if the score rose; drop it if not. Repeat.", "That loop, not any single score, is what makes an agent better week by week."],
        changes: ["~ New version becomes the baseline", "+ Next candidate queued"],
        metrics: { runs: 5, old: "0.78", new: "next", verdict: "measuring" },
        scene: (s) => { s.ents.old = Object.assign({}, old, { label: "Baseline, 0.78", glyph: "v2", tint: "orange" }); s.ents.neu = Object.assign({}, neu, { label: "Next candidate", glyph: "v3", tags: [{ text: "one change", tone: "amber" }] }); s.ents.board = Object.assign({}, board5, { title: "the loop", lines: ["change one thing", "run five times", "keep it if it rose"] }); return s; },
      },
      {
        short: "Live", chapter: "tradeoff", title: "The test set is not the world",
        body: ["Twenty cases cannot cover what real users ask. Once a version ships, keep scoring a sample of live conversations with the same judge, and add the surprising ones to the test set.", "Here the baseline scored 0.78 on the test cases and 0.74 on live conversations: the gap is the questions your set never asked.", "Scores on the test set tell you a change is safe to try. Live scores tell you whether it worked."],
        callout: { kind: "idea", text: "Every unexpected real question is a free new test case. The set should grow with the product." },
        changes: ["+ A sample of live conversations scored", "~ New cases added to the set"],
        metrics: { runs: 5, old: "live 0.74", new: "next", verdict: "watching" },
        scene: (s) => { s.ents.prod = prod; s.links.p = L("prod", "judge", { heads: "end", via: [["prod", "judge"]], style: "dashed", label: "a sample", labelAt: 0.62 }); s.links.q = L("prod", "cases", { heads: "end", via: [["prod", "cases"]], style: "off", label: "new cases", labelAt: 0.12 }); s.flows = [{ route: ["p"], kind: "res", rate: 0.4 }, { route: ["e"], kind: "write", rate: 0.4 }]; return s; },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["Keep a fixed set of <b>test cases</b> and run every change against it.", "A <b>judge</b> with a <b>rubric</b> scores the answers; check the judge against <b>people</b> first.", "<b>One run proves nothing</b>; five runs each, averaged, and the verdict holds.", "Then <b>loop</b>: change one thing, measure, keep or drop.", "Keep scoring <b>live</b> conversations and grow the test set from them."],
        callout: { kind: "next", text: "The rest of this lab covers metrics and methods, rubrics, trajectories, offline and online evaluation, hill climbing, latency and cost, and model upgrades." },
        metrics: { runs: 5, old: "live 0.74", new: "next", verdict: "watching" },
      },
    ],
  };
})();
