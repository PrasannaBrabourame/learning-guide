/* Walkthrough: one Docker server at 2am, then a cluster that looks after itself. */
(window.WALKS = window.WALKS || {}).k8s = (function () {
  const users = { type: "crowd", x: -18, y: 2, label: "Users", tint: "sand", n: 4 };
  const server = { type: "block", x: 0, y: 0, label: "One server", glyph: "box", tint: "slate" };
  const you = { type: "person", x: -4, y: 14, label: "You, at 2am", tint: "sand" };
  const cp = { type: "block", x: -6, y: -18, label: "Control plane", glyph: "brain", tint: "orange" };
  const lb = { type: "block", x: -6, y: -2, label: "Front door", glyph: "front", tint: "teal", s: 0.85 };
  const node = (i, x, y, state) => ({ type: "block", x, y, label: "", glyph: "node " + i, tint: "blue", s: 0.95, state });
  const cluster = { type: "zone", x: 2, y: -20, w: 34, d: 34, label: "the cluster", tint: "teal", labelAt: "front" };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const podTags = (n, text) => Array.from({ length: n }, () => ({ text: text || "copy", tone: "green" }));
  const fleet = (tags, states) => ({
    ents: { cluster, users, lb, cp, n1: Object.assign(node(1, 8, -14, states && states[0]), { tags: tags[0] }), n2: Object.assign(node(2, 18, -4, states && states[1]), { tags: tags[1] }), n3: Object.assign(node(3, 28, 6, states && states[2]), { tags: tags[2] }) },
    links: { u: L("users", "lb"), a: L("lb", "n1", { via: [["lb", "n1"]] }), b: L("lb", "n2"), c: L("lb", "n3", { via: [["lb", "n3"]] }), w: L("cp", "n1", { style: "dashed", heads: "end" }) },
    flows: [{ route: ["u"], rate: 0.8 }, { route: ["a"], bounce: true, rate: 0.3 }, { route: ["b"], bounce: true, rate: 0.3 }, { route: ["c"], bounce: true, rate: 0.3 }, { route: ["w"], kind: "ping", rate: 0.3 }],
  });
  return {
    title: "One Docker server at 2am, then a cluster that looks after itself",
    summary: "Start with your app in a container on one server, watch what wakes you up, then hand the same container to a cluster and see it restart, re-place, scale and update the app without you.",
    plain: "your app runs in a container on one server. It works until the container crashes, the server dies, or Monday brings ten times the traffic, and each of those is a person out of bed. Kubernetes is the manager that takes those jobs: you tell it \"keep three copies running\" and it keeps three running, on whichever computers have room, whatever happens. This walk runs the same container both ways.",
    reallife: "One shopkeeper who does everything, against a shopping centre with a management company. The management company reopens a flooded unit, finds a new unit when one burns down, and opens more tills on a busy Saturday. The shopkeeper still decides what to sell.",
    startby: "Press Next to watch one server fail three ways, then hand the same container to a cluster. Arrow keys work too.",
    terms: [
      ["container", "your app packed in a box with everything it needs to run, so it runs the same on any computer"],
      ["Docker", "the tool that builds and runs containers on one computer"],
      ["Kubernetes", "the manager that runs many containers across many computers and keeps the number you asked for running"],
      ["cluster", "the group of computers Kubernetes manages as one"],
      ["node", "one computer in the cluster"],
      ["control plane", "the brain of the cluster: it keeps the list of what you asked for and makes the nodes match it"],
      ["replica", "one running copy of your app; the file calls copies replicas"],
      ["autoscaler", "the part that adds and removes copies, or nodes, as the load changes"],
      ["rolling update", "replacing old copies with new ones a few at a time, so the app never goes fully down"],
    ],
    metrics: [{ k: "copies", label: "Copies running" }, { k: "up", label: "Site up" }, { k: "who", label: "Who fixed it" }],
    legend: [{ kind: "req", label: "a user's request" }, { kind: "res", label: "a reply" }, { kind: "bad", label: "a request that failed" }, { kind: "ping", label: "the control plane checking" }],
    goals: [
      { text: "The three things that wake you up with one server", step: 4 },
      { text: "What a cluster is: nodes, a control plane, and your wish", step: 5 },
      { text: "Self-healing: restart, and re-place when a node dies", step: 6 },
      { text: "Scaling and a rolling update without a person", step: 8 },
    ],
    steps: [
      {
        short: "One server", chapter: "problem", title: "Your app in a container on one server",
        body: ["You packed the app into a container and started it on one server with one command. It works. Users arrive, the server answers.", "Everything that follows is about what happens next, because something always does."],
        callout: { kind: "idea", text: "A container solves 'it works on my machine'. It does nothing about the machine itself." },
        metrics: { copies: 1, up: { v: "yes", tone: "green" }, who: "nobody needed" },
        scene: { ents: { users, server: Object.assign({}, server, { tags: [{ text: "docker run shop:1.4", tone: "blue" }] }) }, links: { u: L("users", "server") }, flows: [{ route: ["u"], bounce: true, rate: 0.5 }] },
      },
      {
        short: "It crashes", chapter: "problem", title: "2am: the container crashes",
        body: ["A bug that shows up once a week fires at 2am. The container dies. The server is fine, the container is simply not running, and every request fails.", "Someone's phone buzzes. They log in, type the start command again, and go back to bed."],
        changes: ["- The container", "~ A person restarted it"],
        metrics: { copies: { v: 0, tone: "red" }, up: { v: "no, 20 minutes", tone: "red" }, who: { v: "a person", tone: "red" } },
        scene: { ents: { users, server: Object.assign({}, server, { state: "dead", tags: [{ text: "container exited", tone: "red" }] }), you }, links: { u: L("users", "server", { style: "red" }), y: L("you", "server", { style: "dashed", label: "restart it by hand" }) }, flows: [{ route: ["u"], kind: "bad", rate: 0.6, fail: 0.9 }] },
      },
      {
        short: "Server dies", chapter: "problem", title: "The server itself dies",
        body: ["A month later the server's disk fails. There is no container to restart, because there is no server. Somebody has to build a new one, install Docker, fetch the image and start it.", "That is an hour at best, and the site is down for all of it."],
        changes: ["- The server", "~ An hour to build another"],
        metrics: { copies: { v: 0, tone: "red" }, up: { v: "no, an hour", tone: "red" }, who: { v: "a person", tone: "red" } },
        scene: { ents: { users, server: Object.assign({}, server, { state: "dead", tags: [{ text: "disk failed", tone: "red" }] }), you: Object.assign({}, you, { tags: [{ text: "building a new server", tone: "amber" }] }) }, links: { u: L("users", "server", { style: "red" }) }, flows: [{ route: ["u"], kind: "bad", rate: 0.6, fail: 0.9 }] },
      },
      {
        short: "Monday", chapter: "problem", title: "Monday brings ten times the traffic",
        body: ["A newsletter goes out. Ten times the usual users arrive at once. One copy on one server cannot keep up; pages take twenty seconds and then time out.", "Adding a second copy means a second server, by hand, and something in front to share the load. By the time it is built, the rush is over."],
        callout: { kind: "warn", text: "Three different failures, one shape: a person doing by hand what should happen by itself." },
        changes: ["~ Ten times the users", "~ One copy, overwhelmed"],
        metrics: { copies: 1, up: { v: "slow, timing out", tone: "amber" }, who: { v: "a person, too late", tone: "red" } },
        scene: { ents: { users: Object.assign({}, users, { n: 5, label: "Ten times the users" }), server: Object.assign({}, server, { state: "hot", tags: [{ text: "20 s a page", tone: "red" }] }) }, links: { u: L("users", "server") }, flows: [{ route: ["u"], rate: 2, kind: "req", bounce: true, back: "bad" }] },
      },
      {
        short: "A cluster", chapter: "technique", title: "Hand the same container to a cluster",
        body: ["A cluster is three or more computers, the nodes, and a control plane: the brain that keeps a list of what you asked for. You hand it the same container image and one wish: <em>keep three copies of shop:1.4 running.</em>", "The control plane places one copy on each node. A front door shares the traffic. You did not say which node; it chose."],
        changes: ["+ Three nodes and a control plane", "+ Your wish: three copies", "+ A front door sharing the load"],
        metrics: { copies: { v: 3, tone: "green" }, up: { v: "yes", tone: "green" }, who: "nobody needed" },
        scene: fleet([podTags(1), podTags(1), podTags(1)]),
      },
      {
        short: "Self-healing", chapter: "technique", title: "The same crash, and nobody wakes up",
        body: ["The weekly bug fires again and one copy dies. The control plane notices within seconds that only two copies are running, which is not what you asked for, and starts a third. The other two carried the traffic meanwhile.", "Then node 2 loses its disk. The control plane sees the node stop reporting and starts its copy on node 3. Nobody's phone buzzes."],
        callout: { kind: "idea", text: "You wrote down what you want. The cluster's whole job is to keep the world matching it, all day, without you." },
        changes: ["~ A copy died: replaced in seconds", "- Node 2: its copy re-placed on node 3"],
        metrics: { copies: { v: 3, tone: "green" }, up: { v: "yes, throughout", tone: "green" }, who: { v: "the control plane", tone: "green" } },
        scene: (() => { const s = fleet([podTags(1), [{ text: "node down", tone: "red" }], [{ text: "2 copies, one re-placed", tone: "amber" }]], [null, "dead", null]); s.links.b.style = "red"; s.flows = [{ route: ["u"], rate: 0.8 }, { route: ["a"], bounce: true, rate: 0.4 }, { route: ["c"], bounce: true, rate: 0.5 }, { route: ["w"], kind: "ping", rate: 0.4 }]; return s; })(),
      },
      {
        short: "Scaling", chapter: "technique", title: "Monday again, and the copies multiply",
        body: ["The newsletter goes out. The processor on every copy climbs past the line you set, and the autoscaler changes your wish from three copies to nine. The control plane places them wherever there is room, across all three nodes.", "When the rush fades, the count comes back down. You read about it in the morning."],
        changes: ["+ An autoscaler watching the load", "~ Three copies became nine, then three again"],
        metrics: { copies: { v: 9, tone: "green" }, up: { v: "yes", tone: "green" }, who: { v: "the autoscaler", tone: "green" } },
        scene: (() => { const s = fleet([[{ text: "3 copies", tone: "green" }], [{ text: "3 copies", tone: "green" }], [{ text: "3 copies", tone: "green" }]]); s.ents.users = Object.assign({}, users, { n: 5, label: "Ten times the users" }); s.flows = [{ route: ["u"], rate: 2 }, { route: ["a"], bounce: true, rate: 0.6 }, { route: ["b"], bounce: true, rate: 0.6 }, { route: ["c"], bounce: true, rate: 0.6 }]; return s; })(),
      },
      {
        short: "Update", chapter: "solution", title: "A new version, with the site up the whole time",
        body: ["Version 1.5 is ready. You change one line of the wish, 1.4 to 1.5, and hand it back. The control plane starts one new copy, waits for it to pass its readiness check, then stops one old copy, and repeats until every copy is new.", "If 1.5 turns out to be broken, one command puts 1.4 back the same way. The site never went down for either."],
        callout: { kind: "tip", text: "Docker is the box. Kubernetes is the port. You still pack the box, and the port still cannot fix what is inside it." },
        changes: ["~ Image 1.4 → 1.5, one copy at a time", "+ Rollback kept ready"],
        metrics: { copies: { v: 3, tone: "green" }, up: { v: "yes, throughout", tone: "green" }, who: { v: "the control plane", tone: "green" } },
        scene: fleet([[{ text: "1.5", tone: "blue" }], [{ text: "1.5", tone: "blue" }], [{ text: "1.4 → 1.5", tone: "amber" }]]),
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["A <b>container</b> fixes the app's packaging; one <b>server</b> still fails three ways, and each is a person out of bed.", "A <b>cluster</b> is nodes plus a <b>control plane</b> that keeps the world matching your written wish.", "<b>Self-healing</b>: a dead copy is replaced, a dead node's copies are re-placed.", "<b>Scaling</b> changes the wish by the numbers; a <b>rolling update</b> swaps copies one at a time with rollback ready.", "It does nothing about bugs, databases it does not own, or whether anyone wants the app."],
        callout: { kind: "next", text: "The next tabs take the box apart, name each part of the port, deploy a real app through it, and say when a cluster is not worth its cost." },
        metrics: { copies: { v: 3, tone: "green" }, up: { v: "yes", tone: "green" }, who: "the cluster" },
        scene: fleet([podTags(1), podTags(1), podTags(1)]),
      },
    ],
  };
})();
