/* Walkthrough: your clock is running. Four questions a panel asks, and the first move each one is listening for. */
(window.WALKS = window.WALKS || {}).hotseat = (function () {
  const panel = { type: "crowd", x: -18, y: -8, label: "The panel", tint: "sand", n: 3 };
  const you = { type: "person", x: -18, y: 8, label: "You", tint: "sand" };
  const card = (title, lines) => ({ type: "panel", x: -18, y: -8, dx: 24, dy: -112, title, lines });
  const docs = { type: "db", x: 4, y: -10, label: "10,000 documents", tint: "violet" };
  const retriever = { type: "block", x: 4, y: 2, label: "Retrieval", glyph: "find", tint: "blue", s: 0.85 };
  const model = { type: "model", x: 16, y: 2, label: "The model", glyph: "AI", tint: "violet" };
  const meter = { type: "block", x: 16, y: -10, label: "Measure here", glyph: "test", tint: "green", s: 0.8 };
  const bill = { type: "panel", x: 16, y: -10, dx: -30, dy: -60, title: "the bill", lines: ["tokens in  18,000", "tokens out    900", "= 3× what it should be"] };
  const page = { type: "db", x: 4, y: -10, label: "A fetched web page", tint: "rose" };
  const fence = { type: "block", x: 16, y: 2, label: "Allowed actions", glyph: "gate", tint: "teal", s: 0.85 };
  const data = { type: "db", x: 4, y: -10, label: "Yesterday's prices", tint: "amber" };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const ask = (c, ents, links, flows) => ({ ents: Object.assign({ panel, you, card: c }, ents), links: Object.assign({ q: L("panel", "you", { heads: "end" }) }, links), flows: [{ route: ["q"], kind: "msg", rate: 0.3 }, ...flows] });
  return {
    title: "Your clock is running",
    summary: "Four questions a panel asks about things you have built, and for each one the first move they are listening for: not a definition, the step that shows you have done it.",
    plain: "in a technical round the panel asks, and the clock starts on your side. They are not listening for a definition. They are listening for the first thing you would actually do, because that is what separates someone who has built it from someone who has read about it. This walk takes four common questions and shows the first move for each.",
    reallife: "A fire inspector asks \"what would you do if the kitchen caught fire?\" Reciting the chemistry of combustion is a wrong answer. \"Close the door, pull the alarm, get out\" is the right one, because it is what someone who has done the drill says.",
    startby: "Press Next to hear each question, then see the first move the panel is listening for. Arrow keys work too.",
    terms: [
      ["retrieval", "finding the few passages, out of thousands, that are relevant to a question, before the model answers"],
      ["token", "a piece of text about four letters long; models are billed per token in and per token out"],
      ["prompt injection", "text hidden in a document or web page that the model reads as an instruction, and may obey"],
      ["fine-tuning", "training a model further on your own examples, which changes its style and format but does not keep facts current"],
      ["first move", "the one concrete step you would take before anything else; what a panel listens for"],
    ],
    metrics: [{ k: "q", label: "Question" }, { k: "wrong", label: "The reciting answer" }, { k: "move", label: "The first move" }],
    legend: [{ kind: "msg", label: "the question" }, { kind: "req", label: "a request" }, { kind: "res", label: "an answer" }, { kind: "bad", label: "a hijacked step" }],
    goals: [
      { text: "Why a definition is the wrong answer", step: 1 },
      { text: "Retrieval: measure finding separately from answering", step: 2 },
      { text: "Cost: count tokens before you cut anything", step: 3 },
      { text: "Injection: assume it works, make it harmless", step: 4 },
      { text: "Fine-tuning: style, not facts", step: 5 },
    ],
    steps: [
      {
        short: "The seat", chapter: "problem", title: "The panel asks, your clock starts",
        body: ["Three people across the table, one question at a time. They have one thing in mind: when this person says <em>I built it</em>, did they?", "A definition proves you read something. A first move proves you did something. Every answer below starts with the move."],
        callout: { kind: "idea", text: "Lead with what you would do first and why. The theory can follow if they ask." },
        metrics: { q: null, wrong: "a definition", move: "the step you would take" },
        scene: ask(card("the rule", ["not a definition", "= the first thing you would do"]), {}, {}, []),
      },
      {
        short: "Searching", chapter: "technique", title: "Searching 10,000 documents gives bad answers. What first?",
        body: ["The reciting answer explains what retrieval is. The first move: split the problem. Measure whether retrieval finds the right passages, on its own, before you look at the answers.", "Take fifty questions where you know which passage holds the answer, and count how often it comes back in the top few. If it does not, no prompt will fix the answers."],
        changes: ["+ Fifty questions with known passages", "~ Retrieval measured on its own"],
        metrics: { q: "search over 10,000 docs", wrong: "explain retrieval", move: { v: "measure finding apart from answering", tone: "green" } },
        scene: ask(card("question 1", ["answers from 10,000 PDFs", "are bad. What first?"]), { docs, retriever, model, meter }, { r: L("retriever", "docs", { via: [["retriever", "docs"]] }), m: L("retriever", "model", { heads: "end" }), t: L("meter", "retriever", { style: "dashed", via: [["meter", "retriever"]], label: "right passage in top 5?" }) }, [{ route: ["r"], bounce: true, rate: 0.4 }, { route: ["t"], bounce: true, kind: "ping", rate: 0.35 }]),
      },
      {
        short: "The bill", chapter: "technique", title: "The bill is three times too high. What first?",
        body: ["The reciting answer lists ways to save money. The first move: measure tokens per request before you cut anything. Most bills are one request that sends far more than it needs: the whole history, five documents instead of one.", "Count tokens in and out per request, find the fat one, and the fix is usually obvious."],
        changes: ["+ Tokens counted per request", "~ The fat request found"],
        metrics: { q: "the bill is 3× too high", wrong: "list savings", move: { v: "count tokens per request first", tone: "green" } },
        scene: ask(card("question 2", ["the model bill is three", "times too high. What first?"]), { model: Object.assign({}, model, { x: 10, y: 0, tags: [{ text: "18,000 tokens in per request", tone: "red" }] }), bill: Object.assign({}, bill, { x: 10, y: 0, dx: 70, dy: -10 }) }, { m: L("you", "model", { heads: "end" }) }, [{ route: ["m"], kind: "heavy", rate: 0.4 }]),
      },
      {
        short: "Injection", chapter: "technique", title: "A web page says 'ignore your instructions'. What first?",
        body: ["The reciting answer describes prompt injection. The first move: assume the model will sometimes obey, and make obeying harmless. Limit what the agent can do to what you would let a stranger do, and keep anything that matters behind a check outside the model.", "You do not win by making the model unfoolable. You win by making a fooled model unable to hurt you."],
        changes: ["~ Assume the model will sometimes obey", "+ Allowed actions limited outside the model"],
        metrics: { q: "a page says ignore your instructions", wrong: "define injection", move: { v: "assume it works; make it harmless", tone: "green" } },
        scene: ask(card("question 3", ["a fetched page says", "'ignore your instructions'"]), { page: Object.assign({}, page, { tags: [{ text: "hidden instruction", tone: "red" }] }), model: Object.assign({}, model, { x: 4, y: 2 }), fence }, { p: L("page", "model", { heads: "end" }), f: L("model", "fence", { heads: "end" }) }, [{ route: ["p"], kind: "bad", rate: 0.4 }, { route: ["f"], kind: "bad", rate: 0.4, fail: 0.9 }]),
      },
      {
        short: "Fine-tune", chapter: "technique", title: "Should we fine-tune? What first?",
        body: ["The reciting answer explains fine-tuning. The first move: ask what they want it to learn. Fine-tuning teaches style and format: how to answer. It does not keep facts current.", "If the problem is <em>it does not know yesterday's prices</em>, fine-tuning is the wrong tool; retrieval is. If the problem is <em>it answers in the wrong shape</em>, fine-tuning might be right, after prompting has been tried."],
        callout: { kind: "tip", text: "Facts that change belong in retrieval. Habits that do not change belong in the prompt first, and in fine-tuning only when the prompt cannot carry them." },
        changes: ["~ Asked what it should learn: facts or style"],
        metrics: { q: "should we fine-tune?", wrong: "explain fine-tuning", move: { v: "ask: facts, or style?", tone: "green" } },
        scene: ask(card("question 4", ["should we fine-tune", "the model?"]), { data: Object.assign({}, data, { tags: [{ text: "facts: retrieval", tone: "blue" }] }), model: Object.assign({}, model, { x: 16, y: 2, tags: [{ text: "style: prompt, then fine-tune", tone: "violet" }] }) }, { d: L("data", "model", { via: [["data", "model"]], style: "dashed" }) }, [{ route: ["d"], bounce: true, rate: 0.35 }]),
      },
      {
        short: "The pattern", chapter: "insight", title: "Every first move is a measurement or a boundary",
        body: ["Look at the four moves. Two are measurements: find out where retrieval fails, count the tokens. Two are boundaries: limit what a fooled model can do, decide what fine-tuning is for.", "That is what the panel hears: someone who measures before changing and bounds before trusting."],
        callout: { kind: "idea", text: "When you do not know the first move, say what you would measure. It is almost always right, and it is always honest." },
        metrics: { q: "any", wrong: "recite", move: "measure, or draw a boundary" },
        scene: ask(card("the pattern", ["measure before changing", "bound before trusting"]), {}, {}, []),
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["Lead with the <b>first move</b>, not the definition.", "Retrieval: <b>measure finding</b> separately from answering.", "Cost: <b>count tokens per request</b> before cutting anything.", "Injection: <b>assume it works</b> and make it harmless.", "Fine-tuning: <b>style, not facts</b>; facts live in retrieval."],
        callout: { kind: "next", text: "The rest of this lab is the question bank itself, then the deep dives: retrieval from 10,000 documents, the cost question, cheaper, better, safer, faster, and model migration." },
        metrics: { q: "any", wrong: "recite", move: "measure, or draw a boundary" },
      },
    ],
  };
})();
