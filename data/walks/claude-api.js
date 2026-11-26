/* Walkthrough on the API tab: "Where is order 4417?" through the shop's support assistant. Its token counts are the conversation simulation's. */
(window.WALKS = window.WALKS || {})["claude-api"] = (function () {
  const cust = { type: "person", x: -21, y: 9, label: "A customer", tint: "sand" };
  const phone = { type: "phone", x: -21, y: -3, label: "Phone", screen: "violet" };
  const code = { type: "block", x: -12, y: -12, label: "The shop's code", glyph: "code", tint: "blue" };
  const claude = { type: "model", x: 9, y: -19, label: "Claude", glyph: "model", tint: "violet" };
  const orders = { type: "db", x: 12, y: 2, label: "Order records", tint: "teal" };
  const cache = { type: "db", x: 21, y: -9, label: "The cache", tint: "green", s: 0.8 };
  const refund = { type: "block", x: 12, y: 2, label: "Refund tool", glyph: "refund", tint: "orange" };
  const person = { type: "person", x: 14, y: 16, label: "The approver", tint: "sand" };
  const L = (from, to, extra) => Object.assign({ from, to }, extra);
  const tag = (e, text, tone) => Object.assign({}, e, { tags: [{ text, tone }] });
  /* the conversation the shop's code keeps: one slab for each turn */
  const conv = (n, text, tone) => ({ type: "queue", x: -1, y: 5, label: "The conversation", dir: [1, 0], n, tags: text ? [{ text, tone }] : [] });
  const note = (title, lines) => ({ type: "panel", x: -21, y: 9, dx: -22, dy: 44, title, lines });
  const u = L("cust", "phone", { heads: "both" }), a = L("phone", "code"), k = L("code", "conv", { style: "dashed", heads: "both" });
  const q = (label) => L("code", "claude", { heads: "both", label, labelAt: 0.45 });
  const t = L("code", "orders", { label: "look_up_order", labelAt: 0.55 }), c = L("claude", "cache", { style: "dashed", heads: "both" });
  const out = { route: ["q"], kind: "req", rate: 0.5 }, home = { route: ["q"], kind: "res", reverse: true, rate: 0.5 };
  const asks = { route: ["a"], kind: "req", rate: 0.4 }, told = { route: ["a"], kind: "res", reverse: true, rate: 0.4 };
  return {
    title: "Where is order 4417? One question through the API",
    summary: "Follow one customer question through the shop's support assistant: the request, Claude asking for a tool, the shop's code running it, the answer, and what five turns cost with and without caching.",
    plain: "a customer asks the shop's support assistant where order 4417 is. Claude has no chat window here. The shop's own code sends Claude a request, Claude asks for a tool, the code runs it and sends the result back, and Claude writes the answer. This walk follows that question, then four more. It shows who really remembers the conversation, what that costs, what caching saves, and where the refund limit lives.",
    reallife: "A brilliant new colleague on a help line, who forgets every call the moment it ends. To carry on, the shop reads them the whole story so far before each new question. They cannot open the order book themselves either: they ask, and the shop looks it up and tells them what it says.",
    startby: "Press Next to follow the question from the customer's phone to Claude and back. From step 6, watch the tray marked The conversation: it holds one slab for each turn the code sends. Arrow keys work too.",
    terms: [
      ["API", "a way for one program to ask another to do something; here, the shop's software sending Claude a request and getting a reply"],
      ["Claude", "an AI model made by Anthropic that reads and writes text and can use tools it is given"],
      ["support assistant", "the shop's own program that answers customers' questions, with Claude doing the reading and writing inside it"],
      ["model", "the line of the request that says which Claude answers: a small fast one, a balanced one or a larger one"],
      ["token", "the unit text is counted and billed in: a short word, or a piece of a longer one"],
      ["max_tokens", "the line of the request that sets the longest reply you will accept"],
      ["system prompt", "the standing instructions sent at the start of every request, such as who the assistant is and how to behave"],
      ["tool", "a function the shop's software offers, such as looking up an order; its description travels in every request"],
      ["block", "one item in a reply: a piece of text, or a request for a tool"],
      ["stop reason", "the word that comes with every reply and says why Claude stopped writing"],
      ["tool_use", "the stop reason that means Claude is asking the code to run a tool and send back what it returned"],
      ["tool result", "what the tool returned, sent back to Claude by the code in the next request as a tool_result block"],
      ["end_turn", "the stop reason that means Claude finished what it wanted to say"],
      ["turn", "one question from the customer and one reply"],
      ["history", "the earlier turns of the conversation, kept by the code and sent again each time"],
      ["caching", "marking the unchanging start of the request so that repeats are read back at a fraction of the price; the kept copy is called the cache"],
      ["cache_control", "the marker that says everything up to here is the same as last time, so it can be read back cheaply"],
      ["billed as", "what the tokens sent cost, counted in full-price tokens"],
    ],
    metrics: [{ k: "typed", label: "Tokens the customer typed" }, { k: "sent", label: "Tokens the code sent" }, { k: "bill", label: "Billed as" }, { k: "fail", label: "Answers that failed" }],
    legend: [{ kind: "req", label: "a question or a request going out" }, { kind: "res", label: "a reply or a result coming back" }, { kind: "bad", label: "a reply that fails, or a refund refused" }, { kind: "ping", label: "a look-up, or a kept copy being read" }],
    goals: [
      { text: "What a request to the API holds", step: 2 },
      { text: "Who runs a tool, and who only asks", step: 4 },
      { text: "Why every turn sends the whole conversation", step: 6 },
      { text: "What caching saves, and where a limit lives", step: 9 },
    ],
    steps: [
      {
        short: "The question", chapter: "problem", title: "A question arrives, and Claude is not there yet",
        body: ["A customer types a question to the shop's support assistant: \"Where is order 4417?\" It is 20 tokens long.", "The support assistant is the shop's own code. Claude has no chat window here, and it cannot see the shop's order records.", "Claude will also remember nothing afterwards. Whatever it needs to know, the code must send, every time."],
        metrics: { typed: 20, sent: null, bill: null, fail: null },
        scene: { ents: { cust, phone: tag(phone, "Where is order 4417?", "violet"), code, claude: tag(claude, "remembers nothing", "muted") }, links: { u, a }, flows: [asks] },
      },
      {
        short: "The request", chapter: "technique", title: "The code wraps the question in a request",
        body: ["The shop's code sends Claude a request through the API. Five lines do nearly all the work: which model, a limit of 500 tokens on the reply, a system prompt, the tools on offer, and the messages so far.", "The request is 1,820 tokens, and only 20 of them are the customer's question. The other 1,800 are the start that never changes: the system prompt, four tool descriptions and the returns policy."],
        changes: ["+ One request: 1,820 tokens", "~ 1,800 of them are the unchanging start"],
        metrics: { typed: 20, sent: "1,820", bill: "1,820", fail: null },
        scene: { ents: { cust, phone, code: tag(code, "builds the request", "blue"), claude, req: note("the request", ["model: a Sonnet model", "max_tokens: 500", "system: brief and kind", "tools: 4 descriptions", "messages: the question"]) }, links: { u, a, q: q("1,820 tokens") }, flows: [asks, out] },
      },
      {
        short: "Claude asks", chapter: "technique", title: "The reply is a request, not an answer",
        body: ["Claude's reply is a list of blocks. One is text: \"Let me look that up.\" The other asks for a tool: look_up_order, with order 4417.", "With the blocks comes the stop reason, tool_use, and the cost: 1,820 tokens in, 46 out.", "Claude has not looked anything up. It cannot. It has asked."],
        callout: { kind: "idea", text: "The code reads the stop reason first. It says what to do next. The commonest bug in a first assistant is treating every reply as a finished answer." },
        changes: ["+ A reply with two blocks", "~ Stop reason: tool_use"],
        metrics: { typed: 20, sent: "1,820", bill: "1,820", fail: null },
        scene: { ents: { cust, phone, code, claude: tag(claude, "stop reason: tool_use", "amber"), rep: note("the reply", ["text: Let me look that up.", "tool_use: look_up_order", "input: order 4417", "stop_reason: tool_use", "usage: 1,820 in, 46 out"]) }, links: { u, a, q: q("a reply: two blocks") }, flows: [home] },
      },
      {
        short: "Code runs it", chapter: "technique", title: "The shop's code runs the tool",
        body: ["The shop's code runs the real function, look_up_order, against the order records. Back come the order's status and its items: it left the warehouse on Tuesday and is due on Thursday.", "The code sends that to Claude in the next request, as a tool_result block.", "The model never touches the shop's systems. The code does, so the code holds the limits."],
        changes: ["+ The code runs look_up_order", "+ A tool_result block goes back to Claude"],
        metrics: { typed: 20, sent: "1,820", bill: "1,820", fail: null },
        scene: { ents: { cust, phone, code: tag(code, "runs the tool itself", "blue"), claude, orders: tag(orders, "4417: due Thursday", "green"), res: note("what the tool returned", ["order 4417", "left warehouse: Tuesday", "due: Thursday", "1.7 litre kettle, $24.00"]) }, links: { u, a, q: q("with a tool_result"), t },
          flows: [{ route: ["t"], kind: "ping", bounce: true, back: "res", rate: 0.5 }, out] },
      },
      {
        short: "The answer", chapter: "solution", title: "Claude answers, and stops with end_turn",
        body: ["Now Claude has what it needs. It writes: \"It left the warehouse on Tuesday and is due on Thursday.\" The stop reason this time is end_turn: Claude has finished, and the loop is over.", "The shop's code shows the reply to the customer. One turn is done.", "A turn that uses a tool is really two requests. The tiles count it as one, of 1,820 tokens, the way the simulation below does."],
        changes: ["~ Stop reason: end_turn", "+ The customer has an answer"],
        metrics: { typed: 20, sent: "1,820", bill: "1,820", fail: 0 },
        scene: { ents: { cust, phone: tag(phone, "due on Thursday", "green"), code, claude: tag(claude, "stop reason: end_turn", "green"), orders, turn: note("one turn, two requests", ["request 1 → tool_use", "the code runs the tool", "request 2 → end_turn", "= counted here as one"]) }, links: { u, a, q: q("the answer"), t },
          flows: [home, told] },
      },
      {
        short: "Five turns", chapter: "problem", title: "Four more questions, and everything is sent again",
        body: ["The customer asks four more things: can the delivery address change, is the kettle the 1.7 litre one, what if it arrives damaged, and what was the order number again.", "The API remembers nothing between calls. So the shop's code keeps every turn and sends the whole conversation again each time: 1,820 tokens, then 2,140, 2,245, 2,490 and 2,620.", "The customer typed 105 tokens. The code sent 11,315. Most of that is the same 1,800-token start, sent five times."],
        callout: { kind: "warn", text: "The feeling of a conversation is made by the shop's code, not by Claude. That is why a long chat costs more per turn than a short one." },
        changes: ["+ Four more turns", "~ Typed: 105 tokens", "~ Sent: 11,315 tokens"],
        metrics: { typed: 105, sent: { v: "11,315", tone: "amber" }, bill: { v: "11,315", tone: "amber" }, fail: 0 },
        scene: { ents: { cust, phone, code: tag(code, "sends it all, every turn", "amber"), claude, orders, conv: conv(5, "5 turns, all kept", "blue"), sum: note("tokens sent, turn by turn", ["turn 1         1,820", "turn 2         2,140", "turn 3         2,245", "turn 4         2,490", "turn 5         2,620", "= 11,315 sent, 105 typed"]) }, links: { u, a, q: q("the whole conversation"), t, k },
          flows: [asks, { route: ["q"], kind: "heavy", rate: 0.6 }, { route: ["k"], kind: "ping", rate: 0.4 }] },
      },
      {
        short: "Send less?", chapter: "tradeoff", title: "Send less, and Claude knows less",
        body: ["One way to pay less is to send less. Suppose the code sends only the new message each time: 9,105 tokens, not 11,315.", "Three of the five answers fail. Asked about the delivery address, Claude replies: \"Which order do you mean?\" It is not being forgetful. The turn that named the order was not in the request, so it was never told.", "Keeping the last two turns does little better. It saves 740 tokens, 7% of the total, and one answer still fails."],
        callout: { kind: "warn", text: "What the code trims is what Claude no longer knows. Keep the facts that later turns lean on, or a short note of them." },
        changes: ["~ Only the new message is sent", "~ Sent: 9,105 tokens", "~ 3 of 5 answers fail"],
        metrics: { typed: 105, sent: "9,105", bill: "9,105", fail: { v: "3 of 5", tone: "red" } },
        scene: { ents: { cust, phone, code, claude: Object.assign({}, claude, { tags: [{ text: "Which order do you mean?", tone: "red", dx: -6 }] }), orders, conv: conv(1, "history left out", "red"), sum: note("history sent", ["# kept        sent  failed", "everything  11,315     0", "last two    10,575     1", "new only     9,105     3"]) }, links: { u, a, q: q("new message only"), t, k: L("code", "conv", { style: "off", heads: "both" }) },
          flows: [asks, out, { route: ["q"], kind: "bad", reverse: true, rate: 0.4 }] },
      },
      {
        short: "Caching", chapter: "solution", title: "Caching: keep everything, pay less",
        body: ["The better saving leaves nothing out. The code marks the unchanging start with cache_control, which says: everything up to here is the same as last time.", "On turn 1 those 1,800 tokens are written to the cache at a quarter extra. On turns 2 to 5 they are read back at about a tenth of the price.", "The code still sends 11,315 tokens. They are billed as 5,285, which is 53% off, and nothing was forgotten, because nothing was left out."],
        callout: { kind: "tip", text: "The start must be identical each time. Change one character early on and everything after it is paid for in full." },
        changes: ["+ The start, marked with cache_control", "~ Billed as: 11,315 → 5,285", "~ Answers that fail: 0"],
        metrics: { typed: 105, sent: "11,315", bill: { v: "5,285", tone: "green" }, fail: { v: 0, tone: "green" } },
        scene: { ents: { cust, phone, code, claude: tag(claude, "start read at a tenth", "green"), orders, conv: conv(5, "5 turns, all kept", "blue"), cache: Object.assign({}, cache, { tags: [{ text: "the 1,800-token start", tone: "green", dx: -16 }] }), sum: note("billed as, turn by turn", ["turn 1         2,270", "turn 2           520", "turn 3           625", "turn 4           870", "turn 5         1,000", "= 5,285, not 11,315"]) }, links: { u, a, q: q("the whole conversation"), t, k, c },
          flows: [asks, out, { route: ["c"], kind: "ping", bounce: true, back: "res", rate: 0.5 }] },
      },
      {
        short: "The refund cap", chapter: "insight", title: "A limit lives in the tool, and a person says yes",
        body: ["The assistant may also refund, up to $50. Suppose a customer talks it, politely and at length, into asking for a $400 refund on the $24 kettle, which was bought in the sale.", "Claude can only ask. The shop's code runs the refund tool, and the tool refuses in its own code: more than $50, more than the order is worth, and a sale item, which the shop exchanges and does not refund. No conversation can raise a limit the model does not hold.", "A refund the tool does allow still waits. Money that has left is hard to get back, so a person looks at the amount and the customer, and says yes first."],
        callout: { kind: "idea", text: "\"Never refund more than $50\" written in the system prompt is a request. The same limit inside the refund tool is a wall." },
        changes: ["+ A refund tool with a $50 cap in its code", "+ A person approves every refund"],
        metrics: { typed: 105, sent: "11,315", bill: "5,285", fail: 0 },
        scene: { ents: { cust, phone, code, claude: tag(claude, "asks for $400", "amber"), conv: conv(5), cache, refund: tag(refund, "refuses over $50", "red"), person: tag(person, "says yes first", "green"), safe: note("three layers", ["which tools exist at all", "each tool refuses", "a person approves"]) }, links: { u, a, q: q("tool_use: a refund"), k, c, f: L("code", "refund", { style: "red" }), g: L("refund", "person", { style: "dashed" }) },
          flows: [home, { route: ["f"], kind: "bad", fail: 0.9, rate: 0.5 }] },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["The <b>API remembers nothing</b>. The shop's code keeps the conversation and sends all of it on every turn.", "With <b>tools</b>, Claude asks and the code runs: <b>tool_use</b>, then a <b>tool_result</b>, then <b>end_turn</b>.", "Five turns: <b>105 tokens typed, 11,315 sent</b>. Sending only the new message breaks 3 of 5 answers.", "<b>Caching</b> the 1,800-token start bills the same five turns as 5,285, which is 53% off.", "The <b>$50 cap</b> lives in the refund tool's code, and a <b>person approves</b> every refund."],
        callout: { kind: "next", text: "The simulation below sends the same five turns and lets you switch caching and trimming yourself. The two after it practise reading the stop reason, and picking which line of the request to change." },
        metrics: { typed: 105, sent: "11,315", bill: "5,285", fail: 0 },
      },
    ],
    page: "claude", pane: "capi",
  };
})();
