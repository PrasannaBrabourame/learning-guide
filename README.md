# Learning Guide

A static learning guide for Technical Lead & AI Engineer topics, covering 283 topics. No build step, no dependencies, no external requests, just serve the folder.

Each topic is broken down into:
- 🧠 Technical answer
- 💡 In layman's terms
- 🛠 Practical use cases
- 🎯 Follow-up checks
- ⚠ Red flags
- 📌 One-line memory aid

## Difficulty and colour

Every topic carries a `difficulty` of **Low** (recall/definition), **Medium**
(mechanics or comparison), **High** (production design and judgement) or
**Complex** (multi-system trade-offs under ambiguity). Filter by level from
the toolbar, or click a level on the dashboard to drill straight into it.
Each badge shows its label as text, so the level never depends on colour
alone; all eight badge colours clear WCAG AA contrast in both themes.

The 43 categories are coloured by **domain family** (Cloud & Infrastructure,
Architecture & Platform, AI & LLM, Agents & MCP, Security & Governance,
Leadership & Business, Reliability & Ops, Data, RAG & Retrieval) rather than
one hue each, 41 hues are not visually distinguishable, 9 are, and the
colour then carries meaning. Tiles remain sorted alphabetically.

## Files

```
index.html        Page shell, topbar, dashboard, and browse-view markup
assets/styles.css Styling (light/dark theme, aurora backdrop, tiles, print)
assets/fonts/     Self-hosted Inter and Newsreader subsets (woff2, 352 KB)
cloud.html        Cloud lab: request journey, OSI (including what the data
                  physically is at each layer, from data to segment, packet,
                  frame and bits), landing zone (VPC tiers, proxies, private
                  link, CIDR, security groups and policy evaluation), VPC
                  design (how many, public vs private, subnet sizing,
                  component advice), network simulator, NGINX, IAM, SAP-C02
                  cheatsheet, pillars, DR simulator, translator
agentcore.html    AgentCore lab: running agents in production, covering
                  runtime, identity, gateway, memory, evaluation and
                  multi-agent patterns
agentbuild.html   Agents-building-agents lab: spec-driven development with a
                  coding agent, the ADK loop, and the Managed Agents API
adk.html          ADK lab: agents, tools and tool schemas, session state,
                  callbacks and plugins, orchestration and delegation,
                  grounding and MCP, the Agent Sandbox, skills, deployment
frames.html       Agent-frameworks lab: five ways to build the same
                  support-ticket agent (LangGraph's drawn graph with
                  checkpoints and resume, CrewAI's cast of roles,
                  Strands' model-driven loop, ADK's kit, the Hermes-style
                  self-editor), which frame for which job including no
                  framework at all, and the Lang family untangled
                  (LangChain, LangGraph, LangSmith, Langflow, Langfuse)
                  by layer and vendor
evals.html        Evaluation lab, why testing breaks on generative systems,
                  metrics and autoraters, rubrics, trajectories and golden
                  paths, offline vs online, the managed platform, ADK
                  build-time evals, hill climbing, unit economics, upgrades
metrics.html      Metrics lab: which number to trust when a miss costs more
                  than a false alarm. Sample size and the honest band, the
                  triage map (something happened, look here), precision and
                  recall with the F1 trap, the ranked list and the operating
                  point, MAE against the quadratic penalty, stability and the
                  boilerplate detector, the retrieval ceiling, deterministic
                  gates and the deadband, judging the judge, drift, fairness
                  by slice, and the toolbox of off-the-shelf eval frameworks,
                  including a judge-scored build gate you can make flaky and
                  then cure
gemini.html       Gemini Enterprise lab, architecture and provisioning, the
                  identity decision, Workforce Identity Federation, networking,
                  data stores and connectors, agents, Model Armor, search
                  quality and tuning, governance, change management
govern.html       Govern & secure lab, the agent gateway on both sides, the
                  policy chain, private egress, agent identity, delegated
                  access, the threat landscape, the red-team week, boundaries and controls,
                  perimeters, the registry, tracing and audit
gpu.html          GPU lab. The layer everything else sits on: why a GPU is
                  shaped differently from a CPU, threads/warps/SMs and warp
                  divergence, the five-rung memory ladder, the roofline model
                  and arithmetic intensity, coalescing, tiling, tensor cores
                  and number formats, operator fusion and FlashAttention,
                  and Triton vs torch.compile (with graph breaks)
train.html        Training lab: watch a model learn, live in the page. The
                  loop (guess, measure, nudge), the learning rate's four
                  personalities, a real network training on blobs / rings /
                  XOR / spiral with the boundary forming, the overfitting
                  U-curve, early stopping as a game, why batching is a
                  hardware decision, and adapting a foundation model: prompt
                  vs RAG vs fine-tuning, LoRA arithmetic on a 7B shape, and
                  catastrophic forgetting live, with the replay fix,
                  and distillation, bottling the teacher into a student
                  a fifth its size
classic.html      Classical ML lab: four little machines that still run the
                  world. Three kinds of learning, nearest neighbours with a
                  poisoned memory, a decision tree you build and destabilise,
                  k-means as food trucks with a genuine local-optimum trap,
                  the perceptron to margin to logistic confidence, PCA as a
                  lamp whose brightest shadow can hide the meaning, and which
                  machine for which job
llm.html          LLM internals lab, the generation loop, tokenisation and
                  BPE, embeddings and position, attention (Q/K/V, heads,
                  the attention sink), the transformer block and what breaks
                  without residuals, sampling, the KV cache and its
                  arithmetic, quantisation (GPTQ/AWQ/naive), continuous
                  batching and paged attention
serving.html      LLM serving lab, what an inference engine does that a model
                  does not: prefill vs decode, iteration-level scheduling and
                  preemption, prefix caching, speculative decoding, CUDA
                  graphs, multi-LoRA, prefill/decode disaggregation, KV cache
                  tiers, constrained decoding and tool parsing, padding waste
                  in ragged batches, the request lifecycle (streaming,
                  cancellation, invalid input) and benchmark methodology, and
                  TTFT/TPOT/tail-latency SLOs
fleet.html        Fleet lab, the orchestration layer above one engine:
                  discovery and readiness, KV-aware routing, moving KV state
                  versus recomputing it, sizing disaggregated prefill and
                  decode pools, planner control loops and why they oscillate,
                  what a worker dying does to an in-flight stream, and
                  capacity acceptance
peakweek.html     Peak Week lab, a sorter fails at a parcel hub on the
                  busiest night of the year, and one agent is carried through
                  the whole life of a system: groundwork, make it work (tools,
                  docstrings, route search), make it survive (sessions, Memory
                  Bank, sandbox, the smoke test that saves the deploy), make it
                  safe (Model Armor, least privilege), make it good (graded
                  eval, LLM-as-judge), make it theirs (publishing, and the
                  session-id bug that only shows up there)
design.html       Diagram lab, audiences, levels of zoom, anatomy, notation,
                  choosing services, what people leave out, the questions
                  behind the picture, surviving a review, diagram rot, the
                  do's and don'ts, and the whiteboard interview
assets/lab.css    Styling shared by all sixteen lab pages, theme tokens,
                  layout, the top bar, tabs, callouts, the plain-English
                  on-ramp, diagrams
assets/lab.js     Behaviour shared by all sixteen lab pages, theme toggle,
                  tab deep links, the scenario drill, the navigation rail,
                  the labs menu and the track line
assets/app.js     Dashboard + browse views, rendering, search/filter, quiz
                  mode, flashcard drills, jump-to-topic palette,
                  progress rings + streak tracking, lab-to-topic mapping
data/topics.json  The 283 topics as plain JSON (incl. per-topic difficulty)
```

