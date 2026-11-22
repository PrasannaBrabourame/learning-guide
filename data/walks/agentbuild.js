/* Walkthrough: a coding agent builds the agent, and the spec is what you actually write. */
(window.WALKS = window.WALKS || {}).agentbuild = (function () {
  const you = { type: "person", x: -17, y: 2, label: "You", tint: "sand" };
  const spec = { type: "panel", x: -17, y: 2, dx: -40, dy: -118, title: "the spec", lines: ["Given a refund under $50", "When the customer asks", "Then approve it"] };
  const coder = { type: "block", x: -3, y: 0, label: "Coding agent", glyph: "code", tint: "orange" };
  const model = { type: "model", x: -3, y: -14, label: "The model", glyph: "AI", tint: "violet" };
  const repo = { type: "db", x: 10, y: 6, label: "The code", tint: "slate" };
  const tests = { type: "block", x: 10, y: -8, label: "Tests", glyph: "test", tint: "green", s: 0.9 };
  const built = { type: "block", x: 22, y: -2, label: "The built agent", glyph: "live", tint: "teal" };
  const api = { type: "zone", x: 16, y: -10, w: 12, d: 16, label: "hosted for you", tint: "teal", labelAt: "back" };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const base = () => ({
    ents: { you, spec, coder, model, repo, tests },
    links: { u: L("you", "coder"), m: L("coder", "model"), r: L("coder", "repo", { heads: "end", label: "writes code", labelAt: 0.72 }), t: L("coder", "tests", { via: [["coder", "tests"]] }) },
    flows: [{ route: ["m"], bounce: true, rate: 0.5, speed: 70 }, { route: ["r"], kind: "write", rate: 0.4 }, { route: ["t"], bounce: true, kind: "ping", rate: 0.35 }],
  });
  return {
    title: "A coding agent builds the agent; you write the spec",
    summary: "Watch a coding agent turn a written specification into a working agent, see where a vague line stops it, and hand the result to a managed agent service to run.",
    plain: "building an agent used to mean writing fiddly code against an interface you had to memorise. Now you describe what the agent should do, one behaviour at a time, and a coding agent writes the code and the tests. The valuable thing you write is the specification. This walk follows one spec from your desk to a running agent, including the line that was too vague to build.",
    reallife: "Commissioning a kitchen from a builder. You do not lay the bricks. You write down what must be true when it is done: the oven here, a socket there, a door that opens outwards. A builder can work from that. \"Make it nice\" they cannot build or check.",
    startby: "Press Next to follow the spec through the coding agent, the code, the tests and out to a managed agent service. Arrow keys work too.",
    terms: [
      ["coding agent", "an AI program that reads a description, writes the code and runs the tests, going round until the tests pass"],
      ["specification", "the written list of what the agent must do, one behaviour at a time; the thing you actually author"],
      ["Given, When, Then", "the shape of one testable behaviour: a starting state, a trigger, and the outcome that must follow"],
      ["test", "a small program that checks one behaviour and says pass or fail"],
      ["managed agent service", "a hosted service that runs your agent for you: starts it, scales it, keeps its state and records its steps"],
      ["sandbox", "a sealed box where code the model wrote can run without touching anything else"],
    ],
    metrics: [{ k: "spec", label: "Behaviours written" }, { k: "pass", label: "Tests passing" }, { k: "runs", label: "Runs where" }],
    legend: [{ kind: "req", label: "a request" }, { kind: "write", label: "code written" }, { kind: "ping", label: "a test run" }, { kind: "bad", label: "a failed build" }],
    goals: [
      { text: "What you write and what the coding agent writes", step: 2 },
      { text: "Why each behaviour needs a starting state, a trigger and an outcome", step: 4 },
      { text: "How tests keep the coding agent honest", step: 5 },
      { text: "What a managed agent service takes off your hands", step: 7 },
    ],
    steps: [
      {
        short: "The ask", chapter: "problem", title: "Build me a refund agent",
        body: ["You need an agent that handles refunds. The old way: learn the agent library, write the loop, write the tool code, write the tests, fix the tests. A week, if nothing surprises you.", "The new way starts with a different question: what exactly must this agent do?"],
        callout: { kind: "idea", text: "The code is the cheap part now. The expensive part is knowing, precisely, what the agent must do." },
        metrics: { spec: 0, pass: null, runs: "nowhere" },
        scene: { ents: { you: Object.assign({}, you, { tags: [{ text: "build me a refund agent", tone: "violet" }] }) }, links: {}, flows: [] },
      },
      {
        short: "The spec", chapter: "technique", title: "Write one behaviour at a time",
        body: ["You write the spec as behaviours. Each has a starting state, a trigger and an outcome: <em>given a refund under $50, when the customer asks, then approve it.</em> Three lines, and a tester could check it.", "Four behaviours cover the whole job. That is your morning's work, and the most valuable thing in the project."],
        changes: ["+ Four behaviours, each Given, When, Then"],
        metrics: { spec: 4, pass: null, runs: "nowhere" },
        scene: { ents: { you, spec: Object.assign({}, spec, { lines: ["Given a refund under $50", "When the customer asks", "Then approve it", "# and three more like it"] }) }, links: {}, flows: [] },
      },
      {
        short: "Code", chapter: "technique", title: "The coding agent writes the code and the tests",
        body: ["Hand the spec to a coding agent. It reads the behaviours, asks the model for code, writes it, and writes one test per behaviour. Then it runs the tests and reads the failures back to itself.", "You watch the loop: write, test, fix, test. Three passes and three of four tests are green."],
        changes: ["+ Coding agent", "+ Code and one test per behaviour"],
        metrics: { spec: 4, pass: { v: "3 of 4", tone: "amber" }, runs: "your laptop" },
        scene: base(),
      },
      {
        short: "Too vague", chapter: "problem", title: "The line that cannot be built",
        body: ["The fourth behaviour was written as prose: <em>handle angry customers appropriately.</em> There is no outcome anyone could check, so the coding agent guesses, writes something, and the test it invents fails for reasons nobody can defend.", "The gap was in the spec, not the code. Prose feels finished and hides the hole."],
        callout: { kind: "warn", text: "If you cannot say what should be true afterwards, you have not specified a behaviour. You have expressed a hope." },
        changes: ["~ One behaviour written as prose", "- One test, failing"],
        metrics: { spec: 4, pass: { v: "3 of 4", tone: "amber" }, runs: "your laptop" },
        scene: (s) => { s.ents.spec = Object.assign({}, spec, { lines: ["# behaviour 4", "handle angry customers", "appropriately", "= no outcome to check"] }); s.ents.tests = Object.assign({}, tests, { state: "hot", tags: [{ text: "test 4 fails", tone: "red" }] }); s.flows = [{ route: ["t"], bounce: true, kind: "bad", rate: 0.4, fail: 0.95 }]; return s; },
      },
      {
        short: "Fix the spec", chapter: "solution", title: "Fix the spec, not the code",
        body: ["Rewrite it: <em>given a message with abusive language, when it arrives, then reply once with the escalation note and hand the case to a person.</em> Now there is an outcome.", "The coding agent rebuilds the fourth behaviour from the new line. Four tests, four green. Nobody touched the code by hand."],
        changes: ["~ Behaviour 4 rewritten with an outcome", "+ Test 4 passing"],
        metrics: { spec: 4, pass: { v: "4 of 4", tone: "green" }, runs: "your laptop" },
        scene: (s) => { s.ents.spec = Object.assign({}, spec, { lines: ["Given abusive language", "When a message arrives", "Then reply once and hand over"] }); s.ents.tests = Object.assign({}, tests, { tags: [{ text: "4 of 4 pass", tone: "green" }] }); s.flows = [{ route: ["r"], kind: "write", rate: 0.4 }, { route: ["t"], bounce: true, kind: "ping", rate: 0.4 }]; return s; },
      },
      {
        short: "The sandbox", chapter: "technique", title: "Where the coding agent is allowed to work",
        body: ["A coding agent runs commands. Give it the whole machine and a wrong command deletes the wrong folder. It works inside a sandbox: a sealed copy of the project, with network access only to the places on a short list.", "Nothing it does can reach your real files until you take the result out."],
        changes: ["+ A sandbox around the coding agent", "+ A short list of places it may reach"],
        metrics: { spec: 4, pass: { v: "4 of 4", tone: "green" }, runs: "your laptop" },
        scene: (s) => { s.ents = Object.assign({ box: { type: "zone", x: -10, y: -8, w: 26, d: 20, label: "sandbox: a sealed copy of the project", tint: "amber", labelAt: "back" } }, s.ents); s.ents.spec = spec; s.ents.tests = tests; return s; },
      },
      {
        short: "Hand it over", chapter: "solution", title: "Hand the built agent to a managed agent service",
        body: ["The agent exists and its tests pass. Rather than renting servers, hand the agent's definition to a managed agent service: it runs the agent, keeps each conversation's state, scales with demand and records every step.", "You keep the spec and the tests. The service keeps the lights on."],
        callout: { kind: "tip", text: "Keep the spec in the repository next to the code. When the behaviour changes, the spec changes first and the coding agent follows." },
        changes: ["+ Managed agent service", "~ The agent runs there, not on your laptop"],
        metrics: { spec: 4, pass: { v: "4 of 4", tone: "green" }, runs: { v: "the hosted service", tone: "green" } },
        scene: (s) => { delete s.ents.box; s.ents.api = api; s.ents.built = built; s.links.d = L("coder", "built", { heads: "end", via: [["coder", "built"]], label: "deployed", labelAt: 0.6 }); s.flows = [{ route: ["d"], kind: "write", rate: 0.35 }]; return s; },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["You write the <b>spec</b>; the <b>coding agent</b> writes the code and the tests.", "Every behaviour is <b>Given, When, Then</b>: a state, a trigger, an outcome you can check.", "Prose feels finished and hides the hole; <b>fix the spec, not the code</b>.", "The coding agent works in a <b>sandbox</b> with a short list of places it may reach.", "A <b>managed agent service</b> runs the result and keeps its state."],
        callout: { kind: "next", text: "The rest of this lab runs the local loop, the evaluation, the managed agent service and the security of the sandbox in detail." },
        metrics: { spec: 4, pass: { v: "4 of 4", tone: "green" }, runs: { v: "the hosted service", tone: "green" } },
        scene: (s) => { s.flows = [{ route: ["m"], bounce: true, rate: 0.4, speed: 70 }, { route: ["t"], bounce: true, kind: "ping", rate: 0.3 }, { route: ["d"], kind: "write", rate: 0.3 }]; return s; },
      },
    ],
  };
})();
