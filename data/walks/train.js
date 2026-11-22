/* Walkthrough: watch a model become less wrong. Guess, measure, nudge, repeat. */
(window.WALKS = window.WALKS || {}).train = (function () {
  const data = { type: "db", x: -18, y: 0, label: "Labelled examples", tint: "violet" };
  const model = { type: "model", x: -4, y: 0, label: "The model", glyph: "AI", tint: "violet" };
  const loss = (v, tone) => ({ type: "block", x: 10, y: -8, label: "How wrong", glyph: "loss", tint: "rose", s: 0.85, tags: [{ text: v, tone }] });
  const nudge = { type: "block", x: 10, y: 8, label: "The nudge", glyph: "step", tint: "orange", s: 0.85 };
  const chart = (lines, title) => ({ type: "panel", x: 22, y: -8, dx: -20, dy: -110, title: title || "the loss, step by step", lines });
  const held = { type: "db", x: -18, y: 14, label: "Held-back examples", tint: "amber" };
  const ckpt = { type: "db", x: 22, y: 10, label: "Saved checkpoints", tint: "slate" };
  const gpu = { type: "block", x: -4, y: 14, label: "The graphics chip", glyph: "chip", tint: "teal", s: 0.85 };
  const L = (from, to, extra) => Object.assign({ from, to }, extra);
  const loop = (lv, tone, lines, rate) => ({
    ents: { data, model, loss: loss(lv, tone), nudge, chart: chart(lines) },
    links: { d: L("data", "model", { heads: "end" }), l: L("model", "loss", { heads: "end" }), n: L("loss", "nudge", { heads: "end", via: [["loss", "nudge"]] }), b: L("nudge", "model", { heads: "end", via: [["model", "nudge"]], label: "nudge every dial", labelAt: 0.22 }) },
    flows: [{ route: ["d", "l"], rate, speed: 70 }, { route: ["n", "b"], rate, kind: "write", speed: 70 }],
  });
  return {
    title: "Watch a model become less wrong",
    summary: "Training is three moves on repeat: guess, measure how wrong the guess was as one number, nudge every setting a little downhill. Run the loop, pick the step size, and know when to stop.",
    plain: "a model is a guess with dials on it. Training is: make the guess, measure how wrong it was as one number, turn every dial a little in the direction that makes the number smaller, repeat. The size of the turn is the step size, and it is the setting that matters most. This walk runs the loop, tries three step sizes, catches the model memorising instead of learning, and stops at the right moment.",
    reallife: "Tuning a radio by ear. Turn the dial, listen to the static, turn it a little the way that helped. Tiny turns take all night. Huge turns overshoot the station every time. And once it is clear, more turning only makes it worse.",
    startby: "Press Next to run the loop, change the step size, and watch the number fall or blow up. Arrow keys work too.",
    terms: [
      ["loss", "the one number that says how wrong the model's guesses were on a batch of examples; training tries to make it smaller"],
      ["step size", "how far every dial turns on each nudge; also called the learning rate"],
      ["gradient", "for each dial, which way to turn it to make the loss smaller, and by how much"],
      ["epoch", "one pass through all the training examples"],
      ["held-back examples", "examples kept out of training and used only to check whether the model learned or merely memorised"],
      ["checkpoint", "a saved copy of all the dials at a moment in training, so you can go back to it"],
      ["overfitting", "the model getting better on the examples it trained on while getting worse on new ones"],
    ],
    metrics: [{ k: "step", label: "Step size" }, { k: "loss", label: "Loss, training" }, { k: "held", label: "Loss, held-back" }],
    legend: [{ kind: "req", label: "a batch of examples" }, { kind: "write", label: "a nudge to the dials" }, { kind: "bad", label: "a blow-up" }],
    goals: [
      { text: "The loop: guess, measure, nudge", step: 1 },
      { text: "Why the step size decides whether training crawls, settles or explodes", step: 4 },
      { text: "Held-back examples and how to spot memorising", step: 5 },
      { text: "When to stop, and what to keep", step: 6 },
    ],
    steps: [
      {
        short: "The loop", chapter: "technique", title: "Guess, measure, nudge, repeat",
        body: ["A batch of labelled examples goes in. The model guesses. The loss measures how wrong the guesses were as one number. From that number, each dial learns which way to turn, and all of them turn a little.", "Then the next batch. That is all training is."],
        callout: { kind: "idea", text: "Nothing in the loop knows what the examples mean. It only knows one number went down or up." },
        metrics: { step: "not set", loss: "4.1", held: null },
        scene: loop("4.1", "red", ["step 0    4.10", "# waiting for a step size"], 0.5),
      },
      {
        short: "Too small", chapter: "problem", title: "Step size too small: it crawls",
        body: ["Set the step size tiny. Every nudge is a fraction of a degree. The loss falls: 4.10, 4.08, 4.06... After a thousand steps it is still above 3.", "It would get there. It would take a week, and the chip is billed by the hour."],
        changes: ["+ Step size 0.0001", "~ Loss 4.10 to 3.9 in 1,000 steps"],
        metrics: { step: { v: "0.0001", tone: "amber" }, loss: { v: "3.9 after 1,000", tone: "amber" }, held: null },
        scene: loop("3.9", "amber", ["step 0        4.10", "step 500      4.00", "step 1,000    3.90", "# crawling"], 0.3),
      },
      {
        short: "Too big", chapter: "problem", title: "Step size too big: it explodes",
        body: ["Set it huge. The first nudge overshoots the bottom of the valley; the next overshoots further back; after six steps the loss is a billion and then it stops being a number at all; the computer prints <em>not a number</em>.", "Every dial swung so far that nothing is left to recover."],
        callout: { kind: "warn", text: "A loss that goes up and up, then <em>not a number</em>, is almost always a step size that is too big. Cut it by ten and start again from the last good checkpoint." },
        changes: ["+ Step size 1.0", "- Everything: loss blew up"],
        metrics: { step: { v: "1.0", tone: "red" }, loss: { v: "not a number", tone: "red" }, held: null },
        scene: (() => { const s = loop("blew up", "red", ["step 0     4.10", "step 2     9.80", "step 4   1,400", "step 6     not a number"], 0.6); s.ents.model = Object.assign({}, model, { state: "hot" }); s.flows = [{ route: ["n", "b"], rate: 0.6, kind: "bad", speed: 90 }]; return s; })(),
      },
      {
        short: "About right", chapter: "solution", title: "Step size about right: it settles",
        body: ["Set it in between. The loss drops fast at first, 4.1 to 2.0 in a hundred steps, then slows as it nears the bottom, and settles around 1.2.", "The first few steps tell you most of what you need: a quick fall that slows is the shape you want."],
        changes: ["+ Step size 0.01", "~ Loss 4.1 to 1.2, settling"],
        metrics: { step: { v: "0.01", tone: "green" }, loss: { v: "1.2", tone: "green" }, held: null },
        scene: loop("1.2", "green", ["step 0       4.10", "step 100     2.00", "step 500     1.30", "step 1,000   1.20"], 0.5),
      },
      {
        short: "Memorising", chapter: "problem", title: "It is memorising, not learning",
        body: ["Keep going. The training loss keeps falling: 1.0, 0.8, 0.6. Then check it on examples it has never seen, the held-back set. That loss stopped falling at step 1,200 and is now rising.", "The model is memorising the training examples instead of learning the pattern. It looks better and is getting worse."],
        callout: { kind: "idea", text: "Never judge a model on the examples it trained on. The held-back loss is the only one that predicts how it will do tomorrow." },
        changes: ["+ Held-back examples checked every 100 steps", "~ Held-back loss rising since step 1,200"],
        metrics: { step: "0.01", loss: { v: "0.6, still falling", tone: "amber" }, held: { v: "1.4, rising", tone: "red" } },
        scene: (() => { const s = loop("0.6", "amber", ["            train   held", "step 1,000   1.20   1.25", "step 1,200   0.90   1.20", "step 2,000   0.60   1.40"]); s.ents.held = held; s.links.h = L("held", "model", { heads: "end", style: "dashed", via: [["held", "model"]], label: "never trained on" }); s.flows.push({ route: ["h"], kind: "ping", rate: 0.3 }); return s; })(),
      },
      {
        short: "Stop", chapter: "solution", title: "Stop at the best held-back loss, keep that checkpoint",
        body: ["Save the dials every hundred steps. When the held-back loss has not improved for a while, stop, and keep the checkpoint from its lowest point: step 1,200, not the last one.", "Training further would only make the saved model worse at the job."],
        changes: ["+ Checkpoints every 100 steps", "~ Stopped; kept the checkpoint from step 1,200"],
        metrics: { step: "0.01", loss: "0.9 at the kept checkpoint", held: { v: "1.20, the best", tone: "green" } },
        scene: (() => { const s = loop("0.9", "green", ["best held-back   step 1,200", "= keep that checkpoint"], 0.3); s.ents.held = held; s.ents.ckpt = ckpt; s.links.h = L("held", "model", { heads: "end", style: "dashed", via: [["held", "model"]] }); s.links.c = L("model", "ckpt", { heads: "end", via: [["model", "ckpt"]], label: "saved every 100 steps", labelAt: 0.85 }); s.flows.push({ route: ["c"], kind: "write", rate: 0.3 }); return s; })(),
      },
      {
        short: "The chip", chapter: "tradeoff", title: "Why the chip cares",
        body: ["Each step multiplies big tables of numbers: the batch against every dial. A graphics chip does those multiplications thousands at a time, which is the only reason a training run takes hours rather than years.", "The chip is billed by the hour. A good step size and an early stop are the two biggest savings there are."],
        metrics: { step: "0.01", loss: "0.9", held: { v: "1.20", tone: "green" } },
        scene: (s) => { s.ents.gpu = gpu; s.links.g = L("model", "gpu", { heads: "both", style: "dashed", label: "thousands of sums at once" }); s.flows.push({ route: ["g"], bounce: true, kind: "heavy", rate: 0.4 }); return s; },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["Training is <b>guess, measure, nudge</b>, on repeat.", "The <b>step size</b> decides whether the loss crawls, settles or explodes; a quick fall that slows is the shape you want.", "Judge on <b>held-back examples</b>; a rising held-back loss means memorising.", "<b>Stop</b> when the held-back loss stops improving and keep the best <b>checkpoint</b>.", "The chip is billed by the hour; the step size and the stop are the big savings."],
        callout: { kind: "next", text: "The rest of this lab trains a real network, catches fitting too well, decides when to stop, makes a model yours, and shows why the chip cares." },
        metrics: { step: "0.01", loss: "0.9", held: { v: "1.20", tone: "green" } },
      },
    ],
  };
})();
