/* Walkthrough: five frameworks, one loop. The same system with a different decider docked each
   time. Drawn by assets/walk.js. */
(window.WALKS = window.WALKS || {}).frames = (function () {
  const user = { type: "person", x: -17, y: 2, label: "A customer", tint: "sand" };
  const agent = { type: "block", x: -4, y: 0, label: "The loop", glyph: "loop", tint: "orange" };
  const model = { type: "model", x: -4, y: -14, label: "The model", glyph: "AI", tint: "violet" };
  const tools = { type: "block", x: 12, y: 2, label: "Tools", glyph: "tool", tint: "blue" };
  const decider = (label, glyph, tint, tags) => ({ type: "block", x: 10, y: -13, label, glyph, tint, s: 0.9, tags });
  const store = { type: "db", x: 22, y: -8, label: "Saved state", tint: "amber" };
  const crew = { type: "crowd", x: 22, y: -6, label: "A crew of roles", tint: "rose", n: 3 };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const loop = () => ({
    ents: { user, agent, model, tools },
    links: { u: L("user", "agent"), m: L("agent", "model"), t: L("agent", "tools") },
    flows: [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["m"], bounce: true, rate: 0.5, speed: 70 }, { route: ["t"], bounce: true, rate: 0.4 }],
  });
  const docked = (d, extra) => { const s = loop(); s.ents.decider = d; s.links.d = L("agent", "decider", { style: "dashed", label: "what next?", labelAt: 0.5 }); s.flows.push({ route: ["d"], bounce: true, kind: "ping", rate: 0.4 }); if (extra) extra(s); return s; };
  return {
    title: "Five frameworks, one loop",
    summary: "The loop under every agent framework is the same. Send one support ticket round it, dock each of five frameworks in turn, and see the one thing that changes: who decides the next step.",
    plain: "every agent framework wraps the same loop: show the model the situation, let it think, call a tool or answer, feed the result back, go round again. The five frameworks here differ in one thing: who decides what happens next. A drawn graph, a crew of roles, the model itself, a kit you wire, or the agent rewriting its own rules. This walk sends one support ticket, a customer charged twice on invoice 4417, round the loop with each one docked.",
    reallife: "Five taxi firms with identical cars. One drives a fixed route map. One has a dispatcher assigning roles. One lets the driver choose. One hands you a kit of parts and a manual. One lets the driver rewrite the rulebook mid-shift. Same car, same road; what differs is who is steering.",
    startby: "Press Next to dock each framework in turn and watch the decider that docks beside the loop change; the customer, the loop, the model and the tools never move. Arrow keys work too.",
    terms: [
      ["ADK", "the Agent Development Kit: the kit-first frame, which ships sessions, memory, evals and a deploy path with the loop"],
      ["agent loop", "read the situation, ask the model, call a tool, feed the result back, repeat until there is an answer"],
      ["framework", "a ready-made way to build the loop, which decides who picks the next step"],
      ["graph", "a drawing of boxes and arrows where each box is a step and the arrows say which step comes next"],
      ["checkpoint", "the loop's state saved to disk at a step, so a crashed run can pick up where it stopped"],
      ["role", "a named job given to one agent in a crew, such as researcher or writer"],
      ["tool", "something the agent can call to act on the world: search, read a file, send a message"],
      ["deterministic", "the same input always leads to the same path; a drawn graph is, a model's choice is not"],
    ],
    metrics: [{ k: "who", label: "Who decides next" }, { k: "same", label: "Same path every run" }, { k: "resume", label: "Can resume after a crash" }],
    legend: [{ kind: "req", label: "a request" }, { kind: "res", label: "a reply" }, { kind: "ping", label: "asking who is next" }, { kind: "write", label: "state saved" }],
    goals: [
      { text: "The loop every framework shares", step: 1 },
      { text: "A drawn graph: fixed paths and checkpoints", step: 2 },
      { text: "A crew of roles, and the model deciding on its own", step: 4 },
      { text: "A kit you wire, and an agent that rewrites itself", step: 6 },
      { text: "How to choose between them", step: 7 },
    ],
    steps: [
      {
        short: "The loop", chapter: "insight", title: "The loop nobody needs a framework for",
        body: ["A customer writes in: <em>invoice 4417 charged me twice</em>. The loop shows the model the situation so far, the model thinks, then either calls a tool, such as the invoice lookup, or answers. Whatever the tool says goes back in for the next round.", "That is the whole engine. Every framework below runs exactly this; what they sell is the part that decides where the loop goes next."],
        callout: { kind: "idea", text: "When you choose a framework you are not choosing a loop. You are choosing who steers it." },
        metrics: { who: "nobody yet", same: null, resume: null },
        scene: loop(),
      },
      {
        short: "A graph", chapter: "technique", title: "Dock a drawn graph",
        body: ["LangGraph's bet. You draw the process as boxes and arrows: <em>classify</em> the ticket, <em>look up</em> the invoice, <em>draft</em> the reply, then a <em>policy gate</em> checks the draft before it goes out. The graph decides the next step; the model only works inside each box.", "Every ticket like this one walks the same drawing, so it can be tested like ordinary software."],
        changes: ["+ A drawn graph as the decider", "~ Every run follows the same arrows"],
        metrics: { who: "the graph", same: { v: "yes", tone: "green" }, resume: "not yet" },
        scene: docked(decider("A drawn graph", "graph", "teal", [{ text: "classify → lookup → draft → gate", tone: "blue" }])),
      },
      {
        short: "Checkpoint", chapter: "technique", title: "The graph saves its place",
        body: ["Because the graph knows which box it is in, it saves the ticket's state to disk after every step. Crash after the invoice lookup and the run resumes at the draft, with the category and the evidence still there, not from the start.", "It also lets a person step in: pause at a box, look, approve, continue."],
        callout: { kind: "tip", text: "Long jobs with people in the loop are where the graph shines. Short chats barely notice the difference." },
        changes: ["+ Saved state after every step"],
        metrics: { who: "the graph", same: { v: "yes", tone: "green" }, resume: { v: "yes", tone: "green" } },
        scene: docked(decider("A drawn graph", "graph", "teal"), (s) => { s.ents.store = store; s.links.s = L("decider", "store", { heads: "end" }); s.flows.push({ route: ["s"], kind: "write", rate: 0.4 }); }),
      },
      {
        short: "A crew", chapter: "technique", title: "Dock a crew of roles",
        body: ["CrewAI's bet. Now the decider is a crew: a researcher, an analyst and a writer, each with a job description in plain words. A manager hands the work along: the researcher pulls the invoice, the analyst weighs it against the refund policy, the writer drafts the reply.", "It reads like a team and is quick to set up. With a manager in charge, which role goes next is the manager's call, and the manager is a model, so two runs can take different routes."],
        changes: ["- The graph", "+ A manager and a crew of three roles"],
        metrics: { who: "the crew", same: { v: "mostly", tone: "amber" }, resume: "no" },
        scene: docked(decider("A manager", "crew", "rose"), (s) => { s.ents.crew = crew; s.links.c = L("decider", "crew", { heads: "both" }); s.flows.push({ route: ["c"], bounce: true, kind: "msg", rate: 0.4 }); }),
      },
      {
        short: "The model", chapter: "technique", title: "Let the model decide",
        body: ["Strands Agents' bet. Take the decider away and let the model steer: it reads the ticket, calls the invoice lookup, reads the result, drafts the refund and stops when it is satisfied. This ticket takes it three turns. The least code to write by far.", "The cost is predictability. Ask twice and the model may take two different routes to the answer, or a longer one than you would like."],
        callout: { kind: "warn", text: "A loop the model steers needs a budget: a cap on steps and spend, or a confused model can go round for a very long time." },
        changes: ["- The crew", "~ The model picks each step itself", "+ A cap on steps"],
        metrics: { who: "the model", same: { v: "no", tone: "red" }, resume: "no" },
        scene: (() => { const s = loop(); s.ents.model = Object.assign({}, model, { state: "lit", tags: [{ text: "picks each step · max 12 turns", tone: "violet" }] }); return s; })(),
      },
      {
        short: "A kit", chapter: "technique", title: "Dock a kit you wire yourself",
        body: ["ADK's bet, and the one with a lab of its own. A kit gives you parts: agents, tools, hooks that run before and after each step, a session store that keeps each conversation, a way to hand work to a helper agent. You wire them. The decider is whatever you built from the parts.", "More to learn than the crew, more control than the model alone, and the parts are made to be deployed and watched in production."],
        changes: ["+ A kit of parts: agents, tools, hooks, a session store"],
        metrics: { who: "what you wired", same: { v: "as you choose", tone: "amber" }, resume: { v: "yes", tone: "green" } },
        scene: docked(decider("Your wiring", "kit", "blue", [{ text: "hooks · sub-agents · sessions", tone: "blue" }]), (s) => { s.ents.store = store; s.links.s = L("decider", "store", { heads: "both" }); s.flows.push({ route: ["s"], bounce: true, kind: "write", rate: 0.3 }); }),
      },
      {
        short: "Self-editor", chapter: "tradeoff", title: "An agent that rewrites its own rules",
        body: ["The last shape, the Hermes-style self-editor, lets the agent edit its own instructions as it goes: it notices what worked and changes its own playbook for next time.", "Powerful, and the hardest to review: the rules that ran yesterday are not the rules that run today, and nobody signed off the change."],
        callout: { kind: "idea", text: "Choose by who needs to steer. A regulated process that waits days for a sign-off wants the graph. An open-ended task a strong model can plan is fine with the model alone. A product you must run for years wants the kit." },
        changes: ["+ The agent edits its own playbook"],
        metrics: { who: "the agent itself", same: { v: "no", tone: "red" }, resume: "no" },
        scene: docked(decider("Its own playbook", "self", "amber", [{ text: "rewritten after each run", tone: "amber" }]), (s) => { s.links.d.style = "red"; }),
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["Every framework runs the same <b>loop</b>; the difference is <b>who decides the next step</b>.", "A <b>drawn graph</b> gives fixed paths and <b>checkpoints</b>: testable, resumable, good for long jobs with people in them.", "A <b>crew of roles</b> is quick to set up and mostly predictable.", "The <b>model deciding</b> needs the least code and a budget.", "A <b>kit</b> gives control and production parts; a <b>self-editing agent</b> is the hardest to review."],
        callout: { kind: "next", text: "The next four tabs let you try the graph, the crew, the model and the self-editor by hand; ADK has a lab of its own. After that come three more frameworks that differ in what one action is, then the Lang family of names." },
        metrics: { who: "your choice", same: "depends", resume: "depends" },
        scene: loop(),
      },
    ],
  };
})();
