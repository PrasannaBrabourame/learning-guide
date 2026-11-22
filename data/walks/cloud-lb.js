/* Walkthrough on the cloud lab's NGINX tab: two receptionists. A layer 4 load balancer routes
   by the envelope; a layer 7 one opens the letter. Drawn by assets/walk.js. */
(window.WALKS = window.WALKS || {})["cloud-lb"] = (function () {
  const users = { type: "crowd", x: -18, y: 2, label: "Users", tint: "sand", n: 4 };
  const lb4 = { type: "block", x: -3, y: 0, label: "Layer 4 balancer", glyph: "port", tint: "teal" };
  const lb7 = { type: "block", x: -3, y: 0, label: "Layer 7 balancer", glyph: "read", tint: "orange" };
  const srv = (id, x, y, label, tags, state) => ({ type: "block", x, y, label, glyph: "srv", tint: "blue", s: 0.85, tags, state });
  const sees = (lines, title) => ({ type: "panel", x: -3, y: 0, dx: -120, dy: -150, title: title || "what it can see", lines });
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const trio = (tagsA, tagsB, tagsC, stateB) => ({ a: srv("a", 10, -14, "Server A", tagsA), b: srv("b", 16, -4, "Server B", tagsB, stateB), c: srv("c", 22, 6, "Server C", tagsC) });
  const fleet = (lb, servers, extra) => { const s = { ents: Object.assign({ users, lb }, servers), links: { u: L("users", "lb"), a: L("lb", "a", { via: [["lb", "a"]] }), b: L("lb", "b"), c: L("lb", "c", { via: [["lb", "c"]] }) }, flows: [{ route: ["u"], rate: 0.9 }, { route: ["a"], bounce: true, rate: 0.3 }, { route: ["b"], bounce: true, rate: 0.3 }, { route: ["c"], bounce: true, rate: 0.3 }] }; if (extra) extra(s); return s; };
  return {
    title: "Two receptionists: the layer 4 and the layer 7 load balancer",
    summary: "One address, three servers. A layer 4 balancer reads only the envelope and passes the connection straight through; a layer 7 balancer opens the letter and decides by what it says. See how each works, what each can and cannot do, and which to pick.",
    plain: "every request is a letter in an envelope. The envelope carries the addresses and a port number; the letter inside carries the web request: which page, which site, which cookie. A layer 4 load balancer reads only the envelope and hands the whole connection to a server, fast and for any protocol. A layer 7 load balancer opens the letter, so it can send /images to one server and /checkout to another, keep a user on the same server, hold the certificate and screen the words. This walk runs the same traffic through each and shows where they differ.",
    reallife: "Two receptionists. One looks at the envelope, sees it is for the third floor, and sends the courier up without opening it: fast, and it works for parcels of any kind. The other opens the letter, reads that it is a complaint about an invoice, and walks it to the person who handles invoices: slower, only works for letters, and far more useful.",
    startby: "Press Next to send traffic through the layer 4 balancer, then the layer 7 one, then break a server and see which receptionist notices. Arrow keys work too.",
    terms: [
      ["load balancer", "the receptionist in front of a service, deciding which server takes this request"],
      ["port", "a numbered door on a server; web traffic uses 443, a database listens on its own number"],
      ["layer 4", "the transport layer of the seven: addresses and port numbers, the envelope; a balancer working here never looks inside"],
      ["layer 7", "the application layer of the seven: the web request itself, the letter; a balancer working here reads the page, the site name, the headers and cookies"],
      ["connection", "the open line between a user and a server over which one or many requests travel"],
      ["TLS termination", "the balancer holding the certificate and decrypting traffic itself, so it can read the request; behind it the servers may speak plain"],
      ["health check", "a regular small request to each server to find out whether it is still alive; a layer 4 check opens a connection, a layer 7 check asks for a page"],
      ["sticky session", "sending the same user to the same server every time, by reading their cookie"],
      ["reverse proxy", "a layer 7 balancer by another name: it takes the request on the user's behalf and makes its own request to a server"],
      ["AWS", "Amazon Web Services, Amazon's cloud"],
      ["Google Cloud", "Google's cloud, often written GCP for Google Cloud Platform"],
      ["Azure", "Microsoft's cloud, the third of the big three"],
      ["web application firewall", "a firewall that reads the words of a web request itself and blocks known attacks; it sits in front of the load balancer"],
    ],
    metrics: [{ k: "reads", label: "What it reads" }, { k: "route", label: "Can route /images to C" }, { k: "cert", label: "Who holds the certificate" }, { k: "sick", label: "Notices a sick server" }],
    legend: [{ kind: "req", label: "a request" }, { kind: "res", label: "a reply" }, { kind: "ping", label: "a health check" }, { kind: "bad", label: "a request that failed" }],
    goals: [
      { text: "The envelope and the letter: what layer 4 and layer 7 mean", step: 2 },
      { text: "How a layer 4 balancer works and what it cannot do", step: 3 },
      { text: "How a layer 7 balancer works and what it can do", step: 4 },
      { text: "Where the certificate lives in each", step: 5 },
      { text: "A failure only one of them can see, and which to pick", step: 7 },
    ],
    steps: [
      {
        short: "One address", chapter: "problem", title: "Three servers, one address",
        body: ["The site has three servers and users have one address. Something has to take each request and hand it to a server, spread the load, and stop sending to a server that has died.", "That something is a load balancer. There are two kinds, and people mix them up because both are drawn as the same box."],
        callout: { kind: "idea", text: "The difference between the two kinds is one question: does it open the letter, or only read the envelope?" },
        metrics: { reads: null, route: null, cert: "each server", sick: null },
        scene: { ents: Object.assign({ users }, trio()), links: { a: L("users", "a", { style: "off" }), b: L("users", "b", { style: "off" }), c: L("users", "c", { style: "off" }) }, flows: [] },
      },
      {
        short: "The letter", chapter: "insight", title: "The envelope and the letter",
        body: ["Every request travels as a letter in an envelope. The envelope, layers 3 and 4 of the seven, carries the from address, the to address and a port number: which door on the server. The letter inside, layer 7, is the web request: <em>GET /checkout</em>, the site name, the cookies, the form data.", "A receptionist can route by the envelope alone, without opening anything. Or they can open the letter and route by what it says. That is the whole difference."],
        metrics: { reads: "envelope: addresses and port · letter: page, site, cookies", route: null, cert: "each server", sick: null },
        scene: { ents: { users: Object.assign({}, users, { tags: [{ text: "to 203.0.113.7 port 443", tone: "blue" }, { text: "GET /checkout · cookie: u=alice", tone: "violet" }] }), card: sees(["ENVELOPE (layer 4)", "from 198.51.100.4", "to   203.0.113.7 : 443", "= LETTER (layer 7)", "GET /checkout", "host shop.example", "cookie u=alice"], "one request") }, links: {}, flows: [] },
      },
      {
        short: "Layer 4", chapter: "technique", title: "Layer 4: route by the envelope, pass the connection through",
        body: ["The layer 4 balancer reads the envelope only: a new connection to port 443 has arrived. It picks a server, round robin or the one with the fewest connections, and forwards the connection as it is. It never opens the letter and cannot read it, because the letter is encrypted and it has no key.", "Fast, nearly no work per packet, and it works for anything that uses connections: web, databases, game servers, email. Its health check is simply <em>can I open a connection to port 443?</em>"],
        changes: ["+ Layer 4 balancer", "~ Connections passed straight through"],
        metrics: { reads: "the envelope only", route: { v: "no", tone: "red" }, cert: "each server", sick: { v: "only if its port closes", tone: "amber" } },
        scene: fleet(lb4, trio(), (s) => { s.ents.card = sees(["new connection", "to 203.0.113.7 : 443", "= pick a server, pass it on", "# the letter stays sealed"]); s.flows.push({ route: ["a"], kind: "ping", rate: 0.15 }); }),
      },
      {
        short: "Layer 7", chapter: "technique", title: "Layer 7: open the letter, decide by what it says",
        body: ["The layer 7 balancer ends the user's connection itself, decrypts it, and reads the letter. <em>GET /images</em> goes to server C, which holds the pictures. <em>shop.example</em> and <em>orders.example</em> go to different servers. A cookie that says <em>u=alice</em> goes to the server that already has Alice's basket.", "Then it opens its own connection to the chosen server and forwards the request. It can also compress replies, cache them, rewrite addresses and add headers. More work per request, and web traffic only."],
        callout: { kind: "tip", text: "If you have ever written a rule like /images goes here and everything else goes there, you were configuring a layer 7 balancer." },
        changes: ["- Layer 4 balancer", "+ Layer 7 balancer", "~ Routes by page, site name and cookie"],
        metrics: { reads: "the letter: page, site, cookies", route: { v: "yes", tone: "green" }, cert: "the balancer", sick: { v: "yes, by asking for a page", tone: "green" } },
        scene: fleet(lb7, trio([{ text: "shop.example", tone: "blue" }], [{ text: "orders.example · u=alice", tone: "blue" }], [{ text: "/images", tone: "blue" }]), (s) => { s.ents.card = sees(["GET /images     → C", "host orders.example → B", "cookie u=alice   → B", "= decided by the letter"]); s.links.c.label = "/images"; s.links.c.labelAt = 0.6; }),
      },
      {
        short: "Certificate", chapter: "technique", title: "Where the certificate lives",
        body: ["With layer 4, the encrypted bytes pass straight through, so each server must hold the site's certificate and do the decrypting. Three servers, three copies to renew.", "With layer 7, the balancer holds the one certificate and decrypts once. Behind it, inside your private network, the servers can speak plain or use their own internal certificate. One place to renew, and the balancer can read the request because it did the decrypting."],
        changes: ["~ Certificate held once, on the balancer", "~ Servers decrypt nothing"],
        metrics: { reads: "the letter", route: { v: "yes", tone: "green" }, cert: { v: "the balancer, one copy", tone: "green" }, sick: { v: "yes", tone: "green" } },
        scene: fleet(Object.assign({}, lb7, { tags: [{ text: "certificate: shop.example", tone: "green" }] }), trio([{ text: "plain inside the fence", tone: "muted" }], [{ text: "plain inside the fence", tone: "muted" }], [{ text: "plain inside the fence", tone: "muted" }]), (s) => { s.ents.card = sees(["layer 4: certificate on", "        every server", "= layer 7: certificate on", "        the balancer only"], "who decrypts"); }),
      },
      {
        short: "A sick server", chapter: "problem", title: "A failure only one of them can see",
        body: ["Server B's app has crashed. The machine is up and port 443 still accepts connections, but every page it serves is an error 500.", "The layer 4 health check opens a connection, succeeds, and keeps sending a third of all users to a server that answers every one of them with an error. The layer 7 health check asks <em>GET /health</em>, reads the 500, and takes B out of the rotation within seconds."],
        callout: { kind: "warn", text: "A port that answers is not a server that works. If your balancer can only check ports, your health check is lying to you." },
        changes: ["~ Server B: port open, app crashed", "~ Layer 7 takes B out; layer 4 would not"],
        metrics: { reads: "the letter", route: { v: "yes", tone: "green" }, cert: "the balancer", sick: { v: "B removed in 10 s", tone: "green" } },
        scene: fleet(lb7, trio(null, [{ text: "port open · app returns 500", tone: "red" }], null, "dead"), (s) => { s.ents.card = sees(["layer 4 check: port 443 open ✓", "layer 7 check: GET /health → 500 ✗", "= B taken out"], "the two health checks"); s.links.b.style = "red"; s.flows = [{ route: ["u"], rate: 0.9 }, { route: ["a"], bounce: true, rate: 0.45 }, { route: ["c"], bounce: true, rate: 0.45 }, { route: ["b"], kind: "ping", rate: 0.4, fail: 0.95 }]; }),
      },
      {
        short: "Which one", chapter: "tradeoff", title: "Which one, when, and often both",
        body: ["Web app with paths, several site names, cookies, a certificate to hold and a web application firewall to run: layer 7. A database, a game server, a custom protocol, millions of connections, or the raw client address preserved: layer 4, because layer 7 cannot speak those protocols and costs more per request.", "Large sites use both: a layer 4 balancer at the edge taking the flood, layer 7 balancers behind it reading the letters. The clouds sell each under its own name: a network load balancer and an application load balancer on AWS, a network balancer and an application balancer on Google Cloud, a load balancer and an application gateway on Azure."],
        callout: { kind: "idea", text: "Ask what the balancer must decide by. If the answer mentions a page, a site name or a cookie, it is layer 7. If it mentions only a port, layer 4 will do and will be faster." },
        metrics: { reads: "both: envelope at the edge, letter behind", route: { v: "yes", tone: "green" }, cert: "the layer 7 balancer", sick: { v: "yes", tone: "green" } },
        scene: (() => { const s = fleet(Object.assign({}, lb7, { x: 3, y: 0 }), trio(null, null, null)); s.ents.edge = Object.assign({}, lb4, { x: -9, y: -3, label: "Layer 4 at the edge", s: 0.9 }); s.links.u = L("users", "edge"); s.links.e = L("edge", "lb"); s.ents.card = { type: "panel", x: 10, y: -14, dx: -230, dy: -120, title: "which one", lines: ["web with paths, cookies, a web firewall → layer 7", "database, games, custom → layer 4", "= big sites: 4 at the edge, 7 behind"] }; s.flows = [{ route: ["u", "e"], rate: 0.8 }, { route: ["a"], bounce: true, rate: 0.3 }, { route: ["b"], bounce: true, rate: 0.3 }, { route: ["c"], bounce: true, rate: 0.3 }]; return s; })(),
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["A request is a <b>letter in an envelope</b>: addresses and a port outside (layer 4), the web request inside (layer 7).", "A <b>layer 4</b> balancer reads the envelope and passes the connection through: fast, any protocol, cannot route by page.", "A <b>layer 7</b> balancer opens the letter: routes by page, site name and cookie, holds the <b>certificate</b>, can screen the words; web only, more work.", "A <b>health check</b> that only opens a port cannot see a crashed app; a layer 7 check asks for a page.", "Pick by what it must <b>decide by</b>; big sites run layer 4 at the edge and layer 7 behind."],
        callout: { kind: "next", text: "The rest of this tab is NGINX itself, a layer 7 balancer you can run: how it stays fast, one request step by step, and the settings you actually touch." },
        metrics: { reads: "depends", route: "depends", cert: "depends", sick: "depends" },
      },
    ],
    page: "cloud", pane: "nginx",
  };
})();
