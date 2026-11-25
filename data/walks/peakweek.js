/* Walkthrough: one agent through the lab's six stages, S0 to S5, on the night the Coventry sorter fails. */
(window.WALKS = window.WALKS || {}).peakweek = (function () {
  const ops = { type: "crowd", x: -18, y: 2, label: "The contact centre", tint: "sand", n: 3 };
  const agent = { type: "block", x: -4, y: 0, label: "The agent", glyph: "agent", tint: "orange" };
  const model = { type: "model", x: -4, y: -14, label: "The model", glyph: "AI", tint: "violet" };
  const project = { type: "zone", x: -11, y: -21, w: 36, d: 36, label: "the project: data and plan.md ready", tint: "teal", labelAt: "back" };
  const runtime = { type: "zone", x: -10, y: -7, w: 12, d: 14, label: "your laptop", tint: "blue", labelAt: "left" };
  const parcels = { type: "db", x: 12, y: -4, label: "Plan and status", tint: "violet" };
  const memory = { type: "db", x: 12, y: 10, label: "Memory Bank", tint: "slate" };
  const judge = { type: "block", x: 22, y: 2, label: "Graded evaluation", glyph: "score", tint: "green", s: 0.85 };
  const app = { type: "device", x: -18, y: 15, label: "Gemini Enterprise", screen: "teal" };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const asking = { tags: [{ text: "is my parcel coming?", tone: "violet" }] };
  return {
    title: "One agent, six stages, in order",
    summary: "The night the Coventry sorter fails. Follow one agent from an empty project to a chat the contact centre can use, through S0 to S5, and see which stages leave something a later one needs.",
    plain: "groundwork and a working agent are the easy part. Getting it somewhere the contact centre can use it, safely, takes four more stages: six in all, S0 to S5, in order. Watch three hidden handoffs. Deploying lists the agent in the company catalogue. A wrapper pasted in at S2 is what lets S5 publish it. And the permissions are the one thing you have to check yourself.",
    reallife: "Opening a cafe. Stock the shelves and write the plan. Cook one good dish in your own kitchen. Move into the real premises, with a fridge that keeps things overnight. Change the locks and check who holds keys. Get a hygiene inspection with a score on the door. Then get on the map so people walk in. You can open without the locks or the inspection, and nothing looks wrong until a bad day.",
    startby: "Press Next to carry the agent from S0 to S5. Watch the tile that says who can use it: it only reaches the contact centre at the last stage. Arrow keys work too.",
    terms: [
      ["BigQuery", "Google’s data warehouse for very large tables"],
      ["plan.md", "a plain text file holding the build plan as a checklist, each step tagged as the coding agent’s or yours"],
      ["groundwork", "the setup done before any building: tools checked, data downloaded, a checklist written"],
      ["coding agent", "an AI program that writes and runs the code for you, one prompt at a time"],
      ["tool", "an ordinary function the agent can choose to call to look something up"],
      ["system instruction", "the written brief the agent follows on every question"],
      ["deploy", "put the agent on a cloud service so it runs without your laptop"],
      ["deployment", "the agent running on that cloud service; S5 publishes this same one"],
      ["smoke test", "a quick run that proves the thing starts and answers once"],
      ["sandbox", "a sealed-off place where code the model writes can run without reaching your systems"],
      ["Memory Bank", "the cloud memory that keeps facts about a user from one chat to the next"],
      ["wrapper", "a small file of tested code around the agent that fixes what the generated version gets wrong"],
      ["session id", "the label that tells the agent which conversation a message belongs to"],
      ["least privilege", "giving something only the access its job needs, and nothing more"],
      ["shield", "a filter in front of the agent that blocks attacks such as a jailbreak, an attempt to talk it out of its rules"],
      ["Model Armor", "the cloud service that acts as the shield, screening prompts and answers for attacks and personal data"],
      ["judge", "a second AI model that marks each sentence of an answer as backed by a tool result or not"],
      ["graded evaluation", "a fixed set of test cases scored the same way every time, so quality becomes a number"],
      ["grounded", "every claim traceable to something a tool actually returned"],
      ["publish", "list the existing deployment in the company chat app so colleagues can find it; no second copy"],
    ],
    metrics: [{ k: "stage", label: "Stage" }, { k: "left", label: "What this stage leaves behind" }, { k: "who", label: "Who can use it" }],
    legend: [{ kind: "req", label: "a question" }, { kind: "res", label: "an answer" }, { kind: "write", label: "saved to memory" }, { kind: "bad", label: "an invented detail" }],
    goals: [
      { text: "What S0 sets up before any code", step: 2 },
      { text: "What deploying at S2 quietly sets up for later", step: 4 },
      { text: "Least privilege and a shield as the safety stage", step: 5 },
      { text: "How a judge catches an invented loading bay", step: 6 },
      { text: "Why publishing is not a second deploy", step: 7 },
    ],
    steps: [
      {
        short: "Peak night", chapter: "problem", title: "The busiest night of the year",
        body: ["Twenty past ten at the Coventry hub, and the main outbound sorter has failed. The 23:05 to Bristol is cancelled and other trunk runs are late. The contact centre hears one question a thousand ways: <em>is my parcel still going to arrive?</em>", "A chatbot answers from memory, warmly and wrongly. An agent with tools could look it up. Between that idea and the contact centre are six stages, S0 to S5."],
        callout: { kind: "idea", text: "The stages are not about making the agent clever. They are about making it safe to hand to people who did not build it." },
        metrics: { stage: "not started", left: "an idea", who: { v: "nobody", tone: "red" } },
        scene: { ents: { ops: Object.assign({}, ops, asking), parcels }, links: { q: L("ops", "parcels", { style: "off", label: "no way to look" }) }, flows: [] },
      },
      {
        short: "S0 Groundwork", chapter: "technique", title: "S0: groundwork",
        body: ["Twelve minutes, and nothing gets built. Give the coding agent access to current documentation. Write plan.md, a checklist with every step tagged as the coding agent&rsquo;s or yours. Check the tools are installed. Download the data: the routing plan, which says what should happen, and the depot-status feed, which says what is happening.", "Each item stops a specific failure later. Skip the data and you write a tool against a column that does not exist."],
        changes: ["+ A coding agent that reads current docs", "+ plan.md, one step per prompt", "+ The routing plan and the live feed"],
        metrics: { stage: "S0 · 1 of 6", left: "the data and a checklist", who: { v: "nobody yet", tone: "red" } },
        scene: { ents: { project, ops, parcels: Object.assign({}, parcels, { tags: [{ text: "downloaded", tone: "green" }] }) }, links: {}, flows: [] },
      },
      {
        short: "S1 Work", chapter: "technique", title: "S1: make it work",
        body: ["Four prompts in plain English. Scaffold the project. Add three tools: one reads the routing plan, one reads the depot-status feed, one finds a way round. Write the system instruction, five rules, the third being <em>never invent a detail a tool did not return</em>. Run it in the local playground.", "Ask about the 23:05 to Bristol. It looks up the plan, checks the feed, finds the run cancelled and works out another way through. On your laptop only: nobody else can reach it yet."],
        changes: ["+ Three tools and a five-rule instruction", "+ Tested in the local playground"],
        metrics: { stage: "S1 · 2 of 6", left: "three tools, five rules", who: { v: "you, on a laptop", tone: "amber" } },
        scene: { ents: { project, runtime, ops, agent, model, parcels }, links: { u: L("ops", "agent", { style: "off", label: "not yet" }), m: L("agent", "model"), t: L("agent", "parcels") }, flows: [{ route: ["t"], bounce: true, rate: 0.4 }, { route: ["m"], bounce: true, rate: 0.5, speed: 70 }] },
      },
      {
        short: "S2 Survive", chapter: "technique", title: "S2: make it survive",
        body: ["Every change first, then one deploy. Add sessions, so it remembers within a chat, and Memory Bank, so it remembers across chats. Add a sandbox for arithmetic. Paste in the tested runtime wrapper. A ten-second smoke test on your laptop catches the bugs a deploy of five to ten minutes would only show afterwards.", "Deploying quietly does two more things: it lists the agent in the company catalogue and gives it an identity. The wrapper also tidies up the session id that the S5 portal will send. Nothing on screen tells you any of this."],
        callout: { kind: "tip", text: "Three handoffs start here and pay off later: the catalogue entry and the identity at S3, the wrapper at S5." },
        changes: ["+ Deployed to the cloud, once", "+ Sessions, Memory Bank, a sandbox", "+ A catalogue entry and an identity, unasked"],
        metrics: { stage: "S2 · 3 of 6", left: "a deployment and a wrapper", who: { v: "you, from the cloud", tone: "amber" } },
        scene: (s) => { s.ents.runtime = Object.assign({}, runtime, { label: "deployed" }); s.ents.memory = memory; s.links.l = L("agent", "memory", { heads: "end", via: [["agent", "memory"]] }); s.flows = [{ route: ["t"], bounce: true, rate: 0.4 }, { route: ["m"], bounce: true, rate: 0.5, speed: 70 }, { route: ["l"], kind: "write", rate: 0.5 }]; return s; },
      },
      {
        short: "S3 Safe", chapter: "technique", title: "S3: make it safe",
        body: ["Mostly checking, not building. Find the catalogue entry and the identity that S2 created. Then audit the permissions: the deploy granted six roles and the agent needs two. Storage, BigQuery and Secret Manager admin go, and so does a publishing role only you need.", "Put a Model Armor shield in front. It blocks the <em>maintenance mode</em> jailbreak and a card number. A polite request to cancel a collection still passes, because it is not an attack; stopping that is a separate rule about what the agent is for."],
        changes: ["- 4 roles the agent never used", "+ A Model Armor shield"],
        metrics: { stage: "S3 · 4 of 6", left: "2 roles and a shield", who: { v: "you, from the cloud", tone: "amber" } },
        scene: (s) => { s.links.u = L("ops", "agent", { style: "off" }); s.ents.agent = Object.assign({}, agent, { tags: [{ text: "2 roles, not 6", tone: "green" }, { text: "shielded", tone: "green" }] }); return s; },
      },
      {
        short: "S4 Good", chapter: "technique", title: "S4: make it good",
        body: ["Stop reading answers and start measuring them. Run ten simulated scenarios, then grade four test cases with a judge: a second model that marks each sentence as backed by a tool result or not. The pass mark is 0.80. All of it runs on your laptop.", "Three cases pass. The fourth scores 0.50: asked about the 01:55 to Bristol, the agent said <em>loading bay 10</em>, and there is no loading bay anywhere in the plan. Tighten rule three and that case scores 1.00."],
        changes: ["+ Four graded test cases", "~ Loading bay case: 0.50, then 1.00"],
        metrics: { stage: "S4 · 5 of 6", left: "a reusable test suite", who: { v: "you, from the cloud", tone: "amber" } },
        scene: (s) => { s.ents.agent = agent; s.ents.judge = judge; s.links.j = L("parcels", "judge", { heads: "end" }); s.links.ja = L("judge", "agent", { style: "dashed", via: [["judge", "agent"]] }); s.flows = [{ route: ["j"], kind: "res", rate: 0.4 }, { route: ["ja"], bounce: true, kind: "ping", back: "bad", rate: 0.35 }]; return s; },
      },
      {
        short: "S5 Theirs", chapter: "solution", title: "S5: make it theirs",
        body: ["Publish the deployment you already have to Gemini Enterprise, the chat app your colleagues already use. There is no second deploy: publishing registers the S2 runtime under a display name.", "The portal sends the session id as a long path. The wrapper from S2 trims it, so the first chat works; without it the agent appears in the list and every chat fails. Now the contact centre can ask about the 23:05 and get a grounded answer."],
        callout: { kind: "idea", text: "S1 leaves a project shape that S2 deploys unchanged. S2 leaves the wrapper that lets S5 publish. S3 and S4 leave nothing a later stage needs, which is why they get skipped, and why a bad night needs them." },
        changes: ["+ Published in Gemini Enterprise", "~ The S2 wrapper trims the session id"],
        metrics: { stage: "S5 · 6 of 6", left: "a published agent", who: { v: "the contact centre", tone: "green" } },
        scene: (s) => { s.ents.ops = Object.assign({}, ops, asking); s.ents.app = app; s.links.a = L("app", "agent", { heads: "both", via: [["agent", "app"]] }); s.links.u = L("ops", "app"); s.flows = [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["a"], bounce: true, rate: 0.35 }, { route: ["t"], bounce: true, rate: 0.3 }, { route: ["l"], kind: "write", rate: 0.4 }]; return s; },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["<b>S0 Groundwork</b>: current docs for the coding agent, plan.md, the data.", "<b>S1 Make it work</b>: three tools, five rules, tested on a laptop. <b>S2 Make it survive</b>: memory, a sandbox, the wrapper, one deploy.", "<b>S3 Make it safe</b>: four spare roles removed, a shield in front.", "<b>S4 Make it good</b>: a judge that caught an invented loading bay.", "<b>S5 Make it theirs</b>: the same deployment, published. S3 and S4 are the stages you can skip, and the ones a bad night needs."],
        callout: { kind: "next", text: "The rest of this lab runs each stage in detail, then the whole arc, and where it breaks." },
        metrics: { stage: "S5 · 6 of 6", left: "a published agent", who: { v: "the contact centre", tone: "green" } },
      },
    ],
  };
})();