There are 245 simulations across the nineteen labs. Every one carries a
plain-English on-ramp above its controls: an everyday analogy for the mechanism, one concrete first action,
and a short glossary of only the jargon that appears on that screen. The
glossary is per-simulation rather than per-page, because someone lost in
the middle of an interaction does not scroll away to look a word up.

That last part is a checkable rule, not an aspiration: **every acronym,
product name and piece of domain jargon that appears on a simulation's
screen (including the text the simulation renders as you operate it) is
defined in that simulation's own glossary.** The two exceptions are the
scenario drill and the cloud-differences quiz, which replay other
simulations' answers and are read by someone who has already passed those
screens; glossing the whole page's vocabulary there buries the entries
that matter.

Per-simulation does not mean per-simulation wording. Where a term means the
same thing on two screens it is worded the same way on both, so that someone
reading three labs is not asked to re-learn "blast radius" each time. Where
it means genuinely different things (an LLM token and an access token, a
GPU block and a cache block) the definitions stay different, and a wording
that names something on its own screen keeps that clause.

## Reading the theme

The visual design is trying to get out of the way. Three rules hold it
together:

**One accent.** Everything the reader can act on (links, the active tab, the
focus ring) is the same teal (`--accent`). It used to be three: amber tabs,
teal links and a violet eyebrow, none of which meant anything. Colour inside a
simulation still carries meaning, and is left alone: green, amber and red are
pass, warn and fail, and the provider blues and oranges identify AWS, Azure and
GCP.

