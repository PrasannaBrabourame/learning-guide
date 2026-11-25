/* Walkthrough: what an inference engine does that the model does not. */
(window.WALKS = window.WALKS || {}).serving = (function () {
  const users = (n, label) => ({ type: "crowd", x: -18, y: 2, label, tint: "sand", n });
  const queue = (n) => ({ type: "queue", x: -5, y: 0, label: "Waiting requests", n, dir: [0, 1] });
  const engine = { type: "block", x: 8, y: 0, label: "The engine", glyph: "run", tint: "orange" };
  const weights = { type: "db", x: 20, y: -8, label: "The model's weights", tint: "violet", s: 1.1 };
  const cache = { type: "db", x: 20, y: 8, label: "The cache", tint: "amber" };
  const board = (lines, title) => ({ type: "panel", x: 8, y: 0, dx: -60, dy: -150, title: title || "this second", lines });
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const serve = (n, lines, rateIn, rateW) => ({
    ents: { users: users(Math.min(5, Math.max(1, Math.ceil(n / 2))), n === 1 ? "One user" : n + " users"), queue: queue(Math.min(7, n)), engine, weights, board: board(lines) },
    links: { u: L("users", "queue", { heads: "end" }), q: L("queue", "engine", { heads: "end" }), w: L("engine", "weights", { via: [["engine", "weights"]], label: "read every weight, once per pass", labelAt: 0.7 }), r: L("engine", "users", { heads: "end", via: [["engine", "users"]], style: "dashed" }) },
    flows: [{ route: ["u"], rate: rateIn }, { route: ["w"], bounce: true, kind: "heavy", rate: rateW, speed: 60 }, { route: ["r"], kind: "res", rate: rateIn }],
  });
  return {
    title: "What the engine does that the model does not",
    summary: "Loading a model and calling it once is easy. Serving a thousand people at once, on a chip billed by the hour, is the engine's job: batching, a cache, a scheduler, and the trade between throughput and the wait per token.",
    plain: "to write one token for one user, the engine has to read the whole model once. Read it once and write one token for eight users instead, and you get eight times the output for almost the same work. That is batching, and it is most of what an inference engine does. This walk serves one user, then eight, then sixty-four, adds a cache, then hands a thousand to the scheduler, and shows the trade: more tokens a second for everyone, a slightly longer wait for each.",
    reallife: "A pizza oven. Baking one pizza takes twelve minutes and heats the whole oven. Baking eight at once takes thirteen. A restaurant that fires one pizza at a time serves nobody; one that waits for eight orders serves everyone a minute later.",
    startby: "Press Next to add users and watch the engine batch them, read the trade at step 4, then add the cache. Arrow keys work too.",
    terms: [
      ["prefix caching", "keeping the work already done on a shared opening, such as the same instructions at the start of every request, so it is not done again"],
      ["inference engine", "the program that runs a model for many users at once: queues requests, batches them, keeps the cache, schedules the chip"],
      ["weights", "the model's numbers, tens of gigabytes of them; every token written means reading them all once"],
      ["batch", "a group of requests the engine serves in one pass of the weights"],
      ["throughput", "tokens written per second across all users"],
      ["latency", "how long one user waits, for the first token and then for each one after"],
      ["KV cache", "the stored keys and values for every token so far, so they are not recomputed; it eats chip memory fast"],
      ["prefill", "the model reading the whole prompt in one parallel pass before it writes anything"],
      ["token", "a word or a piece of one; the model writes its reply one token at a time"],
      ["decode", "writing the reply one token at a time, one full pass of the weights for each"],
    ],
    metrics: [{ k: "batch", label: "Batch size" }, { k: "tps", label: "Tokens a second, total" }, { k: "wait", label: "Wait per token, each user" }],
    legend: [{ kind: "req", label: "a request" }, { kind: "heavy", label: "one pass of the weights" }, { kind: "res", label: "a token back to a user" }, { kind: "write", label: "the cache" }],
    goals: [
      { text: "Why one token costs one full read of the model", step: 1 },
      { text: "Batching: one pass, many users", step: 3 },
      { text: "The trade: throughput against the wait per token", step: 4 },
      { text: "What the cache saves and what it costs", step: 5 },
      { text: "What the scheduler decides a thousand times a second", step: 6 },
    ],
    steps: [
      {
        short: "One user", chapter: "problem", title: "One user, one token, one full read",
        body: ["One user asks a question. To write each token of the reply, the engine reads every weight in the model once, tens of gigabytes, and produces one token.", "Twenty milliseconds a pass, fifty tokens a second, and the chip is mostly waiting for memory. For one user, that is fine."],
        callout: { kind: "idea", text: "Writing a token is not limited by arithmetic. It is limited by how fast the weights can be read, and they are read whole every time." },
        metrics: { batch: 1, tps: "50", wait: "20 ms" },
        scene: serve(1, ["1 pass = 1 token", "20 ms a pass", "= 50 tokens a second"], 0.3, 0.45),
      },
      {
        short: "Eight users", chapter: "problem", title: "Eight users, one at a time",
        body: ["Eight users arrive. Serve them one at a time and each waits for the other seven. The eighth user sees their first token after a long pause and the chip is still mostly waiting for memory.", "Reading the weights eight times to write eight tokens is the waste."],
        changes: ["+ Seven more users", "~ Each waits for the others"],
        metrics: { batch: 1, tps: "50", wait: { v: "160 ms", tone: "red" } },
        scene: serve(8, ["8 users, one at a time", "8 passes for 8 tokens", "= still 50 a second"], 0.6, 0.45),
      },
      {
        short: "Batch", chapter: "technique", title: "Batching: one pass, eight tokens",
        body: ["The engine lines the eight requests up and runs them through one pass of the weights together. The pass takes a little longer, twenty-three milliseconds instead of twenty, and writes eight tokens instead of one.", "Three hundred and fifty tokens a second from the same chip. That is most of what an engine is for."],
        callout: { kind: "tip", text: "Batching works because the weights are read once for the whole batch. The arithmetic for eight users is nearly free compared with the read." },
        changes: ["~ Eight requests in one pass", "~ 23 ms a pass, 8 tokens a pass"],
        metrics: { batch: 8, tps: { v: "350", tone: "green" }, wait: "23 ms" },
        scene: serve(8, ["8 users in one pass", "23 ms a pass, 8 tokens", "= 350 tokens a second"], 0.6, 0.4),
      },
      {
        short: "The trade", chapter: "tradeoff", title: "Bigger batches: more total, slower each",
        body: ["Sixty-four users in a batch: a pass takes forty milliseconds and writes sixty-four tokens. Sixteen hundred tokens a second, and every user now waits forty milliseconds per token instead of twenty.", "Throughput for everyone rises. The wait for each person rises too. You choose the batch size by how long a user may wait."],
        changes: ["~ Batch of 64", "~ 40 ms a pass, 1,600 tokens a second"],
        metrics: { batch: 64, tps: { v: "1,600", tone: "green" }, wait: { v: "40 ms", tone: "amber" } },
        scene: serve(64, ["64 users in one pass", "40 ms a pass", "= 1,600 a second, 40 ms each"], 0.9, 0.3),
      },
      {
        short: "The cache", chapter: "technique", title: "The cache: do not re-read what you have already read",
        body: ["Every token the model has read leaves a trace it needs again for the next token. Without a cache, writing token 500 means re-reading the first 499. The engine keeps those traces in chip memory: the cache.", "It makes long replies cheap and eats memory fast. How many users fit in a batch is often decided by how much cache fits on the chip."],
        changes: ["+ The cache, in chip memory", "~ Batch size now limited by cache room"],
        metrics: { batch: "as many as the cache holds", tps: { v: "1,600", tone: "green" }, wait: "40 ms" },
        scene: (() => { const s = serve(64, ["cache per user grows", "with every token written", "= memory decides the batch"], 0.9, 0.3); s.ents.cache = Object.assign({}, cache, { tags: [{ text: "fills as replies grow", tone: "amber" }] }); s.links.c = L("engine", "cache", { via: [["engine", "cache"]] }); s.flows.push({ route: ["c"], bounce: true, kind: "write", rate: 0.6 }); return s; })(),
      },
      {
        short: "Scheduler", chapter: "solution", title: "The scheduler decides, a thousand times a second",
        body: ["A thousand users, some wanting ten tokens, some four thousand. Which join the next pass? Who has waited longest? Is there cache room? Should a new prompt be read now, which delays everyone, or after this pass?", "The engine answers those questions every pass. That decision loop, not the model, is what makes serving work."],
        callout: { kind: "idea", text: "The model is the same file whoever runs it. The engine's scheduling is where one provider is fast and cheap and another is not." },
        changes: ["+ A thousand users", "~ Scheduler fills each pass from the queue"],
        metrics: { batch: "chosen each pass", tps: { v: "1,500 to 1,800", tone: "green" }, wait: "under 50 ms, target" },
        scene: (() => { const s = serve(1000, ["each pass:", "who joins, who waits,", "is there cache room"], 1.2, 0.35); s.ents.engine = Object.assign({}, engine, { tags: [{ text: "deciding every pass", tone: "orange", dx: -30 }] }); s.ents.cache = cache; s.links.c = L("engine", "cache", { via: [["engine", "cache"]] }); s.flows.push({ route: ["c"], bounce: true, kind: "write", rate: 0.6 }); return s; })(),
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["One token costs one full read of the <b>weights</b>.", "<b>Batching</b> reads them once for many users: most of the engine's value.", "Bigger batches raise <b>throughput</b> and the <b>wait per token</b> together; pick by the wait you can accept.", "The <b>cache</b> makes long replies cheap and eats memory, which caps the batch.", "The <b>scheduler</b> fills every pass; it is where providers differ."],
        callout: { kind: "next", text: "The rest of this lab takes each piece in turn: prefill and decode, the scheduler, prefix caching, speculative decoding, launch overhead, many tuned variants on one model, splitting the two phases, cache tiers, structured output, the request lifecycle and the metrics that matter." },
        metrics: { batch: "chosen each pass", tps: { v: "1,500 to 1,800", tone: "green" }, wait: "under 50 ms" },
      },
    ],
  };
})();
