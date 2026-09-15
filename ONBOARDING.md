# Onboarding: the Learning Guide

A static, self-contained learning guide for Technical Lead and AI Engineer
topics. **304 topics**, **19 hands-on labs**, **251 in-browser simulations**,
and a revision cheatsheet, served straight from the folder: no build step, no
dependencies, no external requests.

Deployed to GitHub Pages: <https://prasannabrabourame.github.io/learning-guide>.

---

## What it is

Two kinds of content, one site:

- **The topic bank** (`data/topics.json`) — 304 interview topics, each with a
  technical answer, a plain-English take, use cases, a worked example, follow-ups,
  red flags, and a one-line memory aid. Rendered on the dashboard and browse view
  (`index.html` + `assets/app.js`).
- **The labs** (`*.html`) — 19 self-contained pages, each a tabbed set of
  interactive simulations you can operate and break on purpose. They share their
  chrome through `assets/lab.css` and `assets/lab.js` (header, tabs, theme,
  section-find, labs menu, version footer, bookmark control).

Plus `cheatsheet.html`: the whole guide distilled onto one printable page.

## Layout

```
index.html         Dashboard, browse view, quiz and flashcard modes
assets/app.js      Dashboard logic: rendering, search/filter, progress,
                   bookmarks, the Reset control
assets/lab.js      Shared lab chrome (theme, tabs, find, labs menu, bookmarks)
assets/lab.css     Shared lab styling and theme tokens
assets/styles.css  Dashboard styling
data/topics.json   The 304 topics as plain JSON
cheatsheet.html    Revision cheatsheet: filter, Test-yourself recall, and a
                   Mental-models band of technical diagrams + a roofline sim
<lab>.html         One lab each (cloud, gpu, train, classic, llm, serving,
                   fleet, adk, frames, agentcore, agentbuild, evals, metrics,
                   govern, gemini, peakweek, design)
```

## The non-negotiables (read before you touch anything)

These are hard rules for this repo, enforced across every change:

1. **The change workflow is mandatory.** Every change, docs included:
   open a GitHub issue first, branch, build, comment the pain points on the
   issue and close it, open a PR, squash-merge, delete the branch. Never commit
   straight to `main`.
2. **Commit messages carry no AI or assistant attribution.** No `Co-Authored-By`
   for an assistant, no "generated with" lines. Plain, human-voiced messages.
3. **`.claude/` is deliberately gitignored.** Never commit it, never add an
   exception for it.
4. **Everything published is white-labelled.** No source URLs, document names,
   presenter names, contact details or event logistics anywhere in the shipped
   content. The distinction that governs it: *names of products the guide
   teaches are content (LangGraph, Vertex AI, Model Armor); names, addresses and
   URLs of the places the material came from are sourcing, and sourcing never
   ships.* Source documents live under a gitignored `.tmp/`.
5. **No em dashes, ever.** Use commas, colons or semicolons. (`grep -c '—'` and
   `grep -c '&#8212;\|&mdash;'` must both be 0.)
6. **No external requests at runtime.** Same-origin assets only. A favicon file
   is fine; a CDN script is not.

## House conventions for simulations

Every sim follows the same shape so the guide reads as one system:

- A `.simplain` on-ramp above the controls: an "in real life" analogy, a
  "start by" first action, and a **per-simulation glossary** ("words here")
  that defines *every* acronym and piece of jargon on that screen, including
  strings the JS renders as you operate it. This is a checkable rule.
- Seeded determinism (`mulberry32`, `gauss`) so a sim behaves identically every
  run; no `Math.random()` where reproducibility matters.
- The `D()`/`box()`/`t()`/`tm()` SVG helpers, `MONO`/`SANS` fonts, the
  `.lzhop`/`.lzbad`/`.lzwarn`/`.ok` note classes, and the `.exam-line` + drill
  pattern the shared `lab.js` builds automatically.
- Motion sits behind `prefers-reduced-motion`; slider-driven outputs stand down
  during a drag.

## How to add content

