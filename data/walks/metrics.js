/* Walkthrough: the threshold, told with the lab's own class of twenty. The screener scores every
   learner; you choose the line above which you flag. Scores are the ranked-list tab's: Mira 0.91,
   Ben 0.88, Kai 0.86, Lena 0.79, Tara 0.71 ... Noor 0.44, the other eight below 0.40. Four learners
   (Mira, Ben, Lena, Noor) really need reading support. */
(window.WALKS = window.WALKS || {}).metrics = (function () {
  const cases = { type: "queue", x: -18, y: 0, label: "Twenty learners", n: 7, dir: [0, 1] };
  const model = { type: "model", x: -5, y: 0, label: "The screener", glyph: "AI", tint: "violet" };
  const gate = (v, tone) => ({ type: "block", x: 8, y: 0, label: "The line", glyph: v, tint: "orange", tags: [{ text: "flag above " + v, tone: tone || "amber" }] });
  const flag = { type: "db", x: 20, y: -8, label: "Flagged", tint: "rose" };
  const pass = { type: "db", x: 20, y: 8, label: "Not flagged", tint: "slate" };
  const board = (lines) => ({ type: "panel", x: 20, y: -8, dx: -30, dy: -118, title: "this class", lines });
  const L = (from, to, extra) => Object.assign({ from, to }, extra);
  const scene = (v, tone, lines, fr, pr) => ({
    ents: { cases, model, gate: gate(v, tone), flag, pass, board: board(lines) },
    links: { s: L("cases", "model"), g: L("model", "gate"), f: L("gate", "flag", { via: [["gate", "flag"]] }), p: L("gate", "pass", { via: [["gate", "pass"]] }) },
    flows: [{ route: ["s", "g"], rate: 0.6, speed: 70 }, { route: ["f"], rate: fr, kind: "bad" }, { route: ["p"], rate: pr, kind: "res" }],
  });
  return {
    title: "Where to draw the line",
    summary: "The screener scores every learner in the class of twenty. You choose the line above which you flag, and every place you put it trades missed learners against false alarms. Walk the line down and up and read the numbers.",
    plain: "the screener does not say yes or no. It gives every learner a score, and you choose the line above which you flag them for reading support. Set the line low and you find everyone who needs help, plus a crowd who do not. Set it high and you flag only the sure cases, and miss some who matter. This walk takes the lab's class of twenty, four of whom really need support, and moves the line.",
    reallife: "A smoke alarm's sensitivity dial. Turn it up and it catches every fire and every slice of toast. Turn it down and breakfast is peaceful and one real fire goes unnoticed. The right setting depends on what a missed fire costs compared with a false alarm.",
    startby: "Press Next to score the class. Then step on as the line sits at 0.70, drops to 0.40 and rises to 0.87, and each time read the &ldquo;this class&rdquo; scoreboard and the four tiles above the scene. Arrow keys work too.",
    terms: [
      ["score", "the number the screener gives a learner, from 0 to 1, for how likely they are to need support"],
      ["threshold", "the score above which you flag a learner; everyone below is left alone"],
      ["false alarm", "a learner flagged who did not need support"],
      ["miss", "a learner who needed support and was not flagged"],
      ["precision", "of the learners you flagged, the share who really needed it"],
      ["recall", "of the learners who really needed it, the share you flagged"],
    ],
    metrics: [{ k: "line", label: "The line" }, { k: "caught", label: "Found, of 4" }, { k: "alarms", label: "False alarms" }, { k: "prec", label: "Precision" }],
    legend: [{ kind: "req", label: "a learner being scored" }, { kind: "bad", label: "flagged" }, { kind: "res", label: "not flagged" }],
    goals: [
      { text: "The screener gives scores; the line is your decision", step: 2 },
      { text: "What recall and precision count", step: 4 },
      { text: "Why lowering the line raises one and lowers the other", step: 5 },
      { text: "How the cost of a miss picks the line", step: 7 },
    ],
    steps: [
      {
        short: "The class", chapter: "problem", title: "Twenty learners, four who need help",
        body: ["A learning centre runs its AI screener over one class of twenty. Their teacher says four of them genuinely need reading support: Mira, Ben, Lena and Noor. The other sixteen are fine.", "The screener does not see the teacher's view. It reads each learner's observation notes and scores how likely they are to need help."],
        callout: { kind: "idea", text: "The screener's job is to score. Deciding what score is worth a follow-up is yours, and it is a decision about learners and teacher time." },
        metrics: { line: null, caught: null, alarms: null, prec: null },
        scene: { ents: { cases: Object.assign({}, cases, { tags: [{ text: "4 need support", tone: "red" }] }), model }, links: { s: L("cases", "model") }, flows: [{ route: ["s"], rate: 0.6 }] },
      },
      {
        short: "Scores", chapter: "technique", title: "Every learner gets a score, not a verdict",
        body: ["The screener gives each learner a number from 0 to 1. Three of the four score high: Mira 0.91, Ben 0.88, Lena 0.79. Noor scores only 0.44. And Kai, who is fine, scores 0.86.", "Twelve learners score 0.44 or more; the other eight score below 0.40. A sorted list of scores is all you have. Somewhere on it you must draw a line."],
        changes: ["+ Twenty scores, Mira 0.91 at the top"],
        metrics: { line: null, caught: null, alarms: null, prec: null },
        scene: { ents: { cases, model: Object.assign({}, model, { tags: [{ text: "0.91 0.88 0.86 0.79 ...", tone: "violet" }] }) }, links: { s: L("cases", "model") }, flows: [{ route: ["s"], rate: 0.6 }] },
      },
      {
        short: "Default", chapter: "technique", title: "Draw the line at 0.70",
        body: ["The screener's own default flags anyone above 0.70. Five learners are flagged: Mira, Ben and Lena, who need it, and Kai and Tara, who do not. Noor, at 0.44, is missed.", "Of the four who needed support, three were found. Of the five flagged, three needed it. Those two fractions are the whole subject."],
        changes: ["+ The line at 0.70", "~ 5 flagged: 3 right, 2 false alarms, 1 missed"],
        metrics: { line: "0.70", caught: { v: "3", tone: "amber" }, alarms: { v: 2, tone: "amber" }, prec: "0.60" },
        scene: scene("0.70", "amber", ["flagged      5", "needed it    3", "false alarms 2", "missed       1"], 0.4, 0.65),
      },
      {
        short: "Two numbers", chapter: "insight", title: "Recall and precision",
        body: ["<em>Recall</em> is how many of the learners who needed support you found: 3 of 4, 0.75. <em>Precision</em> is how many of your flags were right: 3 of 5, 0.60.", "Every line you draw gives a pair. Moving the line trades one against the other. There is no setting that maximises both."],
        callout: { kind: "idea", text: "Recall asks: did we find them? Precision asks: when we flagged, were we right? Say which one you mean, every time." },
        metrics: { line: "0.70", caught: { v: "3 (recall 0.75)", tone: "amber" }, alarms: { v: 2, tone: "amber" }, prec: "0.60" },
        scene: (s) => { s.ents.board = board(["recall    0.75", "precision 0.60", "move the line:", "both numbers move"]); return s; },
      },
      {
        short: "Lower", chapter: "tradeoff", title: "Lower the line to 0.40",
        body: ["Lower the line and twelve learners are flagged. All four who need support are found, Noor included, and so are eight who were fine. Recall 1.00, precision 0.33.", "Eight false alarms at twenty minutes each is 160 teacher minutes. Whether that is worth paying depends on what a miss costs."],
        changes: ["~ The line at 0.40", "~ 12 flagged: 4 right, 8 false alarms, 0 missed"],
        metrics: { line: "0.40", caught: { v: "4 (recall 1.00)", tone: "green" }, alarms: { v: 8, tone: "red" }, prec: { v: "0.33", tone: "red" } },
        scene: scene("0.40", "green", ["flagged     12", "needed it    4", "false alarms 8", "missed       0"], 0.75, 0.35),
      },
      {
        short: "Higher", chapter: "tradeoff", title: "Raise the line to 0.87",
        body: ["Raise it to 0.87, just above Kai, and only Mira and Ben are flagged, both rightly. Precision 1.00. But Lena and Noor slip through. Recall 0.50.", "Compared with the default, you saved forty teacher minutes and cost Lena a term of help. If a miss costs more than a false alarm, this is the wrong line, however clean the precision looks."],
        callout: { kind: "warn", text: "A high-precision screener that misses half the learners who need help can look excellent in a demo and be useless in a classroom. Ask what a miss costs." },
        changes: ["~ The line at 0.87", "~ 2 flagged: 2 right, 0 false alarms, 2 missed"],
        metrics: { line: "0.87", caught: { v: "2 (recall 0.50)", tone: "red" }, alarms: { v: 0, tone: "green" }, prec: { v: "1.00", tone: "green" } },
        scene: scene("0.87", "red", ["flagged      2", "needed it    2", "false alarms 0", "missed       2"], 0.2, 0.9),
      },
      {
        short: "The choice", chapter: "solution", title: "Let the costs pick the line",
        body: ["A missed learner loses a term of help. A false alarm costs a teacher twenty minutes. A term of help is worth far more, so the line goes low enough to reach Noor, around 0.40, and the centre accepts 160 minutes of extra follow-ups.", "Different decision, different costs, different line. If a flag moved a learner out of their class for a term, a false alarm would cost far more, and that line would go higher."],
        changes: ["~ The line set by cost: 0.40 here"],
        metrics: { line: "0.40", caught: { v: "4 (recall 1.00)", tone: "green" }, alarms: { v: 8, tone: "amber" }, prec: "0.33" },
        scene: scene("0.40", "green", ["a miss      1 term", "false alarm 20 min", "= draw the line low"], 0.75, 0.35),
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["The screener gives <b>scores</b>; the <b>line</b> is your decision.", "<b>Recall</b>: of the learners who needed support, how many you found. <b>Precision</b>: of those you flagged, how many needed it.", "Moving the line trades one against the other; nothing maximises both.", "The <b>cost of a miss</b> (a term of help) against the <b>cost of a false alarm</b> (twenty teacher minutes) picks the line."],
        callout: { kind: "next", text: "The next tabs reuse this same class. In the ranked-list tab you drag this line yourself; in found vs flagged you weigh the two mistakes." },
        metrics: { line: "0.40", caught: { v: "4 (recall 1.00)", tone: "green" }, alarms: { v: 8, tone: "amber" }, prec: "0.33" },
      },
    ],
  };
})();
