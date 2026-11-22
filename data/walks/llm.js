/* Walkthrough: what happens between your prompt and the answer. Next token, again. */
(window.WALKS = window.WALKS || {}).llm = (function () {
  const you = { type: "person", x: -18, y: 2, label: "You", tint: "sand" };
  const tok = { type: "block", x: -6, y: -8, label: "Tokeniser", glyph: "cut", tint: "amber", s: 0.85 };
  const model = { type: "model", x: 6, y: 0, label: "The model", glyph: "AI", tint: "violet" };
  const bars = (lines, title) => ({ type: "panel", x: 6, y: 0, dx: 50, dy: -140, title: title || "most likely next token", lines });
  const sampler = { type: "block", x: 18, y: -8, label: "The sampler", glyph: "pick", tint: "orange", s: 0.85 };
  const tape = (text) => ({ type: "queue", x: 18, y: 8, label: "The reply so far", n: 6, dir: [1, 0], tags: [{ text, tone: "blue" }] });
  const ctx = (text, tone) => ({ type: "db", x: -6, y: 10, label: "The context window", tint: "slate", tags: [{ text, tone }] });
  const tool = { type: "block", x: 24, y: 20, label: "A tool", glyph: "tool", tint: "blue", s: 0.8 };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "end" }, extra);
  const step = (lines, text, extra) => { const s = {
    ents: { you, tok, model, bars: bars(lines), sampler, tape: tape(text), ctx: ctx("the prompt + the reply so far", "muted") },
    links: { u: L("you", "tok", { via: [["you", "tok"]] }), t: L("tok", "model"), m: L("model", "sampler", { via: [["model", "sampler"]] }), s: L("sampler", "tape", { via: [["sampler", "tape"]] }), b: L("tape", "model", { style: "dashed", via: [["model", "tape"]], label: "back in, next round", labelAt: 0.3 }), c: L("ctx", "model", { style: "dashed", heads: "none" }) },
    flows: [{ route: ["t", "m"], rate: 0.5, speed: 80 }, { route: ["s"], rate: 0.5, kind: "write" }, { route: ["b"], rate: 0.5, kind: "ping" }],
  }; if (extra) extra(s); return s; };
  return {
    title: "Next token, again",
    summary: "A language model does one thing: given the text so far, it scores every possible next piece. Watch one word get picked, stamped, and fed back in, then see where tools, the window and the dial fit.",
    plain: "a language model does one thing: given the words so far, it gives every possible next piece of text a score, and one is picked. That piece is added to the text and the whole thing runs again. A reply is that one step, repeated. This walk shows the step, the dial that makes it creative or careful, how a tool call is just another kind of text, and what the window it reads from can and cannot hold.",
    reallife: "Predictive text on a phone, taken seriously. It suggests the next word from everything typed so far; tap one, and it suggests again. A whole message is tapping the suggestions, one at a time, with the suggestions getting cleverer the more of the message they can see.",
    startby: "Press Next to pick the next token, stamp it, and feed it back in. Arrow keys work too.",
    terms: [
      ["token", "a piece of text about four letters long, the unit the model reads and writes"],
      ["tokeniser", "the part that chops your text into tokens before the model sees it"],
      ["sampler", "the part that picks one token from the model's scores; the dial on it sets how adventurous the pick is"],
      ["temperature", "the dial on the sampler: low always takes the top choice, high picks lower ones more often"],
      ["context window", "the fixed amount of text the model can be handed at once; the prompt and the reply so far must fit"],
      ["tool call", "the model writing a request for a function to be run, in a shape your code recognises and acts on"],
      ["tool result", "what your code sends back into the model's context after running the tool"],
    ],
    metrics: [{ k: "sofar", label: "The reply so far" }, { k: "top", label: "Top choice" }, { k: "window", label: "Window used" }],
    legend: [{ kind: "req", label: "tokens going in" }, { kind: "write", label: "a token stamped" }, { kind: "ping", label: "fed back in" }, { kind: "msg", label: "a tool call" }],
    goals: [
      { text: "The one step: score every next token, pick one, repeat", step: 3 },
      { text: "What the temperature dial changes", step: 4 },
      { text: "A tool call is just text in a recognised shape", step: 5 },
      { text: "What the context window holds and when it runs out", step: 6 },
    ],
    steps: [
      {
        short: "Chop", chapter: "technique", title: "Your words become tokens",
        body: ["You type <em>The cat sat on the</em>. The tokeniser chops it into pieces about four letters long. Common words are one token; rare words are several.", "The model never sees letters. It sees a list of token numbers."],
        callout: { kind: "idea", text: "Everything the model does, it does to tokens. That is why it counts letters badly and why bills are in tokens." },
        metrics: { sofar: "The cat sat on the", top: null, window: "6 of 8,000" },
        scene: step(["# scoring...", ""], "The cat sat on the", (s) => { s.flows = [{ route: ["u"], rate: 0.5 }, { route: ["t"], rate: 0.5 }]; }),
      },
      {
        short: "Score", chapter: "technique", title: "Every possible next token gets a score",
        body: ["The model reads all six tokens and gives a score to every token it knows, tens of thousands of them. <em>mat</em> 0.31, <em>floor</em> 0.12, <em>sofa</em> 0.09, and a long tail.", "It has not chosen anything. It has only said how likely each next piece is."],
        changes: ["+ A score for every token in the vocabulary"],
        metrics: { sofar: "The cat sat on the", top: "mat 0.31", window: "6 of 8,000" },
        scene: step(["mat     0.31", "floor   0.12", "sofa    0.09", "# ... 50,000 more"], "The cat sat on the", (s) => { s.flows = [{ route: ["t", "m"], rate: 0.5, speed: 80 }]; }),
      },
      {
        short: "Pick", chapter: "technique", title: "Pick one, stamp it, go again",
        body: ["The sampler picks one token from the scores, usually the top one. <em>mat</em> is stamped onto the reply. Now the text is seven tokens long, and the whole thing runs again on all seven.", "A reply of two hundred words is this step two hundred and something times. The model never plans the sentence; it only ever picks the next piece."],
        changes: ["+ mat, stamped", "~ Seven tokens go back in"],
        metrics: { sofar: "The cat sat on the mat", top: ". 0.44", window: "7 of 8,000" },
        scene: step([".       0.44", "and     0.21", ",       0.10"], "The cat sat on the mat"),
      },
      {
        short: "The dial", chapter: "tradeoff", title: "The dial: careful or adventurous",
        body: ["Turn the sampler's temperature down to zero and it always takes the top choice: the same reply every time, safe and a little dull. Turn it up and lower-scored tokens win more often: more variety, more surprises, more mistakes.", "Facts and code want it low. Brainstorming wants it higher."],
        callout: { kind: "tip", text: "If an agent gives you a different answer every run, the dial is one reason. For anything you need to repeat exactly, turn it down." },
        changes: ["~ Temperature raised", "~ sofa picked over mat"],
        metrics: { sofar: "The cat sat on the sofa", top: "mat 0.31, not picked", window: "7 of 8,000" },
        scene: step(["mat     0.31  ← top", "floor   0.12", "sofa    0.09  ← picked"], "The cat sat on the sofa", (s) => { s.ents.sampler = Object.assign({}, sampler, { state: "lit", tags: [{ text: "temperature: high", tone: "amber" }] }); }),
      },
      {
        short: "A tool", chapter: "technique", title: "A tool call is text in a recognised shape",
        body: ["Ask <em>what is the weather in Leeds?</em> The model cannot look anything up. But it has been shown the shape of a tool request, so the most likely next tokens are <code>get_weather(city=\"Leeds\")</code>.", "Your code recognises that shape, runs the function, and puts the result back into the text. The model then continues as if it had always known."],
        changes: ["+ A tool request written as tokens", "+ The result fed back in as more text"],
        metrics: { sofar: "get_weather(city=\"Leeds\")", top: "→ run it", window: "40 of 8,000" },
        scene: step(["get_weather(   0.62", "I don't know   0.11", "It is          0.08"], "get_weather(city=\"Leeds\")", (s) => { s.ents.tool = tool; s.links.k = L("tape", "tool", { style: "dashed" }); s.links.r = L("tool", "model", { style: "dashed", via: [["model", "tool"]], label: "12°C, rain", labelAt: 0.3 }); s.flows = [{ route: ["k"], kind: "msg", rate: 0.4 }, { route: ["r"], kind: "res", rate: 0.4 }]; }),
      },
      {
        short: "The window", chapter: "problem", title: "The window: everything must fit",
        body: ["The model can only read a fixed number of tokens at once: the prompt, every document you pasted, every tool result, and the reply so far. That is the context window.", "Paste a long report and a long conversation and the window fills. Then the oldest tokens fall off the front, and the model forgets what you said first."],
        callout: { kind: "warn", text: "Nothing outside the window exists to the model. Memory, documents and history only count if they are inside it right now." },
        changes: ["~ A long document pasted in", "~ Window nearly full"],
        metrics: { sofar: "...", top: null, window: { v: "7,900 of 8,000", tone: "red" } },
        scene: step(["# scoring over 7,900 tokens", ""], "...", (s) => { s.ents.ctx = ctx("7,900 of 8,000: the start is about to fall off", "red"); s.ents.model = Object.assign({}, model, { state: "hot" }); s.flows = [{ route: ["c"], rate: 0.6, kind: "heavy" }]; }),
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["Text becomes <b>tokens</b>; the model only ever sees tokens.", "One step: <b>score every next token, pick one, stamp it, feed it back</b>. A reply is that step repeated.", "The <b>temperature</b> dial trades sameness for variety.", "A <b>tool call</b> is tokens in a shape your code recognises.", "Everything must fit in the <b>context window</b>; outside it, nothing exists."],
        callout: { kind: "next", text: "The rest of this lab opens the model itself: embeddings, attention, the block, generation, the cache, quantisation and batching." },
        metrics: { sofar: "The cat sat on the mat.", top: null, window: "8 of 8,000" },
        scene: step(["# done", ""], "The cat sat on the mat.", (s) => { s.flows = [{ route: ["t", "m"], rate: 0.4, speed: 80 }, { route: ["s"], rate: 0.4, kind: "write" }, { route: ["b"], rate: 0.4, kind: "ping" }]; }),
      },
    ],
  };
})();
