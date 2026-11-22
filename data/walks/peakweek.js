/* Walkthrough: one agent through the six stages of its life, in the order they must happen. */
(window.WALKS = window.WALKS || {}).peakweek = (function () {
  const ops = { type: "crowd", x: -18, y: 2, label: "The night shift", tint: "sand", n: 3 };
  const agent = { type: "block", x: -4, y: 0, label: "The agent", glyph: "agent", tint: "orange" };
  const model = { type: "model", x: -4, y: -14, label: "The model", glyph: "AI", tint: "violet" };
  const project = { type: "zone", x: -11, y: -21, w: 36, d: 36, label: "the project: access and identity set up", tint: "teal", labelAt: "back" };
  const runtime = { type: "zone", x: -10, y: -7, w: 12, d: 14, label: "deployed", tint: "blue", labelAt: "left" };
  const parcels = { type: "db", x: 12, y: -4, label: "Parcel tracking", tint: "violet" };
  const logs = { type: "db", x: 12, y: 10, label: "Logs and errors", tint: "slate" };
  const judge = { type: "block", x: 22, y: 2, label: "Graded evaluation", glyph: "score", tint: "green", s: 0.85 };
  const app = { type: "device", x: -18, y: 15, label: "The company app", screen: "teal" };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  return {
    title: "One agent, six stages, in order",
    summary: "The busiest night of the year at a parcel carrier. Follow one agent from an empty project to a tool the night shift reaches for, and see why each stage needs the one before it.",
    plain: "building the agent is the easy part. Getting it somewhere other people can use it, safely, is five more stages, and they have to happen in order. First the groundwork of access and identity. Then making it work, making it survive a bad night, making it safe, proving it is good, and making it part of the tool people already use. Each stage leaves something behind that the next one needs.",
    reallife: "Opening a cafe. Lease and licences first. Then a kitchen that can cook. Then a fire extinguisher and a first-aid kit. Then locks on the till. Then a health inspection with a score on the door. Then the regulars who come in without thinking about it. Skip a step and the one after it has nothing to stand on.",
    startby: "Press Next to carry the agent through the six stages; each one adds a part the next one depends on. Arrow keys work too.",
    terms: [
      ["groundwork", "the project, its access rules and its identity, set up before any code; nothing later works without it"],
      ["deployment", "putting the agent somewhere other people can reach it, rather than on one laptop"],
      ["logs", "the written record of what the agent did and what went wrong, kept so a failure can be read afterwards"],
      ["least privilege", "giving something only the access its job needs, and nothing more"],
      ["guardrail", "a rule enforced outside the model that stops an action regardless of what the model wants"],
      ["grounded", "an answer that comes from the real records it was shown, not from the model's memory"],
      ["graded evaluation", "a fixed set of questions scored the same way every time, so you can say how good the agent is with a number"],
    ],
    metrics: [{ k: "stage", label: "Stage" }, { k: "left", label: "What this stage leaves behind" }, { k: "night", label: "Survives a bad night" }],
    legend: [{ kind: "req", label: "a question from the floor" }, { kind: "res", label: "an answer" }, { kind: "write", label: "a log line" }, { kind: "bad", label: "a failure" }],
    goals: [
      { text: "Why access and identity come before any code", step: 2 },
      { text: "What deployment and logs give the stages after them", step: 4 },
      { text: "Least privilege and guardrails as the safety stage", step: 5 },
      { text: "Why a graded evaluation needs the logs", step: 6 },
      { text: "What it means to make the agent theirs", step: 7 },
    ],
    steps: [
      {
        short: "Peak night", chapter: "problem", title: "The busiest night of the year",
        body: ["A parcel carrier on its peak night. The night shift fields hundreds of <em>where is parcel 4471?</em> questions, each one a lookup across three screens.", "An agent could answer those in seconds. Someone has a demo. Between the demo and the night shift are six stages."],
        callout: { kind: "idea", text: "A demo proves the idea. The stages prove the agent can be trusted at 2am by people who did not build it." },
        metrics: { stage: "0 of 6", left: "a demo", night: { v: "no", tone: "red" } },
        scene: { ents: { ops: Object.assign({}, ops, { tags: [{ text: "where is parcel 4471?", tone: "violet" }] }), parcels }, links: { q: L("ops", "parcels", { style: "off", label: "three screens, by hand" }) }, flows: [] },
      },
      {
        short: "Groundwork", chapter: "technique", title: "Stage one: groundwork",
        body: ["Before a line of agent code: a project of its own, an identity for the agent, and the access it will need written down and granted, nothing more.", "Boring, and the stage everyone wants to skip. Every later stage asks <em>who is this, and what may it touch?</em> This is where the answer is made."],
        changes: ["+ A project", "+ An identity for the agent", "+ Access to parcel tracking, read only"],
        metrics: { stage: "1 of 6", left: "identity and access", night: { v: "no", tone: "red" } },
        scene: { ents: { project, ops, parcels }, links: {}, flows: [] },
      },
      {
        short: "Make it work", chapter: "technique", title: "Stage two: make it work",
        body: ["Now build it: the agent, the model, one tool that looks up a parcel. Deploy it so the night shift can reach it from their own screens.", "It answers the question. On a quiet afternoon, that is enough."],
        changes: ["+ The agent and its one tool", "+ Deployed where the shift can reach it"],
        metrics: { stage: "2 of 6", left: "a working, reachable agent", night: { v: "not yet", tone: "amber" } },
        scene: { ents: { project, runtime, ops, agent, model, parcels }, links: { u: L("ops", "agent"), m: L("agent", "model"), t: L("agent", "parcels") }, flows: [{ route: ["u"], bounce: true, rate: 0.35 }, { route: ["t"], bounce: true, rate: 0.4 }, { route: ["m"], bounce: true, rate: 0.5, speed: 70 }] },
      },
      {
        short: "Survive", chapter: "technique", title: "Stage three: make it survive",
        body: ["Peak night. The tracking system slows down and the agent starts timing out. Without logs, nobody knows whether it is the model, the tool or the network.", "Add logs and error handling: every call written down, a clear error back to the shift instead of silence, a retry where a retry is safe. Now a bad night can be read the next morning."],
        callout: { kind: "tip", text: "Logs are not for you. They are for the person on call who has never seen the code." },
        changes: ["+ Logs of every call", "+ Clear errors and safe retries"],
        metrics: { stage: "3 of 6", left: "logs", night: { v: "yes", tone: "green" } },
        scene: (s) => { s.ents.logs = logs; s.ents.parcels = Object.assign({}, parcels, { state: "hot", tags: [{ text: "slow tonight", tone: "red" }] }); s.links.l = L("agent", "logs", { heads: "end", via: [["agent", "logs"]] }); s.flows = [{ route: ["t"], bounce: true, back: "bad", rate: 0.4 }, { route: ["l"], kind: "write", rate: 0.6 }]; return s; },
      },
      {
        short: "Safe", chapter: "technique", title: "Stage four: make it safe",
        body: ["Someone asks the agent to change a delivery address. It could, if it had the access. It does not: the identity from stage one can read parcels and nothing else, and a guardrail refuses any request to change records regardless of what the model thinks.", "The worst a wrong answer can do is be wrong."],
        changes: ["+ Guardrail: read only, no changes", "~ Least privilege checked against the logs"],
        metrics: { stage: "4 of 6", left: "a bounded agent", night: { v: "yes", tone: "green" } },
        scene: (s) => { s.ents.parcels = parcels; s.ents.agent = Object.assign({}, agent, { tags: [{ text: "read only · no changes", tone: "green" }] }); s.ents.ops = Object.assign({}, ops, { tags: [{ text: "change the address?", tone: "amber" }] }); s.flows = [{ route: ["u"], rate: 0.4, kind: "bad", fail: 0.9 }, { route: ["l"], kind: "write", rate: 0.4 }]; return s; },
      },
      {
        short: "Good", chapter: "technique", title: "Stage five: make it good",
        body: ["Is it actually right? Take two hundred real questions from the logs, with the answers a person checked, and run them through the agent every time something changes. Score whether each answer is grounded in the real record.", "The evaluation needs the logs from stage three. Without them there is nothing real to test against."],
        changes: ["+ A graded evaluation from logged questions", "~ Score: 0.91 grounded"],
        metrics: { stage: "5 of 6", left: "a number you can trust", night: { v: "yes", tone: "green" } },
        scene: (s) => { s.ents.ops = ops; s.ents.agent = agent; s.ents.judge = judge; s.links.j = L("logs", "judge", { heads: "end", label: "200 real questions" }); s.links.ja = L("judge", "agent", { style: "dashed", via: [["judge", "agent"]] }); s.flows = [{ route: ["j"], kind: "write", rate: 0.4 }, { route: ["ja"], bounce: true, kind: "ping", rate: 0.35 }]; return s; },
      },
      {
        short: "Theirs", chapter: "solution", title: "Stage six: make it theirs",
        body: ["The agent works, survives, is safe and scores well, and lives on a page nobody opens. Put it inside the app the night shift already has open, as a box on the parcel screen.", "Now it is not a project. It is how parcels get found."],
        callout: { kind: "idea", text: "Each stage leaves something the next one needs: identity for the build, the deployment for the logs, the logs for the evaluation, the evaluation for the trust to put it in the app." },
        changes: ["+ The agent inside the company app"],
        metrics: { stage: "6 of 6", left: "a tool people use", night: { v: "yes", tone: "green" } },
        scene: (s) => { s.ents.app = app; s.links.a = L("app", "agent", { heads: "both", via: [["agent", "app"]] }); s.links.u = L("ops", "app"); s.flows = [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["a"], bounce: true, rate: 0.35 }, { route: ["t"], bounce: true, rate: 0.3 }, { route: ["l"], kind: "write", rate: 0.4 }]; return s; },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["<b>Groundwork</b>: project, identity, access, before any code.", "<b>Make it work</b>: build and deploy. <b>Make it survive</b>: logs, errors, retries.", "<b>Make it safe</b>: least privilege and guardrails outside the model.", "<b>Make it good</b>: a graded evaluation built from the logs.", "<b>Make it theirs</b>: inside the app people already use. Each stage stands on the one below."],
        callout: { kind: "next", text: "The rest of this lab runs each stage in detail, then the whole arc, and where it breaks." },
        metrics: { stage: "6 of 6", left: "a tool people use", night: { v: "yes", tone: "green" } },
      },
    ],
  };
})();
