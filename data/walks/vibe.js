/* Walkthrough: think it, build it, ship it. A prompt grows into an app, one layer at a time. */
(window.WALKS = window.WALKS || {}).vibe = (function () {
  const you = { type: "person", x: -17, y: 2, label: "You", tint: "sand" };
  const prompt = (lines) => ({ type: "panel", x: -17, y: 2, dx: -44, dy: -134, title: "your prompt", lines });
  const tool = { type: "block", x: -3, y: 0, label: "The AI builder", glyph: "build", tint: "orange" };
  const model = { type: "model", x: -3, y: -14, label: "The model", glyph: "AI", tint: "violet" };
  const app = { type: "device", x: 11, y: 4, label: "The app, running", screen: "teal" };
  const ctx = (v, tone) => ({ type: "db", x: 11, y: -10, label: "The conversation so far", tint: "amber", tags: [{ text: v, tone }] });
  const site = { type: "block", x: 24, y: 2, label: "Published", glyph: "live", tint: "green", s: 0.9 };
  const friends = { type: "crowd", x: 24, y: 14, label: "People using it", tint: "sand", n: 3 };
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const building = (lines) => ({
    ents: { you, prompt: prompt(lines), tool, model, app },
    links: { u: L("you", "tool"), m: L("tool", "model"), a: L("tool", "app", { heads: "end" }) },
    flows: [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["m"], bounce: true, rate: 0.5, speed: 70 }, { route: ["a"], kind: "write", rate: 0.4 }],
  });
  return {
    title: "A prompt grows into an app, one layer at a time",
    summary: "Type a wish, get an app. Then watch the difference between a lazy prompt and a powerful one, build in small steps, notice when the tool starts forgetting, and ship it.",
    plain: "you type something like \"build me a habit tracker\" and an AI tool writes the whole app and shows it running beside the chat. That works, badly, on the first try. It works well when the prompt carries six layers: the goal, who it is for, how it is used, whether it needs AI, how it should feel, and a sketch. This walk builds the prompt up, builds the app in small steps, hits the point where the tool forgets, and publishes.",
    reallife: "Briefing a decorator. \"Make it nice\" gets you beige. \"A reading corner for two, used in the evenings, warm, with one picture of the wall I mean\" gets you the room you wanted, and asking for one change at a time keeps it that way.",
    startby: "Press Next to add a layer to the prompt and watch what the builder does with it. Arrow keys work too.",
    terms: [
      ["AI builder", "a tool that turns a written description into a running app and keeps changing it as you talk"],
      ["prompt", "what you type to the builder: the description it works from"],
      ["layer", "one part of a strong prompt: the goal, the role, the context, the AI, the vibe, the picture"],
      ["context window", "the fixed amount of text the model can be handed at once; a long conversation fills it up"],
      ["publish", "putting the app on a web address so other people can open it"],
      ["small steps", "asking for one change at a time, so each one can be checked before the next"],
      ["lazy prompt", "a one-line wish that leaves every decision to the tool"],
      ["powerful prompt", "a prompt with all six layers, so the tool has nothing left to guess"],
    ],
    metrics: [{ k: "layers", label: "Layers in the prompt" }, { k: "guess", label: "Things the tool guessed" }, { k: "state", label: "The app" }],
    legend: [{ kind: "req", label: "something you typed" }, { kind: "res", label: "the tool's reply" }, { kind: "write", label: "code written" }, { kind: "bad", label: "a wrong guess" }],
    goals: [
      { text: "What a lazy prompt makes the tool guess", step: 2 },
      { text: "The six layers of a powerful prompt", step: 3 },
      { text: "Why small steps beat one big ask", step: 5 },
      { text: "What happens when the conversation outgrows the context window", step: 6 },
      { text: "Shipping it to other people", step: 7 },
    ],
    steps: [
      {
        short: "A wish", chapter: "problem", title: "Build me a habit tracker",
        body: ["You type one line: <em>build me a habit tracker.</em> Thirty seconds later there is an app running beside the chat.", "It is a generic grid of checkboxes in a colour you did not pick. The tool had to guess everything you did not say, and it guessed average."],
        callout: { kind: "idea", text: "A lazy prompt is not wrong. It just hands every decision to the tool, and the tool decides for the average person." },
        metrics: { layers: 1, guess: { v: 5, tone: "red" }, state: "generic" },
        scene: (() => { const s = building(["build me a habit tracker"]); s.ents.app = Object.assign({}, app, { tags: [{ text: "a grid of checkboxes", tone: "amber" }] }); return s; })(),
      },
      {
        short: "Who, how", chapter: "technique", title: "Say who it is for and how it is used",
        body: ["Add two layers: <em>for a nurse on night shifts</em> and <em>used on a phone, in ten seconds, at the end of a shift.</em>", "The tool rebuilds: big buttons, one screen, a dark theme that does not glare at 3am. Two fewer guesses."],
        changes: ["+ Who it is for", "+ How and when it is used"],
        metrics: { layers: 3, guess: { v: 3, tone: "amber" }, state: "phone-sized, dark" },
        scene: (() => { const s = building(["build me a habit tracker", "for a nurse on night shifts", "on a phone, in ten seconds"]); s.ents.app = Object.assign({}, app, { tags: [{ text: "big buttons · dark", tone: "green" }] }); return s; })(),
      },
      {
        short: "Six layers", chapter: "technique", title: "The powerful prompt: six layers",
        body: ["Three more: <em>no AI needed inside the app</em>; <em>calm and encouraging, not gamified</em>; and a photo of a sketch on a napkin showing a streak counter at the top.", "Now the tool is building your app, not its idea of one. A sketch beats a paragraph about layout every time."],
        callout: { kind: "tip", text: "Goal, who, how, AI or not, the feel, a picture. Five of the six are two sentences each. The sixth is a photo." },
        changes: ["+ Whether it needs AI", "+ The vibe", "+ A sketch"],
        metrics: { layers: 6, guess: { v: 0, tone: "green" }, state: "yours" },
        scene: (() => { const s = building(["build me a habit tracker", "for a nurse on night shifts", "on a phone, in ten seconds", "no AI inside the app", "calm, not gamified", "+ a napkin sketch"]); s.ents.app = Object.assign({}, app, { tags: [{ text: "streak on top, as sketched", tone: "green" }] }); return s; })(),
      },
      {
        short: "Too much", chapter: "problem", title: "One big ask, and it breaks",
        body: ["Now you ask for everything at once: reminders, a weekly chart, export to a spreadsheet, and a dark-mode toggle. The tool writes it all, and the streak counter stops working.", "Four changes landed together. Nobody, including the tool, can say which one broke it."],
        changes: ["+ Four features in one message", "- The streak counter"],
        metrics: { layers: 6, guess: 0, state: { v: "broken", tone: "red" } },
        scene: (() => { const s = building(["add reminders, a weekly chart,", "export, and a dark-mode toggle"]); s.ents.app = Object.assign({}, app, { state: "hot", tags: [{ text: "streak counter broken", tone: "red" }] }); s.flows = [{ route: ["a"], kind: "bad", rate: 0.5 }]; return s; })(),
      },
      {
        short: "Small steps", chapter: "solution", title: "Small steps: one change, check, next",
        body: ["Undo. Ask for reminders only. Check it. Ask for the chart. Check it. Each step takes a minute and either works or is one message to undo.", "Four small steps take about as long as the one big ask and leave you with four working features instead of a mystery."],
        callout: { kind: "idea", text: "The tool is fast, so there is no prize for asking for everything at once. Ask for one thing, look, then ask for the next." },
        changes: ["~ One feature per message", "+ Reminders, chart, export, toggle, each checked"],
        metrics: { layers: 6, guess: 0, state: { v: "four features, working", tone: "green" } },
        scene: (() => { const s = building(["add reminders", "# checked, works", "now add the weekly chart"]); s.ents.app = Object.assign({}, app, { tags: [{ text: "reminders · chart", tone: "green" }] }); return s; })(),
      },
      {
        short: "Forgetting", chapter: "tradeoff", title: "The conversation outgrows the window",
        body: ["Two hours in, the tool starts undoing earlier decisions: the dark theme comes back light, the streak counter moves. The conversation has filled the model's context window and the early messages have fallen off the edge.", "Start a fresh conversation and paste in a short summary of what the app is. The window empties and the tool remembers again."],
        changes: ["~ Early messages fell out of the window", "+ A fresh conversation with a summary"],
        metrics: { layers: 6, guess: { v: "rising", tone: "amber" }, state: "drifting" },
        scene: (() => { const s = building(["# two hours of messages", "why is it light again?"]); s.ents.ctx = ctx("full: early messages lost", "red"); s.links.c = L("tool", "ctx", { style: "dashed" }); s.ents.app = Object.assign({}, app, { tags: [{ text: "theme reverted", tone: "amber" }] }); s.flows = [{ route: ["c"], bounce: true, kind: "bad", rate: 0.4 }]; return s; })(),
      },
      {
        short: "Ship it", chapter: "solution", title: "Publish it",
        body: ["The app works. Press publish: the tool puts it on a web address, and the nurse opens it on her phone.", "From here, every change is a small step in a fresh conversation, checked on the live app before the next."],
        changes: ["+ Published to a web address", "+ Real users"],
        metrics: { layers: 6, guess: 0, state: { v: "live", tone: "green" } },
        scene: (() => { const s = building(["publish it"]); s.ents.ctx = ctx("fresh, with a summary", "green"); s.links.c = L("tool", "ctx", { style: "dashed" }); s.ents.site = site; s.ents.friends = friends; s.links.p = L("app", "site", { heads: "end" }); s.links.f = L("friends", "site", { via: [["friends", "site"]] }); s.flows = [{ route: ["p"], kind: "write", rate: 0.4 }, { route: ["f"], bounce: true, rate: 0.4 }]; return s; })(),
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["A <b>lazy prompt</b> hands every decision to the tool.", "A <b>powerful prompt</b> has six layers: goal, who, how, AI or not, the feel, a sketch.", "<b>Small steps</b>: one change, check, next.", "When the conversation outgrows the <b>context window</b>, start fresh with a summary.", "<b>Publish</b>, then keep changing it in small steps."],
        callout: { kind: "next", text: "The rest of this lab covers picking a tool, building, adding AI inside the app, and shipping." },
        metrics: { layers: 6, guess: 0, state: { v: "live", tone: "green" } },
      },
    ],
  };
})();
