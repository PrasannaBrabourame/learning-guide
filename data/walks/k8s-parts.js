/* Walkthrough on the parts tab: each part of a cluster added when its problem appears. */
(window.WALKS = window.WALKS || {})["k8s-parts"] = (function () {
  const users = { type: "crowd", x: -22, y: -2, label: "Users", tint: "sand", n: 3 };
  const cluster = { type: "zone", x: -8, y: -16, w: 36, d: 36, label: "the cluster", tint: "teal", labelAt: "front" };
  const cp = { type: "block", x: -2, y: -10, label: "Control plane", glyph: "brain", tint: "orange", s: 0.9 };
  const n1 = { type: "zone", x: 8, y: -13, w: 11, d: 9, label: "Node 1", tint: "blue", labelAt: "right" };
  const n2 = { type: "zone", x: 15, y: 0, w: 11, d: 9, label: "Node 2", tint: "blue", labelAt: "right" };
  const pod = (x, y, label, tags) => ({ type: "block", x, y, label, glyph: "pod", tint: "violet", s: 0.7, tags });
  const svc = { type: "block", x: 2, y: -1, label: "Service: shop", glyph: "addr", tint: "teal", s: 0.85 };
  const ing = { type: "block", x: -14, y: 2, label: "Ingress", glyph: "door", tint: "teal", s: 0.85 };
  const cfg = { type: "db", x: 0, y: 12, label: "Config map + secret", tint: "amber", s: 0.9 };
  const pv = { type: "db", x: 26, y: 14, label: "Persistent volume", tint: "slate" };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  return {
    title: "The parts of a cluster, each added when its problem appears",
    summary: "Start with one pod on one node and meet the problems in order: the address keeps changing, the outside world needs a door, settings are baked in, data vanishes, two teams collide. Each part is added when its problem shows up.",
    plain: "nobody learns the parts of Kubernetes from the list. You learn them by meeting the problem each one solves. A pod is the box; a node is where it runs; a deployment is your written wish. Then: the pod's address changed, so you add a service. The internet needs a door, so you add an ingress. The password was baked into the image, so you add a secret. The disk vanished with the pod, so you add a volume. Two teams collided, so you add namespaces.",
    reallife: "Setting up a market. First a stall. Then a sign, because the stall moves. Then one gate for the public. Then a locked cash box instead of money in the goods. Then a storeroom that is not the stall. Then rows, so two traders do not share a pitch.",
    startby: "Press Next to meet each problem and the part that answers it. Arrow keys work too.",
    terms: [
      ["control plane", "the brain of the cluster: it keeps the list of what you asked for and makes the nodes match it"],
      ["pod", "the smallest thing Kubernetes runs: one or a few containers that share a box and an address, started and stopped together"],
      ["deployment", "your written wish: this image, this many copies, updated this way; Kubernetes keeps the pods matching it"],
      ["service", "one steady address in front of a set of pods, so callers never need to know which pod answered"],
      ["label", "a name tag on a pod; a service sends traffic to pods whose tags match its selector"],
      ["ingress", "the one door from the internet into the cluster, routing by site name and path to the right service, usually holding the certificate"],
      ["config map", "settings handed to a pod when it starts, kept outside the image so the same image runs in test and in production"],
      ["secret", "a password or key handed to a pod the same way, but stored and shown more carefully"],
      ["persistent volume", "storage that outlives any pod, for data that must survive a restart"],
      ["namespace", "a named room inside one cluster, with its own limits, so teams do not tread on each other"],
    ],
    metrics: [{ k: "parts", label: "Parts in play" }, { k: "problem", label: "The problem just met" }, { k: "fix", label: "The part that answers it" }],
    legend: [{ kind: "req", label: "a request" }, { kind: "res", label: "a reply" }, { kind: "bad", label: "a request to a stale address" }, { kind: "write", label: "settings handed over" }],
    goals: [
      { text: "Pod, node, deployment: the box, the ship, the wish", step: 2 },
      { text: "Why a service exists: pod addresses change", step: 3 },
      { text: "Ingress: the one door from the internet", step: 4 },
      { text: "Config maps, secrets and volumes: what must not live in the image", step: 6 },
      { text: "Namespaces: rooms for teams", step: 7 },
    ],
    steps: [
      {
        short: "A pod", chapter: "technique", title: "A pod on a node",
        body: ["The smallest thing the cluster runs is a pod: your container, with its own address, on a node. You almost never make one by hand; you write a deployment, <em>two copies of shop:1.4</em>, and the control plane makes the pods.", "Two pods, one per node. Each has an address of its own."],
        metrics: { parts: "pod, node, control plane, deployment", problem: null, fix: null },
        scene: { ents: { cluster, cp, n1, n2, p1: pod(13, -9, "Pod shop-a1", [{ text: "10.1.0.7", tone: "blue" }]), p2: pod(20, 4, "Pod shop-b4", [{ text: "10.1.1.3", tone: "blue" }]) }, links: { w1: L("cp", "p1", { style: "dashed", heads: "end" }), w2: L("cp", "p2", { style: "dashed", heads: "end", via: [["cp", "p2"]] }) }, flows: [{ route: ["w1"], kind: "ping", rate: 0.3 }, { route: ["w2"], kind: "ping", rate: 0.3 }] },
      },
      {
        short: "Replaced", chapter: "problem", title: "A pod is replaced and its address changes",
        body: ["Pod shop-a1 dies and the control plane replaces it. The new pod is shop-c9 with a new address. The orders app, which had written down 10.1.0.7, is now calling an address that answers nothing.", "Pods are disposable by design. Anything that remembers a pod's address will be wrong by morning."],
        callout: { kind: "warn", text: "Never address a pod. Address the thing in front of the pods." },
        changes: ["- Pod shop-a1 at 10.1.0.7", "+ Pod shop-c9 at 10.1.0.12", "~ The orders app is calling a dead address"],
        metrics: { parts: "pod, node, control plane, deployment", problem: { v: "the address changed", tone: "red" }, fix: null },
        scene: (s) => { s.ents.p1 = pod(13, -9, "Pod shop-c9", [{ text: "10.1.0.12, new", tone: "amber" }]); s.ents.orders = { type: "block", x: -2, y: 8, label: "Orders app", glyph: "app", tint: "orange", s: 0.8, tags: [{ text: "still calling 10.1.0.7", tone: "red" }] }; s.links.o = L("orders", "p1", { style: "red", heads: "end", via: [["orders", "p1"]] }); s.flows = [{ route: ["o"], kind: "bad", rate: 0.5, fail: 0.9 }]; return s; },
      },
      {
        short: "A service", chapter: "technique", title: "A service: one steady address",
        body: ["Add a service named <em>shop</em>. It has one address that never changes, and a selector: <em>send to any pod labelled app=shop.</em> When a pod is replaced, the service's list updates by itself.", "The orders app calls <em>shop</em> and never learns a pod's address again."],
        changes: ["+ Service shop, one steady address", "~ Orders app calls the service"],
        metrics: { parts: "+ service", problem: "the address changed", fix: { v: "a service", tone: "green" } },
        scene: (s) => { s.ents.svc = svc; s.ents.orders.tags = [{ text: "calls the service", tone: "green" }]; delete s.links.o; s.links.o = L("orders", "svc", { heads: "end", labelAt: 0.7 }); s.links.s1 = L("svc", "p1", { heads: "end" }); s.links.s2 = L("svc", "p2", { heads: "end" }); s.ents.p1.tags = [{ text: "app=shop", tone: "green" }]; s.ents.p2.tags = [{ text: "app=shop", tone: "green" }]; s.flows = [{ route: ["o"], rate: 0.5 }, { route: ["s1"], rate: 0.3 }, { route: ["s2"], rate: 0.3 }]; return s; },
      },
      {
        short: "The door", chapter: "technique", title: "An ingress: the one door from the internet",
        body: ["Users on the internet cannot reach a service's address; it lives inside the cluster. An ingress is the one door: it holds the site's certificate and routes by site name and path. <em>shop.example</em> goes to the shop service, <em>/orders</em> to another.", "One certificate, one public address, many services behind it."],
        changes: ["+ Ingress, holding the certificate", "+ shop.example → service shop"],
        metrics: { parts: "+ ingress", problem: "the internet needs a door", fix: { v: "an ingress", tone: "green" } },
        scene: (s) => { s.ents.users = users; s.ents.ing = Object.assign({}, ing, { tags: [{ text: "shop.example → shop", tone: "blue" }] }); s.links.u = L("users", "ing"); s.links.i = L("ing", "svc"); s.flows = [{ route: ["u", "i"], bounce: true, rate: 0.5 }, { route: ["s1"], rate: 0.3 }, { route: ["s2"], rate: 0.3 }]; return s; },
      },
      {
        short: "Baked in", chapter: "problem", title: "The password is baked into the image",
        body: ["The image was built with the database address and password inside it. To point test and production at different databases, someone built two images. Then a developer pushed the production image to a public registry.", "Anything inside the image goes everywhere the image goes."],
        callout: { kind: "warn", text: "An image should contain the app and nothing that changes between places it runs." },
        changes: ["~ Two images that differ only in a password", "~ The password is in the registry"],
        metrics: { parts: "+ ingress", problem: { v: "settings in the image", tone: "red" }, fix: null },
        scene: (s) => { s.ents.p1.tags = [{ text: "db password inside", tone: "red" }]; s.ents.p2.tags = [{ text: "db password inside", tone: "red" }]; return s; },
      },
      {
        short: "The envelope", chapter: "technique", title: "Config maps, secrets, and a volume for the data",
        body: ["Take the settings out of the image. A config map holds the database address and is handed to the pod when it starts; a secret holds the password and is stored and shown more carefully. One image, two envelopes.", "And the photos users uploaded vanished when a pod was replaced, because a pod's disk dies with it. A persistent volume outlives any pod; the pods write there."],
        changes: ["+ Config map and secret, handed over at start", "+ Persistent volume for the uploads", "~ One image for test and production"],
        metrics: { parts: "+ config map, secret, volume", problem: "settings in the image · data lost", fix: { v: "an envelope and a warehouse", tone: "green" } },
        scene: (s) => { s.ents.p1.tags = [{ text: "reads the envelope", tone: "green" }]; s.ents.p2.tags = [{ text: "reads the envelope", tone: "green" }]; s.ents.cfg = cfg; s.ents.pv = pv; s.links.c1 = L("cfg", "p1", { heads: "end", style: "dashed", via: [["p1", "cfg"]] }); s.links.c2 = L("cfg", "p2", { heads: "end", style: "dashed" }); s.links.v = L("p2", "pv", { heads: "end", via: [["pv", "p2"]], label: "uploads" }); s.flows = [{ route: ["c1"], kind: "write", rate: 0.3 }, { route: ["c2"], kind: "write", rate: 0.3 }, { route: ["v"], kind: "write", rate: 0.3 }, { route: ["u", "i"], bounce: true, rate: 0.4 }]; return s; },
      },
      {
        short: "Two teams", chapter: "technique", title: "Namespaces: rooms for teams",
        body: ["The payments team joins the cluster and names their service <em>shop</em> too. Now two things called shop fight, and a runaway payments job eats the memory the shop needed.", "Namespaces are rooms. Each team gets one, with its own names and its own limits on processor and memory. Inside a room, <em>shop</em> means your shop."],
        callout: { kind: "idea", text: "A cluster shared by teams needs rooms before it needs anything else. Retrofitting them is painful." },
        changes: ["+ Namespace shop, namespace payments", "+ Limits per room"],
        metrics: { parts: "+ namespaces", problem: "two teams collide", fix: { v: "rooms with limits", tone: "green" } },
        scene: (s) => { s.ents.cluster = Object.assign({}, cluster, { label: "namespace shop" }); s.ents.pay = { type: "zone", x: 8, y: 12, w: 12, d: 8, label: "namespace payments", tint: "rose", labelAt: "left" }; s.ents.pp = pod(14, 16, "Pod pay-x2", [{ text: "limited to 2 GB", tone: "amber" }]); return s; },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["A <b>pod</b> is the box, a <b>node</b> is where it runs, a <b>deployment</b> is the wish, the <b>control plane</b> keeps it true.", "Pod addresses change, so a <b>service</b> is the steady address; the internet comes in through one <b>ingress</b>.", "Settings and passwords live in a <b>config map</b> and a <b>secret</b>, not the image; data that must survive lives on a <b>persistent volume</b>.", "Teams get <b>namespaces</b>: rooms with names and limits."],
        callout: { kind: "next", text: "The deploy tab takes a real app through all of these, from the recipe to the rollback." },
        metrics: { parts: "all of them", problem: null, fix: null },
      },
    ],
    page: "k8s", pane: "kparts",
  };
})();
