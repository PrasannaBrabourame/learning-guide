/* Boot: topic data lives in data/topics.json (pure JSON). */
fetch("data/topics.json")
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
  .then(init)
  .catch(() => {
    document.body.innerHTML = `<div class="bootfail"><h1>Couldn't load topic data</h1>
<p>This page fetches <code>data/topics.json</code>, which browsers block when the file is opened directly from disk.</p>
<p>Serve the folder over HTTP instead:</p><pre>python3 -m http.server 8000</pre>
<p>…then visit <code>http://localhost:8000</code>, or use the deployed GitHub Pages URL.</p></div>`;
  });

function init(topics) {
  /* ============ state ============ */
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } },
    set(k, v) { localStorage.setItem(k, JSON.stringify(v)) }
  };
  const studied = new Set(store.get("study-progress", []));
  const starred = new Set(store.get("study-starred", []));
  const activity = store.get("study-activity", {});
  let lastMilestone = store.get("study-milestone", 0);

  const esc = s => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const list = a => `<ul>${a.map(x => `<li>${x}</li>`).join("")}</ul>`;
  const $ = s => document.querySelector(s);
  const byId = new Map(topics.map(t => [t.id, t]));
  const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* topic counts come from the data, never from hard-coded markup */
  $("#msearch").placeholder = `Search ${topics.length} topics…   ( / )`;
  const dsubEl = document.querySelector(".dsub");
  if (dsubEl) dsubEl.textContent = dsubEl.textContent.replace(/^\d+/, topics.length);

  /* ============ categories: semantic colour families ============
     One hue per domain family rather than a unique hue per category, 
     41 hues are not distinguishable, 9 families are, and the colour
     then carries meaning. Tiles stay alphabetical; only colour groups. */
  const FAMILIES = [
    ["Cloud & Infrastructure", 212, ["Kubernetes", "GCP", "Cloud Architecture", "DevOps", "Deployment", "Infrastructure as Code"]],
    ["Architecture & Platform", 250, ["Software Architecture", "Software Development", "API & Backend", "Event-Driven Architecture", "Full-Stack Engineering", "Multi-Tenancy"]],
    ["AI & LLM", 280, ["Large Language Models", "AI & GenAI", "Deep Learning & Neural Networks", "Classical Machine Learning", "Math, Probability & Statistics"]],
    ["Agents & MCP", 320, ["AI Agents", "Agentic AI", "Agentic AI Scenarios", "Model Context Protocol", "LangChain Stack", "Agent Frameworks & Runtimes"]],
    ["Security & Governance", 352, ["Security", "AI Security", "AI Governance"]],
    ["Leadership & Business", 20, ["Leadership", "Candidate Validation", "Scenario Exercise", "FinOps"]],
    ["Reliability & Ops", 48, ["Observability", "Production Readiness", "Production Operations", "LLMOps", "Performance", "Testing & Quality", "Evaluation & Metrics"]],
    ["Data", 150, ["Data", "Data & Databases", "Data Engineering", "Data & Integration", "File & Media Processing"]],
    ["RAG & Retrieval", 180, ["Retrieval-Augmented Generation", "Multimodal RAG Deep Dive"]]
  ];
  const catHue = new Map();
  const catFamily = new Map();
  FAMILIES.forEach(([fam, hue, cats]) => cats.forEach(c => { catHue.set(c, hue); catFamily.set(c, fam) }));
  const categories = [...new Set(topics.map(t => t.category))].sort((a, b) => a.localeCompare(b));
  // any category not yet mapped falls back to a spaced hue so nothing renders colourless
  categories.forEach((c, i) => { if (!catHue.has(c)) { catHue.set(c, Math.round(i * 137.508) % 360); catFamily.set(c, "Other") } });
  const byCat = new Map(categories.map(c => [c, topics.filter(t => t.category === c)]));

  /* ============ labs -> the topics they actually cover ============
     Each hands-on lab is the practical half of a handful of these
     categories. Without this map every lab card pointed at the same
     undifferentiated pile of 267 topics, so finishing the Cloud lab and
     wanting the cloud reading meant hand-picking fourteen tiles out of
     forty-three. Categories listed here are the ones the lab genuinely
     teaches, a lab that only brushes a subject is deliberately left out,
     because a link that returns half the site is the problem, not the fix. */
  const LABS = {
    cloud: { name: "Cloud lab", hue: 212, cats: ["Cloud Architecture", "GCP", "Kubernetes", "Security", "Observability", "Infrastructure as Code", "DevOps", "Deployment", "FinOps", "Performance", "Event-Driven Architecture", "Production Readiness", "Production Operations", "Data & Databases"] },
    agentcore: { name: "AgentCore lab", hue: 320, cats: ["AI Agents", "Agentic AI", "Agent Frameworks & Runtimes", "Model Context Protocol", "Observability", "Production Readiness"] },
    agentbuild: { name: "Agents building agents", hue: 320, cats: ["AI Agents", "Agentic AI", "Agentic AI Scenarios", "Agent Frameworks & Runtimes", "AI & GenAI"] },
    adk: { name: "ADK lab", hue: 320, cats: ["Agent Frameworks & Runtimes", "AI Agents", "Agentic AI", "Model Context Protocol"] },
    evals: { name: "Evaluation & hill climbing", hue: 48, cats: ["Evaluation & Metrics", "LLMOps", "Observability", "Testing & Quality", "Production Readiness"] },
    gemini: { name: "Gemini Enterprise rollout", hue: 212, cats: ["GCP", "Cloud Architecture", "Security", "Retrieval-Augmented Generation", "Data & Databases", "Data Engineering", "AI Governance", "Leadership"] },
    govern: { name: "Govern & secure agents", hue: 352, cats: ["Security", "AI Governance", "Agentic AI", "AI Agents", "Agent Frameworks & Runtimes", "Model Context Protocol"] },
    design: { name: "Architecture diagrams", hue: 250, cats: ["Software Architecture", "Production Readiness", "Candidate Validation", "Leadership"] },
    peakweek: { name: "Peak Week \u2014 one agent end to end", hue: 320, cats: ["Agent Frameworks & Runtimes", "AI Agents", "Agentic AI", "Evaluation & Metrics", "LLMOps", "Security", "Production Readiness", "GCP"] },
    gpu: { name: "The machine underneath", hue: 280, cats: ["Large Language Models", "Deep Learning & Neural Networks", "Performance", "LLMOps", "Math, Probability & Statistics"] },
    llm: { name: "One token at a time", hue: 280, cats: ["Large Language Models", "Deep Learning & Neural Networks", "Retrieval-Augmented Generation", "LLMOps", "Performance"] },
    serving: { name: "The engine, not the model", hue: 48, cats: ["Large Language Models", "LLMOps", "Performance", "Production Readiness", "Observability", "Multi-Tenancy"] },
    fleet: { name: "Twenty engines, one endpoint", hue: 48, cats: ["Production Readiness", "Observability", "Performance", "LLMOps", "Kubernetes", "Software Architecture", "Production Operations"] },
    pca: { name: "GCP Architect exam", hue: 212, cats: ["GCP", "Cloud Architecture", "Data", "Data & Databases", "Data Engineering", "Kubernetes", "Security", "Production Readiness", "FinOps"] },
    sap: { name: "SAP-C02 cheatsheet", hue: 212, cats: ["Cloud Architecture", "Security", "Kubernetes", "Deployment", "Observability", "FinOps", "Performance", "Production Readiness"] }
  };
  /* drop any category the data no longer has, so a renamed category
     shrinks a lab's list instead of silently counting zero */
  for (const k in LABS) LABS[k].cats = LABS[k].cats.filter(c => byCat.has(c));
  const labItems = k => topics.filter(t => LABS[k].cats.includes(t.category));

  /* ============ difficulty ============ */
  const DIFFS = ["Low", "Medium", "High", "Complex"];
  const DSLUG = { Low: "low", Medium: "med", High: "high", Complex: "cx" };
  const diffOf = t => DIFFS.includes(t.difficulty) ? t.difficulty : "Medium";
  const diffBadge = t => { const d = diffOf(t); return `<span class="dbadge d-${DSLUG[d]}">${d}</span>` };

  /* ============ search index ============ */
  const norm = s => s.toLowerCase().replace(/[–, ·]/g, " ");
  const searchIndex = new Map(topics.map(t => [t.id,
    norm([t.title, t.category, t.question, ...t.technical, t.layman, ...t.usecases, t.code, ...t.followups, ...t.redflags, t.memory].join(" "))
  ]));

  /* ============ tiny syntax highlighter ============ */
  const HLRX = /((?:^|[ \t])(?:#|\/\/)[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`[^`]*`)|(^[ \t-]*[\w.$-]+)(?=:(?:[ \t]|$))|\b(\d+(?:\.\d+)?)\b|\b(const|let|var|function|return|if|else|for|while|async|await|import|from|export|new|class|def|lambda|try|except|finally|with|as|pass|raise|True|False|None|null|true|false|SELECT|FROM|WHERE|AND|OR|NOT|NULL|GROUP BY|ORDER BY|JOIN|LEFT|INNER|ON|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|LIMIT)\b/gm;
  const hl = src => esc(src).replace(HLRX, (m, c, s, p, n, k) =>
    c ? `<i class="tk-c">${c}</i>` : s ? `<i class="tk-s">${s}</i>` : p ? `<i class="tk-p">${p}</i>` : n ? `<i class="tk-n">${n}</i>` : `<i class="tk-k">${k}</i>`);

  /* ============ progress ring (SVG) ============ */
  const ring = (pct, hued) => `<svg viewBox="0 0 36 36" class="ring${hued ? " hue" : ""}"><circle cx="18" cy="18" r="15.5" class="rbg"/><circle cx="18" cy="18" r="15.5" class="rfg" style="stroke-dasharray:${(pct * 97.4).toFixed(1)} 97.4"/></svg>`;

  /* ============ render cards ============ */
  const cards = $("#cards");
  const num = new Map(topics.map((t, i) => [t.id, String(i + 1).padStart(2, "0")]));
  cards.innerHTML = topics.map((t, i) => `<article class="card" id="${t.id}" data-cat="${esc(t.category)}" data-diff="${diffOf(t)}" style="--hue:${catHue.get(t.category)}">
<header class="head" tabindex="0" aria-expanded="false"><div class="num">${String(i + 1).padStart(2, "0")}</div><div><h2>${esc(t.title)}</h2><p>${esc(t.category)}${diffBadge(t)}</p></div><div class="actions"><button class="star${starred.has(t.id) ? " on" : ""}" data-id="${t.id}" title="Star for review" aria-pressed="${starred.has(t.id)}">★</button><input class="check" type="checkbox" data-id="${t.id}" ${studied.has(t.id) ? "checked" : ""} title="Mark studied"><button class="chev" aria-label="Expand">⌄</button></div></header>
<div class="body"><div class="bwrap"><div class="question">${t.question}</div><button class="btn reveal">Reveal answer</button><div class="grid">
<section class="box full"><h3>🧠 Technical answer</h3>${list(t.technical)}</section>
<section class="box layman"><h3>💡 In layman terms</h3><p>${t.layman}</p></section>
<section class="box"><h3>🛠 Practical use cases</h3>${list(t.usecases)}</section>
<div class="code"><button class="copy">Copy</button><pre><code>${hl(t.code)}</code></pre></div>
<section class="box"><h3>🎯 Follow-up checks</h3>${list(t.followups)}</section>
<section class="box bad"><h3>⚠ Red flags</h3>${list(t.redflags)}</section>
<section class="box full memo"><h3>📌 One-line memory aid</h3><p><b>${t.memory}</b></p></section>
</div></div></div></article>`).join("");

  /* ============ views: dashboard <-> browse ============ */
  const dash = $("#dash"), browse = $("#browse");
  let currentCat = null;
  function showDash() {
    // drop a #lab= deep link on the way out, so reloading does not bounce
    // straight back into the lab's list the reader just left
    if (/^#lab=/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search);
    browse.hidden = true; dash.hidden = false;
    diffSel.value = "all"; stateSel.value = "all"; ms.value = "";
    renderTiles(); renderLegends(); updateCounters(true);
    scrollTo(0, 0);
  }
  /* `sel` is null (everything), a category name, or a lab key from LABS.
     Everything downstream works off catSet, so one card and one tile take
     exactly the same path. */
  let currentSet = null;
  const catSet = sel => sel == null ? null
    : LABS[sel] ? new Set(LABS[sel].cats)
      : new Set([sel]);
  function showBrowse(sel) {
    currentCat = sel; currentSet = catSet(sel);
    dash.hidden = true; browse.hidden = false;
    const lab = LABS[sel];
    $("#bname").textContent = lab ? lab.name : sel || "All topics";
    $("#bsub").textContent = lab ? `topics behind this lab · ${lab.cats.length} categories` : "";
    const items = currentSet ? topics.filter(t => currentSet.has(t.category)) : topics;
    const done = items.filter(t => studied.has(t.id)).length;
    $("#bring").innerHTML = ring(items.length ? done / items.length : 0, !!sel);
    if (sel) $("#bring").style.setProperty("--hue", lab ? lab.hue : catHue.get(sel));
    else $("#bring").style.removeProperty("--hue");
    filter();
    scrollTo(0, 0);
  }
  $("#back").onclick = showDash;
  $("#browseall").onclick = () => showBrowse(null);

  /* ============ lab cards -> their own topics ============
     Counts are read from the data, never typed into the markup, so a topic
     added to data/topics.json shows up on the right card by itself. */
  document.querySelectorAll(".ltopics").forEach(b => {
    const k = b.dataset.lab, n = LABS[k] ? labItems(k).length : 0;
    const c = b.querySelector(".ltc");
    if (c) c.textContent = `${n} topic${n === 1 ? "" : "s"}`;
    b.setAttribute("aria-label", `Browse the ${n} topics behind ${LABS[k] ? LABS[k].name : k}`);
    b.onclick = () => { location.hash = `lab=${k}`; showBrowse(k) };
  });
  /* a lab page can link straight back at its own reading: index.html#lab=evals */
  function openFromHash() {
    const m = /^#lab=([a-z]+)$/.exec(location.hash);
    if (m && LABS[m[1]]) showBrowse(m[1]);
  }
  addEventListener("hashchange", openFromHash);

  /* ============ dashboard tiles ============ */
  const tiles = $("#tiles");
  function renderTiles() {
    tiles.innerHTML = categories.map(c => {
      const items = byCat.get(c), done = items.filter(t => studied.has(t.id)).length, pct = done / items.length;
      // difficulty mix bar: proportional segments so a tile shows how hard the category is
      const mix = DIFFS.map(d => items.filter(t => diffOf(t) === d).length)
        .map((n, i) => n ? `<i class="d-${DSLUG[DIFFS[i]]}" style="flex:${n}" title="${n} ${DIFFS[i]}"></i>` : "").join("");
      return `<button class="tile${done === items.length ? " done" : ""}" data-cat="${esc(c)}" style="--hue:${catHue.get(c)}">
<span class="tring">${ring(pct, true)}<b>${Math.round(pct * 100)}%</b></span>
<span class="tinfo"><b>${esc(c)}</b><small>${done}/${items.length} studied${done === items.length ? " ✓" : ""}</small><span class="tmix">${mix}</span></span></button>`;
    }).join("");
  }
  tiles.onclick = e => { const t = e.target.closest(".tile"); if (t) showBrowse(t.dataset.cat) };

  /* ============ dashboard legends: difficulty (clickable) + colour families ============ */
  function renderLegends() {
    const dl = $("#dlegend");
    dl.innerHTML = DIFFS.map(d => {
      const items = topics.filter(t => diffOf(t) === d);
      const done = items.filter(t => studied.has(t.id)).length;
      return `<button class="dchip d-${DSLUG[d]}" data-diff="${d}"><b>${d}</b><span>${done}/${items.length}</span></button>`;
    }).join("");
    $("#flegend").innerHTML = FAMILIES.filter(([, , cats]) => cats.some(c => byCat.has(c)))
      .map(([fam, hue]) => `<span class="fchip" style="--hue:${hue}"><i></i>${esc(fam)}</span>`).join("");
  }
  $("#dlegend").onclick = e => {
    const b = e.target.closest(".dchip"); if (!b) return;
    diffSel.value = b.dataset.diff; showBrowse(null);   // drill straight into that level
  };

  /* ============ counters + topbar ============ */
  function animateCount(el, to) {
    if (reduced || to < 6) { el.textContent = to; return }
    const t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / 600, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  function calcStreak() {
    let streak = 0; const cur = new Date(); cur.setHours(0, 0, 0, 0);
    if (!activity[todayKey()]) cur.setDate(cur.getDate() - 1);
    for (; ;) {
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
      if (activity[key]) { streak++; cur.setDate(cur.getDate() - 1) } else break;
    }
    return streak;
  }
  function updateCounters(animate) {
    const catsDone = categories.filter(c => byCat.get(c).every(t => studied.has(t.id))).length;
    const streak = calcStreak();
    if (animate) { animateCount($("#c-studied"), studied.size); animateCount($("#c-starred"), starred.size); animateCount($("#c-cats"), catsDone); }
    else { $("#c-studied").textContent = studied.size; $("#c-starred").textContent = starred.size; $("#c-cats").textContent = catsDone; }
    $("#c-streak").textContent = streak;
    $("#tstreak").textContent = `🔥 ${streak}`;
    $("#oring").innerHTML = ring(studied.size / topics.length) + `<b>${Math.round(studied.size / topics.length * 100)}%</b>`;
    if (!dash.hidden) { renderTiles(); renderLegends() }
  }

  /* ============ milestones + studied ============ */
  function checkMilestone() {
    const pct = studied.size / topics.length * 100;
    const hit = [100, 75, 50, 25].find(m => pct >= m) || 0;
    if (hit > lastMilestone) {
      lastMilestone = hit; store.set("study-milestone", hit);
      toast(hit === 100 ? "🏆 All topics studied. You're ready." : `🎉 ${hit}% of the guide studied!`);
      confetti();
    }
  }
  function markStudied(id, on) {
    on ? studied.add(id) : studied.delete(id);
    store.set("study-progress", [...studied]);
    const box = document.querySelector(`.check[data-id="${id}"]`);
    if (box) box.checked = on;
    if (on) { activity[todayKey()] = (activity[todayKey()] || 0) + 1; store.set("study-activity", activity); renderHeatmap(); }
    updateCounters(false); checkMilestone();
  }

  /* ============ toast + confetti ============ */
  let toastTimer;
  function toast(msg) {
    let el = document.getElementById("toast");
    if (!el) { el = document.createElement("div"); el.id = "toast"; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 3500);
  }
  function confetti() {
    if (reduced) return;
    const cv = document.createElement("canvas"); cv.className = "confetti";
    cv.width = innerWidth; cv.height = innerHeight; document.body.appendChild(cv);
    const ctx = cv.getContext("2d"), colors = ["#3559d8", "#7b4de8", "#087a61", "#f2a600", "#e34948"];
    const ps = Array.from({ length: 90 }, () => ({ x: innerWidth / 2, y: innerHeight * .35, vx: (Math.random() - .5) * 13, vy: Math.random() * -11 - 3, r: Math.random() * 5 + 2, c: colors[Math.random() * colors.length | 0], a: Math.random() * Math.PI }));
    const t0 = performance.now();
    (function tick(now) {
      const dt = (now - t0) / 1600;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .32; p.a += .1; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = Math.max(0, 1 - dt); ctx.fillStyle = p.c; ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); ctx.restore(); });
      dt < 1 ? requestAnimationFrame(tick) : cv.remove();
    })(t0);
  }

  /* ============ study-streak heatmap ============ */
  function renderHeatmap() {
    const hm = document.getElementById("heatmap"); if (!hm) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(today); start.setDate(start.getDate() - start.getDay() - 13 * 7);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let html = "", idx = 0;
    for (const d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const n = activity[key] || 0;
      const lvl = n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n <= 4 ? 3 : 4;
      html += `<i class="hcell l${lvl}"${reduced ? "" : ` style="animation-delay:${idx * 5}ms"`} title="${n} topic${n === 1 ? "" : "s"} · ${days[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}"></i>`;
      idx++;
    }
    hm.innerHTML = html;
    const streak = calcStreak();
    $("#streaktext").textContent = streak ? `🔥 ${streak}-day streak, keep it alive` : "Study a topic to start a streak";
  }

  /* ============ card interactions ============ */
  document.querySelectorAll(".head").forEach(h => {
    const c = h.closest(".card");
    const go = () => { c.classList.toggle("open"); h.setAttribute("aria-expanded", c.classList.contains("open")); if (c.classList.contains("open")) store.set("study-last", c.id); };
    h.onclick = e => { if (!e.target.classList.contains("check") && !e.target.classList.contains("star")) go() };
    h.onkeydown = e => { if ((e.key === "Enter" || e.key === " ") && e.target === h) { e.preventDefault(); go() } };
  });
  document.querySelectorAll(".check").forEach(x => x.onchange = () => markStudied(x.dataset.id, x.checked));
  document.querySelectorAll(".star").forEach(b => b.onclick = () => {
    const id = b.dataset.id;
    starred.has(id) ? starred.delete(id) : starred.add(id);
    b.classList.toggle("on", starred.has(id)); b.setAttribute("aria-pressed", starred.has(id));
    store.set("study-starred", [...starred]); updateCounters(false);
  });
  document.querySelectorAll(".copy").forEach(b => b.onclick = async () => { await navigator.clipboard.writeText(b.nextElementSibling.innerText); b.textContent = "Copied"; setTimeout(() => b.textContent = "Copy", 1000) });
  document.querySelectorAll(".reveal").forEach(b => b.onclick = () => { const c = b.closest(".card"); c.classList.toggle("revealed"); b.textContent = c.classList.contains("revealed") ? "Hide answer" : "Reveal answer" });

  /* ============ filter ============ */
  const stateSel = $("#state"), diffSel = $("#diff"), ms = $("#msearch");
  function highlightTitle(card, qWords) {
    const t = byId.get(card.id).title, h2 = card.querySelector("h2");
    const w = qWords.find(w => norm(t).includes(w));
    if (!w) { h2.innerHTML = esc(t); return; }
    const i = norm(t).indexOf(w);
    h2.innerHTML = `${esc(t.slice(0, i))}<mark>${esc(t.slice(i, i + w.length))}</mark>${esc(t.slice(i + w.length))}`;
  }
  function filter() {
    const qWords = norm(ms.value).trim().split(/\s+/).filter(Boolean), sv = stateSel.value, dv = diffSel.value;
    let n = 0;
    document.querySelectorAll(".card").forEach(c => {
      const okQ = !qWords.length || qWords.every(w => searchIndex.get(c.id).includes(w));
      const okCat = !currentSet || currentSet.has(c.dataset.cat);
      const okState = sv === "all" || (sv === "studied" ? studied.has(c.id) : sv === "unstudied" ? !studied.has(c.id) : starred.has(c.id));
      const okDiff = dv === "all" || c.dataset.diff === dv;
      const show = okQ && okCat && okState && okDiff;
      c.hidden = !show;
      if (show) { n++; highlightTitle(c, qWords); }
    });
    $("#empty").style.display = n ? "none" : "block";
    $("#bcount").textContent = `${n} topic${n === 1 ? "" : "s"}`;
  }
  ms.oninput = () => { if (browse.hidden) showBrowse(null); else filter() };
  stateSel.onchange = filter; diffSel.onchange = filter;

  /* ============ toolbar ============ */
  $("#expand").onclick = () => document.querySelectorAll(".card:not([hidden])").forEach(c => { c.classList.add("open"); c.querySelector(".head").setAttribute("aria-expanded", "true") });
  $("#collapse").onclick = () => document.querySelectorAll(".card").forEach(c => { c.classList.remove("open"); c.querySelector(".head").setAttribute("aria-expanded", "false") });
  $("#quiz").onclick = e => { document.body.classList.toggle("quiz"); document.querySelectorAll(".card").forEach(c => c.classList.remove("revealed")); e.target.textContent = document.body.classList.contains("quiz") ? "Exit quiz mode" : "Quiz mode" };
  if (store.get("study-theme", "light") === "dark") { document.documentElement.dataset.theme = "dark"; $("#theme").textContent = "☀️" }
  /* crossfade rather than hard-cut: the class enables colour transitions on
     everything for the duration of the switch (see styles.css) */
  let themeFadeT = 0;
  $("#theme").onclick = () => {
    const root = document.documentElement, d = root.dataset.theme === "dark";
    if (!reduced) { root.classList.add("theme-fade"); clearTimeout(themeFadeT); themeFadeT = setTimeout(() => root.classList.remove("theme-fade"), 400); }
    root.dataset.theme = d ? "light" : "dark"; store.set("study-theme", d ? "light" : "dark"); $("#theme").textContent = d ? "🌙" : "☀️" };
  $("#print").onclick = () => { showBrowse(null); ms.value = ""; stateSel.value = "all"; filter(); setTimeout(() => window.print(), 60) };

  /* ============ track last-read topic ============ */
  let booted = false; setTimeout(() => booted = true, 1500);
  const observer = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && booted && !browse.hidden) store.set("study-last", e.target.id);
  }), { rootMargin: "-30% 0px -65% 0px" });
  document.querySelectorAll(".card").forEach(c => observer.observe(c));

  /* ============ reading progress bar ============ */
  const readbar = $("#readbar");
  addEventListener("scroll", () => { readbar.style.width = `${scrollY / (document.body.scrollHeight - innerHeight || 1) * 100}%` }, { passive: true });

  /* ============ jump to topic ============ */
  function jumpTo(id) {
    const card = document.getElementById(id); if (!card) return;
    if (browse.hidden) showBrowse(byId.get(id).category);
    if (card.hidden) { ms.value = ""; stateSel.value = "all"; showBrowse(null); }
    card.classList.add("open"); card.querySelector(".head").setAttribute("aria-expanded", "true");
    card.scrollIntoView({ block: "start" });
    card.classList.add("flash"); setTimeout(() => card.classList.remove("flash"), 1300);
    store.set("study-last", id);
  }

  /* ============ resume chip ============ */
  const lastId = store.get("study-last", null);
  if (lastId && byId.has(lastId)) {
    const chip = document.createElement("div"); chip.id = "resume";
    chip.innerHTML = `<button class="rgo">↩ Resume: ${esc(byId.get(lastId).title)}</button><button class="rx" aria-label="Dismiss">✕</button>`;
    document.body.appendChild(chip);
    chip.querySelector(".rgo").onclick = () => { jumpTo(lastId); chip.remove() };
    chip.querySelector(".rx").onclick = () => chip.remove();
  }

  /* ============ command palette ============ */
  const pal = document.createElement("div"); pal.id = "palette"; pal.hidden = true;
  pal.innerHTML = `<div class="pal" role="dialog" aria-modal="true" aria-label="Jump to topic"><input type="search" placeholder="Jump to a topic…"><div class="plist"></div></div>`;
  document.body.appendChild(pal);
  const pinput = pal.querySelector("input"), plist = pal.querySelector(".plist");
  let psel = 0, pmatches = [];
  const palNorm = s => s.toLowerCase().replace(/[–, ·-]/g, " ");
  function palScore(qWords, t) {
    const title = palNorm(t.title), cat = palNorm(t.category), all = title + " " + cat;
    if (!qWords.every(w => all.includes(w))) return -1;
    let s = 0;
    for (const w of qWords) { if (title.startsWith(w)) s += 3; else if (title.includes(w)) s += 2; else s += 1 }
    return s;
  }
  function palRender() {
    const q = palNorm(pinput.value).trim();
    const qWords = q.split(/\s+/).filter(Boolean);
    pmatches = !q ? topics.slice(0, 12) :
      topics.map(t => ({ t, s: palScore(qWords, t) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 12).map(x => x.t);
    psel = Math.min(psel, Math.max(0, pmatches.length - 1));
    plist.innerHTML = pmatches.map((t, i) => `<button class="prow${i === psel ? " sel" : ""}" data-id="${t.id}"><b>${num.get(t.id)}</b> ${esc(t.title)}<span>${esc(t.category)}</span></button>`).join("") || `<div class="pempty">No matches</div>`;
  }
  function palOpen() { pal.hidden = false; pinput.value = ""; psel = 0; palRender(); pinput.focus() }
  function palClose() { pal.hidden = true }
  pinput.oninput = () => { psel = 0; palRender() };
  pinput.onkeydown = e => {
    if (e.key === "ArrowDown") { e.preventDefault(); psel = Math.min(psel + 1, pmatches.length - 1); palRender() }
    else if (e.key === "ArrowUp") { e.preventDefault(); psel = Math.max(psel - 1, 0); palRender() }
    else if (e.key === "Enter" && pmatches[psel]) { palClose(); jumpTo(pmatches[psel].id) }
    else if (e.key === "Escape") palClose();
  };
  plist.onclick = e => { const r = e.target.closest(".prow"); if (r) { palClose(); jumpTo(r.dataset.id) } };
  pal.onclick = e => { if (e.target === pal) palClose() };
  $("#palbtn").onclick = palOpen;

  /* ============ flashcard mode ============ */
  const fc = document.createElement("div"); fc.id = "flashcards"; fc.hidden = true;
  fc.innerHTML = `<div class="fctop"><span class="fccount"></span><span class="fcspacer"></span><button class="btn fcshuffle">🔀 Shuffle</button><button class="btn fcexit">✕ Exit (esc)</button></div>
<div class="fccard" role="dialog" aria-modal="true"><div class="fcmeta"><span class="fccat"></span><span class="fcdiff"></span></div><h2 class="fctitle"></h2><p class="fcq"></p>
<div class="fcanswer" hidden><div class="box layman"><h3>💡 In layman terms</h3><p class="fclay"></p></div><div class="box"><h3>🧠 Technical answer</h3><div class="fctech"></div></div><div class="box memo"><h3>📌 Memory aid</h3><p class="fcmem"></p></div></div></div>
<div class="fcctl"><button class="btn primary fcreveal">Reveal (space)</button><span class="fcjudge" hidden><button class="btn fcagain">↻ Again (a)</button><button class="btn fcgot">✓ Got it (g)</button><button class="btn fcskip">Skip →</button></span></div>`;
  document.body.appendChild(fc);
  let deck = [], fcMissed = [], fcDone = 0, fcGot = 0;
  const $fc = s => fc.querySelector(s);
  function fcRender() {
    const t = deck[0];
    if (!t) {
      $fc(".fccat").textContent = ""; $fc(".fcdiff").innerHTML = ""; $fc(".fctitle").textContent = "Deck complete 🎉";
      $fc(".fcq").textContent = `${fcGot} got it · ${fcMissed.length} to revisit`;
      $fc(".fcanswer").hidden = true; $fc(".fcreveal").hidden = true;
      $fc(".fcjudge").hidden = false;
      $fc(".fcagain").textContent = fcMissed.length ? `↻ Review missed (${fcMissed.length})` : "↻ Restart deck";
      $fc(".fcgot").hidden = true; $fc(".fcskip").hidden = true;
      $fc(".fccount").textContent = "";
      return;
    }
    $fc(".fcgot").hidden = false; $fc(".fcskip").hidden = false; $fc(".fcreveal").hidden = false;
    $fc(".fccat").textContent = t.category; $fc(".fccat").style.setProperty("--hue", catHue.get(t.category));
    $fc(".fcdiff").innerHTML = diffBadge(t);
    $fc(".fctitle").textContent = t.title; $fc(".fcq").textContent = t.question;
    $fc(".fclay").textContent = t.layman; $fc(".fcmem").textContent = t.memory;
    $fc(".fctech").innerHTML = list(t.technical);
    $fc(".fcanswer").hidden = true; $fc(".fcjudge").hidden = true;
    $fc(".fcreveal").textContent = "Reveal (space)";
    $fc(".fccount").textContent = `${fcDone + 1} of ${fcDone + deck.length}${studied.has(t.id) ? " · studied" : ""}`;
  }
  function fcOpen() {
    deck = browse.hidden ? topics.slice() : topics.filter(t => !document.getElementById(t.id).hidden);
    if (!deck.length) deck = topics.slice();
    fcMissed = []; fcDone = 0; fcGot = 0;
    fc.hidden = false; document.body.style.overflow = "hidden"; fcRender();
  }
  function fcClose() { fc.hidden = true; document.body.style.overflow = "" }
  function fcReveal() { const a = $fc(".fcanswer"); a.hidden = !a.hidden; $fc(".fcjudge").hidden = a.hidden; $fc(".fcreveal").textContent = a.hidden ? "Reveal (space)" : "Hide (space)" }
  function fcNext() { deck.shift(); fcDone++; fcRender() }
  $fc(".fcexit").onclick = fcClose;
  $fc(".fcreveal").onclick = fcReveal;
  $fc(".fcskip").onclick = fcNext;
  $fc(".fcgot").onclick = () => { fcGot++; markStudied(deck[0].id, true); fcNext() };
  $fc(".fcagain").onclick = () => {
    if (!deck.length) { deck = fcMissed.length ? fcMissed.slice() : topics.slice(); fcMissed = []; fcDone = 0; fcGot = 0; fcRender(); return }
    const t = deck.shift(); deck.push(t); if (!fcMissed.includes(t)) fcMissed.push(t); fcRender();
  };
  $fc(".fcshuffle").onclick = () => { for (let i = deck.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[deck[i], deck[j]] = [deck[j], deck[i]] } fcRender(); toast("Deck shuffled") };
  $("#flash").onclick = fcOpen;
  $("#flash2").onclick = fcOpen;

  /* ============ keyboard shortcuts ============ */
  function visibleCards() { return [...document.querySelectorAll(".card:not([hidden])")] }
  function currentCardIndex(cs) {
    let best = 0;
    cs.forEach((c, i) => { if (c.getBoundingClientRect().top <= 100) best = i });
    return best;
  }
  addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.hidden ? palOpen() : palClose(); return }
    if (!fc.hidden) {
      if (e.key === "Escape") fcClose();
      else if (e.key === " ") { e.preventDefault(); fcReveal() }
      else if (e.key === "ArrowRight") fcNext();
      else if (e.key.toLowerCase() === "g" && deck.length) { fcGot++; markStudied(deck[0].id, true); fcNext() }
      else if (e.key.toLowerCase() === "a") $fc(".fcagain").click();
      return;
    }
    if (!pal.hidden) { if (e.key === "Escape") palClose(); return }
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) { if (e.key === "Escape") e.target.blur(); return }
    const k = e.key.toLowerCase();
    if (k === "/") { e.preventDefault(); ms.focus() }
    else if (k === "escape" && !browse.hidden) showDash();
    else if (k === "j" || k === "k") {
      if (browse.hidden) return;
      const cs = visibleCards(); if (!cs.length) return;
      const i = currentCardIndex(cs);
      const next = cs[Math.min(Math.max(i + (k === "j" ? 1 : -1), 0), cs.length - 1)];
      next.scrollIntoView({ block: "start" });
    }
    else if (k === "f") fcOpen();
    else if (k === "q" && !browse.hidden) $("#quiz").click();
    else if (k === "d") $("#theme").click();
    else if (k === "?") toast("Shortcuts: / search · j/k next/prev · f flashcards · q quiz · d dark · esc back · ⌘K jump");
  });

  /* ============ boot ============ */
  renderHeatmap(); showDash(); openFromHash();
}
