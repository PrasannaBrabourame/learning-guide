/* Walkthrough on the Claude Code tab: the developer's morning adding the discount code box, in one context window. Its percentages are the context meter simulation's. */
(window.WALKS = window.WALKS || {})["claude-code"] = (function () {
  const dev = { type: "person", x: -21, y: 9, label: "The developer", tint: "sand" };
  const laptop = { type: "device", x: -21, y: -3, label: "Laptop", screen: "violet" };
  const cc = { type: "model", x: -7, y: -15, label: "Claude Code", glyph: "agent", tint: "violet" };
  const code = { type: "db", x: 19, y: -7, label: "The shop's code", tint: "blue" };
  const tests = { type: "block", x: 8, y: 12, label: "The tests", glyph: "tests", tint: "teal" };
  const hook = { type: "block", x: 20, y: 9, label: "A hook", glyph: "hook", tint: "orange", s: 0.75 };
  const sub = { type: "model", x: 8, y: -4, label: "A subagent", glyph: "helper", tint: "rose", s: 0.8 };
  const L = (from, to, extra) => Object.assign({ from, to }, extra);
  const tag = (e, text, tone) => Object.assign({}, e, { tags: [{ text, tone }] });
  /* the context window: a tray that gains a slab for about every ten per cent in use */
  const win = (pct, tone, more) => ({ type: "queue", x: 9, y: -21, label: "Context window", dir: [1, 0], n: Math.max(1, Math.round(pct / 10)), tags: [{ text: pct + "% in use", tone }].concat(more || []) });
  const note = (title, lines) => ({ type: "panel", x: -21, y: 9, dx: -22, dy: 44, title, lines });
  const MEM = ["# CLAUDE.md", "tests: npm test", "money: whole cents", "a discount applies once", "ask first in payments/"];
  const u = L("dev", "laptop", { heads: "both" }), q = L("laptop", "cc", { label: "the request" }), q0 = L("laptop", "cc");
  const w = L("cc", "win"), s = L("cc", "code"), t = L("cc", "tests", { label: "npm test", labelAt: 0.55 }), t0 = L("cc", "tests");
  const h = L("hook", "code", { style: "dashed" }), a = L("cc", "sub"), a2 = L("sub", "code");
  const lands = { route: ["w"], kind: "write", rate: 0.5 };
  return {
    title: "The discount code box: one morning in one context window",
    summary: "Follow the developer's morning adding the discount code box with Claude Code, watch the context window fill step by step, then run the same morning with the window looked after.",
    plain: "the developer asks Claude Code to add a discount code box to the shop's checkout. Claude Code searches the code, reads it, plans, edits and runs the 313 tests, and everything it reads or sees lands in one context window. This walk follows that window through the morning. It shows where the memory file, a permission question, a hook and a subagent come in. Then it runs the same morning again with the window looked after.",
    reallife: "A brilliant new colleague on their first day, working at one desk. Every file they open, every printout and every side question lands on that desk and stays. By late morning the note that mattered is under the pile. The sticky note on the monitor is the one thing that is never swept away.",
    startby: "Press Next to follow the morning one step at a time. Watch the tray marked Context window: it gains a slab for about every ten per cent in use. Arrow keys work too.",
    terms: [
      ["Claude Code", "Claude working inside a software project: it reads the code, edits files and runs commands"],
      ["context window", "everything Claude can see at once: its instructions, files it has read, the output of commands and the conversation so far; it has a fixed size"],
      ["session", "one sitting with Claude Code, from starting it to closing it"],
      ["memory file", "a plain text file of project notes, named CLAUDE.md, loaded at the start of every session and again after a clear or a compact"],
      ["permission rule", "a setting that says what Claude Code may do without asking, must ask about, or may never do; an allow rule lets a command run unasked, a deny rule forbids it outright"],
      ["plan mode", "a way of running Claude Code in which it reads and proposes but changes nothing until you agree"],
      ["hook", "your own script that Claude Code runs at a fixed moment, such as before a command or after an edit; it is ordinary code, so it always runs"],
      ["formatter", "a tool that tidies the layout of code so every file looks the same"],
      ["subagent", "a helper that does one job in its own context window and hands back a summary"],
      ["tool", "one thing Claude Code can do, such as read a file or run a command; each comes with a description it must keep in view"],
      ["test", "a small program that checks the code still does what it should; the shop has 313 of them"],
      ["log", "the printed output of a command, here one line for every test that ran"],
      ["npm", "the tool that installs libraries and runs commands for apps written in JavaScript; here, npm test is the command that runs the shop's 313 tests"],
      ["/clear", "the command that empties the conversation; only what is written in files is still known afterwards"],
      ["/compact", "the command that replaces the conversation so far with a short summary of it; a session that is nearly full does the same by itself"],
      ["commit", "a saved change to the code, with a note saying what it does"],
      ["pull request", "a change shown to a colleague for review before it joins the main copy of the code"],
      ["checkout", "the page of the shop where a customer pays"],
      ["footer", "the strip at the bottom of every page of the shop's website"],
      ["key", "a secret string of characters that proves who is asking; here, the ones that let the shop take payments"],
    ],
    metrics: [{ k: "step", label: "Step of the morning" }, { k: "win", label: "Window in use" }, { k: "peak", label: "Fullest so far" }, { k: "tries", label: "Tries at the fix" }],
    legend: [{ kind: "req", label: "a request, a read or a command" }, { kind: "write", label: "what lands in the window" }, { kind: "bad", label: "a failed test" }, { kind: "msg", label: "a short summary handed back" }],
    goals: [
      { text: "What fills a context window, and when", step: 3 },
      { text: "Where the memory file, a permission and a hook come in", step: 6 },
      { text: "Why a full window makes worse work", step: 7 },
      { text: "How a clear and a subagent keep it low", step: 9 },
    ],
    steps: [
      {
        short: "Start-up", chapter: "problem", title: "A session starts with 12% already in use",
        body: ["The developer opens Claude Code in the shop's project and types: add a discount code box to the checkout.", "Before a word of that is read, three things load into the context window: Claude Code's own instructions, the descriptions of its tools, and the memory file, CLAUDE.md. Together they fill 12% of it.", "Every session starts knowing nothing about the project. The memory file is how it learns that a discount applies once, before postage, and that money is whole cents."],
        callout: { kind: "tip", text: "The tray marked Context window gains a slab for about every ten per cent in use. Nothing leaves it unless the developer removes it." },
        metrics: { step: "1 of 8", win: "12%", peak: "12%", tries: null },
        scene: { ents: { dev, laptop, cc, win: win(12, "green"), mem: note("the memory file", MEM) }, links: { u, q, w }, flows: [{ route: ["q"], kind: "req", rate: 0.5 }, lands] },
      },
      {
        short: "Side question", chapter: "problem", title: "A side question rides along",
        body: ["Before starting, the developer asks something else: why is the footer out of line on the returns page? Claude Code reads a long style file to find out, and answers.", "The answer has nothing to do with the discount box. Its 16% stays in the window all the same, and the window is 28% full before the real work begins."],
        callout: { kind: "warn", text: "Nothing leaves the window by itself. A side question that is finished is still being carried." },
        changes: ["+ 16% a side question about the footer", "~ Window: 12% → 28%"],
        metrics: { step: "2 of 8", win: "28%", peak: "28%", tries: null },
        scene: { ents: { dev, laptop: tag(laptop, "a side question", "amber"), cc, win: win(28, "green"), code: tag(code, "one long style file", "amber"), mem: note("the memory file", MEM) }, links: { u, q: q0, w, s },
          flows: [{ route: ["s"], kind: "req", bounce: true, back: "write", rate: 0.5 }, lands] },
      },
      {
        short: "The search", chapter: "technique", title: "Gather context: a search through forty files",
        body: ["Now the real job. Claude Code works in a loop: gather context, take action, check the result. It begins by finding every place the shop works out a total, a search through forty files.", "What it opens lands in the window. The search adds 22%, and the window is half full before a line of code has changed."],
        changes: ["+ 22% a search through forty files", "~ Window: 28% → 50%"],
        metrics: { step: "3 of 8", win: "50%", peak: "50%", tries: null },
        scene: { ents: { dev, laptop, cc, win: win(50, "green"), code: tag(code, "40 files searched", "amber"), mem: note("the memory file", MEM) }, links: { u, q: q0, w, s },
          flows: [{ route: ["s"], kind: "heavy", bounce: true, back: "write", rate: 0.7 }, lands] },
      },
      {
        short: "Read and plan", chapter: "technique", title: "Read the two files that matter, and plan",
        body: ["The search points at two files: the checkout and the cart. Claude Code reads both closely and plans the change. That adds 9%, and the window is 59% full.", "The developer asked for a plan first. In plan mode Claude Code reads and proposes, and changes nothing until the developer agrees. Redirecting a plan is free. Redirecting a finished change is not."],
        changes: ["+ 9% reading the checkout and the cart", "~ Window: 50% → 59%"],
        metrics: { step: "4 of 8", win: "59%", peak: "59%", tries: null },
        scene: { ents: { dev, laptop: tag(laptop, "the plan: agreed", "violet"), cc, win: win(59, "green"), code: tag(code, "2 files read closely", "blue"), mem: note("the memory file", MEM) }, links: { u, q: q0, w, s },
          flows: [{ route: ["s"], kind: "req", bounce: true, back: "write", rate: 0.5 }, lands] },
      },
      {
        short: "The edit", chapter: "technique", title: "Take action: a question, an edit, a hook",
        body: ["Claude Code is ready to change the checkout. It stops and asks first, because an edit changes the project. The developer says yes.", "It adds the discount code box and the sum behind it. Straight after, a hook runs the formatter. A hook is the developer's own script, so it runs after every edit, whether or not anyone remembers.", "The edit adds 6%. The window is 65% full, past the 60% line where the meter on this tab turns amber."],
        changes: ["+ A permission question, answered yes", "+ The formatter, run by a hook", "+ 6% the edit", "~ Window: 59% → 65%"],
        metrics: { step: "5 of 8", win: { v: "65%", tone: "amber" }, peak: { v: "65%", tone: "amber" }, tries: null },
        scene: { ents: { dev, laptop: tag(laptop, "may I edit? yes", "amber"), cc, win: win(65, "amber"), code: tag(code, "checkout edited", "green"), hook: tag(hook, "runs the formatter", "blue") }, links: { u, q: q0, w, s, h },
          flows: [{ route: ["s"], kind: "req", rate: 0.5 }, { route: ["h"], kind: "ping", rate: 0.5 }, lands] },
      },
      {
        short: "313 tests", chapter: "technique", title: "Check the result: 313 tests, one failure",
        body: ["Now the check. Claude Code runs the shop's 313 tests. It does not ask this time: an allow rule in the settings says the test command may run without a question.", "One test fails: expected 90.00, got 81.00. The discount is being applied twice.", "The log is long, one line for every test, and all of it lands in the window: 18% more. The window is 83% full, and the fix comes next."],
        callout: { kind: "tip", text: "An allow rule saves a question. A deny rule is a wall: in this project Claude Code may never read the file of payment keys." },
        changes: ["+ 18% the log of 313 tests", "~ Window: 65% → 83%"],
        metrics: { step: "6 of 8", win: { v: "83%", tone: "amber" }, peak: { v: "83%", tone: "amber" }, tries: null },
        scene: { ents: { dev, laptop, cc, win: win(83, "amber"), code, hook, tests: tag(tests, "313 run · 1 failed", "red"), fail: note("the failing test", ["expected   90.00", "got        81.00", "= discount applied twice"]) }, links: { u, q: q0, w, s, h, t },
          flows: [{ route: ["t"], kind: "req", bounce: true, back: "bad", rate: 0.5 }, lands] },
      },
      {
        short: "A full window", chapter: "problem", title: "The fix, in a window too full to work in",
        body: ["The fix starts with the window 83% full, and a fuller window is read less carefully. Claude Code loses sight of a rule it read hours earlier, that a discount applies once. Its first fix is wrong.", "That try takes the window to 90%. The second try would push it past its limit, so the session compacts itself in the middle of the job: 78% of conversation becomes a 16% summary.", "The second fix works. Claude Code commits the change and opens a pull request, and the morning ends at 38%. It got there, the hard way."],
        callout: { kind: "warn", text: "The once-only rule was a line in the memory file: a request, not a guarantee. In a long, full session a request can slip." },
        changes: ["+ 7% a first fix, which is wrong", "~ Fullest point: 90%", "~ The session compacts itself: 78% → 16%", "+ 7% the second fix, + 3% the commit", "~ Window at the end: 38%"],
        metrics: { step: "8 of 8", win: "38%", peak: { v: "90%", tone: "red" }, tries: { v: 2, tone: "red" } },
        scene: { ents: { dev, laptop, cc: tag(cc, "lost the once-only rule", "red"), win: win(38, "muted", [{ text: "peaked at 90%", tone: "red" }]), code: tag(code, "committed", "green"), hook, tests: tag(tests, "fixed on the 2nd try", "amber"), fix: note("the fix, started at 83%", ["first try, wrong:     90%", "compacts itself: 78 → 16", "second try, right:    35%", "commit, pull request: 38%"]) }, links: { u, q: q0, w, s, h, t: t0 },
          flows: [{ route: ["t"], kind: "bad", bounce: true, back: "bad", rate: 0.4 }, { route: ["s"], kind: "req", rate: 0.4 }, lands] },
      },
      {
        short: "Start again", chapter: "solution", title: "The same morning again: clear, then hand off the search",
        body: ["Run the morning again and look after the window. Straight after the footer question, the developer types /clear. The conversation empties and the window drops from 28% back to its 12% of start-up.", "The memory file is still there, because it loads again after every clear. Nothing is lost here: the footer and the discount box are unrelated jobs.", "Then the search goes to a subagent, a helper with a context window of its own. It reads the forty files there and hands back six lines. The search costs this window 2%, not 22%."],
        changes: ["~ /clear after the footer question: 28% → 12%", "+ A subagent does the search", "~ The search: 2%, not 22%", "~ Window: 14%"],
        metrics: { step: "3 of 8", win: { v: "14%", tone: "green" }, peak: "28%", tries: null },
        scene: { ents: { dev, laptop: tag(laptop, "/clear", "green"), cc, win: win(14, "green"), code: tag(code, "40 files searched", "amber"), hook, tests, sub: Object.assign({}, sub, { tags: [{ text: "its own window", tone: "blue", dx: 54 }] }), again: note("the morning again", ["start-up            12%", "footer question     28%", "/clear              12%", "search, by subagent 14%"]) }, links: { u, q: q0, w, h, a, a2 },
          flows: [{ route: ["a2"], kind: "heavy", bounce: true, back: "heavy", rate: 0.7 }, { route: ["a"], kind: "msg", reverse: true, rate: 0.4 }, lands] },
      },
      {
        short: "A tidy morning", chapter: "solution", title: "The same work, and the window never passes 57%",
        body: ["The rest is the same work as before. Reading the two files takes the window to 23%, the edit to 29% and the 313 tests to 47%.", "The same test fails with the same numbers: expected 90.00, got 81.00. This time the fix starts at 47%, with the once-only rule still in plain view, and the first try is right.", "The fix makes 54% and the commit 57%. Nothing was done twice, and the window never came near the point where the work suffers."],
        callout: { kind: "idea", text: "Clear between unrelated jobs. Hand heavy reading to a subagent. Put what must always happen in a hook, and what must never happen in a deny rule." },
        changes: ["~ Fullest point: 57%, not 90%", "~ Tries at the fix: 1, not 2"],
        metrics: { step: "8 of 8", win: { v: "57%", tone: "green" }, peak: { v: "57%", tone: "green" }, tries: { v: 1, tone: "green" } },
        scene: { ents: { dev, laptop, cc, win: win(57, "green"), code: tag(code, "committed", "green"), hook, tests: tag(tests, "fixed on the 1st try", "green"), sub, again: note("the rest of the morning", ["read two files      23%", "the edit            29%", "313 tests           47%", "the fix, first try  54%", "commit              57%"]) }, links: { u, q: q0, w, s, h, t: t0, a, a2 },
          flows: [{ route: ["t"], kind: "req", bounce: true, back: "res", rate: 0.4 }, { route: ["s"], kind: "req", rate: 0.4 }, lands] },
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["Claude Code's loop: <b>gather context</b>, <b>take action</b>, <b>check the result</b>.", "Everything it reads or sees lands in one <b>context window</b>: 12% at start-up, 83% once the tests had run.", "At 83% the fix took <b>two tries</b>, and the session compacted itself at 90%.", "With <b>/clear</b> after the side question and a <b>subagent</b> for the search, the same morning peaked at 57%.", "The <b>memory file</b> holds requests. A <b>hook</b> and a <b>permission rule</b> are guarantees."],
        callout: { kind: "next", text: "The context meter below runs this morning step by step, and lets you try /compact as well. The cards either side sort eleven wishes into the part that should hold them, and nine requests into plan first or just do it." },
        metrics: { step: "8 of 8", win: "57%", peak: "57%", tries: 1 },
      },
    ],
    page: "claude", pane: "ccode",
  };
})();
