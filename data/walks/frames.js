/* Walkthrough: five frameworks, one loop. The same system with a different decider docked each
   time. Drawn by assets/walk.js. */
(window.WALKS = window.WALKS || {}).frames = (function () {
  const user = { type: "person", x: -17, y: 2, label: "A user", tint: "sand" };
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
    summary: "The loop under every agent framework is the same. Dock each framework in turn and see the one thing that changes: who decides the next step.",
    plain: "every agent framework wraps the same loop: show the model the situation, let it think, call a tool or answer, feed the result back, go round again. The frameworks differ in one thing: who decides what happens next. A drawn graph, a crew of roles, the model itself, a kit you wire, or the agent rewriting its own rules. This walk runs the loop with each one docked.",
    reallife: "Five taxi firms with identical cars. One drives a fixed route map. One has a dispatcher assigning roles. One lets the driver choose. One hands you a kit of parts and a manual. One lets the driver rewrite the rulebook mid-shift. Same car, same road; what differs is who is steering.",
    startby: "Press Next to dock each framework in turn and watch what changes in the picture; the loop underneath never changes. Arrow keys work too.",
    terms: [
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
        body: ["A user asks something. The loop shows the model the situation so far, the model thinks, then either calls a tool or answers. Whatever the tool says goes back in for the next round.", "That is the whole engine. Every framework below runs exactly this; what they sell is the part that decides where the loop goes next."],
        callout: { kind: "idea", text: "When you choose a framework you are not choosing a loop. You are choosing who steers it." },
        metrics: { who: "nobody yet", same: null, resume: null },
        scene: loop(),
      },
      {
        short: "A graph", chapter: "technique", title: "Dock a drawn graph",
        body: ["You draw the process as boxes and arrows: <em>classify</em>, then <em>search</em>, then <em>answer</em>, with a branch back to <em>search</em> if the answer is thin. The graph decides the next step; the model only works inside each box.", "Every run walks the same drawing, so it can be tested like ordinary software."],
        changes: ["+ A drawn graph as the decider", "~ Every run follows the same arrows"],
        metrics: { who: "the graph", same: { v: "yes", tone: "green" }, resume: "not yet" },
        scene: docked(decider("A drawn graph", "graph", "teal", [{ text: "classify → search → answer", tone: "blue" }])),
      },
      {
        short: "Checkpoint", chapter: "technique", title: "The graph saves its place",
        body: ["Because the graph knows which box it is in, it can save that to disk after every step. Crash halfway through a long run and it resumes from the last box, not from the start.", "It also lets a person step in: pause at a box, look, approve, continue."],
        callout: { kind: "tip", text: "Long jobs with people in the loop are where the graph shines. Short chats barely notice the difference." },
        changes: ["+ Saved state after every step"],
        metrics: { who: "the graph", same: { v: "yes", tone: "green" }, resume: { v: "yes", tone: "green" } },
        scene: docked(decider("A drawn graph", "graph", "teal"), (s) => { s.ents.store = store; s.links.s = L("decider", "store", { heads: "end" }); s.flows.push({ route: ["s"], kind: "write", rate: 0.4 }); }),
      },
      {
        short: "A crew", chapter: "technique", title: "Dock a crew of roles",
        body: ["Now the decider is a crew: a researcher, a writer, a reviewer, each with a job description. A dispatcher hands the task along: the researcher gathers, the writer drafts, the reviewer checks.", "It reads like a team and is quick to set up. Which role speaks next is partly the model's call, so two runs can take different routes."],
        changes: ["- The graph", "+ A crew of three roles"],
        metrics: { who: "the crew", same: { v: "mostly", tone: "amber" }, resume: "no" },
        scene: docked(decider("A dispatcher", "crew", "rose"), (s) => { s.ents.crew = crew; s.links.c = L("decider", "crew", { heads: "both" }); s.flows.push({ route: ["c"], bounce: true, kind: "msg", rate: 0.4 }); }),
      },
      {
        short: "The model", chapter: "technique", title: "Let the model decide",
        body: ["Take the decider away and let the model steer: it looks at the tools, picks one, reads the result, picks again, stops when it is satisfied. The least code to write by far.", "The cost is predictability. Ask twice and the model may take two different routes to the answer, or a longer one than you would like."],
        callout: { kind: "warn", text: "A loop the model steers needs a budget: a cap on steps and spend, or a confused model can go round for a very long time." },
        changes: ["- The crew", "~ The model picks each step itself", "+ A cap on steps"],
        metrics: { who: "the model", same: { v: "no", tone: "red" }, resume: "no" },
        scene: (() => { const s = loop(); s.ents.model = Object.assign({}, model, { state: "lit", tags: [{ text: "picks the next step · max 12", tone: "violet" }] }); return s; })(),
      },
      {
        short: "A kit", chapter: "technique", title: "Dock a kit you wire yourself",
        body: ["A kit gives you parts: agents, tools, hooks that run before and after each step, a session store, a way to hand to a sub-agent. You wire them. The decider is whatever you built from the parts.", "More to learn than the crew, more control than the model alone, and the parts are made to be deployed and watched in production."],
        changes: ["+ A kit of parts: agents, tools, hooks, a session store"],
        metrics: { who: "what you wired", same: { v: "as you choose", tone: "amber" }, resume: { v: "yes", tone: "green" } },
        scene: docked(decider("Your wiring", "kit", "blue", [{ text: "hooks · sub-agents · sessions", tone: "blue" }]), (s) => { s.ents.store = store; s.links.s = L("decider", "store", { heads: "both" }); s.flows.push({ route: ["s"], bounce: true, kind: "write", rate: 0.3 }); }),
      },
      {
        short: "Self-editor", chapter: "tradeoff", title: "An agent that rewrites its own rules",
        body: ["The last shape lets the agent edit its own instructions as it goes: it notices what worked and changes its own playbook for next time.", "Powerful, and the hardest to review: the rules that ran yesterday are not the rules that run today, and nobody signed off the change."],
        callout: { kind: "idea", text: "Choose by who needs to steer. A regulated process wants the graph. A quick internal helper is fine with the model. A product you must operate for years wants the kit." },
        changes: ["+ The agent edits its own playbook"],
        metrics: { who: "the agent itself", same: { v: "no", tone: "red" }, resume: "no" },
        scene: docked(decider("Its own playbook", "self", "amber", [{ text: "rewritten after each run", tone: "amber" }]), (s) => { s.links.d.style = "red"; }),
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["Every framework runs the same <b>loop</b>; the difference is <b>who decides the next step</b>.", "A <b>drawn graph</b> gives fixed paths and <b>checkpoints</b>: testable, resumable, good for long jobs with people in them.", "A <b>crew of roles</b> is quick to set up and mostly predictable.", "The <b>model deciding</b> needs the least code and a budget.", "A <b>kit</b> gives control and production parts; a <b>self-editing agent</b> is the hardest to review."],
        callout: { kind: "next", text: "The rest of this lab builds the same agent in each shape, then compares three more shapes and the five bricks every one of them is made of." },
        metrics: { who: "your choice", same: "depends", resume: "depends" },
        scene: loop(),
      },
    ],
  };
})();
