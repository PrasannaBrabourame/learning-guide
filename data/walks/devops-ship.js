/* Walkthrough on the publish tab: version 1.5, with a bug the tests missed, shipped four ways. Its numbers are the ship simulation's. */
(window.WALKS = window.WALKS || {})["devops-ship"] = (function () {
  const users = { type: "crowd", x: -18, y: 6, label: "Customers", tint: "sand", n: 4 };
  const door = { type: "block", x: -6, y: -2, label: "Front door", glyph: "door", tint: "teal", s: 0.85 };
  const old = { type: "block", x: 8, y: -12, label: "On 1.4", glyph: "1.4", tint: "blue" };
  const nw = { type: "block", x: 10, y: 6, label: "On 1.5", glyph: "1.5", tint: "orange" };
  const alarm = { type: "block", x: 23, y: -4, label: "The alert", glyph: "watch", tint: "amber", s: 0.8 };
  const L = (from, to, extra) => Object.assign({ from, to }, extra);
  const tag = (e, text, tone) => Object.assign({}, e, { tags: [{ text, tone }] });
  const board = (lines, title) => ({ type: "panel", x: -6, y: -2, dx: -70, dy: 55, title: title || "this release", lines });
  const c = L("users", "door"), a = L("door", "old"), b = L("door", "nw"), w1 = L("old", "alarm", { style: "dashed" }), w2 = L("nw", "alarm", { style: "dashed" });
  return {
    title: "Shipping 1.5: four ways to put a version in front of customers",
    summary: "Version 1.5 of the shop has a bug the tests missed. Ship it all at once, rolling, blue-green and as a canary, and count how many customers meet the bug each way.",
    plain: "the package is tested and on the shelf, and the question is how to swap it in for the old one while customers are using the shop. This walk ships the same version four ways: all at once, a few servers at a time, a second full set with a switch, and one server first. The version has a bug the tests missed, so each way shows what it really buys: how many customers meet a mistake, and how fast you can take it back.",
    reallife: "A bakery chain launching a new loaf with a fault nobody has spotted. Put it in every branch on the same morning and every customer gets it. Go branch by branch and it spreads until someone complains. Sell it in one branch first, read the complaints book, and only that branch's customers ever taste it.",
    startby: "Press Next to ship version 1.5 four ways and watch the four numbers above the scene. Arrow keys work too.",
    terms: [
      ["version", "the number on a package, such as 1.5, so everyone means the same one"],
      ["server", "one computer running a copy of the shop"],
      ["front door", "the part that shares arriving customers out across the servers; engineers call it a load balancer"],
      ["error page", "what a customer sees when no server can answer"],
      ["health check", "a small automatic test a server must pass before customers are sent to it"],
      ["alert", "an alarm that fires when a number, such as the share of failed payments, crosses a line"],
      ["rolling", "swapping servers to the new version a few at a time"],
      ["blue-green", "two full sets of servers, the old one (blue) and the new one (green), with a switch between them"],
      ["canary", "the first server to get a new version, with a small share of customers; named after the bird miners carried to warn them of gas"],
      ["feature flag", "an on-off switch inside the software, so code can be on the servers but hidden from customers"],
      ["deployment", "putting a version of the software onto the servers"],
    ],
    metrics: [{ k: "hit", label: "Customers hit trouble" }, { k: "mins", label: "Minutes of trouble" }, { k: "extra", label: "Extra servers" }, { k: "back", label: "The way back" }],
    legend: [{ kind: "req", label: "customers served by 1.4" }, { kind: "bad", label: "customers meeting trouble" }, { kind: "ping", label: "numbers reaching the alert" }],
    goals: [
      { text: "Why all at once hurts even when nothing is wrong", step: 1 },
      { text: "How rolling limits the spread", step: 3 },
      { text: "What blue-green and a canary each buy", step: 5 },
      { text: "Why deploying is not the same as releasing", step: 7 },
    ],
    steps: [
      {
        short: "All at once", chapter: "problem", title: "All at once: stop, swap, start",
        body: ["Version 1.5 of the shop is ready. Ten servers, about a thousand customers a minute. The simplest way to ship it: stop all ten, swap the version, start them again.", "For that minute nobody is answering. A thousand customers get an error page, and there was nothing wrong with 1.5."],
        metrics: { hit: { v: "1,000", tone: "amber" }, mins: 1, extra: 0, back: "another outage" },
        scene: { ents: { users, door, old: tag(Object.assign({}, old, { label: "All ten" }), "restarting", "amber") }, links: { c, a: L("door", "old", { style: "red" }) }, flows: [{ route: ["c", "a"], kind: "bad", rate: 0.7, fail: true }] },
      },
      {
        short: "With a bug", chapter: "problem", title: "All at once, and 1.5 has a bug",
        body: ["Now suppose 1.5 breaks checkout and the tests missed it. A minute of error pages going in. Three minutes of broken checkout for every customer, until failed payments trip the alert. Another minute of error pages putting 1.4 back.", "Five thousand customers hit trouble in five minutes."],
        callout: { kind: "warn", text: "With all at once, the only way back is the way you came: stop everything again." },
        changes: ["~ 1.5 breaks checkout", "~ Everyone gets it at once"],
        metrics: { hit: { v: "5,000", tone: "red" }, mins: { v: 5, tone: "red" }, extra: 0, back: "another outage" },
        scene: { ents: { users, door, nw: tag(Object.assign({}, nw, { label: "All ten" }), "checkout broken", "red"), alarm: tag(alarm, "fires after 3 min", "amber") }, links: { c, b: L("door", "nw", { style: "red" }), w2 }, flows: [{ route: ["c", "b"], kind: "bad", rate: 0.7 }, { route: ["w2"], kind: "ping", rate: 0.3 }] },
      },
      {
        short: "Rolling", chapter: "technique", title: "Rolling: two at a time",
        body: ["Rolling starts two extra servers on 1.5 and waits for them to pass a health check. Then they take customers, two old servers are stopped, and it repeats. Nobody sees an error page, and a version that will not start never gets a customer.", "This bug passes the health check, so it spreads two servers a minute. The alert fires with six in ten on 1.5, and going back takes as long as going forward: 2,400 customers, six minutes."],
        changes: ["+ Two servers at a time, checked first", "~ The bug reaches six servers in ten"],
        metrics: { hit: { v: "2,400", tone: "amber" }, mins: 6, extra: 2, back: "3 minutes" },
        scene: { ents: { users, door, old: tag(old, "4 servers", "green"), nw: tag(nw, "6 servers · bug", "red"), alarm: tag(alarm, "fires after 3 min", "amber") }, links: { c, a, b: L("door", "nw", { style: "red" }), w1, w2 }, flows: [{ route: ["c", "a"], rate: 0.35 }, { route: ["c", "b"], kind: "bad", rate: 0.5 }, { route: ["w2"], kind: "ping", rate: 0.3 }] },
      },
      {
        short: "Blue-green", chapter: "technique", title: "Blue-green: a second full set, and a switch",
        body: ["Start ten new servers on 1.5 beside the ten old ones, and check them while they take no customers. Then point the front door at the new set in one move. If it is wrong, point it back: seconds.", "The bug still reaches everyone, because the switch moves everyone at once. But only for the three minutes until the alert: 3,000 customers. The price is double the servers while both sets run."],
        changes: ["+ A second full set of ten", "+ One switch at the front door"],
        metrics: { hit: { v: "3,000", tone: "amber" }, mins: 3, extra: { v: 10, tone: "amber" }, back: { v: "seconds", tone: "green" } },
        scene: { ents: { users, door: tag(door, "the switch", "blue"), old: tag(Object.assign({}, old, { label: "Blue set" }), "10 servers · idle", "muted"), nw: tag(Object.assign({}, nw, { label: "Green set" }), "10 servers · bug", "red"), alarm }, links: { c, a: L("door", "old", { style: "dashed" }), b: L("door", "nw", { style: "red" }), w2 }, flows: [{ route: ["c", "b"], kind: "bad", rate: 0.7 }, { route: ["w2"], kind: "ping", rate: 0.3 }] },
      },
      {
        short: "Canary", chapter: "technique", title: "Canary: a few customers first",
        body: ["Start one extra server on 1.5, the canary, and send it 5 customers in every 100. Put its failures on a chart beside the other ten servers.", "With the checkout bug the gap is plain within two minutes, sooner than a general alert, because the two groups sit side by side. The canary is taken out. A hundred customers met the bug, not thousands."],
        callout: { kind: "idea", text: "A canary does not find the bug for you. It decides how few customers find it." },
        changes: ["+ One extra server, 5 customers in 100", "+ Its numbers compared with the rest"],
        metrics: { hit: { v: "100", tone: "green" }, mins: { v: 2, tone: "green" }, extra: 1, back: { v: "seconds", tone: "green" } },
        scene: { ents: { users, door, old: tag(old, "10 servers · 95 in 100", "green"), nw: tag(Object.assign({}, nw, { label: "The canary", s: 0.75 }), "1 server · 5 in 100", "amber"), alarm: tag(Object.assign({}, alarm, { label: "Side by side" }), "gap seen in 2 min", "amber") }, links: { c, a, b, w1, w2 }, flows: [{ route: ["c", "a"], rate: 0.7 }, { route: ["c", "b"], kind: "bad", rate: 0.12 }, { route: ["w1"], kind: "ping", rate: 0.3 }, { route: ["w2"], kind: "ping", rate: 0.3 }] },
      },
      {
        short: "Compare", chapter: "insight", title: "Same bug, same alert, four outcomes",
        body: ["All at once exposes everyone and has no way back but another outage. Rolling limits how far the bug spreads. Blue-green makes the way back instant. A canary limits who meets the bug at all.", "None of them found the bug. Each decided how many customers found it for you, and what that protection costs in servers and time."],
        metrics: { hit: "100 to 5,000", mins: "2 to 6", extra: "0 to 10", back: "seconds to minutes" },
        scene: { ents: { users, door, old: tag(old, "10 servers", "green"), alarm, sum: board(["all at once   5,000", "rolling       2,400", "blue-green    3,000", "canary          100"], "customers hit") }, links: { c, a, w1 }, flows: [{ route: ["c", "a"], rate: 0.6 }] },
      },
      {
        short: "The flag", chapter: "technique", title: "Deploying is not releasing: the flag",
        body: ["A fifth way moves no servers. Ship the new checkout inside 1.5 but switched off, behind a feature flag. Turn it on for the team, then for 5 customers in 100, then for everyone.", "Turning it off again takes seconds and needs no deployment. Deploying moves code; releasing lets customers see it."],
        changes: ["+ A switch inside the software"],
        metrics: { hit: "who you choose", mins: "seconds", extra: 0, back: { v: "flip the flag", tone: "green" } },
        scene: { ents: { users, door, nw: tag(Object.assign({}, nw, { label: "All ten on 1.5" }), "new checkout: off", "muted"), alarm }, links: { c, b, w2 }, flows: [{ route: ["c", "b"], rate: 0.6 }] },
      },
      {
        short: "Choose", chapter: "solution", title: "Pick by what a mistake costs",
        body: ["The shop's ordinary weekly release goes out rolling. A switch to a new card-payment company goes blue-green, or behind a flag. A rewritten search page gets a canary.", "Nobody uses all at once on anything customers are watching."],
        metrics: { hit: "100 to 5,000", mins: "2 to 6", extra: "0 to 10", back: "seconds to minutes" },
        scene: { ents: { users, door, old: tag(old, "10 servers", "green"), alarm, sum: board(["everyday    rolling", "must undo   blue-green", "unsure      canary", "timed       a flag"], "which way") }, links: { c, a, w1 }, flows: [{ route: ["c", "a"], rate: 0.6 }] },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["<b>All at once</b>: an outage on every release, and everyone meets a bad version.", "<b>Rolling</b>: a few servers at a time, each checked first; the everyday default.", "<b>Blue-green</b>: a second full set and one switch; an instant way back, at double the servers.", "A <b>canary</b>: a few customers first, compared with the rest.", "A <b>feature flag</b> separates deploying code from releasing it."],
        callout: { kind: "next", text: "The simulation below runs the same four ways with a version that is fine and one that will not start at all." },
        metrics: { hit: "100 to 5,000", mins: "2 to 6", extra: "0 to 10", back: "seconds to minutes" },
      },
    ],
    page: "devops", pane: "dship",
  };
})();
