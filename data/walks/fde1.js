/* Walkthrough: the seven parts of an enterprise agent, and where each control attaches. */
(window.WALKS = window.WALKS || {}).fde1 = (function () {
  const user = { type: "person", x: -17, y: 0, label: "An employee", tint: "sand" };
  const core = { type: "model", x: 0, y: 0, label: "Reasoning core", glyph: "AI", tint: "violet" };
  const tools = { type: "block", x: 14, y: -8, label: "Capabilities", glyph: "TOOL", tint: "blue" };
  const ctx = { type: "db", x: 14, y: 8, label: "Context plane", tint: "amber" };
  const runtime = { type: "zone", x: -9, y: -9, w: 18, d: 18, label: "runtime", tint: "teal" };
  const other = { type: "block", x: 6, y: -19, label: "Other agents", glyph: "agent", tint: "orange", s: 0.85 };
  const control = { type: "block", x: -14, y: -16, label: "Control plane", glyph: "rules", tint: "slate", s: 0.85 };
  const idz = { type: "zone", x: -12, y: -24, w: 38, d: 40, label: "identity boundary: acting as this employee", tint: "blue", labelAt: "back" };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  return {
    title: "The seven parts of an enterprise agent",
    summary: "The model is one part of seven. Add the other six one at a time, and see where each control, from least privilege to an audit trail, attaches.",
    plain: "the model inside a weekend demo and the model inside a bank's assistant can be the identical file. What differs is the body around it: the tools it may call, what it can see, where it runs, how it hands work to other agents, the policy that steers it, and who it acts as. Each part is a place to attach a control. This walk builds the body part by part.",
    reallife: "A surgeon is one person, but a hospital is not one surgeon. There is the theatre they work in, the instruments they may use, the patient notes they may read, the colleagues they hand over to, the hospital's rules, and the badge that says who they are. Safety lives in all of it, not in the surgeon's good intentions.",
    terms: [
      ["reasoning core", "the model: the part that reads the situation and picks the next step"],
      ["capabilities", "the tools an agent may call; the smaller the set, the smaller the damage a mistake can do"],
      ["context plane", "everything the agent can see when it decides: memory, documents, the state of the conversation"],
      ["runtime", "the managed place an agent runs: it starts it, scales it and keeps each conversation apart"],
      ["orchestration", "how one agent hands work to another and collects the result"],
      ["control plane", "the policies and settings that steer every agent: what is allowed, what is logged, which model to use"],
      ["identity boundary", "who the agent is acting as, and so which data it may touch; it must never widen on its own"],
      ["least privilege", "giving something only the access its job needs, and nothing more"],
    ],
    metrics: [{ k: "parts", label: "Parts in place" }, { k: "worst", label: "Worst a mistake can do" }, { k: "who", label: "Acting as" }],
    legend: [{ kind: "req", label: "a request" }, { kind: "res", label: "a reply" }, { kind: "msg", label: "a hand-over" }, { kind: "ping", label: "a policy check" }],
    goals: [
      { text: "Why the model is one part of seven, not the whole agent", step: 2 },
      { text: "How limiting capabilities limits the damage a mistake can do", step: 3 },
      { text: "The context plane, the runtime and orchestration", step: 6 },
      { text: "What the control plane and the identity boundary protect", step: 8 },
    ],
    steps: [
      {
        short: "Same model", chapter: "problem", title: "Same model, very different agents",
        body: ["An employee asks an assistant to find a customer's contract. In the weekend demo and in the bank's real assistant, the model answering is the same file.", "One of them may be trusted near customer data and one may not. The difference is everything around the model."],
        callout: { kind: "idea", text: "Two agents with the same model behave differently because their bodies differ. Judge the body." },
        metrics: { parts: 1, worst: { v: "anything", tone: "red" }, who: { v: "nobody in particular", tone: "red" } },
        scene: { ents: { user, core }, links: { u: L("user", "core") }, flows: [{ route: ["u"], bounce: true, rate: 0.35 }] },
      },
      {
        short: "The core", chapter: "technique", title: "Part one: the reasoning core",
        body: ["The core reads the situation and picks the next step. That is all it does. It does not hold passwords, it does not remember yesterday, it does not run anywhere in particular.", "Every other part exists to give the core something safe to work with."],
        metrics: { parts: 1, worst: { v: "anything", tone: "red" }, who: { v: "nobody in particular", tone: "red" } },
        scene: (s) => { s.ents.core = Object.assign({}, core, { state: "lit", tags: [{ text: "picks the next step", tone: "violet" }] }); return s; },
      },
      {
        short: "Tools", chapter: "technique", title: "Part two: capabilities, kept small",
        body: ["Give the core tools: search contracts, read a contract, nothing else. Not <em>send email</em>, not <em>delete</em>. A mistake can now read the wrong contract, which is bad, but it cannot send it anywhere.", "The smaller the toolset, the smaller the worst day."],
        callout: { kind: "tip", text: "Set the boundary by the worst action a wrong step could cause, not by the average one. Remove the tools the job never needs." },
        changes: ["+ Two tools: search and read", "- Send, delete, pay"],
        metrics: { parts: 2, worst: { v: "read the wrong file", tone: "amber" }, who: { v: "nobody in particular", tone: "red" } },
        scene: (s) => { s.ents.core = core; s.ents.tools = Object.assign({}, tools, { tags: [{ text: "search · read", tone: "blue" }] }); s.links.t = L("core", "tools", { via: [["core", "tools"]] }); s.flows = [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["t"], bounce: true, rate: 0.4 }]; return s; },
      },
      {
        short: "What it sees", chapter: "technique", title: "Part three: the context plane",
        body: ["What the core sees when it decides: the conversation so far, the documents it fetched, its memory. If a poisoned document is in view, the core will read it as fact.", "Controls here decide what may enter the agent's field of view, and from where."],
        changes: ["+ Context plane: memory, documents, state"],
        metrics: { parts: 3, worst: { v: "read the wrong file", tone: "amber" }, who: { v: "nobody in particular", tone: "red" } },
        scene: (s) => { s.ents.tools = tools; s.ents.ctx = ctx; s.links.c = L("core", "ctx", { via: [["core", "ctx"]] }); s.flows = [{ route: ["c"], bounce: true, rate: 0.4 }, { route: ["t"], bounce: true, rate: 0.3 }]; return s; },
      },
      {
        short: "Where", chapter: "technique", title: "Part four: the runtime",
        body: ["Where does it run, and how many at once? A runtime starts the agent, keeps one employee's session apart from another's, and scales when the queue grows.", "The control here is isolation: one sealed box per conversation."],
        changes: ["+ Runtime, one sealed box per session"],
        metrics: { parts: 4, worst: { v: "read the wrong file", tone: "amber" }, who: { v: "nobody in particular", tone: "red" } },
        scene: (s) => { s.ents = Object.assign({ runtime }, s.ents); return s; },
      },
      {
        short: "Hand-over", chapter: "technique", title: "Part five: orchestration",
        body: ["Contracts in French go to a translation agent. The core hands the work over and collects the result. That hand-over is a seam: what did it send, and what came back?", "Controls here decide which agents may talk to which, and what they are allowed to pass."],
        changes: ["+ Other agents, with a defined hand-over"],
        metrics: { parts: 5, worst: { v: "read the wrong file", tone: "amber" }, who: { v: "nobody in particular", tone: "red" } },
        scene: (s) => { s.ents.other = other; s.links.o = L("core", "other", { label: "translate this", labelAt: 0.4 }); s.flows = [{ route: ["o"], bounce: true, kind: "msg", rate: 0.35 }, { route: ["u"], bounce: true, rate: 0.3 }]; return s; },
      },
      {
        short: "The rules", chapter: "technique", title: "Part six: the control plane",
        body: ["Who decides which model is used, what is logged, which tools are allowed for which agent? Not each agent's code. A control plane holds the policy for all of them, and every agent checks it.", "Change a rule once and every agent follows it the next minute."],
        callout: { kind: "idea", text: "Rules in each agent's code drift apart. Rules in one control plane stay the same everywhere and can be audited." },
        changes: ["+ Control plane: policy for every agent"],
        metrics: { parts: 6, worst: { v: "read the wrong file", tone: "amber" }, who: { v: "nobody in particular", tone: "red" } },
        scene: (s) => { s.ents.control = control; s.links.p = L("core", "control", { style: "dashed", label: "allowed?" }); s.flows = [{ route: ["p"], bounce: true, kind: "ping", rate: 0.35 }, { route: ["t"], bounce: true, rate: 0.3 }]; return s; },
      },
      {
        short: "Who", chapter: "solution", title: "Part seven: the identity boundary",
        body: ["Finally, who is the agent acting as? This employee. Every search and every read carries that identity, so the agent can only find contracts this employee is allowed to see.", "Draw it as a boundary around everything: nothing inside may widen it. Reading the wrong file is now impossible, not merely unlikely."],
        changes: ["+ Identity boundary: acting as this employee", "~ Worst case shrinks to what the employee could see anyway"],
        metrics: { parts: 7, worst: { v: "what the employee could do", tone: "green" }, who: { v: "this employee", tone: "green" } },
        scene: (s) => { s.ents = Object.assign({ idz }, s.ents); s.ents.user = Object.assign({}, user, { tags: [{ text: "badge: sales, EU", tone: "blue" }] }); return s; },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["The <b>reasoning core</b> is one part of seven.", "<b>Capabilities</b> set the worst case: fewer tools, smaller damage.", "The <b>context plane</b> is what the core sees; the <b>runtime</b> is where it runs, one box per session.", "<b>Orchestration</b> is the hand-over between agents; the <b>control plane</b> is the one place the rules live.", "The <b>identity boundary</b> says who it acts as, and never widens from inside."],
        callout: { kind: "next", text: "The rest of day one dissects a single turn, the orchestrator, the two protocols agents speak, the build, zero trust and the discovery engine." },
        metrics: { parts: 7, worst: { v: "what the employee could do", tone: "green" }, who: { v: "this employee", tone: "green" } },
        scene: (s) => { s.ents.user = user; s.flows = [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["t"], bounce: true, rate: 0.3 }, { route: ["p"], bounce: true, kind: "ping", rate: 0.25 }]; return s; },
      },
    ],
  };
})();
