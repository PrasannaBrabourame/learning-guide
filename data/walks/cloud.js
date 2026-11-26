/* Walkthrough: one tap on an app, and the request's journey through the cloud, then the four
   places it fails at 3am. Drawn by assets/walk.js. */
(window.WALKS = window.WALKS || {}).cloud = (function () {
  const you = { type: "phone", x: -14, y: 2, label: "You", screen: "violet" };
  const dns = { type: "block", x: -8, y: -12, label: "Address book", glyph: "DNS", tint: "amber" };
  const lb = { type: "block", x: -2, y: 0, label: "Load balancer", glyph: "front", tint: "orange" };
  const web = { type: "block", x: 8, y: -2, label: "App server", glyph: "app", tint: "blue" };
  const db = { type: "db", x: 18, y: 5, label: "Database", tint: "violet" };
  const igw = { type: "block", x: 2, y: 10, label: "Internet gateway", glyph: "door", tint: "teal", s: 0.85 };
  const pub = { type: "zone", x: 2, y: -9, w: 12, d: 16, label: "public subnet", tint: "teal", labelAt: "right" };
  const priv = { type: "zone", x: 14, y: -1, w: 10, d: 13, label: "private subnet", tint: "violet" };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const full = () => ({
    ents: { pub, priv, you, dns, lb, web, db, igw },
    links: { d: L("you", "dns", { via: [["you", "dns"]], style: "off", label: "cached" }), l: L("you", "lb"), w: L("lb", "web"), q: L("web", "db", { via: [["web", "db"]] }) },
    flows: [{ route: ["l", "w", "q"], bounce: true, rate: 0.35, speed: 80 }],
  });
  return {
    title: "One tap on the app, and where it goes",
    summary: "Follow one request from your phone to the database and back, then watch it fail at each of the four places it fails in real life.",
    plain: "when you tap a button in an app, the request leaves your phone, finds the address of the service and is let in through a front door. A server takes it, asks a database, and the answer comes all the way back. This is the trip from the simulation at the top of this tab, cut down to the five stops every request needs; the shortcuts and the background jobs are left out, so it takes a little longer here. Each stop is a place it can fail. This walk makes the trip once, then breaks it four different ways so you can see where to look when it is your turn at 3am.",
    reallife: "Posting a letter. You look up the address, it goes through the sorting office, a postman delivers it to the right building, someone inside finds the file you asked for and posts the reply. If nothing comes back, you do not check every step at once: you work out how far the letter got.",
    terms: [
      ["VPC", "virtual private cloud: your own fenced-off network inside the cloud, where your servers and their subnets live"],
      ["DNS", "the internet's address book: it turns a name like shop.example.com into the numeric address machines use"],
      ["load balancer", "the receptionist in front of a service, deciding which server takes this request"],
      ["subnet", "a slice of the network with its own range of addresses"],
      ["public subnet", "a subnet whose route table has a way out to the internet, so it can be reached from outside"],
      ["private subnet", "a subnet with no route in from outside; it reaches out only through a controlled path"],
      ["internet gateway", "the door between a company's network and the internet; a subnet needs a route to it to be reachable"],
      ["route", "a rule saying which door traffic for a given address goes through"],
      ["security group", "a list of which ports are open on a server, and to whom; a firewall around one machine"],
      ["port", "a numbered door on a server; web traffic uses 443"],
      ["certificate", "the proof a server shows that it really is the site you asked for, so the connection can be encrypted"],
    ],
    metrics: [{ k: "hop", label: "Where the request is" }, { k: "ms", label: "Time so far" }, { k: "fail", label: "What failed" }],
    legend: [{ kind: "req", label: "the request" }, { kind: "res", label: "the reply" }, { kind: "bad", label: "a request that failed" }],
    goals: [
      { text: "The stops a request makes: address, front door, server, database, back", step: 5 },
      { text: "Why a public subnet needs a route to the internet gateway", step: 6 },
      { text: "What a security group blocks, and what a certificate proves", step: 8 },
      { text: "How to find a fault by working up the stack", step: 9 },
    ],
    steps: [
      {
        short: "Tap", chapter: "problem", title: "You tap, and nothing happens for a moment",
        body: ["You open the shop app and tap <em>my orders</em>. Less than a fifth of a second later the list appears. In between, your request made a round trip through at least five machines.", "Knowing those stops is what lets you find the fault when the list never comes."],
        callout: { kind: "idea", text: "Every request is a conversation between machines. Each stop costs a little time and is one more place to break." },
        metrics: { hop: "your phone", ms: "0 ms", fail: "nothing yet" },
        scene: { ents: { you: Object.assign({}, you, { tags: [{ text: "my orders", tone: "violet" }] }) }, links: {}, flows: [] },
      },
      {
        short: "Address", chapter: "technique", title: "Find the address",
        body: ["Machines route by number, not by name. The phone first asks the address book, DNS, <em>where is shop.example.com?</em> and gets back a numeric address.", "The answer is kept for a few minutes, so the next tap skips this stop."],
        callout: { kind: "tip", text: "If the name cannot be found, nothing else even starts. A wrong DNS record takes a whole site down while every server is perfectly healthy." },
        changes: ["+ DNS lookup, about 20 ms"],
        metrics: { hop: "the address book", ms: "20 ms", fail: "nothing yet" },
        scene: { ents: { you, dns: Object.assign({}, dns, { tags: [{ text: "203.0.113.7", tone: "amber" }] }) }, links: { d: L("you", "dns", { via: [["you", "dns"]], label: "where is shop.example.com?" }) }, flows: [{ route: ["d"], bounce: true, rate: 0.5, speed: 80 }] },
      },
      {
        short: "Front door", chapter: "technique", title: "The front door: a load balancer",
        body: ["The address points at a load balancer, not a server. It is the receptionist: it takes every request, checks the server is alive, and passes the request on.", "It also ends the encrypted connection, which is why it is the one holding the site's certificate."],
        changes: ["+ Load balancer", "+ Connection and handshake, about 40 ms"],
        metrics: { hop: "the load balancer", ms: "60 ms", fail: "nothing yet" },
        scene: { ents: { you, dns, lb: Object.assign({}, lb, { tags: [{ text: "certificate: shop.example.com", tone: "green" }] }) }, links: { d: L("you", "dns", { via: [["you", "dns"]], style: "off", label: "cached" }), l: L("you", "lb") }, flows: [{ route: ["l"], bounce: true, rate: 0.5, speed: 80 }] },
      },
      {
        short: "Server", chapter: "technique", title: "A server in a public subnet",
        body: ["The app server lives in a public subnet: a slice of the network that the internet can reach, because its route table points at the internet gateway.", "The server runs the app's code. It reads your request, works out it needs your orders, and turns to the database."],
        callout: { kind: "tip", text: "Bigger builds keep only the load balancer in the public subnet and move the servers into a private one. The VPC design tab builds that, fence by fence." },
        changes: ["+ App server, in a public subnet", "+ Internet gateway and a route to it", "+ Hand-off to the server, about 15 ms"],
        metrics: { hop: "the app server", ms: "75 ms", fail: "nothing yet" },
        scene: { ents: { pub, you, dns, lb, web, igw }, links: { d: L("you", "dns", { via: [["you", "dns"]], style: "off", label: "cached" }), l: L("you", "lb"), w: L("lb", "web"), r: L("web", "igw", { heads: "none", style: "dashed", label: "route to the internet", labelAt: 0.72 }) }, flows: [{ route: ["l", "w"], bounce: true, rate: 0.4, speed: 80 }] },
      },
      {
        short: "Database", chapter: "technique", title: "The database, in a private subnet, and the way back",
        body: ["The database sits in a private subnet with no route to the internet at all. Only the app server can talk to it. The server asks <em>orders for this customer</em>, gets the rows, builds the page and sends it back the way it came.", "Phone, address book, front door, server, database, and back. That is the whole trip."],
        callout: { kind: "idea", text: "Nothing from the internet can reach the database directly. The only path to it runs through the server, which is exactly where you want every request checked." },
        changes: ["+ Database, in a private subnet", "+ Query, reply and the trip home, about 80 ms"],
        metrics: { hop: "back on your phone", ms: "155 ms", fail: "nothing yet" },
        scene: full(),
      },
      {
        short: "No route", chapter: "problem", title: "Fault one: there is no route",
        body: ["Someone rebuilt the subnet and forgot the route to the internet gateway. The server is healthy, the app is fine, and not one request reaches it.", "The request dies on the way in. The fix is one line in a route table, but only if you know to look there."],
        callout: { kind: "warn", text: "A public subnet is public because of a route and a public address, not because of its name. Lose the route and it is private." },
        changes: ["- The route to the internet gateway"],
        metrics: { hop: "stuck at the door", ms: "timeout", fail: { v: "no route", tone: "red" } },
        scene: (s) => { s.ents.igw = Object.assign({}, igw, { state: "dead", tags: [{ text: "no route", tone: "red" }] }); s.links.w.style = "red"; s.flows = [{ route: ["l", "w"], rate: 0.5, kind: "bad", fail: 0.62 }]; return s; },
      },
      {
        short: "Port shut", chapter: "problem", title: "Fault two: the port is closed",
        body: ["The route is back. Now a security group on the server allows port 80 but not 443, and every modern request arrives on 443.", "The request reaches the server's doorstep and is refused there. The server never sees it, so its logs are empty, which is the clue."],
        changes: ["+ Route restored", "- Port 443 on the server's security group"],
        metrics: { hop: "refused at the server", ms: "refused", fail: { v: "port 443 closed", tone: "red" } },
        scene: (s) => { s.ents.igw = igw; s.ents.web = Object.assign({}, web, { state: "hot", tags: [{ text: "443 closed", tone: "red" }] }); s.links.w.style = "red"; s.flows = [{ route: ["l", "w"], rate: 0.5, kind: "bad", fail: 0.94 }]; return s; },
      },
      {
        short: "Wrong name", chapter: "problem", title: "Fault three: the certificate does not match",
        body: ["The port is open. Now the certificate on the load balancer was issued for a different name, so the phone refuses to trust it and drops the connection before sending anything.", "Everything behind the door is fine. The fault is in the handshake at the door itself."],
        callout: { kind: "tip", text: "The browser's error names the layer: a certificate warning is the encryption layer, a timeout is usually the network, a 500 is the app." },
        changes: ["+ Port 443 open", "- A certificate for the right name"],
        metrics: { hop: "stuck at the door", ms: "refused", fail: { v: "certificate mismatch", tone: "red" } },
        scene: (s) => { s.ents.web = web; s.links.w.style = "solid"; s.ents.lb = Object.assign({}, lb, { state: "hot", tags: [{ text: "certificate: other.example.com", tone: "red" }] }); s.links.l.style = "red"; s.flows = [{ route: ["l"], rate: 0.5, kind: "bad", fail: 0.9 }]; return s; },
      },
      {
        short: "Error 500", chapter: "solution", title: "Fault four: the app itself, and how you found it",
        body: ["New certificate. Now every layer works, the request reaches the server, and the server answers with an error 500. The code crashed. Stop looking at the network.", "That is the method: check the address first, then work up from the bottom: route, port, handshake, app. Each check tells you whether to keep climbing."],
        callout: { kind: "idea", text: "The layer that fails is the lowest one that is broken. Start at the bottom and climb; the first failure is the one to fix." },
        changes: ["+ The right certificate", "~ The app returns 500"],
        metrics: { hop: "the app server", ms: "80 ms", fail: { v: "the app crashed", tone: "amber" } },
        scene: (s) => { s.ents.lb = lb; s.links.l.style = "solid"; s.ents.web = Object.assign({}, web, { state: "hot", tags: [{ text: "500", tone: "red" }] }); s.flows = [{ route: ["l", "w"], bounce: true, back: "bad", rate: 0.45, speed: 80 }]; return s; },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["A request stops at the <b>address book</b>, the <b>front door</b>, a <b>server</b> and a <b>database</b>, then comes back.", "A <b>public subnet</b> needs a route to the <b>internet gateway</b>; a private one deliberately has none.", "A <b>security group</b> refuses at the server's door; the server never sees the request.", "A <b>certificate</b> for the wrong name fails the handshake before anything is sent.", "Work <b>up the stack</b>: the lowest broken layer is the one to fix."],
        callout: { kind: "next", text: "The simulation at the top of this tab switches off the shortcuts this walk left out. The next tab names all seven layers of the stack you just climbed, and the Service translator compares what each cloud calls these parts." },
        metrics: { hop: "back on your phone", ms: "155 ms", fail: "nothing" },
        scene: () => { const s = full(); s.ents.web = web; return s; },
      },
    ],
  };
})();
