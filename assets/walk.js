/* Walkthroughs: a system drawn as an isometric scene that changes step by step.
   Each walk is data (data/walks/<lab>.js registers window.WALKS[<lab>]): a list of steps, and for
   each step the scene (the machines on the floor, the links between them, the packets flowing
   along the links), the numbers in the tiles, and the story beside the stage. This file draws
   the scene with the figure kit (assets/anatomy-kit.js), animates the packets, and runs the
   step controls. Nothing here fetches anything: every walk ships with the page. */
(function () {
"use strict";
const A = window.ANATOMY;
if (!A) return;
const U = 10, W = 760, H = 470;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const rm = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const CH = { problem: "Problem", technique: "Technique", solution: "Solution", tradeoff: "Trade-off", insight: "Insight", recap: "Recap" };
const CALL = { idea: "Key idea", warn: "Watch out", tip: "Good to know", next: "Coming up" };
const R = { block: 19, db: 17, device: 20, phone: 13, person: 7, queue: 14, crowd: 24, model: 19, zone: 0, panel: 0 };

/* ---------- screen-space bits ---------- */
function pill(x, y, text, { tone = "", name = false, anchor = "middle" } = {}) {
  const w = text.length * 6.4 + 16, h = 19;
  const left = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  return `<g class="wk-pill"${tone ? ` data-tone="${tone}"` : ""}${name ? " data-name" : ""}><rect x="${left.toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="9.5"/><text x="${(left + w / 2).toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle">${esc(text)}</text></g>`;
}
function arrowHead(p, q, style) {
  const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, s = 6.5;
  const bx = q[0] - ux * s, by = q[1] - uy * s;
  return `<path class="wk-head" data-style="${style}" d="M${q[0].toFixed(1)} ${q[1].toFixed(1)}L${(bx - uy * s * 0.5).toFixed(1)} ${(by + ux * s * 0.5).toFixed(1)}L${(bx + uy * s * 0.5).toFixed(1)} ${(by - ux * s * 0.5).toFixed(1)}Z"/>`;
}

/* ---------- the machines on the floor ---------- */
function hex(cx, cy, r) { const o = []; for (let i = 0; i < 6; i++) { const a = (30 + 60 * i) * Math.PI / 180; o.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return o; }
function glyphOn(cx, cy, z, P, text, size) {
  const c = A.iso([cx, cy, z], P);
  return `<text class="wk-glyph" x="${c[0].toFixed(1)}" y="${c[1].toFixed(1)}" font-size="${size}" text-anchor="middle" dominant-baseline="central">${esc(text)}</text>`;
}
function drawEntity(e, P) {
  const S = (p, o) => A.solidSvg(p, o), L = (d, o) => A.lineSvg(d, o);
  const cx = e.x * U, cy = e.y * U, s = e.s || 1;
  const [, vy] = A.towardViewer(P); const f = vy > 0 ? 1 : -1;
  let svg = "", top = 0;
  if (e.type === "block" || e.type === "model") {
    const r = 16 * s, h = (e.h || 19) * s;
    svg = S(A.extrude(hex(cx, cy, r), 0, h, P), { tone: "hi" }) + L(A.onTop(hex(cx, cy, r * 0.8), h, P, true), { tone: "faint" });
    if (e.glyph) svg += glyphOn(cx, cy, h, P, e.glyph, 9 * s);
    top = h;
  } else if (e.type === "db") {
    const r = 14 * s, h = (e.h || 20) * s;
    svg = S(A.cylinder(cx, cy, r, 0, h, P, 40, 0.6), { tone: "hi" });
    const ring = []; for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; ring.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    for (const k of [0.34, 0.67]) svg += L(A.ringSeam(ring, h * k, P), { tone: "lo" });
    if (e.glyph) svg += glyphOn(cx, cy, h, P, e.glyph, 8.5 * s);
    top = h;
  } else if (e.type === "device") {
    const w = 32 * s, d = 23 * s, lh = 19 * s;
    svg = S(A.slabOf({ x: cx - w / 2, y: cy - d / 2, w, d, r: 1.5 }, 0, 1.8 * s, P, 4, 0.5), { tone: "hi" });
    svg += L(A.planOutline({ x: cx - w / 2 + 3, y: cy - d / 2 + 4.5, w: w - 6, d: d - 7, r: 0.8 }, 1.8 * s, P, 2), { tone: "faint" });
    const ly = f > 0 ? cy - d / 2 : cy + d / 2 - 1.4 * s;
    svg += S(A.slabOf({ x: cx - w / 2 + 1, y: ly, w: w - 2, d: 1.4 * s, r: 0.4 }, 1.8 * s, lh, P, 2, 0.3), { tone: "mid" });
    const sy = f > 0 ? ly + 1.4 * s : ly - 0.5 * s;
    svg += `<g class="wk-ent" data-tint="${e.screen || "violet"}">${S(A.slabOf({ x: cx - w / 2 + 2.2, y: sy, w: w - 4.4, d: 0.5 * s, r: 0.2 }, 3.4 * s, lh - 3 * s, P, 2), { tone: "hi" })}</g>`;
    top = 1.8 * s + lh;
  } else if (e.type === "phone") {
    const w = 15 * s, d = 26 * s;
    svg = S(A.slabOf({ x: cx - w / 2, y: cy - d / 2, w, d, r: 1.6 }, 0, 1.8 * s, P, 3, 0.5), { tone: "hi" });
    svg += `<g class="wk-ent" data-tint="${e.screen || "violet"}">${S(A.slabOf({ x: cx - w / 2 + 1.2, y: cy - d / 2 + 2, w: w - 2.4, d: d - 4, r: 0.6 }, 1.8 * s, 0.5, P, 2), { tone: "hi" })}</g>`;
    top = 2.3 * s;
  } else if (e.type === "person") {
    svg = S(A.cylinder(cx, cy, 4.2 * s, 0, 10 * s, P, 24, 0.6), { tone: "hi" }) + S(A.cylinder(cx, cy, 3.2 * s, 10.8 * s, 5.2 * s, P, 20, 1.2), { tone: "hi" });
    top = 16 * s;
  } else if (e.type === "queue") {
    const n = e.n || 5, [dx, dy] = e.dir || [1, 0], g = 6.4 * s;
    const items = []; for (let i = 0; i < n; i++) items.push([cx + (i - (n - 1) / 2) * g * dx, cy + (i - (n - 1) / 2) * g * dy]);
    items.sort((a, b) => A.depthOf([a[0], a[1], 0], P) - A.depthOf([b[0], b[1], 0], P));
    const w = Math.abs(dx) ? 4.4 * s : 12 * s, d = Math.abs(dx) ? 12 * s : 4.4 * s;
    svg = S(A.slabOf({ x: cx - (n * g) / 2 * Math.abs(dx) - (Math.abs(dy) ? 8 * s : 2 * s), y: cy - (n * g) / 2 * Math.abs(dy) - (Math.abs(dx) ? 8 * s : 2 * s), w: Math.abs(dx) ? n * g + 4 * s : 16 * s, d: Math.abs(dy) ? n * g + 4 * s : 16 * s, r: 1.2 }, 0, 1.6, P, 3, 0.4), { tone: "mid" });
    for (const [ix, iy] of items) svg += S(A.slabOf({ x: ix - w / 2, y: iy - d / 2, w, d, r: 0.6 }, 1.6, 7.5 * s, P, 2, 0.4), { tone: "hi" });
    top = 9.5 * s;
  } else if (e.type === "crowd") {
    const spots = [[-10, -6], [10, -3], [0, 8], [-3, -14], [12, 9]].slice(0, e.n || 3).map(([a, b]) => [cx + a * s, cy + b * s]);
    spots.sort((a, b) => A.depthOf([a[0], a[1], 0], P) - A.depthOf([b[0], b[1], 0], P));
    for (const [px, py] of spots) svg += S(A.cylinder(px, py, 3.4 * s, 0, 8 * s, P, 20, 0.5), { tone: "hi" }) + S(A.cylinder(px, py, 2.6 * s, 8.7 * s, 4.2 * s, P, 16, 1), { tone: "hi" });
    top = 14 * s;
  }
  let halo = "";
  if (e.state === "hot") { const c = A.iso([cx, cy, 0], P); halo = `<ellipse class="wk-halo" cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="30" ry="15"/>`; }
  const tint = e.type === "device" || e.type === "phone" ? "" : (e.tint || (e.type === "db" ? "violet" : e.type === "model" ? "violet" : e.type === "person" || e.type === "crowd" ? "sand" : "blue"));
  return { svg: `<g class="wk-ent" data-id="${esc(e.id)}"${tint ? ` data-tint="${tint}"` : ""}${e.state ? ` data-state="${e.state}"` : ""}>${halo}${svg}</g>`, top };
}
function drawZone(e, P) {
  const plan = { x: e.x * U, y: e.y * U, w: e.w * U, d: e.d * U, r: 2 };
  return `<g class="wk-ent wk-zonewrap" data-id="${esc(e.id)}" data-tint="${e.tint || "slate"}"><path class="wk-zone-fill" d="${A.onTop(A.roundedPlan(plan, 3), 0.2, P, true)}"/><path class="wk-zone" d="${A.onTop(A.roundedPlan(plan, 3), 0.25, P, true)}"/></g>`;
}
function drawPanel(e, P) {
  const c = A.iso([e.x * U, e.y * U, 0], P), x = c[0] + (e.dx || 0), y = c[1] + (e.dy || 0);
  const lines = e.lines || [], w = Math.max(e.title ? e.title.length * 6.2 + 24 : 0, ...lines.map((l) => l.replace(/^[#=]\s*/, "").length * 6.1 + 24), 90), h = 14 + (e.title ? 16 : 0) + lines.length * 14;
  let o = `<g class="wk-panel"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="6"/>`;
  let ty = y + 15;
  if (e.title) { o += `<text class="wk-pt" x="${x + 10}" y="${ty}">${esc(e.title.toUpperCase())}</text>`; ty += 16; }
  for (const l of lines) { const m = /^([#=])\s*/.exec(l); o += `<text class="${m ? (m[1] === "#" ? "wk-pm" : "wk-pb") : ""}" x="${x + 10}" y="${ty}" xml:space="preserve">${esc(l.replace(/^[#=]\s*/, ""))}</text>`; ty += 14; }
  return `<g class="wk-ent" data-id="${esc(e.id)}">${o}</g></g>`;
}

/* ---------- a scene: entities, links, flows ---------- */
function anchor(ents, ref) {
  if (Array.isArray(ref)) {
    if (typeof ref[0] === "string") { const a = ents[ref[0]], b = ents[ref[1]]; return [a.x * U, b.y * U]; }
    return [ref[0] * U, ref[1] * U];
  }
  const e = ents[ref]; return [e.x * U, e.y * U];
}
function linkPoints(ents, k) {
  const pts = [anchor(ents, k.from), ...(k.via || []).map((v) => anchor(ents, v)), anchor(ents, k.to)];
  const shorten = (p, q, by) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; return [p[0] + dx / l * Math.min(by, l * 0.45), p[1] + dy / l * Math.min(by, l * 0.45)]; };
  const rf = typeof k.from === "string" ? (R[ents[k.from].type] || 10) * (ents[k.from].s || 1) : 0;
  const rt = typeof k.to === "string" ? (R[ents[k.to].type] || 10) * (ents[k.to].s || 1) : 0;
  pts[0] = shorten(pts[0], pts[1], rf); pts[pts.length - 1] = shorten(pts[pts.length - 1], pts[pts.length - 2], rt);
  return pts;
}
function along(pts, t) {
  const segs = []; let total = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); total += l; }
  let d = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) { const u = segs[i] ? d / segs[i] : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u]; } d -= segs[i]; }
  return pts[pts.length - 1];
}
function lengthOf(pts) { let t = 0; for (let i = 1; i < pts.length; i++) t += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return t; }

function normalise(walk) {
  let prev = null;
  walk.steps.forEach((st, i) => {
    let sc = st.scene;
    if (typeof sc === "function") sc = sc(prev ? JSON.parse(JSON.stringify(prev)) : { ents: {}, links: {}, flows: [] });
    if (!sc) sc = prev || { ents: {}, links: {}, flows: [] };
    sc = { ents: sc.ents || {}, links: sc.links || {}, flows: sc.flows || [] };
    for (const id in sc.ents) sc.ents[id] = Object.assign({ id }, sc.ents[id]);
    for (const id in sc.links) sc.links[id] = Object.assign({ id, heads: "end", style: "solid" }, sc.links[id]);
    st.scene = sc; st.i = i; prev = sc;
  });
  return walk;
}
function projectionFor(walk) {
  const pts = [];
  for (const st of walk.steps) for (const id in st.scene.ents) {
    const e = st.scene.ents[id], s = e.s || 1;
    if (e.type === "zone") { pts.push([e.x * U, e.y * U, 0], [(e.x + e.w) * U, (e.y + e.d) * U, 0], [e.x * U, (e.y + e.d) * U, 0], [(e.x + e.w) * U, e.y * U, 0]); continue; }
    if (e.type === "panel") continue;
    const r = (R[e.type] || 12) * s; for (const [a, b] of [[-r, -r], [r, -r], [r, r], [-r, r]]) pts.push([e.x * U + a, e.y * U + b, 0], [e.x * U + a, e.y * U + b, 24 * s]);
  }
  if (!pts.length) pts.push([-60, -60, 0], [60, 60, 0]);
  const v = walk.view || {};
  return A.fitProjection(pts, W, H, { pad: v.pad || 44, headroom: v.headroom || 34, azimuth: v.azimuth || 45, elevation: v.elevation || 30 });
}

/* ---------- the player ---------- */
function mount(root, walk) {
  normalise(walk);
  const P = projectionFor(walk);
  const n = walk.steps.length;
  const metricDefs = walk.metrics || [];
  root.innerHTML = `
<div class="wk-top"><div class="wk-metrics">${metricDefs.map((m) => `<div class="wk-tile" data-k="${esc(m.k)}"><small>${esc(m.label)}</small><b>–</b></div>`).join("")}</div>
<div class="wk-ctl"><button class="wk-btn wk-replay" type="button" title="Play this step's traffic again">↻ Replay</button><button class="wk-btn wk-pause" type="button" aria-pressed="false">❚❚ Pause</button></div></div>
<div class="wk-body"><div class="wk-stage"><div class="iso wk-iso"><svg class="wk-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label=""><g class="wk-floor"></g><g class="wk-links"></g><g class="wk-ents"></g><g class="wk-packets"></g><g class="wk-pills"></g></svg></div>
<div class="wk-legend">${(walk.legend || []).map((l) => `<span><i data-kind="${esc(l.kind)}"></i>${esc(l.label)}</span>`).join("")}</div></div>
<aside class="wk-aside"><div class="wk-stephead"><span class="wk-n"></span><span class="wk-chip"></span></div><h3 class="wk-title"></h3><div class="wk-text" aria-live="polite"></div><div class="wk-callout" hidden></div><div class="wk-changes" hidden></div>
<div class="wk-nav"><button class="wk-btn wk-back" type="button">← Back</button><button class="wk-btn primary wk-next" type="button"><span></span><span>→</span></button></div>
<div class="wk-keys"><kbd>←</kbd><kbd>→</kbd> step · <kbd>R</kbd> replay · <kbd>Space</kbd> pause</div>
${walk.goals && walk.goals.length ? `<div class="wk-goals"><small>You'll learn</small><ul>${walk.goals.map((g) => `<li data-step="${g.step}"><i></i><span>${g.text}</span></li>`).join("")}</ul></div>` : ""}</aside></div>
<div class="wk-strip"><div class="wk-striph"><span>In this walk</span><span class="wk-stripn"></span></div><ol>${walk.steps.map((s, i) => `<li><button type="button" data-go="${i}"><i>${i + 1}</i><span>${esc(s.short || "")}</span></button></li>`).join("")}</ol></div>`;
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const svg = $(".wk-svg"), gFloor = $(".wk-floor"), gLinks = $(".wk-links"), gEnts = $(".wk-ents"), gPk = $(".wk-packets"), gPills = $(".wk-pills");
  /* the floor grid, once */
  { const xs = [], ys = [];
    for (const st of walk.steps) for (const id in st.scene.ents) { const e = st.scene.ents[id]; xs.push(e.x, e.type === "zone" ? e.x + e.w : e.x); ys.push(e.y, e.type === "zone" ? e.y + e.d : e.y); }
    const x0 = Math.floor(Math.min(...xs) - 4), x1 = Math.ceil(Math.max(...xs) + 4), y0 = Math.floor(Math.min(...ys) - 4), y1 = Math.ceil(Math.max(...ys) + 4);
    let d = ""; for (let i = x0; i <= x1; i++) d += A.onTop([[i * U, y0 * U], [i * U, y1 * U]], 0, P); for (let j = y0; j <= y1; j++) d += A.onTop([[x0 * U, j * U], [x1 * U, j * U]], 0, P);
    gFloor.innerHTML = `<path d="${d}" fill="none" stroke-width=".7" stroke-dasharray="1 3"/>`; }

  let cur = -1, paused = false, inView = true, raf = 0, last = 0, routes = [], packets = [], clock = 0;
  const lastMetrics = {};
  function renderScene(st, prevSt) {
    const sc = st.scene, prevEnts = prevSt ? prevSt.scene.ents : {};
    /* links first, on the floor */
    let lk = "";
    for (const id in sc.links) {
      const k = sc.links[id], pts = linkPoints(sc.ents, k).map((p) => A.iso([p[0], p[1], 0.6], P));
      lk += `<path class="wk-link" data-style="${k.style}" d="M${pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L")}"/>`;
      if (k.heads === "end" || k.heads === "both") lk += arrowHead(pts[pts.length - 2], pts[pts.length - 1], k.style);
      if (k.heads === "both" || k.heads === "start") lk += arrowHead(pts[1], pts[0], k.style);
    }
    gLinks.innerHTML = lk;
    /* entities, back to front, keyed so new ones can arrive and old ones leave */
    const order = Object.values(sc.ents).map((e) => ({ e, d: e.type === "zone" ? -1e9 : A.depthOf([e.x * U, e.y * U, 0], P) + (e.type === "panel" ? 1e8 : 0) })).sort((a, b) => a.d - b.d);
    const keep = new Set();
    let pills = "", ents = "", fresh = [];
    for (const { e } of order) {
      keep.add(e.id);
      let drawn, top = 0;
      if (e.type === "zone") drawn = drawZone(e, P); else if (e.type === "panel") drawn = drawPanel(e, P); else { const r = drawEntity(e, P); drawn = r.svg; top = r.top; }
      ents += drawn;
      if (!prevEnts[e.id] && prevSt) fresh.push(e.id);
      /* name below, tags above */
      if (e.type === "zone") {
        if (!e.label) continue;
        const at = e.labelAt || "front", corner = at === "back" ? [e.x, e.y] : at === "left" ? [e.x, e.y + e.d] : at === "right" ? [e.x + e.w, e.y] : [e.x + e.w, e.y + e.d];
        const c = A.iso([corner[0] * U, corner[1] * U, 0.3], P);
        pills += `<g class="wk-pillset" data-id="${esc(e.id)}">${pill(c[0], c[1] + (at === "back" ? -12 : 12), e.label, { tone: "muted", anchor: at === "left" ? "end" : at === "right" ? "start" : "middle" })}</g>`; continue; }
      if (e.type === "panel") continue;
      const base = A.iso([e.x * U, e.y * U, 0], P), peak = A.iso([e.x * U, e.y * U, top], P);
      const r = (R[e.type] || 12) * (e.s || 1);
      let ps = "";
      if (e.label) ps += pill(base[0], base[1] + r * P.scale * 0.95 + 13, e.label, { name: true });
      (e.tags || []).forEach((t, i) => { const tg = typeof t === "string" ? { text: t } : t; ps += pill(peak[0] + (tg.dx || 0), peak[1] - 16 - i * 22 + (tg.dy || 0), tg.text, { tone: tg.tone || "" }); });
      if (ps) pills += `<g class="wk-pillset" data-id="${esc(e.id)}">${ps}</g>`;
    }
    /* the old ones leave gently: keep a fading copy of each one that is gone */
    const leaving = [...gEnts.children].filter((g) => !keep.has(g.dataset.id)).map((g) => g.outerHTML.replace("wk-ent", "wk-ent wk-out"));
    gEnts.innerHTML = ents + leaving.join("");
    for (const g of [...gEnts.children]) { if (fresh.includes(g.dataset.id)) g.classList.add("wk-in"); if (g.classList.contains("wk-out")) setTimeout(() => g.remove(), 380); }
    gPills.innerHTML = pills;
    /* link labels on top of everything */
    let ll = "";
    for (const id in sc.links) { const k = sc.links[id]; if (!k.label) continue; const pts = linkPoints(sc.ents, k), p = along(pts, k.labelAt ?? 0.5), c = A.iso([p[0], p[1], 0.6], P); ll += pill(c[0], c[1] - 13, k.label, { tone: k.labelTone || "muted" }); }
    gPills.insertAdjacentHTML("beforeend", ll);
    /* flows */
    routes = sc.flows.map((f) => { const pts = []; for (const lid of f.route) { const k = sc.links[lid]; if (!k) continue; const lp = linkPoints(sc.ents, k); if (pts.length && f.route.length > 1) lp.shift(); pts.push(...(f.reverse ? lp.reverse() : lp)); } return { f, pts, len: lengthOf(pts), next: 0.15 + Math.random() * 0.3 }; });
    packets = []; gPk.innerHTML = "";
    if (rm()) staticPackets();
  }
  function staticPackets() {
    let o = "";
    for (const r of routes) for (const t of [0.3, 0.7]) { const p = along(r.pts, t), c = A.iso([p[0], p[1], 3], P); o += packetSvg(r.f.kind || "req", c); }
    gPk.innerHTML = o;
  }
  function packetSvg(kind, c, x) {
    if (x) return `<g transform="translate(${c[0].toFixed(1)} ${c[1].toFixed(1)})"><circle class="wk-x" r="6"/><path class="wk-x" d="M-3 -3L3 3M3 -3L-3 3"/></g>`;
    const r = kind === "heavy" ? 7 : 5;
    if (kind === "bad" || kind === "slow") return `<rect class="wk-pk" data-kind="${kind}" x="${(c[0] - r).toFixed(1)}" y="${(c[1] - r).toFixed(1)}" width="${r * 2}" height="${r * 2}" rx="1.5"/>`;
    return `<circle class="wk-pk" data-kind="${kind}" cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${r}"/>`;
  }
  function tick(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now; clock += dt;
    let o = "";
    for (const r of routes) {
      const f = r.f, speed = f.speed || 55, rate = f.rate ?? 0.6;
      r.next -= dt;
      if (r.next <= 0 && packets.filter((p) => p.r === r).length < (f.max || 6)) { r.next = rate > 0 ? 1 / rate : 1e9; packets.push({ r, d: 0, back: false, dead: 0 }); }
    }
    packets = packets.filter((p) => {
      const f = p.r.f, speed = f.speed || 55;
      if (p.dead) { p.dead -= dt; return p.dead > 0; }
      p.d += speed * dt * (p.back ? -1 : 1);
      if (f.fail != null && !p.back && p.d >= f.fail * p.r.len) { p.d = f.fail * p.r.len; p.dead = 0.9; return true; }
      if (p.d >= p.r.len) { if (f.bounce) { p.back = true; p.d = p.r.len; } else return false; }
      if (p.back && p.d <= 0) return false;
      return true;
    });
    for (const p of packets) { const w = along(p.r.pts, p.d / (p.r.len || 1)), c = A.iso([w[0], w[1], 3], P); o += p.dead ? packetSvg("bad", c, true) : packetSvg(p.back ? (p.r.f.back || "res") : (p.r.f.kind || "req"), c); }
    gPk.innerHTML = o;
    if (inView && !paused && !rm() && routes.length) raf = requestAnimationFrame(tick);
  }
  function play() { if (!raf && inView && !paused && !rm() && routes.length) { last = 0; raf = requestAnimationFrame(tick); } }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

  function go(i, fromUser) {
    i = Math.max(0, Math.min(n - 1, i));
    const st = walk.steps[i], prevSt = cur >= 0 ? walk.steps[cur] : null;
    cur = i;
    renderScene(st, prevSt);
    /* the story */
    $(".wk-n").textContent = `STEP ${i + 1} / ${n}`;
    const chip = $(".wk-chip"); chip.textContent = CH[st.chapter] || st.chapter || ""; chip.dataset.ch = st.chapter || "";
    $(".wk-title").textContent = st.title || "";
    const text = $(".wk-text");
    if (st.chapter === "recap" && Array.isArray(st.recap)) text.innerHTML = `<ul class="wk-recap">${st.recap.map((r) => `<li>${r}</li>`).join("")}</ul>` + (st.body || []).map((b) => `<p>${b}</p>`).join("");
    else text.innerHTML = (st.body || []).map((b) => `<p>${b}</p>`).join("");
    const co = $(".wk-callout"); if (st.callout) { co.hidden = false; co.dataset.kind = st.callout.kind || "idea"; co.innerHTML = `<small>${CALL[st.callout.kind] || "Note"}</small>${st.callout.text}`; } else co.hidden = true;
    const ch = $(".wk-changes"); if (st.changes && st.changes.length) { ch.hidden = false; ch.innerHTML = `<small>What changed</small>` + st.changes.map((c) => { const m = /^([+\-~])\s*/.exec(c); return `<div data-op="${m ? m[1] : "~"}">${esc(c.replace(/^[+\-~]\s*/, ""))}</div>`; }).join(""); } else ch.hidden = true;
    /* tiles */
    const mv = st.metrics || {};
    $$(".wk-tile").forEach((t) => { const k = t.dataset.k, v = mv[k], val = v && typeof v === "object" ? v.v : v, tone = v && typeof v === "object" ? v.tone : ""; const b = t.querySelector("b"); const txt = val == null ? "–" : String(val); if (b.textContent !== txt) { b.textContent = txt; t.classList.remove("wk-bump"); void t.offsetWidth; t.classList.add("wk-bump"); } t.dataset.tone = tone || ""; });
    /* goals, strip, nav */
    $$(".wk-goals li").forEach((li) => li.toggleAttribute("data-done", i + 1 >= +li.dataset.step));
    $$(".wk-strip li").forEach((li, j) => { li.toggleAttribute("data-done", j < i); li.toggleAttribute("data-on", j === i); });
    $(".wk-stripn").textContent = `Step ${i + 1} of ${n}`;
    $(".wk-back").disabled = i === 0;
    const nx = $(".wk-next"); nx.disabled = i === n - 1; nx.firstElementChild.textContent = i === n - 1 ? "Done" : `Next: ${walk.steps[i + 1].short || ""}`;
    svg.setAttribute("aria-label", `${walk.title}: step ${i + 1}, ${st.title}`);
    if (fromUser) { const on = $(".wk-strip li[data-on]"); if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest", inline: "nearest" }); }
    play();
  }
  root.addEventListener("click", (ev) => {
    const b = ev.target.closest("button"); if (!b) return;
    if (b.dataset.go != null) go(+b.dataset.go, true);
    else if (b.classList.contains("wk-next")) go(cur + 1, true);
    else if (b.classList.contains("wk-back")) go(cur - 1, true);
    else if (b.classList.contains("wk-replay")) { const st = walk.steps[cur]; renderScene(st, null); play(); }
    else if (b.classList.contains("wk-pause")) { paused = !paused; b.setAttribute("aria-pressed", String(paused)); b.textContent = paused ? "▶ Play" : "❚❚ Pause"; if (paused) stop(); else play(); }
  });
  root.addEventListener("keydown", (ev) => {
    if (ev.target !== root && ev.target.tagName === "BUTTON" && (ev.key === " " || ev.key === "Enter")) return;
    if (ev.key === "ArrowRight") { go(cur + 1, true); ev.preventDefault(); }
    else if (ev.key === "ArrowLeft") { go(cur - 1, true); ev.preventDefault(); }
    else if (ev.key === "r" || ev.key === "R") { $(".wk-replay").click(); ev.preventDefault(); }
    else if (ev.key === " ") { $(".wk-pause").click(); ev.preventDefault(); }
  });
  if ("IntersectionObserver" in window) new IntersectionObserver((es) => { inView = es.some((e) => e.isIntersecting); if (inView) play(); else stop(); }, { threshold: 0.05 }).observe(root);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else play(); });
  go(0, false);
}

function boot() {
  const reg = window.WALKS || {};
  document.querySelectorAll("[data-walk]").forEach((root) => { const w = reg[root.dataset.walk]; if (w && !root.dataset.mounted) { root.dataset.mounted = "1"; try { mount(root, w); } catch (e) { console.error("walk " + root.dataset.walk, e); } } });
}
/* deferred scripts run before DOMContentLoaded in file order, so boot now, and again once the data file has run */
boot(); document.addEventListener("DOMContentLoaded", boot); window.addEventListener("load", boot);
window.WALK = { boot };
})();
