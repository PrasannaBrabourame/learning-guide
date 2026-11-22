/* Walkthrough: the threshold. A model scores every case; you choose the line above which you act. */
(window.WALKS = window.WALKS || {}).metrics = (function () {
  const cases = { type: "queue", x: -18, y: 0, label: "Twenty cases", n: 7, dir: [0, 1] };
  const model = { type: "model", x: -5, y: 0, label: "The scorer", glyph: "AI", tint: "violet" };
  const gate = (v, tone) => ({ type: "block", x: 8, y: 0, label: "The line", glyph: v, tint: "orange", tags: [{ text: "act above " + v, tone: tone || "amber" }] });
  const flag = { type: "db", x: 20, y: -8, label: "Flagged: act", tint: "rose" };
  const pass = { type: "db", x: 20, y: 8, label: "Passed: ignore", tint: "slate" };
  const board = (lines) => ({ type: "panel", x: 20, y: -8, dx: -30, dy: -118, title: "this run", lines });
  const L = (from, to, extra) => Object.assign({ from, to }, extra);
  const scene = (v, tone, lines, fr, pr) => ({
    ents: { cases, model, gate: gate(v, tone), flag, pass, board: board(lines) },
    links: { s: L("cases", "model"), g: L("model", "gate"), f: L("gate", "flag", { via: [["gate", "flag"]] }), p: L("gate", "pass", { via: [["gate", "pass"]] }) },
    flows: [{ route: ["s", "g"], rate: 0.6, speed: 70 }, { route: ["f"], rate: fr, kind: "bad" }, { route: ["p"], rate: pr, kind: "res" }],
  });
  return {
    title: "Where to draw the line",
    summary: "A model scores every case. You choose the line above which you act, and every place you put it trades missed cases against false alarms. Walk the line up and down and read the numbers.",
    plain: "a model does not say yes or no. It gives every case a score, and you choose the line above which you act. Set the line low and you catch everyone who needed help, plus a crowd who did not. Set it high and you only flag the sure cases, and miss some who mattered. This walk sends twenty cases through, five of whom really needed help, and moves the line.",
    reallife: "A smoke alarm's sensitivity dial. Turn it up and it catches every fire and every slice of toast. Turn it down and breakfast is peaceful and one real fire goes unnoticed. The right setting depends on what a missed fire costs compared with a false alarm.",
    startby: "Press Next to score the cases and then move the line down and up; watch the two tubes and the numbers. Arrow keys work too.",
    terms: [
      ["score", "the number a model gives a case, say 0 to 1, for how likely it is to be the thing you are looking for"],
      ["threshold", "the score above which you act; everything below is left alone"],
      ["false alarm", "a case flagged for action that did not need it"],
      ["miss", "a case that needed action and was not flagged"],
      ["precision", "of the cases you flagged, the share that really needed it"],
      ["recall", "of the cases that really needed it, the share you flagged"],
    ],
    metrics: [{ k: "line", label: "The line" }, { k: "caught", label: "Caught, of 5" }, { k: "alarms", label: "False alarms" }, { k: "prec", label: "Precision" }],
    legend: [{ kind: "req", label: "a case being scored" }, { kind: "bad", label: "flagged" }, { kind: "res", label: "passed" }],
    goals: [
      { text: "A model gives scores; the line is your decision", step: 2 },
      { text: "What recall and precision count", step: 4 },
      { text: "Why lowering the line raises one and lowers the other", step: 5 },
      { text: "How the cost of a miss picks the line", step: 6 },
    ],
    steps: [
      {
        short: "The cases", chapter: "problem", title: "Twenty messages, five that matter",
        body: ["Twenty customer messages arrive. Five of them are from people who are about to cancel and could be saved with a call. Fifteen are routine.", "You do not know which five. A model will score each message for how likely it is to be one of them."],
        callout: { kind: "idea", text: "The model's job is to score. Deciding what score is worth a phone call is yours, and it is a business decision." },
        metrics: { line: null, caught: null, alarms: null, prec: null },
        scene: { ents: { cases: Object.assign({}, cases, { tags: [{ text: "5 need a call", tone: "red" }] }), model }, links: { s: L("cases", "model") }, flows: [{ route: ["s"], rate: 0.6 }] },
      },
      {
        short: "Scores", chapter: "technique", title: "Every case gets a score, not a verdict",
        body: ["The scorer reads each message and gives it a number from 0 to 1. The five who matter score high on the whole, but not all of them, and a few routine messages score high too.", "A sorted list of scores is all you have. Somewhere on that list you must draw a line."],
        changes: ["+ Twenty scores, from 0.04 to 0.93"],
        metrics: { line: null, caught: null, alarms: null, prec: null },
        scene: { ents: { cases, model: Object.assign({}, model, { tags: [{ text: "0.93 0.88 0.71 0.66 ... 0.04", tone: "violet" }] }) }, links: { s: L("cases", "model") }, flows: [{ route: ["s"], rate: 0.6 }] },
      },
      {
        short: "Middle", chapter: "technique", title: "Draw the line at 0.5",
        body: ["Act on anything above 0.5. Seven messages are flagged for a call: four of the five who matter, and three who were fine.", "Of the five who needed a call, four got one. Of the seven calls made, four were needed. Those two fractions are the whole subject."],
        changes: ["+ The line at 0.5", "~ 7 flagged: 4 right, 3 false alarms, 1 missed"],
        metrics: { line: "0.50", caught: { v: "4", tone: "amber" }, alarms: { v: 3, tone: "amber" }, prec: "0.57" },
        scene: scene("0.5", "amber", ["flagged      7", "needed it    4", "false alarms 3", "missed       1"], 0.45, 0.6),
      },
      {
        short: "Two numbers", chapter: "insight", title: "Recall and precision",
        body: ["<em>Recall</em> is how many of the people who mattered you caught: 4 of 5, 0.80. <em>Precision</em> is how many of your calls were worth making: 4 of 7, 0.57.", "Every line you draw gives a pair. Moving the line trades one against the other. There is no setting that maximises both."],
        callout: { kind: "idea", text: "Recall asks: did we find them? Precision asks: when we acted, were we right? Say which one you mean, every time." },
        metrics: { line: "0.50", caught: { v: "4 (recall 0.80)", tone: "amber" }, alarms: { v: 3, tone: "amber" }, prec: "0.57" },
        scene: (s) => { s.ents.board = board(["recall    4 of 5 = 0.80", "precision 4 of 7 = 0.57", "= move the line, both move"]); return s; },
      },
      {
        short: "Lower", chapter: "tradeoff", title: "Lower the line to 0.3",
        body: ["Lower the line and thirteen messages are flagged. All five who matter are caught, and so are eight who were fine. Recall 1.00, precision 0.38.", "Eight unnecessary calls a day is a cost. Whether it is worth paying depends on what a lost customer costs."],
        changes: ["~ The line at 0.3", "~ 13 flagged: 5 right, 8 false alarms, 0 missed"],
        metrics: { line: "0.30", caught: { v: "5 (recall 1.00)", tone: "green" }, alarms: { v: 8, tone: "red" }, prec: { v: "0.38", tone: "red" } },
        scene: scene("0.3", "green", ["flagged     13", "needed it    5", "false alarms 8", "missed       0"], 0.8, 0.3),
      },
      {
        short: "Higher", chapter: "tradeoff", title: "Raise the line to 0.7",
        body: ["Raise it and only three messages are flagged, all three worth it. Precision 1.00. But three of the five who mattered slip through. Recall 0.40.", "If a missed customer costs more than a wasted call, this is the wrong line, however clean the precision looks."],
        callout: { kind: "warn", text: "A high-precision model that misses most of what matters can look excellent in a demo and be useless on the job. Ask what a miss costs." },
        changes: ["~ The line at 0.7", "~ 3 flagged: 3 right, 0 false alarms, 2 missed"],
        metrics: { line: "0.70", caught: { v: "2 (recall 0.40)", tone: "red" }, alarms: { v: 0, tone: "green" }, prec: { v: "1.00", tone: "green" } },
        scene: scene("0.7", "red", ["flagged      2", "needed it    2", "false alarms 0", "missed       3"], 0.2, 0.9),
      },
      {
        short: "The choice", chapter: "solution", title: "Let the costs pick the line",
        body: ["A lost customer costs about a hundred times a wasted call. So missing one is far worse than calling eight people who were fine. The line goes low, around 0.3, and the team accepts the extra calls.", "Different job, different costs, different line. A fraud block that annoys a good customer costs more than a missed small fraud, so that line goes high."],
        changes: ["~ The line set by cost: 0.3 here"],
        metrics: { line: "0.30", caught: { v: "5 (recall 1.00)", tone: "green" }, alarms: { v: 8, tone: "amber" }, prec: "0.38" },
        scene: scene("0.3", "green", ["a miss costs   100", "a false alarm    1", "= draw the line low"], 0.8, 0.3),
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["A model gives <b>scores</b>; the <b>line</b> is your decision.", "<b>Recall</b>: of those who mattered, how many you caught. <b>Precision</b>: of those you flagged, how many mattered.", "Moving the line trades one against the other; nothing maximises both.", "The <b>cost of a miss</b> against the <b>cost of a false alarm</b> picks the line."],
        callout: { kind: "next", text: "The rest of this lab covers ranked lists, how wrong and how often, retrieval ceilings, gates that never flake and watching the watchers." },
        metrics: { line: "0.30", caught: { v: "5 (recall 1.00)", tone: "green" }, alarms: { v: 8, tone: "amber" }, prec: "0.38" },
      },
    ],
  };
})();
