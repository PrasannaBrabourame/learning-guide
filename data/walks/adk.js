/* Walkthrough: building an agent from a kit, one part at a time. Drawn by assets/walk.js. */
(window.WALKS = window.WALKS || {}).adk = (function () {
  const user = { type: "person", x: -18, y: 2, label: "A customer", tint: "sand" };
  const agent = { type: "block", x: -5, y: 0, label: "Agent", glyph: "agent", tint: "orange" };
  const model = { type: "model", x: -5, y: -14, label: "The model", glyph: "AI", tint: "violet" };
  const t1 = { type: "block", x: 9, y: -9, label: "Look up order", glyph: "T1", tint: "blue", s: 0.85 };
  const t2 = { type: "block", x: 12, y: 1, label: "Start a refund", glyph: "T2", tint: "blue", s: 0.85 };
  const t3 = { type: "block", x: 9, y: 11, label: "Send an email", glyph: "T3", tint: "blue", s: 0.85 };
  const docs = { type: "db", x: 24, y: -6, label: "Policy documents", tint: "violet" };
  const session = { type: "db", x: -18, y: 14, label: "Session state", tint: "amber" };
  const sub = { type: "block", x: 24, y: 8, label: "Refund specialist", glyph: "agent", tint: "rose" };
  const runtime = { type: "zone", x: -12, y: -20, w: 30, d: 36, label: "managed runtime", tint: "teal" };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const base = () => ({
    ents: { user, agent, model, t1, t2, t3 },
    links: { u: L("user", "agent"), m: L("agent", "model"), a: L("agent", "t1", { via: [["agent", "t1"]] }), b: L("agent", "t2"), c: L("agent", "t3", { via: [["agent", "t3"]] }) },
    flows: [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["m"], bounce: true, rate: 0.5, speed: 70 }, { route: ["a"], bounce: true, rate: 0.35 }],
  });
  return {
    title: "An agent built from a kit, one part at a time",
    summary: "Watch a support agent grow from a bare model call into something that picks tools, remembers the conversation, checks the policy, hands hard cases to a specialist and runs somewhere safe.",
    plain: "an agent is a model with hands: it reads what the customer wants, picks a tool, calls it, reads the result and goes round again. A kit gives you the parts: tools with clear descriptions, memory for the conversation, a way to ground answers in your own documents, a way to hand work to another agent, and a place to run it all. This walk fits each part and shows what goes wrong without it.",
    reallife: "A new hire on the help desk. On day one they have a phone and good judgement. Then you give them the tools, labelled clearly; a notepad for the call they are on; the policy binder; a specialist to call for refunds; and a desk in the building rather than their kitchen table.",
    terms: [
      ["agent", "a program that uses an AI model to decide what to do next and then does it, such as calling a tool"],
      ["tool", "something the agent can call to act on the world: look up an order, start a refund, send an email"],
      ["tool schema", "the written description of a tool the model sees: its name, what it does, and exactly what inputs it takes"],
      ["callback", "code of yours that runs at a fixed point in the loop, such as just before a tool is called"],
      ["session state", "what has been said and decided so far in this conversation, kept so the next turn can use it"],
      ["grounding", "making the model answer from your own documents rather than from memory, so it can quote the real policy"],
      ["sub-agent", "a second agent with a narrower job, which the first one hands work to"],
      ["runtime", "the managed place an agent runs: it starts it, scales it and keeps each conversation apart"],
      ["agent loop", "read the situation, ask the model, call a tool, feed the result back, repeat until there is an answer"],
    ],
    metrics: [{ k: "parts", label: "Parts fitted" }, { k: "right", label: "Answered correctly" }, { k: "where", label: "Where it runs" }],
    legend: [{ kind: "req", label: "a request" }, { kind: "res", label: "a reply" }, { kind: "bad", label: "a wrong turn" }, { kind: "write", label: "a note saved" }],
    goals: [
      { text: "The loop every agent runs: read, decide, call a tool, repeat", step: 2 },
      { text: "Why a tool's description decides whether it gets picked", step: 3 },
      { text: "Session state and grounding, and the mistakes they prevent", step: 6 },
      { text: "When to hand work to a specialist agent", step: 7 },
      { text: "What a managed runtime does for you", step: 8 },
    ],
    steps: [
      {
        short: "Just a model", chapter: "problem", title: "A model on its own can only talk",
        body: ["A customer asks <em>where is order A-4417?</em> The model writes a lovely reply about how orders usually ship. It cannot look anything up, so the reply is confident and useless.", "A model answers from what it already knows. To act, it needs hands."],
        callout: { kind: "idea", text: "The difference between a chatbot and an agent is not cleverness. It is whether it can call something and act on the result." },
        metrics: { parts: 1, right: { v: "no", tone: "red" }, where: "a laptop" },
        scene: { ents: { user: Object.assign({}, user, { tags: [{ text: "where is order A-4417?", tone: "violet" }] }), model: Object.assign({}, model, { x: -5, y: -4, tags: [{ text: "orders usually ship in 3 days", tone: "amber" }] }) }, links: { u: L("user", "model") }, flows: [{ route: ["u"], bounce: true, rate: 0.4 }] },
      },
      {
        short: "The loop", chapter: "technique", title: "Wrap it in a loop with tools",
        body: ["Put an agent around the model and hang three tools on it: look up an order, start a refund, send an email. Now the loop runs: read the request, ask the model what to do, call the tool it names, feed the result back, go round again.", "The customer asks the same question. The model says <em>look up the order</em>, the agent calls that tool, and the real answer comes back."],
        changes: ["+ The agent loop, with three tools"],
        metrics: { parts: 2, right: { v: "yes", tone: "green" }, where: "a laptop" },
        scene: base(),
      },
      {
        short: "The label", chapter: "technique", title: "The tool's description is how it gets picked",
        body: ["The model never sees your code. It sees each tool's schema: a name, one sentence about what it does, and the inputs it takes. It picks by reading those labels.", "Two tools with vague labels, <em>handle order</em> and <em>process order</em>, and the model guesses. Label them <em>look up an order by number</em> and <em>start a refund for an order</em> and it stops guessing."],
        callout: { kind: "warn", text: "Write every tool description for a careful stranger. If a person could not tell two tools apart from their labels, the model cannot either." },
        changes: ["~ Tool descriptions rewritten"],
        metrics: { parts: 2, right: { v: "yes", tone: "green" }, where: "a laptop" },
        scene: (s) => { s.ents.t1 = Object.assign({}, t1, { state: "lit", tags: [{ text: "look up an order by number", tone: "blue" }] }); s.ents.t2 = Object.assign({}, t2, { tags: [{ text: "start a refund for an order", tone: "blue" }] }); s.flows = [{ route: ["m"], bounce: true, rate: 0.5, speed: 70 }]; return s; },
      },
      {
        short: "Forgetting", chapter: "problem", title: "It forgets the last turn",
        body: ["The customer says <em>and refund it</em>. Refund what? The agent has no memory of the order number from a moment ago, so it asks again, and the customer sighs.", "Every turn starts from nothing unless something keeps the thread."],
        metrics: { parts: 2, right: { v: "no", tone: "red" }, where: "a laptop" },
        scene: (s) => { s.ents.t1 = t1; s.ents.t2 = t2; s.ents.user = Object.assign({}, user, { tags: [{ text: "and refund it", tone: "violet" }] }); s.ents.agent = Object.assign({}, agent, { tags: [{ text: "refund which order?", tone: "red" }] }); s.flows = [{ route: ["u"], bounce: true, back: "bad", rate: 0.4 }]; return s; },
      },
      {
        short: "A notepad", chapter: "technique", title: "Session state: a notepad for this conversation",
        body: ["Give the agent session state: a small store that keeps what was said and decided in this conversation. The order number is written down on turn one and read back on turn two.", "Now <em>and refund it</em> works, because the agent knows which <em>it</em>."],
        callout: { kind: "tip", text: "Keep the notepad per conversation and per user. One shared notepad is how customer A's order gets refunded to customer B." },
        changes: ["+ Session state", "~ The order number carried between turns"],
        metrics: { parts: 3, right: { v: "yes", tone: "green" }, where: "a laptop" },
        scene: (s) => { s.ents.user = user; s.ents.agent = agent; s.ents.session = session; s.links.s = L("agent", "session", { heads: "both", label: "order A-4417", labelAt: 0.55 }); s.flows = [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["s"], bounce: true, kind: "write", back: "res", rate: 0.4 }, { route: ["b"], bounce: true, rate: 0.35 }]; return s; },
      },
      {
        short: "The policy", chapter: "technique", title: "Grounding: answer from the real policy",
        body: ["Asked <em>can I return a sale item?</em> the model answers from memory, and memory says yes. Your policy says no. Grounding fixes this: the agent first fetches the relevant page from your documents and the model answers from that page, quoting it.", "The answer is now your answer, not the internet's average answer."],
        changes: ["+ Policy documents, searched before answering", "~ Answers quote the real policy"],
        metrics: { parts: 4, right: { v: "yes", tone: "green" }, where: "a laptop" },
        scene: (s) => { s.ents.docs = docs; s.ents.user = Object.assign({}, user, { tags: [{ text: "can I return a sale item?", tone: "violet" }] }); s.links.g = L("agent", "docs", { via: [["agent", "docs"]], label: "returns policy, page 2", labelAt: 0.6 }); s.flows = [{ route: ["g"], bounce: true, rate: 0.4 }, { route: ["m"], bounce: true, rate: 0.5, speed: 70 }]; return s; },
      },
      {
        short: "A specialist", chapter: "technique", title: "Hand the hard cases to a specialist",
        body: ["Refunds have rules: limits, exceptions, a second check over a certain amount. Rather than teach the support agent all of it, add a refund specialist, a second agent with a narrow job, and let the first hand the case over.", "The support agent stays simple. The specialist can be tested on its own."],
        callout: { kind: "idea", text: "One agent that does everything is hard to test and easy to confuse. Several small agents, each with one job, are how real systems are built." },
        changes: ["+ Refund specialist (a sub-agent)", "~ Refunds handed over instead of handled"],
        metrics: { parts: 5, right: { v: "yes", tone: "green" }, where: "a laptop" },
        scene: (s) => { s.ents.user = user; s.ents.sub = sub; s.links.h = L("agent", "sub", { via: [["agent", "sub"]], label: "over to you", labelAt: 0.5 }); s.links.b = L("sub", "t2"); s.flows = [{ route: ["h"], bounce: true, rate: 0.35 }, { route: ["b"], bounce: true, rate: 0.4 }]; return s; },
      },
      {
        short: "Somewhere safe", chapter: "solution", title: "Run it somewhere safe",
        body: ["It all works on a laptop. Customers cannot use a laptop. Deploy the agent to a managed runtime (in this lab, Agent Runtime): it starts the agent, keeps every conversation apart from every other, scales when the queue grows, and records each step.", "The code is the same. What changed is who looks after it at 3am."],
        changes: ["+ Managed runtime", "~ Each conversation kept apart", "~ Every step recorded"],
        metrics: { parts: 6, right: { v: "yes", tone: "green" }, where: { v: "managed runtime", tone: "green" } },
        scene: (s) => { s.ents = Object.assign({ runtime }, s.ents); s.flows = [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["a"], bounce: true, rate: 0.35 }, { route: ["h"], bounce: true, rate: 0.25 }]; return s; },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["A model alone can only talk; the <b>agent loop</b> gives it hands.", "The model picks tools by their <b>descriptions</b>, so write them for a careful stranger.", "<b>Session state</b> keeps the thread of one conversation.", "<b>Grounding</b> makes answers come from your documents.", "A <b>specialist agent</b> takes the hard cases; a <b>managed runtime</b> takes the 3am calls."],
        callout: { kind: "next", text: "The rest of this lab opens each part: tool schemas, state, callbacks, orchestration, grounding, code execution, skills and deployment." },
        metrics: { parts: 6, right: { v: "yes", tone: "green" }, where: { v: "managed runtime", tone: "green" } },
      },
    ],
  };
})();