**One measure.** Prose is capped at a readable line length rather than running
the full 1280px column, which is about 150 characters and roughly twice what is
comfortable. Diagrams, simulations, tables and code keep the whole width. They
are read by scanning, not line by line.

**One place to navigate from.** Each lab opens with a single row: back to the
guide, this lab's related topics, all labs, and the theme and search controls.
The twelve sibling-lab links that used to sit above every title are behind
**⊞ all labs**, grouped into the same three tracks the dashboard uses and
numbered in the same order. Under the title, a line says where the reader is
standing: `Under the hood · lab 3 of 6 · next: One token at a time`,
so the reading order the dashboard sets survives past the front door. Both are
generated from one table in `assets/lab.js`, so adding a lab is one edit.

**Motion, only where it teaches.** Results animate in when a simulation
re-renders, and three simulations whose whole lesson is time passing (the
generation loop, the queue behind thirty-nine long prompts, the worker list
going stale) have a "watch it happen" playback against a compressed clock.
The dashboard enters the same way (the hero and the lab cards stagger in, and
the activity heatmap draws as a wave of days), and switching theme crossfades
on every page instead of hard-cutting. Everything sits behind
`prefers-reduced-motion`, and outputs driven by a slider stand down
automatically so a drag never flickers.

## Labs and topics are linked

Each lab card carries one plain line saying what the lab lets you do, and that
is the only prose on it. The cards used to carry a four-sentence description as
well, which assumed the thing the lab teaches: "a docstring decides whether a
tool is ever chosen" is a good sentence about the ADK lab and no help at all to
somebody deciding whether to open it. The detail lives in the lab; the card only
has to be scannable alongside seventeen others.

Each hands-on lab card carries a **related-topics** strip showing how many of
the 283 topics that lab actually covers, 50 for the Cloud lab, 37 for
Evaluation, 33 for the diagram lab. Clicking it opens the browse view filtered
to just those, rather than the whole pile. The map from lab to categories lives
in `assets/app.js` (`LABS`); the counts are computed from `data/topics.json` at
load, so adding a topic updates the right card by itself. Every lab page has a
matching **▤ related topics** chip that links back to its own reading, and the
view is shareable as `index.html#lab=<key>`.

Categories a lab only brushes against are deliberately left out, a link that
returns half the site is the problem it was meant to fix.

Data, styling, and behaviour are split into separate files so each can be
edited and diffed independently, e.g. adding a topic only touches
`data/topics.json`.

The sixteen labs are self-contained pages, but the chrome around the content
is not copied into each one: it lives in `assets/lab.css` and `assets/lab.js`,
which every lab links. That split exists because the copies drifted, a callout
that needed a size rule needed thirteen separate patches, and one lab shipped
with a stale copy of a rule because it was generated from an older snapshot.
Each lab still carries its own `<style>` after `lab.css`, holding only the rules
that lab actually needs, and its own inline `<script>` before `lab.js`, which
reads what that script rendered.

## Versioning

Every footer shows the site's version, stamped by the deploy workflow from the
deployed commit: calendar date, commit count, short SHA (for example
`v2026.09.07.94 · abdd3dc`). Nothing is bumped by hand, and there is still no
build step: the checked-in `assets/version.js` says `dev`, so a local checkout
honestly shows `local dev build`.

## View locally

The page fetches `data/topics.json`, which browsers block over `file://`,
so serve the folder over HTTP:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. (On GitHub Pages it just works.)

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In the repo settings, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`.
4. Save. The site will be published at `https://<username>.github.io/<repo>/`.
