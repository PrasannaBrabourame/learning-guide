/* Walkthrough on the cloud lab's VPC design tab: a private network built from nothing, one
   fence at a time. Drawn by assets/walk.js. */
(window.WALKS = window.WALKS || {})["cloud-net"] = (function () {
  const net = { type: "block", x: -20, y: -4, label: "The internet", glyph: "web", tint: "rose" };
  const vpc = { type: "zone", x: -10, y: -16, w: 38, d: 34, label: "your VPC: 10.0.0.0/16, 65,536 addresses", tint: "teal", labelAt: "back" };
  const pub = { type: "zone", x: -8, y: -14, w: 34, d: 14, label: "public subnet 10.0.1.0/24", tint: "blue", labelAt: "front" };
  const priv = { type: "zone", x: -8, y: 2, w: 34, d: 14, label: "private subnet 10.0.2.0/24", tint: "violet", labelAt: "front" };
  const igw = { type: "block", x: -8, y: -6, label: "Internet gateway", glyph: "door", tint: "teal", s: 0.85 };
  const web = { type: "block", x: 6, y: -8, label: "Web server", glyph: "web", tint: "blue", s: 0.9 };
  const nat = { type: "block", x: 18, y: -8, label: "NAT gateway", glyph: "out", tint: "amber", s: 0.85 };
  const app = { type: "block", x: 6, y: 8, label: "App server", glyph: "app", tint: "orange", s: 0.9 };
  const db = { type: "db", x: 18, y: 10, label: "Database", tint: "violet" };
  const lb = { type: "block", x: 2, y: -8, label: "Load balancer", glyph: "front", tint: "orange", s: 0.9 };
  const waf = { type: "block", x: -2, y: -13, label: "Web firewall", glyph: "read", tint: "rose", s: 0.8 };
  const routes = (lines, title) => ({ type: "panel", x: 28, y: -16, dx: -230, dy: -150, title, lines });
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const sg = (e, text, tone) => Object.assign({}, e, { tags: [{ text, tone: tone || "green" }] });
  const fenced = () => ({
    ents: { vpc, pub, priv, net, igw, web, nat, app, db },
    links: { i: L("net", "igw"), w: L("igw", "web"), a: L("web", "app"), d: L("app", "db"), n: L("app", "nat", { heads: "end", style: "dashed", via: [["nat", "app"]] }), no: L("nat", "igw", { heads: "end", style: "dashed" }) },
    flows: [{ route: ["i", "w"], bounce: true, rate: 0.35 }, { route: ["a", "d"], bounce: true, rate: 0.3 }],
  });
  return {
    title: "Your own corner of the cloud, built from nothing",
    summary: "Start with one server on the open internet. Fence off a private network, split it into subnets, add the gate, the one-way door, two kinds of firewall, a front door and a firewall that reads the words, and count the fences between a stranger and your database.",
    plain: "a VPC is a fenced plot of the cloud with its own address range. Subnets are the rooms inside it. A route table is each room's map, and the internet gateway is the one gate to the street. A NAT gateway is a one-way door for rooms that must call out but never be called. Security groups and network ACLs are two different fences; a load balancer is the front desk; a web firewall reads the actual words of a request. This walk builds all of that around one database, one fence at a time, and says what each one stops.",
    reallife: "An office building. The plot with its own postcode is the VPC. Floors are subnets: a public reception floor and a private floor with no outside door. The lobby entrance is the internet gateway, the staff-only exit is the NAT. Each office door has its own key list (a security group); each floor's lift lobby has a guard who checks everyone in both directions (a network ACL). The receptionist is the load balancer; the mailroom that opens suspicious post is the web firewall.",
    startby: "Press Next to add one fence at a time and watch the tiles change; the last step counts the fences between a stranger and the database. Arrow keys work too.",
    terms: [
      ["VPC", "a virtual private cloud: a fenced-off network of your own inside the cloud, with its own address range; nothing inside is reachable from outside until you open something"],
      ["CIDR block", "an address range written as a start and a size: 10.0.0.0/16 is 65,536 addresses, 10.0.1.0/24 is 256"],
      ["subnet", "a slice of the VPC's addresses with its own route table"],
      ["public subnet", "a subnet whose route table has a way out to the internet"],
      ["private subnet", "a subnet with no route in from outside; it reaches out only through a controlled path"],
      ["route table", "a subnet's map: for each destination range, which door the traffic goes through"],
      ["internet gateway", "the door between a company's network and the internet; a subnet needs a route to it to be reachable"],
      ["NAT gateway", "a one-way door in a public subnet that lets private machines call out to the internet while nobody can call in"],
      ["public IP", "an address the whole internet can reach; a machine without one cannot be called from outside however the routes are set"],
      ["security group", "a firewall around one machine: a list of which ports are open, and to whom; it only allows, and it lets replies to your own requests back in"],
      ["network ACL", "a firewall on a subnet's edge: it can allow and deny address ranges, and checks every packet in each direction separately"],
      ["load balancer", "the receptionist in front of a service, deciding which server takes this request"],
      ["web application firewall", "a firewall that reads the words of a web request itself and blocks known attacks; it sits in front of the load balancer"],
      ["port", "a numbered door on a server; web traffic uses 443, a database listens on its own number"],
      ["availability zone", "one of the separate buildings a cloud region is made of; a subnet lives in one, so you make a pair"],
    ],
    metrics: [{ k: "in", label: "Can a stranger reach the database" }, { k: "out", label: "Can the app server call out" }, { k: "fences", label: "Fences before the database" }, { k: "addr", label: "Addresses in the plot" }],
    legend: [{ kind: "req", label: "a request from outside" }, { kind: "res", label: "a reply" }, { kind: "bad", label: "something refused" }, { kind: "ping", label: "a health check" }],
    goals: [
      { text: "What a VPC and a CIDR block are", step: 2 },
      { text: "Subnets, route tables and what makes one public", step: 4 },
      { text: "The one-way door: NAT", step: 5 },
      { text: "Security groups and network ACLs, and how they differ", step: 7 },
      { text: "Where the load balancer and the web firewall sit", step: 9 },
    ],
    steps: [
      {
        short: "Bare server", chapter: "problem", title: "One server on the open internet",
        body: ["A new server with a public address and a database on the same machine. Anyone on the internet can knock on every one of its doors: the web port, the database port, the admin port.", "Within an hour, automated scanners have found it and are trying passwords on the database."],
        callout: { kind: "warn", text: "On the internet every address is tried, constantly, by machines. A server with nothing around it is not private because it is obscure." },
        metrics: { in: { v: "yes, directly", tone: "red" }, out: "yes", fences: { v: 0, tone: "red" }, addr: "1" },
        scene: { ents: { net, web: Object.assign({}, web, { x: 4, y: 0, label: "One server, everything on it", tags: [{ text: "every port open to everyone", tone: "red" }] }) }, links: { i: L("net", "web", { style: "red" }) }, flows: [{ route: ["i"], kind: "bad", rate: 0.8 }] },
      },
      {
        short: "The plot", chapter: "technique", title: "Fence off a plot: the VPC",
        body: ["Create a VPC: a private network of your own with the address range 10.0.0.0/16, which is 65,536 addresses. Everything you build goes inside it.", "By default nothing inside can be reached from outside, and nothing can reach out. It is a fenced plot with no gate yet."],
        changes: ["+ A VPC with 65,536 addresses", "- Any path in or out"],
        metrics: { in: { v: "no", tone: "green" }, out: { v: "no", tone: "amber" }, fences: 1, addr: "65,536" },
        scene: { ents: { vpc, net: Object.assign({}, net, { state: "dim" }), web: Object.assign({}, web, { x: 6, y: 0, label: "Web server" }), db: Object.assign({}, db, { x: 18, y: 4 }) }, links: { a: L("web", "db") }, flows: [{ route: ["a"], bounce: true, rate: 0.3 }] },
      },
      {
        short: "Rooms", chapter: "technique", title: "Divide the plot: subnets",
        body: ["Split the range into subnets, each a slice of 256 addresses: a public subnet, 10.0.1.0/24, for the things the internet must reach, and a private subnet, 10.0.2.0/24, for everything else.", "The web server goes in the public room. The database and an app server go in the private room. In a real build you make each room twice, in two availability zones, so one building failing does not take the room with it."],
        callout: { kind: "idea", text: "A subnet is only two things: a slice of addresses and a route table. Public and private are not settings; they fall out of the route table." },
        changes: ["+ Public subnet 10.0.1.0/24", "+ Private subnet 10.0.2.0/24", "+ App server, in the private room"],
        metrics: { in: { v: "no", tone: "green" }, out: { v: "no", tone: "amber" }, fences: 1, addr: "65,536" },
        scene: { ents: { vpc, pub, priv, net: Object.assign({}, net, { state: "dim" }), web, app, db }, links: { a: L("web", "app"), d: L("app", "db") }, flows: [{ route: ["a", "d"], bounce: true, rate: 0.3 }] },
      },
      {
        short: "The gate", chapter: "technique", title: "The gate and the map: internet gateway and route table",
        body: ["Attach an internet gateway to the VPC: the one door to the street. Then, in the public subnet's route table, add one line: <em>anything not in 10.0.0.0/16 goes through the gateway.</em> Give the web server a public address.", "Now, and only now, the web server is reachable. The private subnet's table has no such line, so nothing in it can be reached from outside, whatever else you do."],
        changes: ["+ Internet gateway", "+ Route 0.0.0.0/0 → gateway, public subnet only", "+ A public address on the web server"],
        metrics: { in: { v: "no", tone: "green" }, out: { v: "web server only", tone: "amber" }, fences: 2, addr: "65,536" },
        scene: { ents: { vpc, pub, priv, net, igw, web: sg(web, "public address 203.0.113.7", "blue"), app, db, rt: routes(["public subnet", "10.0.0.0/16   local", "0.0.0.0/0     gateway", "# private subnet: local only"], "route tables") }, links: { i: L("net", "igw"), w: L("igw", "web"), a: L("web", "app"), d: L("app", "db") }, flows: [{ route: ["i", "w"], bounce: true, rate: 0.35 }, { route: ["a", "d"], bounce: true, rate: 0.3 }] },
      },
      {
        short: "One-way door", chapter: "technique", title: "Private things that still need to call out: NAT",
        body: ["The app server in the private room needs to download updates. It has no route out. Put a NAT gateway in the public room and add one line to the private table: <em>anything outside the VPC goes through the NAT.</em>", "The NAT forwards the request out under its own public address and passes the reply back. Nobody on the internet can start a conversation with the app server; it can only answer one the app server began."],
        callout: { kind: "tip", text: "If a private machine suddenly cannot fetch updates, the NAT line in its route table is the first thing to check." },
        changes: ["+ NAT gateway, in the public subnet", "+ Route 0.0.0.0/0 → NAT, private subnet"],
        metrics: { in: { v: "no", tone: "green" }, out: { v: "yes, through the NAT", tone: "green" }, fences: 2, addr: "65,536" },
        scene: (() => { const s = fenced(); s.ents.rt = routes(["private subnet", "10.0.0.0/16   local", "0.0.0.0/0     NAT"], "route tables"); s.ents.app = sg(app, "fetching updates", "amber"); s.flows = [{ route: ["n", "no"], kind: "req", rate: 0.4 }, { route: ["no"], reverse: true, kind: "res", rate: 0.4 }]; return s; })(),
      },
      {
        short: "Door keys", chapter: "technique", title: "Firewall one: a security group around each machine",
        body: ["Every machine gets a security group: the list of doors it answers and who may knock. Web server: port 443 from anywhere. App server: port 8080 from the web server's group only. Database: its port from the app server's group only.", "It only ever allows; whatever is not listed is shut. And it remembers conversations: when the app server asks the database something, the reply comes back without a rule for it."],
        callout: { kind: "idea", text: "Write security group rules in terms of other groups, not addresses. Then adding a second web server needs no new rule." },
        changes: ["+ Security group on each machine", "~ Database answers the app server's group only"],
        metrics: { in: { v: "no", tone: "green" }, out: { v: "yes, through the NAT", tone: "green" }, fences: 3, addr: "65,536" },
        scene: (() => { const s = fenced(); s.ents.web = sg(web, "443 from anywhere"); s.ents.app = sg(app, "8080 from web group"); s.ents.db = sg(db, "5432 from app group"); s.flows = [{ route: ["i", "w"], bounce: true, rate: 0.35 }, { route: ["a", "d"], bounce: true, rate: 0.3 }, { route: ["i"], kind: "bad", rate: 0.3, fail: 0.95 }]; return s; })(),
      },
      {
        short: "Floor guard", chapter: "technique", title: "Firewall two: a network ACL on the subnet's edge",
        body: ["A second fence, on the edge of the private subnet. A network ACL can allow <em>and deny</em>: block a whole address range that has been attacking you, for instance. It checks every packet separately in each direction, so you must open the reply ports too, and it has no memory of conversations.", "The security group is the key list on each office door. The ACL is the guard at the floor's lift lobby. Both at once is belt and braces."],
        changes: ["+ Network ACL on the private subnet", "~ One attacking address range denied"],
        metrics: { in: { v: "no", tone: "green" }, out: { v: "yes, through the NAT", tone: "green" }, fences: 4, addr: "65,536" },
        scene: (() => { const s = fenced(); s.ents.priv = Object.assign({}, priv, { label: "private subnet · ACL: deny 198.51.100.0/24", tint: "rose" }); s.ents.db = sg(db, "5432 from app group"); s.ents.rt = routes(["security group  network ACL", "per machine     per subnet", "allow only      allow and deny", "remembers       checks each way"], "two fences"); return s; })(),
      },
      {
        short: "Front desk", chapter: "technique", title: "The front door: a load balancer",
        body: ["One web server is one machine to fail. Put a load balancer in the public subnet with the public address, and two web servers behind it. It spreads requests and checks each server's health every few seconds.", "The web servers no longer need public addresses at all. Move them into the private room. Now the only thing with a public address is the front desk."],
        changes: ["+ Load balancer, the only public address", "+ A second web server", "~ Web servers moved to the private subnet"],
        metrics: { in: { v: "no", tone: "green" }, out: { v: "yes, through the NAT", tone: "green" }, fences: 5, addr: "65,536" },
        scene: (() => { const s = fenced(); s.ents.pub = Object.assign({}, pub, { label: "" }); s.ents.priv = Object.assign({}, priv, { label: "" }); s.ents.lb = sg(Object.assign({}, lb, { x: 8, y: -11 }), "public address 203.0.113.7", "blue"); s.ents.web = Object.assign({}, web, { x: 2, y: 7, label: "Web server A" }); s.ents.web2 = Object.assign({}, web, { x: 12, y: 5, label: "Web server B" }); s.ents.app = Object.assign({}, app, { x: 20, y: 2 }); s.ents.db = Object.assign({}, db, { x: 22, y: 13 }); s.ents.nat = Object.assign({}, nat, { x: 20, y: -12 }); delete s.ents.rt; s.links = { i: L("net", "igw"), l: L("igw", "lb"), w1: L("lb", "web", { via: [["lb", "web"]] }), w2: L("lb", "web2", { via: [["web2", "lb"]] }), a: L("web2", "app"), d: L("app", "db", { via: [["app", "db"]] }) }; s.flows = [{ route: ["i", "l"], bounce: true, rate: 0.5 }, { route: ["w1"], bounce: true, rate: 0.3 }, { route: ["w2"], bounce: true, rate: 0.3 }, { route: ["w1"], kind: "ping", rate: 0.2 }]; return s; })(),
      },
      {
        short: "Read the words", chapter: "technique", title: "A firewall that reads the words",
        body: ["Security groups and ACLs see addresses and ports. They cannot tell a normal request on port 443 from one carrying an attack in its text. A web application firewall sits in front of the load balancer and reads the request itself: the URL, the headers, the form fields.", "It blocks the known shapes of attack, such as database commands hidden in a search box, and the bots that hammer the login page."],
        callout: { kind: "warn", text: "A web firewall catches known patterns. It is one more fence, not a reason to leave the others open." },
        changes: ["+ Web application firewall in front of the front desk"],
        metrics: { in: { v: "no", tone: "green" }, out: { v: "yes, through the NAT", tone: "green" }, fences: 6, addr: "65,536" },
        scene: (s) => { s.ents.waf = sg(waf, "blocked: a database command in a search box", "red"); s.links.i = L("net", "waf"); s.links.f = L("waf", "igw"); s.flows = [{ route: ["i", "f", "l"], bounce: true, rate: 0.4 }, { route: ["i"], kind: "bad", rate: 0.35, fail: 0.92 }]; return s; },
      },
      {
        short: "Count fences", chapter: "solution", title: "Count the fences between a stranger and the database",
        body: ["A stranger's request has to pass the web firewall, be accepted by the load balancer, match the web server's security group, cross the private subnet's ACL, match the app server's group, and then the database's group, which only answers the app server.", "Six fences, each stopping a different thing. None of them is the model's judgement or the app's good behaviour; they hold whatever the code does."],
        callout: { kind: "idea", text: "When something is reachable that should not be, walk the fences in this order and find the one that is open. Usually it is a route or a security group rule someone added in a hurry." },
        metrics: { in: { v: "no", tone: "green" }, out: { v: "yes, through the NAT", tone: "green" }, fences: { v: 6, tone: "green" }, addr: "65,536" },
        scene: (s) => { s.ents.waf = waf; s.ents.rt = routes(["1 web firewall", "2 load balancer", "3 web server group", "4 private subnet ACL", "5 app server group", "6 database group"], "the fences, in order"); s.flows = [{ route: ["i", "f", "l"], bounce: true, rate: 0.35 }, { route: ["w2", "a", "d"], bounce: true, rate: 0.3 }]; return s; },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["A <b>VPC</b> is a fenced plot with its own <b>CIDR</b> range; nothing is reachable until you open something.", "<b>Subnets</b> are rooms: a slice of addresses plus a <b>route table</b>. A route to the <b>internet gateway</b> is what makes one public.", "A <b>NAT gateway</b> is a one-way door for private machines that must call out.", "A <b>security group</b> is the key list on each machine (allow only, remembers conversations); a <b>network ACL</b> is the guard at the subnet edge (allow and deny, checks each way).", "The <b>load balancer</b> is the only public address; the <b>web firewall</b> reads the words. Six fences before the database."],
        callout: { kind: "next", text: "The rest of this tab sizes the subnets, audits what sits in the public one, and asks how many networks an estate really needs. The NGINX tab walks the two kinds of load balancer." },
        metrics: { in: { v: "no", tone: "green" }, out: { v: "yes, through the NAT", tone: "green" }, fences: { v: 6, tone: "green" }, addr: "65,536" },
      },
    ],
    page: "cloud", pane: "vpcd",
  };
})();
