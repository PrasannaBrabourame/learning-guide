/* Walkthrough: from a laptop demo to a production agent, one managed part at a time. */
(window.WALKS = window.WALKS || {}).agentcore = (function () {
  const user = { type: "crowd", x: -15, y: 2, label: "Customers", tint: "sand" };
  const laptop = { type: "device", x: -4, y: 0, label: "The demo, on a laptop", screen: "violet" };
  const agent = { type: "block", x: -4, y: 0, label: "Agent", glyph: "agent", tint: "orange" };
  const runtime = { type: "zone", x: -11, y: -8, w: 14, d: 16, label: "runtime: one sealed box per session", tint: "teal", labelAt: "back" };
  const memory = { type: "db", x: -6, y: 15, label: "Memory", tint: "amber" };
  const gateway = { type: "block", x: 10, y: 0, label: "Gateway", glyph: "GATE", tint: "teal" };
  const crm = { type: "db", x: 22, y: -8, label: "Customer records", tint: "violet" };
  const orders = { type: "db", x: 22, y: 4, label: "Orders", tint: "violet" };
  const idp = { type: "block", x: 10, y: -14, label: "Identity", glyph: "ID", tint: "blue", s: 0.85 };
  const obs = { type: "db", x: 10, y: 15, label: "Trace of every step", tint: "slate" };
  const sandbox = { type: "block", x: 22, y: 15, label: "Code sandbox", glyph: "RUN", tint: "rose", s: 0.85 };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  return {
    title: "From a laptop demo to an agent you would let near a customer",
    summary: "The same agent, fitted with the managed parts a production agent needs: a sealed place to run, memory, one door to its tools, an identity, a record of every step and a sandbox for code.",
    plain: "getting an agent to work once on your laptop is a weekend. Getting one you would let near customers needs parts the demo never had: somewhere safe to run, memory, one door to its tools, a way to prove who it is, a record of what it did, and a safe place to run code. This walk adds each one and shows the failure it prevents.",
    reallife: "A food stall that works at one market becomes a restaurant. The cooking is the same. What you add is a kitchen that passes inspection, a booking book, one supplier entrance, staff badges, a till that records every sale, and a separate prep room for the dangerous jobs.",
    terms: [
      ["runtime", "the managed place an agent runs: it starts it, scales it and keeps each conversation apart"],
      ["session", "one conversation with one user, from first message to last"],
      ["gateway", "the one door every tool call passes through, where the call can be checked, allowed or stopped"],
      ["token", "a short-lived pass that proves who is calling and what they are allowed to do; it expires on its own"],
      ["identity token", "a token that names who the agent is and who it is acting for, signed by the identity service"],
      ["trace", "the recorded chain of every step the agent took in one request: what it read, decided and called"],
      ["sandbox", "a sealed box where code the model wrote can run without touching anything else"],
      ["long-term memory", "what the agent should remember about a person across conversations, kept apart from the current chat"],
    ],
    metrics: [{ k: "users", label: "Can serve" }, { k: "kept", label: "Sessions kept apart" }, { k: "proof", label: "Can show what it did" }],
    legend: [{ kind: "req", label: "a customer's request" }, { kind: "res", label: "a reply" }, { kind: "bad", label: "a leak" }, { kind: "write", label: "a record written" }],
    goals: [
      { text: "Why one sealed box per session matters", step: 3 },
      { text: "Short-term versus long-term memory", step: 4 },
      { text: "Why the agent should never hold its own passwords", step: 5 },
      { text: "What a trace gives you that logs do not", step: 7 },
      { text: "Where model-written code may run", step: 8 },
    ],
    steps: [
      {
        short: "Demo", chapter: "problem", title: "It works on the laptop",
        body: ["The agent answers order questions beautifully, on a laptop, for one person at a time. The demo goes well and someone says <em>ship it</em>.", "Three hundred customers cannot talk to a laptop. And on the laptop, the agent holds every password it needs in a text file."],
        callout: { kind: "idea", text: "The model and the code barely change between demo and production. Everything around them does." },
        metrics: { users: { v: "1 at a time", tone: "red" }, kept: { v: "no", tone: "red" }, proof: { v: "no", tone: "red" } },
        scene: { ents: { user, laptop }, links: { u: L("user", "laptop") }, flows: [{ route: ["u"], bounce: true, rate: 0.3 }] },
      },
      {
        short: "Leak", chapter: "problem", title: "Two customers, one memory",
        body: ["Put it on a shared server and let two customers in. The agent keeps one conversation in memory, so customer B is shown customer A's order.", "Nothing was hacked. The agent simply had one notepad for everyone."],
        changes: ["+ A shared server", "- Any wall between conversations"],
        metrics: { users: "many", kept: { v: "no", tone: "red" }, proof: { v: "no", tone: "red" } },
        scene: { ents: { user: Object.assign({}, user, { tags: [{ text: "that is not my order", tone: "red" }] }), agent: Object.assign({}, agent, { state: "hot", tags: [{ text: "one notepad for everyone", tone: "red" }] }) }, links: { u: L("user", "agent") }, flows: [{ route: ["u"], bounce: true, back: "bad", rate: 0.5 }] },
      },
      {
        short: "Sealed box", chapter: "technique", title: "A runtime: one sealed box per session",
        body: ["Move the agent into a managed runtime. Every session gets its own small sealed machine, started on demand and thrown away afterwards. Customer A's conversation cannot see customer B's because they never share a box.", "You do not pick a server size. You pick how long a session may live, and the runtime does the rest."],
        changes: ["+ Managed runtime", "~ One sealed box per session, up to hours long"],
        metrics: { users: "many", kept: { v: "yes", tone: "green" }, proof: { v: "no", tone: "red" } },
        scene: { ents: { runtime, user, agent }, links: { u: L("user", "agent") }, flows: [{ route: ["u"], bounce: true, rate: 0.35 }] },
      },
      {
        short: "Memory", chapter: "technique", title: "Memory: this chat, and this person",
        body: ["Sealed boxes forget everything when they close. Add memory with two shelves: short-term, what was said in this conversation; and long-term, what the agent should remember about this person next time, such as their preferred delivery address.", "Short-term dies with the session. Long-term is stored on purpose, per person."],
        callout: { kind: "tip", text: "Decide what goes into long-term memory deliberately. Remembering a delivery address is helpful; remembering a card number is a breach." },
        changes: ["+ Short-term memory, per session", "+ Long-term memory, per person"],
        metrics: { users: "many", kept: { v: "yes", tone: "green" }, proof: { v: "no", tone: "red" } },
        scene: (s) => { s.ents.memory = Object.assign({}, memory, { tags: [{ text: "this chat · this person", tone: "amber" }] }); s.links.m = L("agent", "memory", { heads: "both" }); s.flows = [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["m"], bounce: true, kind: "write", rate: 0.4 }]; return s; },
      },
      {
        short: "One door", chapter: "technique", title: "A gateway: one door to every tool",
        body: ["The agent needs customer records and orders. Instead of giving it two passwords, put a gateway in front of both. The agent asks the gateway; the gateway holds the passwords and makes the calls.", "The agent never sees a password, so it cannot leak one, however it is tricked."],
        changes: ["+ Gateway", "+ Customer records and orders behind it", "- Passwords in the agent"],
        metrics: { users: "many", kept: { v: "yes", tone: "green" }, proof: { v: "no", tone: "red" } },
        scene: (s) => { s.ents.gateway = gateway; s.ents.crm = crm; s.ents.orders = orders; s.links.g = L("agent", "gateway"); s.links.g1 = L("gateway", "crm", { via: [["gateway", "crm"]] }); s.links.g2 = L("gateway", "orders", { via: [["gateway", "orders"]] }); s.flows = [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["g", "g2"], bounce: true, rate: 0.4 }]; return s; },
      },
      {
        short: "A badge", chapter: "technique", title: "Identity: a badge instead of a password",
        body: ["Who is this agent, and who is it acting for? An identity service hands the agent a short-lived token on each request: <em>this is the support agent, acting for customer A, for the next few minutes.</em>", "The gateway checks the token and only fetches customer A's records. Nothing long-lived to steal, nothing to rotate by hand."],
        callout: { kind: "idea", text: "A password opens a door for whoever holds it. A token names the holder, the person they act for, and when it expires." },
        changes: ["+ Identity service", "+ A short-lived token per request"],
        metrics: { users: "many", kept: { v: "yes", tone: "green" }, proof: { v: "no", tone: "red" } },
        scene: (s) => { s.ents.idp = idp; s.ents.agent = Object.assign({}, agent, { tags: [{ text: "acting for customer A · 5 min", tone: "blue" }] }); s.links.i = L("gateway", "idp", { style: "dashed", label: "pass checked" }); s.flows = [{ route: ["g", "g1"], bounce: true, rate: 0.4 }, { route: ["i"], bounce: true, kind: "ping", rate: 0.3 }]; return s; },
      },
      {
        short: "The record", chapter: "technique", title: "A trace of every step",
        body: ["A customer complains the agent promised a refund. Did it? Every request now leaves a trace: what the model was shown, what it decided, which tools were called, what came back.", "You can replay the exact conversation and see where it went wrong, instead of guessing from a log line."],
        changes: ["+ Trace of every step", "~ Any conversation can be replayed"],
        metrics: { users: "many", kept: { v: "yes", tone: "green" }, proof: { v: "yes", tone: "green" } },
        scene: (s) => { s.ents.agent = agent; s.ents.obs = obs; s.links.o = L("gateway", "obs", { heads: "end", label: "step by step", labelAt: 0.5 }); s.links.oa = L("agent", "obs", { heads: "end", style: "dashed" }); s.flows = [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["o"], kind: "write", rate: 0.5 }, { route: ["oa"], kind: "write", rate: 0.4 }]; return s; },
      },
      {
        short: "Sandbox", chapter: "solution", title: "A sandbox for the risky jobs",
        body: ["Sometimes the model writes code to work out a total, or needs a browser to check a delivery page. That code must not run inside the agent's box, where it could read anything.", "A sandbox runs it in a sealed box of its own, with nothing of yours inside, and hands back only the result."],
        callout: { kind: "warn", text: "Code the model wrote is untrusted code. Treat it exactly as you would a script a stranger emailed you." },
        changes: ["+ Code sandbox", "+ A managed browser, kept apart"],
        metrics: { users: "many", kept: { v: "yes", tone: "green" }, proof: { v: "yes", tone: "green" } },
        scene: (s) => { s.ents.sandbox = sandbox; s.links.c = L("gateway", "sandbox", { label: "code in, result out", labelAt: 0.6 }); s.flows = [{ route: ["c"], bounce: true, kind: "heavy", rate: 0.3 }, { route: ["o"], kind: "write", rate: 0.4 }]; return s; },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["A <b>runtime</b> gives every session its own sealed box.", "<b>Memory</b> has two shelves: this chat, and this person.", "A <b>gateway</b> is the one door to every tool, and holds the passwords.", "An <b>identity</b> token says who the agent is and who it acts for, and expires.", "A <b>trace</b> lets you replay any conversation; a <b>sandbox</b> runs untrusted code apart."],
        callout: { kind: "next", text: "The simulation below adds two more parts: evaluations, which prove a change made it better, and policy, which blocks forbidden actions. The tabs after it take each part in turn, then a worked case and the exam angle." },
        metrics: { users: "many", kept: { v: "yes", tone: "green" }, proof: { v: "yes", tone: "green" } },
        scene: (s) => { s.flows = [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["g", "g2"], bounce: true, rate: 0.35 }, { route: ["o"], kind: "write", rate: 0.4 }]; return s; },
      },
    ],
  };
})();
