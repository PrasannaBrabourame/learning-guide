/* Walkthrough on the deploy tab: an app from the recipe to a rollback, through a cluster. */
(window.WALKS = window.WALKS || {})["k8s-deploy"] = (function () {
  const you = { type: "person", x: -20, y: 4, label: "You", tint: "sand" };
  const laptop = { type: "device", x: -14, y: -12, label: "Your laptop", screen: "violet" };
  const reg = { type: "db", x: -6, y: -22, label: "Registry", tint: "violet" };
  const cluster = { type: "zone", x: 2, y: -16, w: 34, d: 34, label: "the cluster", tint: "teal", labelAt: "front" };
  const cp = { type: "block", x: 6, y: -2, label: "Control plane", glyph: "brain", tint: "orange", s: 0.85 };
  const node = (i, x, y) => ({ type: "block", x, y, label: "", glyph: "node " + i, tint: "blue", s: 0.9 });
  const file = (lines, title) => ({ type: "panel", x: -20, y: 4, dx: -40, dy: -150, title: title || "shop.yaml", lines });
  const users = { type: "crowd", x: -20, y: 16, label: "Users", tint: "sand", n: 3 };
  const svc = { type: "block", x: 8, y: 10, label: "Service + ingress", glyph: "door", tint: "teal", s: 0.8 };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const running = (tags, extra) => { const s = { ents: { cluster, you, laptop, reg, cp, n1: Object.assign(node(1, 12, -10), { tags: tags[0] }), n2: Object.assign(node(2, 22, 0), { tags: tags[1] }), n3: Object.assign(node(3, 32, 10), { tags: tags[2] }) }, links: { k: L("laptop", "cp", { heads: "end", via: [["laptop", "cp"]], label: "kubectl apply", labelAt: 0.75 }), p1: L("n1", "reg", { heads: "end", style: "dashed", via: [["n1", "reg"]] }), w1: L("cp", "n1", { style: "dashed", heads: "end" }), w2: L("cp", "n2", { style: "dashed", heads: "end", via: [["cp", "n2"]] }), w3: L("cp", "n3", { style: "dashed", heads: "end", via: [["cp", "n3"]] }) }, flows: [{ route: ["w1"], kind: "ping", rate: 0.25 }, { route: ["w2"], kind: "ping", rate: 0.25 }, { route: ["w3"], kind: "ping", rate: 0.25 }] }; if (extra) extra(s); return s; };
  return {
    title: "Deploy an app: from the recipe to the rollback",
    summary: "Pack the app into an image, push it to a registry, write down what you want in one file, hand it to the cluster, open the door, scale it, update it, and put the old version back when the new one is bad.",
    plain: "deploying to a cluster is not a list of commands to run on a server. It is: bake the app into an image, put the image on a shelf the cluster can reach, write what you want in a file (which image, how many copies, which door), and hand the file over with one command. The cluster works out the steps. Scaling is a number in the file. An update is a version in the file. A rollback is one command.",
    reallife: "Shipping through a port instead of sailing the cargo yourself. You pack the box once and leave it at the depot. You pin one standing order on the board: this box, three of them on the move, through this gate. The harbour master works out which ships. Change the order and the port works out the difference.",
    startby: "Press Next to take one app from a Dockerfile to a rollback. Arrow keys work too.",
    terms: [
      ["control plane", "the brain of the cluster: it keeps the list of what you asked for and makes the nodes match it"],
      ["Dockerfile", "the short recipe Docker follows to build an image, one instruction per line"],
      ["autoscaler", "the part that adds and removes copies, or nodes, as the load changes"],
      ["image", "the baked, unchanging copy of an app and everything it needs; a container is an image running"],
      ["registry", "the shelf images are pushed to and pulled from, so any node can fetch exactly the one you built"],
      ["YAML", "the plain-text format the files are written in: names, colons and indentation instead of brackets"],
      ["kubectl", "the command-line tool you talk to the cluster with: apply a file, list pods, read logs"],
      ["replicas", "how many copies of the pod you want running at once"],
      ["image tag", "the version label after the colon in an image name, such as shop:1.4"],
      ["readiness check", "a small test the cluster runs on a pod to decide whether to send it traffic yet"],
      ["rolling update", "replacing old copies with new ones a few at a time, so the app never goes fully down"],
      ["rollback", "putting the previous version back with one command, because the cluster kept it"],
    ],
    metrics: [{ k: "where", label: "The app is" }, { k: "copies", label: "Copies" }, { k: "version", label: "Version" }, { k: "cmd", label: "Last command" }],
    legend: [{ kind: "write", label: "an image moving" }, { kind: "req", label: "a request" }, { kind: "ping", label: "the control plane placing pods" }, { kind: "bad", label: "a failed request" }],
    goals: [
      { text: "Build an image and push it to a registry", step: 2 },
      { text: "Write the wish in one file and apply it", step: 4 },
      { text: "Open the door and scale by changing a number", step: 6 },
      { text: "Roll out a version and roll it back", step: 8 },
    ],
    steps: [
      {
        short: "The code", chapter: "problem", title: "An app on your laptop",
        body: ["The shop app works on your laptop. Users cannot use your laptop. Between here and them: an image, a shelf for it, a cluster, and one file.", "Every step below is one of those four."],
        metrics: { where: "your laptop", copies: 0, version: null, cmd: null },
        scene: { ents: { you, laptop: Object.assign({}, laptop, { tags: [{ text: "shop/, works here", tone: "violet" }] }) }, links: { u: L("you", "laptop") }, flows: [] },
      },
      {
        short: "Build, push", chapter: "technique", title: "Bake an image and push it to the registry",
        body: ["<code>docker build -t registry.example/shop:1.4 .</code> follows the five-line recipe and bakes the app into an image tagged 1.4. <code>docker push</code> puts it on the registry, a shelf every node in the cluster can reach.", "From now on, nothing on your laptop matters. The image is the thing."],
        changes: ["+ Image shop:1.4 built from the Dockerfile", "+ Pushed to the registry"],
        metrics: { where: "the registry", copies: 0, version: "1.4", cmd: "docker push" },
        scene: { ents: { you, laptop, reg: Object.assign({}, reg, { tags: [{ text: "shop:1.4", tone: "green" }] }) }, links: { u: L("you", "laptop"), b: L("laptop", "reg", { heads: "end", label: "docker push" }) }, flows: [{ route: ["b"], kind: "write", rate: 0.5 }] },
      },
      {
        short: "The file", chapter: "technique", title: "Write what you want, in one file",
        body: ["Not what to do: what you want. <em>kind: Deployment. image: shop:1.4. replicas: 3. containerPort: 8080.</em> Twelve lines of plain text.", "This file is the whole deployment. It goes in the repository next to the code, and from now on every change to how the app runs is a change to this file."],
        callout: { kind: "idea", text: "The file says what the world should look like. The cluster's job is to make it so, and keep it so." },
        changes: ["+ shop.yaml: image, three copies, port 8080"],
        metrics: { where: "the registry", copies: 0, version: "1.4", cmd: null },
        scene: { ents: { you, laptop: Object.assign({}, laptop, { tags: [{ text: "shop.yaml", tone: "amber" }] }), reg, f: file(["kind: Deployment", "image: shop:1.4", "replicas: 3", "containerPort: 8080"]) }, links: { u: L("you", "laptop") }, flows: [] },
      },
      {
        short: "Apply", chapter: "technique", title: "Hand it over: kubectl apply",
        body: ["<code>kubectl apply -f shop.yaml</code> sends the file to the control plane. The control plane reads it, sees three copies are wanted and none exist, and places one pod on each node. Each node pulls shop:1.4 from the registry and starts it.", "Thirty seconds later, <code>kubectl get pods</code> shows three Running. You did not pick a node, pull an image or start anything."],
        changes: ["+ kubectl apply", "+ Three pods placed, image pulled, running"],
        metrics: { where: "the cluster", copies: { v: 3, tone: "green" }, version: "1.4", cmd: "kubectl apply" },
        scene: running([[{ text: "shop 1.4", tone: "green" }], [{ text: "shop 1.4", tone: "green" }], [{ text: "shop 1.4", tone: "green" }]], (s) => { s.flows.push({ route: ["k"], rate: 0.4 }, { route: ["p1"], kind: "write", rate: 0.3 }); }),
      },
      {
        short: "The door", chapter: "technique", title: "A service and an ingress: now users can reach it",
        body: ["Three running pods and nobody can reach them. Two more small files: a service, one steady address in front of any pod labelled app=shop, and an ingress that sends shop.example through the front door to that service.", "Apply both. Users type the address, the ingress routes it, the service picks a pod. The app is live."],
        changes: ["+ service.yaml and ingress.yaml, applied", "+ shop.example is live"],
        metrics: { where: { v: "live", tone: "green" }, copies: { v: 3, tone: "green" }, version: "1.4", cmd: "kubectl apply" },
        scene: running([[{ text: "shop 1.4", tone: "green" }], [{ text: "shop 1.4", tone: "green" }], [{ text: "shop 1.4", tone: "green" }]], (s) => { s.ents.users = users; s.ents.svc = svc; s.links.u = L("users", "svc", { via: [["users", "svc"]] }); s.links.s2 = L("svc", "n2", { heads: "end" }); s.links.s3 = L("svc", "n3", { heads: "end", via: [["svc", "n3"]] }); s.flows = [{ route: ["u"], bounce: true, rate: 0.5 }, { route: ["s2"], rate: 0.3 }, { route: ["s3"], rate: 0.3 }]; }),
      },
      {
        short: "Scale", chapter: "technique", title: "Scale: change a number",
        body: ["Traffic grows. Change <em>replicas: 3</em> to <em>replicas: 9</em> and apply. The control plane sees six are missing and places them wherever there is room.", "That is the whole scaling procedure. An autoscaler can change the number for you, by the processor load, if you ask it to."],
        changes: ["~ replicas: 3 → 9", "+ Six more pods placed"],
        metrics: { where: { v: "live", tone: "green" }, copies: { v: 9, tone: "green" }, version: "1.4", cmd: "kubectl apply" },
        scene: running([[{ text: "3 × shop 1.4", tone: "green" }], [{ text: "3 × shop 1.4", tone: "green" }], [{ text: "3 × shop 1.4", tone: "green" }]], (s) => { s.ents.users = Object.assign({}, users, { n: 5 }); s.ents.svc = svc; s.ents.f = file(["kind: Deployment", "image: shop:1.4", "replicas: 9", "containerPort: 8080"]); s.links.u = L("users", "svc", { via: [["users", "svc"]] }); s.links.s2 = L("svc", "n2", { heads: "end" }); s.links.s3 = L("svc", "n3", { heads: "end", via: [["svc", "n3"]] }); s.flows = [{ route: ["u"], bounce: true, rate: 1 }, { route: ["s2"], rate: 0.5 }, { route: ["s3"], rate: 0.5 }, { route: ["k"], rate: 0.3 }]; }),
      },
      {
        short: "Update", chapter: "technique", title: "Update: change a version",
        body: ["Version 1.5 is built and pushed. Change the tag in the file, apply. The control plane starts one new pod, waits for its readiness check to pass, then stops one old pod, and repeats.", "At every moment at least nine copies take traffic. Nobody saw a blank page."],
        changes: ["~ image: shop:1.4 → shop:1.5", "~ Pods replaced one at a time"],
        metrics: { where: { v: "live", tone: "green" }, copies: { v: 9, tone: "green" }, version: "1.4 → 1.5", cmd: "kubectl apply" },
        scene: running([[{ text: "3 × shop 1.5", tone: "blue" }], [{ text: "2 × 1.5, 1 × 1.4", tone: "amber" }], [{ text: "3 × shop 1.4", tone: "green" }]], (s) => { s.ents.users = Object.assign({}, users, { n: 5 }); s.ents.svc = svc; s.ents.reg = Object.assign({}, reg, { tags: [{ text: "shop:1.4 · shop:1.5", tone: "green" }] }); s.links.u = L("users", "svc", { via: [["users", "svc"]] }); s.links.s2 = L("svc", "n2", { heads: "end" }); s.flows = [{ route: ["u"], bounce: true, rate: 0.8 }, { route: ["p1"], kind: "write", rate: 0.4 }, { route: ["w2"], kind: "ping", rate: 0.5 }]; }),
      },
      {
        short: "Rollback", chapter: "solution", title: "1.5 is bad: put 1.4 back",
        body: ["Ten minutes in, the error rate climbs: 1.5 has a bug. <code>kubectl rollout undo deployment/shop</code>. The cluster kept the previous version and rolls it back out the same careful way, one pod at a time.", "Two minutes, no outage, and now you have time to read the logs."],
        callout: { kind: "tip", text: "Put the last version back first and think second. The cluster made that cheap on purpose." },
        changes: ["~ kubectl rollout undo", "~ Every pod back on 1.4"],
        metrics: { where: { v: "live", tone: "green" }, copies: { v: 9, tone: "green" }, version: { v: "1.4, rolled back", tone: "amber" }, cmd: "kubectl rollout undo" },
        scene: running([[{ text: "3 × shop 1.4", tone: "green" }], [{ text: "3 × shop 1.4", tone: "green" }], [{ text: "3 × shop 1.4", tone: "green" }]], (s) => { s.ents.users = Object.assign({}, users, { n: 5 }); s.ents.svc = svc; s.ents.laptop = Object.assign({}, laptop, { tags: [{ text: "rollout undo", tone: "amber" }] }); s.links.u = L("users", "svc", { via: [["users", "svc"]] }); s.links.s2 = L("svc", "n2", { heads: "end" }); s.flows = [{ route: ["u"], bounce: true, rate: 0.8 }, { route: ["k"], rate: 0.4 }, { route: ["w1"], kind: "ping", rate: 0.4 }]; }),
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["<b>Build</b> an image from the recipe, <b>push</b> it to the registry.", "Write the <b>wish</b> in one file: image, replicas, port. <b>kubectl apply</b> hands it over; the cluster does the steps.", "A <b>service</b> and an <b>ingress</b> open the door.", "<b>Scale</b> is a number; an <b>update</b> is a version, rolled out one pod at a time behind a readiness check.", "<b>Rollback</b> is one command. Put it back first, think second."],
        callout: { kind: "next", text: "The next two tabs ask when a cluster is worth its cost, and how to read it when a pod says something you do not understand." },
        metrics: { where: { v: "live", tone: "green" }, copies: { v: 9, tone: "green" }, version: "1.4", cmd: null },
      },
    ],
    page: "k8s", pane: "kdeploy",
  };
})();