- **A topic**: append to `data/topics.json` (keep its 2-space indent; append by
  string surgery, do not reformat the whole file), then bump the hardcoded
  counts (hero, search placeholder, README) and confirm the lab-to-category
  card count still computes.
- **A simulation**: add a card (with its `.simplain`) into the lab's tab
  template and an IIFE after it. Verify every quantitative claim in Node
  *before* it reaches the page; then run the glossary, fuzzer and layout checks;
  then a browser probe of every path; then a layman-terms audit; then bump the
  lab's sim count and the site total.
- **A lab**: new `<lab>.html` from the house skeleton, wire it into `TRACKS`
  (`lab.js`), `LABS` (`app.js`), the dashboard cards and labs menu
  (`index.html`), the README, and the hero counts.

## Verifying a change

The quality machinery that keeps this honest:

- **Node pre-verification** of every number before it ships (parameter
  censuses, LoRA memory bills, k-means traps, roofline maths, eval flip counts).
- **A scratchpad harness** (`run.js` executing stub, `gloss.py` glossary
  coverage, `monkey.py` interaction fuzzer, `svgdump.py`/`layout.py` diagram
  overlap checks). Heads up: this harness lives outside the repo and has
  repeatedly vanished between sessions; when it is gone, verify with direct
  Node syntax checks plus headless-Chrome browser probes.
- **Headless-Chrome probes** driving every interaction path and asserting the
  rendered result, with a fake-clock pattern for clock-driven playbacks
  (`--virtual-time-budget` advances rAF but not `Date.now()`).
- **A layman-terms audit** on new sims (a smart adult with no background),
  and a **facts audit** on technical topics, before merge.
- **Deploy verification**: after squash-merge, wait for the Pages run and
  curl the live pages for the new content and the stamped version.

Versioning is automatic: `assets/version.js` is checked in as `dev`, and the
Pages workflow stamps `v<date>.<count> (<sha>)` at deploy, so a local checkout
honestly shows "local dev build".

## What's new (recent changes and implementations)

The most recent arc of work, newest first:

- **Cheatsheet, three ways to use it.** A one-page revision cheatsheet
  distilling every lab's must-remember points; a **Test-yourself** active-recall
  mode that blurs the points until you click to check; and a **Mental models**
  band of twelve precise technical diagrams (transformer block, LCEL chain, KV
  cache, attention, the metric chain, confusion matrix, tool-calling loop,
  LangGraph super-step, LoRA, top-p nucleus, quantisation) plus an **interactive
  roofline simulator**.
- **Bookmarks and progress that persist.** Star topics; bookmark a whole lab or
  an individual simulation from the lab header; both surface on the dashboard
  and live in browser storage across refreshes. A single **Reset** control wipes
  them (the theme is kept).
- **A favicon** (the node-graph mark in brand teal, SVG plus PNG fallbacks).
- **New labs and simulations.** A "Pick your frame" lab (LangGraph, CrewAI,
  Strands, ADK, the Hermes-style self-editor, the Lang family, and Runnables
  and LCEL); fine-tuning, distillation and catastrophic forgetting in the
  training lab; the top-p nucleus and tool/function-calling loops in the LLM
  lab; guardrail-limits and access-controlled-search sims; and the classical-ML
  lab.
- **New topic sets.** The Agent Architect Professional decision map and nine
  new concepts; nine Gemini Enterprise scenarios; thirteen agent-architecture
  exam questions; business-KPI and metric-chain topics.
- **Housekeeping.** The global keyboard-shortcut layer was removed (with the
  labs' section-search given a real button in its place), and a source-document
  reference was stripped from 97 topic code fields to hold the white-label line.

## First tasks to get your bearings

1. Serve locally: `python3 -m http.server 8000`, then open
   `http://localhost:8000`.
2. Open the **training lab** and step a network training live; open the
   **frames lab** and crash a LangGraph run, then resume from its checkpoint.
3. Open the **cheatsheet**, press **Test yourself**, and drag the roofline.
4. Read one topic end to end in the browse view to see the six-part shape.
5. Skim `assets/lab.js` to see how a lab page gets its shared chrome from one
   file.
