/* ============ category illusions ============
   One optical illusion per topic category, drawn as inline SVG at render
   time, so there is nothing to fetch and the picture takes the category's
   family colour in either theme. Each illusion is chosen for the idea the
   category teaches, and the caption says why in plain words. The dashboard
   tiles carry the small version; the browse view shows it large with the
   caption. Colours come from CSS variables set on the container: --ink,
   --paper, --mid, --acc and --acc2. */
(function () {
  "use strict";
  const INK = "var(--ink)", PAPER = "var(--paper)", MID = "var(--mid)", ACC = "var(--acc)", ACC2 = "var(--acc2)";
  const W = 160, H = 110, CX = 80, CY = 55;
  const f2 = n => Math.round(n * 100) / 100;
  const pts = a => a.map(p => f2(p[0]) + "," + f2(p[1])).join(" ");
  const poly = (a, fill, extra) => `<polygon points="${pts(a)}" fill="${fill}"${extra || ""}/>`;
  const line = (x1, y1, x2, y2, col, w, extra) => `<line x1="${f2(x1)}" y1="${f2(y1)}" x2="${f2(x2)}" y2="${f2(y2)}" stroke="${col || INK}" stroke-width="${w || 1.4}"${extra || ""}/>`;
  const circ = (cx, cy, r, fill, extra) => `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(r)}" fill="${fill}"${extra || ""}/>`;
  const rect = (x, y, w, h, fill, extra) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${fill}"${extra || ""}/>`;
  const rad = d => d * Math.PI / 180;
  const pol = (cx, cy, r, deg) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];
  /* intersection of the line through a,b with the line through c,d */
  function X(a, b, c, d) {
    const den = (a[0] - b[0]) * (c[1] - d[1]) - (a[1] - b[1]) * (c[0] - d[0]);
    const t = ((a[0] - c[0]) * (c[1] - d[1]) - (a[1] - c[1]) * (c[0] - d[0])) / den;
    return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
  }
  /* a sector of a ring between two radii, from angle a to angle b (degrees) */
  function sector(cx, cy, r1, r2, a, b, fill, extra) {
    const p1 = pol(cx, cy, r2, a), p2 = pol(cx, cy, r2, b), p3 = pol(cx, cy, r1, b), p4 = pol(cx, cy, r1, a), big = b - a > 180 ? 1 : 0;
    return `<path d="M${f2(p1[0])} ${f2(p1[1])} A${r2} ${r2} 0 ${big} 1 ${f2(p2[0])} ${f2(p2[1])} L${f2(p3[0])} ${f2(p3[1])} A${r1} ${r1} 0 ${big} 0 ${f2(p4[0])} ${f2(p4[1])} Z" fill="${fill}"${extra || ""}/>`;
  }
  /* a circle with a wedge missing, the mouth pointing at angle `at` */
  function pacman(cx, cy, r, at, open, fill) {
    const a = pol(cx, cy, r, at + open / 2), b = pol(cx, cy, r, at - open / 2);
    return `<path d="M${f2(cx)} ${f2(cy)} L${f2(a[0])} ${f2(a[1])} A${r} ${r} 0 1 1 ${f2(b[0])} ${f2(b[1])} Z" fill="${fill}"/>`;
  }
  const shades = [ACC, ACC2, MID, INK, ACC];

  /* ---- impossible figures ---- */
  /* a Penrose polygon: n bars that each pass in front of the next, all the way round */
  function penrose(n, r, w, rot) {
    const V = []; for (let i = 0; i < n; i++) V.push(pol(CX, CY + (n === 3 ? 8 : 0), r, rot + i * 360 / n));
    const cxm = V.reduce((s, p) => s + p[0], 0) / n, cym = V.reduce((s, p) => s + p[1], 0) / n;
    const inner = V.map((p, i) => { const q = V[(i + 1) % n]; const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy); let nx = -dy / L, ny = dx / L; const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; if ((cxm - mx) * nx + (cym - my) * ny < 0) { nx = -nx; ny = -ny; } return [[p[0] + nx * w, p[1] + ny * w], [q[0] + nx * w, q[1] + ny * w]]; });
    let s = "";
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, k = (i + n - 1) % n;
      const A = X(V[i], V[j], inner[j][0], inner[j][1]);
      const Hj = X(inner[i][0], inner[i][1], inner[j][0], inner[j][1]);
      const Y = X(V[k], V[i], inner[i][0], inner[i][1]);
      s += poly([V[i], A, Hj, Y], shades[i % shades.length], ` stroke="${PAPER}" stroke-width="1"`);
    }
    return s;
  }
  /* a Penrose triangle built from little cubes, the way it was first drawn */
  function cubeTriangle() {
    const cube = (x, y, s) => { const h = s * 0.5, v = s * 0.87; return poly([[x, y - s], [x + v, y - h], [x, y], [x - v, y - h]], ACC2) + poly([[x - v, y - h], [x, y], [x, y + s], [x - v, y + h]], ACC) + poly([[x, y], [x + v, y - h], [x + v, y + h], [x, y + s]], MID); };
    const V = [[80, 16], [136, 88], [24, 88]]; let out = "";
    for (let k = 0; k < 3; k++) { const a = V[k], b = V[(k + 1) % 3]; for (let i = 0; i < 3; i++) { const t = i / 3; out += cube(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 9); } }
    return out;
  }
  function impossibleCube() {
    const f = [50, 34, 108, 92], b = [76, 16, 134, 74];
    const bar = (x1, y1, x2, y2) => line(x1, y1, x2, y2, PAPER, 9) + line(x1, y1, x2, y2, INK, 5);
    let s = "";
    s += bar(b[0], b[1], b[2], b[1]) + bar(b[2], b[1], b[2], b[3]) + bar(b[0], b[1], b[0], b[3]) + bar(b[0], b[3], b[2], b[3]);
    s += bar(f[0], f[1], b[0], b[1]) + bar(f[2], f[1], b[2], b[1]) + bar(f[0], f[3], b[0], b[3]) + bar(f[2], f[3], b[2], b[3]);
    s += bar(f[0], f[1], f[2], f[1]) + bar(f[0], f[1], f[0], f[3]) + bar(f[0], f[3], f[2], f[3]) + bar(f[2], f[1], f[2], f[3]);
    /* the one crossing drawn the wrong way round: the back edge passes in front of the front edge */
    s += bar(b[0], b[3], b[2], b[3]);
    return s;
  }
  function neckerCube() {
    const f = [46, 34, 104, 92], b = [70, 16, 128, 74], w = 1.8;
    let s = "";
    s += line(b[0], b[1], b[2], b[1], INK, w) + line(b[2], b[1], b[2], b[3], INK, w) + line(b[0], b[1], b[0], b[3], INK, w) + line(b[0], b[3], b[2], b[3], INK, w);
    s += line(f[0], f[1], b[0], b[1], INK, w) + line(f[2], f[1], b[2], b[1], INK, w) + line(f[0], f[3], b[0], b[3], INK, w) + line(f[2], f[3], b[2], b[3], INK, w);
    s += line(f[0], f[1], f[2], f[1], INK, w) + line(f[0], f[1], f[0], f[3], INK, w) + line(f[0], f[3], f[2], f[3], INK, w) + line(f[2], f[1], f[2], f[3], INK, w);
    s += circ(f[0], f[3], 3, ACC) + circ(b[2], b[1], 3, ACC2);
    return s;
  }
  function schroeder() {
    const a = [[22, 92]]; let x = 22, y = 92;
    for (let i = 0; i < 6; i++) { x += 17; a.push([x, y]); y -= 11; a.push([x, y]); }
    const b = a.map(p => [p[0] + 24, p[1] - 10]);
    let s = poly([...a, b[b.length - 1], b[0]], ACC2, ` opacity=".35"`);
    s += `<polyline points="${pts(a)}" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
    s += `<polyline points="${pts(b)}" fill="none" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round" opacity=".7"/>`;
    for (let i = 0; i < a.length; i += 2) s += line(a[i][0], a[i][1], b[i][0], b[i][1], INK, 1.2);
    s += line(a[a.length - 1][0], a[a.length - 1][1], b[b.length - 1][0], b[b.length - 1][1], INK, 1.2);
    return s;
  }
  function blivet() {
    const ys = [28, 40, 50, 62, 72, 84], x0 = 30, x1 = 128, w = 1.8;
    let s = "";
    [[0, 1], [2, 3], [4, 5]].forEach(([i, j]) => { const r = (ys[j] - ys[i]) / 2; s += `<path d="M${x0} ${ys[i]} A${r} ${r} 0 0 0 ${x0} ${ys[j]}" fill="none" stroke="${INK}" stroke-width="${w}"/>`; });
    s += line(x0, ys[0], x1, ys[0], INK, w) + line(x0, ys[2], x1, ys[2], INK, w) + line(x0, ys[3], x1, ys[3], INK, w) + line(x0, ys[5], x1, ys[5], INK, w);
    s += line(x0, ys[1], 104, ys[1], INK, w) + line(x0, ys[4], 104, ys[4], INK, w);
    s += line(104, ys[1], 104, ys[4], INK, w);
    s += line(x1, ys[0], x1, ys[2], INK, w) + line(x1, ys[3], x1, ys[5], INK, w);
    s += line(x1, ys[0], 140, 20, INK, w) + line(x1, ys[2], 140, 42, INK, w) + line(140, 20, 140, 42, INK, w) + line(x1, ys[3], 140, 54, INK, w) + line(x1, ys[5], 140, 76, INK, w) + line(140, 54, 140, 76, INK, w);
    return s;
  }
  /* ---- shapes that are not there ---- */
  function kanizsa(shape) {
    if (shape === "triangle") {
      const r = 14, V = [pol(CX, CY + 6, 40, -90), pol(CX, CY + 6, 40, 30), pol(CX, CY + 6, 40, 150)];
      let s = "";
      V.forEach((p, i) => { const at = Math.atan2(CY + 6 - p[1], CX - p[0]) * 180 / Math.PI; s += pacman(p[0], p[1], r, at, 60, INK); });
      const U = [pol(CX, CY + 6, 30, 90), pol(CX, CY + 6, 30, 210), pol(CX, CY + 6, 30, 330)];
      for (let i = 0; i < 3; i++) { const a = U[i], b = U[(i + 1) % 3]; const m1 = [a[0] + (b[0] - a[0]) * 0.22, a[1] + (b[1] - a[1]) * 0.22], m2 = [a[0] + (b[0] - a[0]) * 0.78, a[1] + (b[1] - a[1]) * 0.78]; s += line(a[0], a[1], m1[0], m1[1], INK, 1.3) + line(m2[0], m2[1], b[0], b[1], INK, 1.3); }
      return s;
    }
    const r = 13, h = 26, c = [[CX - h, CY - h], [CX + h, CY - h], [CX + h, CY + h], [CX - h, CY + h]];
    let s = ""; c.forEach(p => { const at = Math.atan2(CY - p[1], CX - p[0]) * 180 / Math.PI; s += pacman(p[0], p[1], r, at, 90, INK); });
    return s;
  }
  function neon(uid) {
    let s = `<clipPath id="${uid}c"><circle cx="${CX}" cy="${CY}" r="24"/></clipPath>`;
    const grid = col => { let g = ""; for (let x = 16; x <= 144; x += 16) g += line(x, 8, x, 102, col, 1.3); for (let y = 11; y <= 99; y += 11) g += line(8, y, 152, y, col, 1.3); return g; };
    s += grid(INK) + `<g clip-path="url(#${uid}c)">${grid(ACC).replace(/stroke-width="1.3"/g, 'stroke-width="2.2"')}</g>`;
    return s;
  }
  function ehrenstein() {
    let s = ""; for (let a = 0; a < 360; a += 22.5) { const p = pol(CX, CY, 15, a), q = pol(CX, CY, 48, a); s += line(p[0], p[1], q[0], q[1], INK, 1.6); }
    return s;
  }
  /* ---- grids ---- */
  function hermann(scint) {
    let s = "";
    if (scint) { s += rect(8, 6, 144, 98, INK); for (let x = 20; x <= 140; x += 24) s += line(x, 6, x, 104, MID, 4); for (let y = 16; y <= 94; y += 20) s += line(8, y, 152, y, MID, 4); for (let x = 20; x <= 140; x += 24) for (let y = 16; y <= 94; y += 20) s += circ(x, y, 2.6, PAPER); return s; }
    for (let x = 8; x < 152; x += 24) for (let y = 6; y < 104; y += 20) s += rect(x, y, 19, 15, INK);
    return s;
  }
  function cafeWall() {
    let s = rect(0, 10, W, 90, MID); const t = 20;
    for (let r = 0; r < 6; r++) { const off = (r % 4 === 0 ? 0 : r % 4 === 1 ? 7 : r % 4 === 2 ? 14 : 7); for (let c = -1; c < 9; c++) s += rect(c * t + off, 10 + r * 15, t, 13.5, (c + r) % 2 ? INK : PAPER); }
    for (let r = 0; r <= 6; r++) s += line(0, 10 + r * 15 - 0.75, W, 10 + r * 15 - 0.75, MID, 1.5);
    return s;
  }
  function bulge() {
    let s = ""; const t = 16, sq = 4.5;
    for (let c = 0; c < 10; c++) for (let r = 0; r < 7; r++) {
      const x = c * t, y = r * t - 1, dark = (c + r) % 2 === 1;
      s += rect(x, y, t, t, dark ? INK : PAPER);
      const mx = x + t / 2 - CX, my = y + t / 2 - CY, d = Math.hypot(mx, my); if (d > 52) continue;
      const cx = mx > 0 ? x : x + t - sq, cy = my > 0 ? y : y + t - sq;
      s += rect(cx, cy, sq, sq, dark ? PAPER : INK);
    }
    return s;
  }
  function ouchi(uid) {
    const tile = (vert) => { let g = ""; for (let i = 0; i < 24; i++) for (let j = 0; j < 24; j++) { const x = i * (vert ? 5 : 14) - 10, y = j * (vert ? 14 : 5) - 10; g += rect(x, y, vert ? 5 : 14, vert ? 14 : 5, (i + j) % 2 ? INK : PAPER); } return g; };
    return `<clipPath id="${uid}o"><circle cx="${CX}" cy="${CY}" r="26"/></clipPath>` + tile(false) + `<g clip-path="url(#${uid}o)">${tile(true)}</g>`;
  }
  function moire(uid) {
    let a = "", b = "";
    for (let x = -40; x < 200; x += 5) { a += line(x, 0, x, H, INK, 1.2); b += line(x, 0, x, H, INK, 1.2, ` transform="rotate(7 ${CX} ${CY})"`); }
    return `<clipPath id="${uid}m"><circle cx="${CX}" cy="${CY}" r="48"/></clipPath><g clip-path="url(#${uid}m)">${a}${b}</g>`;
  }
  /* ---- lines that look bent or tilted ---- */
  function zollner() {
    let s = "";
    for (let i = 0; i < 4; i++) { const y = 24 + i * 20, flip = i % 2 ? 1 : -1; s += line(14, y + 12, 146, y - 12, INK, 1.6); for (let x = 20; x < 146; x += 11) { const yy = y + 12 - (x - 14) * 24 / 132; s += line(x - 5 * flip, yy - 5, x + 5 * flip, yy + 5, INK, 1.1); } }
    return s;
  }
  function twistedCord() {
    let s = ""; for (let c = 0; c < 12; c++) for (let r = 0; r < 8; r++) s += rect(c * 14 - 4, r * 14 - 2, 14, 14, (c + r) % 2 ? MID : PAPER, ` opacity=".35"`);
    for (let i = 0; i < 4; i++) { const y = 20 + i * 24, tilt = i % 2 ? 4 : -4; for (let x = 12; x < 150; x += 12) s += line(x - 4, y - tilt, x + 4, y + tilt, (Math.round(x / 12) % 2) ? INK : ACC, 3.2); }
    return s;
  }
  function hering(wundt) {
    let s = "";
    if (!wundt) { for (let a = 0; a < 360; a += 12) { const q = pol(CX, CY, 90, a); s += line(CX, CY, q[0], q[1], MID, 0.9); } }
    else { for (let a = -70; a <= 70; a += 10) { const q = pol(6, CY, 150, a), p = pol(154, CY, 150, 180 - a); s += line(6, CY, q[0], q[1], MID, 0.9) + line(154, CY, p[0], p[1], MID, 0.9); } }
    s += line(58, 6, 58, 104, ACC, 2.6) + line(102, 6, 102, 104, ACC, 2.6);
    return s;
  }
  function orbison() {
    let s = ""; for (let r = 8; r <= 76; r += 9) s += circ(CX, CY, r, "none", ` stroke="${MID}" stroke-width="1"`);
    s += rect(60, 36, 44, 44, "none", ` stroke="${ACC}" stroke-width="2.6"`);
    return s;
  }
  function poggendorff() {
    return rect(66, 6, 30, 98, ACC2, ` opacity=".9"`) + line(10, 90, 66, 36, INK, 2) + line(96, 36, 150, -16, INK, 2, ` stroke-dasharray="3 3" opacity=".45"`) + line(96, 52, 150, 0, INK, 2);
  }
  /* ---- size and length ---- */
  function mullerLyer() {
    let s = line(40, 36, 120, 36, ACC, 2.4) + line(40, 76, 120, 76, ACC, 2.4);
    [[40, 36, -1], [120, 36, 1]].forEach(([x, y, d]) => { s += line(x, y, x + 12 * d, y - 10, INK, 2) + line(x, y, x + 12 * d, y + 10, INK, 2); });
    [[40, 76, 1], [120, 76, -1]].forEach(([x, y, d]) => { s += line(x, y, x + 12 * d, y - 10, INK, 2) + line(x, y, x + 12 * d, y + 10, INK, 2); });
    return s;
  }
  function verticalHorizontal() { return line(44, 86, 116, 86, ACC, 2.6) + line(80, 86, 80, 14, ACC, 2.6); }
  function ponzo() {
    let s = line(36, 104, 74, 6, INK, 1.6) + line(124, 104, 86, 6, INK, 1.6);
    for (let i = 1; i < 6; i++) { const y = 6 + i * 16; const l = 36 + (74 - 36) * (104 - y) / 98, r = 124 - (124 - 86) * (104 - y) / 98; s += line(l, y, r, y, MID, 0.8); }
    s += line(64, 26, 96, 26, ACC, 4) + line(64, 84, 96, 84, ACC, 4);
    return s;
  }
  function ebbinghaus() {
    let s = circ(46, CY, 10, ACC) + circ(118, CY, 10, ACC);
    for (let a = 0; a < 360; a += 60) { const p = pol(46, CY, 29, a + 30); s += circ(p[0], p[1], 13, INK); }
    for (let a = 0; a < 360; a += 45) { const p = pol(118, CY, 17, a); s += circ(p[0], p[1], 4, INK); }
    return s;
  }
  function delboeuf() { return circ(46, CY, 38, "none", ` stroke="${INK}" stroke-width="1.6"`) + circ(46, CY, 14, ACC) + circ(120, CY, 19, "none", ` stroke="${INK}" stroke-width="1.6"`) + circ(120, CY, 14, ACC); }
  function jastrow() {
    const arc = (dx, dy, fill) => { const cx = CX + dx, cy = 150 + dy; return sector(cx, cy, 88, 112, -112, -68, fill, ` stroke="${PAPER}" stroke-width="1"`); };
    return arc(14, 0, ACC2) + arc(-8, 30, ACC);
  }
  function shepard() {
    const A = [[22, 92], [46, 22], [68, 22], [44, 92]], B = [[84, 36], [150, 60], [150, 82], [84, 58]];
    const legs = (p, h) => line(p[0], p[1], p[0], p[1] + h, INK, 2);
    return poly(A, ACC) + legs(A[0], 8) + legs(A[3], 8) + poly(B, ACC2) + legs(B[1], 8) + legs(B[2], 8) + legs(B[3], 8);
  }
  function sander() {
    return poly([[2, 88], [52, 20], [152, 20], [102, 88]], "none", ` stroke="${INK}" stroke-width="1.6"`) + line(118, 20, 68, 88, INK, 1.6) + line(52, 20, 68, 88, ACC, 2.4) + line(118, 20, 102, 88, ACC, 2.4);
  }
  /* ---- light and shade ---- */
  function checkerShadow(uid) {
    const t = 22, x0 = 14, y0 = 10, cols = 6, rows = 4;
    const board = (dark, light) => { let g = ""; for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) g += rect(x0 + c * t, y0 + r * t, t, t, (c + r) % 2 ? dark : light); return g; };
    const shadow = [[60, 0], [160, 0], [160, 70], [100, 110], [40, 110]];
    let s = `<clipPath id="${uid}s"><polygon points="${pts(shadow)}"/></clipPath>`;
    s += board(MID, PAPER) + `<g clip-path="url(#${uid}s)">${board(INK, MID)}</g>`;
    s += `<polygon points="${pts(shadow)}" fill="none" stroke="${INK}" stroke-width="6" opacity=".12"/>`;
    s += circ(128, 14, 12, ACC) + rect(116, 14, 24, 10, ACC) + `<ellipse cx="128" cy="24" rx="12" ry="4" fill="${ACC2}"/>`;
    s += `<text x="${x0 + 0 * t + 11}" y="${y0 + 1 * t + 15}" text-anchor="middle" font-size="11" font-weight="700" fill="${PAPER}">A</text><text x="${x0 + 4 * t + 11}" y="${y0 + 2 * t + 15}" text-anchor="middle" font-size="11" font-weight="700" fill="${PAPER}">B</text>`;
    return s;
  }
  function contrast() { return rect(0, 6, 80, 98, INK) + rect(80, 6, 80, 98, PAPER, ` stroke="${MID}" stroke-width=".5"`) + rect(26, 41, 28, 28, MID) + rect(106, 41, 28, 28, MID); }
  function whites() {
    let s = ""; for (let i = 0; i < 8; i++) s += rect(0, 6 + i * 12.25, W, 12.25, i % 2 ? INK : PAPER);
    for (let i = 1; i < 8; i += 2) s += rect(26, 6 + i * 12.25, 36, 12.25, MID);
    for (let i = 2; i < 8; i += 2) s += rect(98, 6 + i * 12.25, 36, 12.25, MID);
    return s;
  }
  function mach() { let s = ""; for (let i = 0; i < 6; i++) s += rect(8 + i * 24, 6, 24, 98, `color-mix(in srgb, var(--ink) ${i * 18}%, var(--paper))`); return s; }
  function bezold() {
    let s = ""; for (let x = 8; x < 152; x += 6) s += rect(x, 6, 3, 98, ACC);
    for (let x = 11; x < 80; x += 6) s += rect(x, 6, 3, 98, INK); for (let x = 83; x < 152; x += 6) s += rect(x, 6, 3, 98, PAPER);
    return s;
  }
  function watercolor() {
    const d = "M22 40 C30 14, 70 10, 86 24 S140 30, 136 58 S110 100, 80 92 S40 100, 28 76 S16 56, 22 40 Z";
    return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="3"/><path d="${d}" fill="none" stroke="${ACC2}" stroke-width="2.2" transform="translate(80 55) scale(.93) translate(-80 -55)"/>`;
  }
  function troxler(uid) { return `<radialGradient id="${uid}t"><stop offset="0" stop-color="var(--acc)" stop-opacity=".9"/><stop offset=".55" stop-color="var(--acc)" stop-opacity=".35"/><stop offset="1" stop-color="var(--acc)" stop-opacity="0"/></radialGradient>` + circ(CX, CY, 48, `url(#${uid}t)`) + circ(CX, CY, 2.2, INK); }
  function blindSpot() { return line(34, 47, 34, 63, INK, 3) + line(26, 55, 42, 55, INK, 3) + circ(124, 55, 9, ACC); }
  /* ---- things that seem to move ---- */
  function drift() {
    let s = ""; const seq = [INK, ACC, PAPER, ACC2];
    [[14, 24], [30, 40], [46, 54]].forEach(([r1, r2], k) => { const n = 24; for (let i = 0; i < n; i++) { const a = i * 360 / n + k * 7; s += sector(CX, CY, r1, r2, a, a + 360 / n + 0.6, seq[(i + k) % 4]); } });
    return s;
  }
  function pinna() {
    let s = ""; [[22, 20, 20], [40, 28, -20]].forEach(([r, n, tilt]) => { for (let i = 0; i < n; i++) { const a = i * 360 / n, p = pol(CX, CY, r, a); s += `<rect x="${f2(p[0] - 3.5)}" y="${f2(p[1] - 3.5)}" width="7" height="7" fill="${i % 2 ? INK : PAPER}" stroke="${i % 2 ? PAPER : INK}" stroke-width="1.6" transform="rotate(${a + tilt} ${f2(p[0])} ${f2(p[1])})"/>`; } });
    return s;
  }
  function fraserSpiral(uid) {
    let s = `<clipPath id="${uid}f"><circle cx="${CX}" cy="${CY}" r="52"/></clipPath><g clip-path="url(#${uid}f)">`;
    for (let i = 0; i < 16; i++) s += sector(CX, CY, 0, 60, i * 22.5, i * 22.5 + 22.5, i % 2 ? MID : PAPER, ` opacity=".5"`);
    s += "</g>";
    for (let r = 12; r <= 48; r += 9) { const circ_ = 2 * Math.PI * r, n = Math.max(8, Math.round(circ_ / 9)); for (let i = 0; i < n; i++) { const a = i * 360 / n, p = pol(CX, CY, r, a); const col = i % 2 ? INK : ACC; s += `<rect x="${f2(p[0] - 4.2)}" y="${f2(p[1] - 1.6)}" width="8.4" height="3.2" fill="${col}" transform="rotate(${a + 90 + 28} ${f2(p[0])} ${f2(p[1])})"/>`; } }
    return s;
  }
  function rubin() {
    const hw = [[14, 28], [20, 19], [30, 25], [40, 13], [48, 20], [54, 16], [60, 20], [65, 15], [72, 22], [80, 14], [89, 23], [97, 30]];
    const L = hw.map(([y, w]) => [CX - w, y]), R = hw.map(([y, w]) => [CX + w, y]).reverse();
    return poly([...L, ...R], ACC);
  }

  /* ---- the map: category -> illusion, its common name, and why it fits ---- */
  const MAP = {
    "Kubernetes": [() => penrose(4, 44, 15, 45), "the impossible square", "Four straight bars, each in front of the next, all the way round. It cannot exist, and it looks fine from every corner. A control loop is the same: each reconcile step is correct, and the whole thing never arrives, by design."],
    "GCP": [impossibleCube, "the impossible cube", "A wire cube with one crossing drawn the wrong way round. Every edge is right; the whole cannot be built. A cloud project looks like one box until you ask which face is the organisation, which the folder and which the region."],
    "Cloud Architecture": [() => penrose(3, 52, 17, -90), "the impossible triangle", "Three bars that join perfectly at every corner and cannot meet in three dimensions. Cheap, fast and reliable join the same way: perfectly on the whiteboard, never in the building."],
    "DevOps": [drift, "the drifting rings", "Nothing in this picture moves, and the rings seem to turn. A pipeline looks busy for the same reason: repeated bright-dark steps read as motion. Ask what actually changed."],
    "Deployment": [ponzo, "the Ponzo rails", "The two bars are the same length. The one further down the rails looks bigger. A change is the same size wherever it ships; the further it travels towards production, the bigger it looks and the more carefully it is watched."],
    "Infrastructure as Code": [cafeWall, "the café wall", "Every mortar line is perfectly parallel. The offset bricks make them look sloped. Declared state is the straight line; what looks like drift is often the bricks, the small differences in how each row was laid."],
    "Software Architecture": [rubin, "the vase and the faces", "A vase, or two faces about to talk. You cannot see both at once. A boundary in a system is the same choice: what you treat as the figure decides what becomes the background, and a diagram is an argument about which."],
    "Software Development": [bulge, "the bulging board", "The board is a perfect grid of squares. The tiny squares at the corners make it swell in the middle. Small details at the joints are what warp a codebase, not the big tiles."],
    "API & Backend": [poggendorff, "the hidden line", "A straight line goes behind the bar and seems to come out in the wrong place. The dotted line shows where it really continues. A request crosses a boundary and the response seems to come from somewhere else; it did not."],
    "Event-Driven Architecture": [ouchi, "the floating disc", "Move your eyes and the middle disc seems to slide free of its frame. It is drawn on the same flat page. Loosely coupled parts move on their own in the same way: that freedom is the point, and the hardest thing to reason about."],
    "Full-Stack Engineering": [shepard, "the two table tops", "The two table tops are identical: same shape, one turned ninety degrees. Nobody believes it at first. The same data looks like a different thing on the server and in the browser; it is one shape."],
    "Multi-Tenancy": [zollner, "the lines that will not collide", "The long lines are parallel. The short hatches make them look as if they will cross. Tenants on one cluster look as if they are about to collide; isolation is what keeps the long lines parallel."],
    "Large Language Models": [neckerCube, "the cube that flips", "One wire cube, two ways to read it, and your mind flips between them without asking you. A sentence with two meanings is the same shape; the model picks one reading by probability and commits."],
    "AI & GenAI": [fraserSpiral, "the false spiral", "It looks like a spiral winding in. Trace one ring with a finger: they are closed circles. Generated text can look as if it is going somewhere. Check whether it does."],
    "Deep Learning & Neural Networks": [() => hermann(true), "the scintillating grid", "Dark dots flash in and out at the crossings as your eye moves; none of them is drawn. A network's activations do the same: patterns light up and vanish as the input shifts, and none is stored anywhere."],
    "Classical Machine Learning": [mullerLyer, "the arrow lines", "Both lines are the same length. The arrowheads change your estimate by a fifth. A feature's framing biases a model the same way: the line did not change, the ends did."],
    "Math, Probability & Statistics": [jastrow, "the two arcs", "The two arcs are identical. The lower one looks bigger because its long edge sits next to the other's short edge. Comparing unlike edges is how most statistics go wrong."],
    "AI Agents": [blivet, "the impossible fork", "Count the prongs: three at the tips, two at the base. Each end is fine; the middle cannot join them. An agent's plan can look complete at the goal and at the start and never connect in the middle."],
    "Agentic AI": [schroeder, "the staircase that flips", "The same steps read as going up, then as seen from underneath, then up again. An agent's trace reads as progress or as circling until you check the actual state."],
    "Agentic AI Scenarios": [() => hering(false), "the bowed lines", "Both coloured lines are perfectly straight. The lines fanning out behind them bend them outward. A scenario's many details bend your judgement of the one straight question in the middle."],
    "Model Context Protocol": [() => kanizsa("square"), "the square that is not there", "No square is drawn. Four well-placed corners imply it, and you see an edge. A tool's contract is that square: four precise corners, and every caller sees the same shape."],
    "LangChain Stack": [orbison, "the warped square", "The square is a square. The circles behind it make it look pinched. A chain of simple steps looks distorted by the framework drawn around it; look at the square on its own."],
    "Agent Frameworks & Runtimes": [cubeTriangle, "the triangle of blocks", "The impossible triangle, drawn the first way it was ever drawn: as a ring of blocks. Every framework wraps the same loop of observe, decide and act. Change the blocks, and the shape is still the loop."],
    "Security": [troxler, "the fading halo", "Stare at the dot in the middle for ten seconds and the halo fades away. It is still there. A threat you stop looking at fades from your view, not from the system."],
    "AI Security": [checkerShadow, "the shadowed squares", "Squares A and B are exactly the same colour. The shadow makes B look lighter. A prompt that looks harmless in its context is the same prompt; the context is the shadow."],
    "AI Governance": [contrast, "the same grey", "The two inner squares are the same grey. The background decides whether it looks dark or light. The same action under two policies reads as allowed and as forbidden; the policy is the background."],
    "Leadership": [delboeuf, "the circle in two rings", "Both inner circles are the same size. The one in the bigger ring looks smaller. The same team in a bigger organisation looks smaller too. Choose the ring you are judged in."],
    "Candidate Validation": [verticalHorizontal, "the upright line", "The two lines are the same length. The vertical one looks longer. Depth looks bigger than breadth, or the other way round, depending on how the question is drawn; measure both."],
    "Scenario Exercise": [() => hering(true), "the pinched lines", "Both coloured lines are straight. The fans behind them bend them inward this time. A scenario's framing bends the straight answer; find the two lines first, then read the fans."],
    "FinOps": [sander, "the two diagonals", "The two coloured diagonals are the same length. The one in the bigger box looks longer. A bill split across two shapes looks bigger in one of them; measure the diagonals, not the boxes."],
    "Observability": [blindSpot, "the blind spot", "Cover your right eye, look at the cross, and move slowly towards the screen. At one distance the dot disappears. Every monitoring setup has a blind spot; the skill is knowing where yours is."],
    "Production Readiness": [() => penrose(5, 46, 13, -90), "the impossible pentagon", "Five bars, five corners, each one correct. The whole cannot exist. Five teams each pass their own checklist and the system still cannot ship; readiness is a property of the whole ring."],
    "Production Operations": [pinna, "the turning rings", "Move your head towards the screen and the two rings turn in opposite directions. Nothing moved. An incident feels like motion; the state is what you read from the system, not what you feel."],
    "LLMOps": [mach, "the stepped greys", "Each band is one flat grey, yet every edge looks lighter on one side and darker on the other. A model version looks worst right at the boundary with the last one; measure the bands, not the edges."],
    "Performance": [twistedCord, "the twisted cords", "Every row is perfectly horizontal. The slanted dashes tilt them. A latency chart on a twisted scale shows a trend that is not there; straighten the axis before you read the slope."],
    "Testing & Quality": [() => hermann(false), "the grey dots", "Grey dots appear at every crossing and vanish the moment you look straight at one. A test only sees where you point it, and the bugs live at the crossings in between."],
    "Evaluation & Metrics": [ebbinghaus, "the circle among circles", "The two coloured circles are the same size. The company they keep decides how big each looks. A number means nothing without its baseline; always draw the surrounding circles."],
    "Data": [whites, "White's bars", "The grey bars are identical. The stripes they sit on make the left ones look darker. The same value in two tables looks different; normalise before you compare."],
    "Data & Databases": [moire, "the moiré bands", "Two regular grids laid at a slight angle make dark bands that neither grid contains. Two tables joined on the wrong key produce rows that neither table holds."],
    "Data Engineering": [watercolor, "the watercolour tint", "The inside of the shape is the same white as the outside. The coloured edge spreads a tint across it. A pipeline stage colours everything downstream of it, long after its own edge."],
    "Data & Integration": [ehrenstein, "the bright disc", "No circle is drawn. The lines that stop short create a disc brighter than the page. An integration layer is that disc: the systems stop at its edge, and together they imply it."],
    "File & Media Processing": [bezold, "the Bezold stripes", "The coloured stripes are identical on both sides. Dark neighbours make them look dark, light neighbours light. A file is only bytes; the codec and the screen decide what you see."],
    "Retrieval-Augmented Generation": [() => kanizsa("triangle"), "the Kanizsa triangle", "No triangle is drawn. Three notched discs imply it and you see a bright triangle with edges. A model does the same with three half-matching sources: it sees an answer that is not in any of them."],
    "Multimodal RAG Deep Dive": [neon, "the glowing disc", "The pale disc is not drawn. The coloured parts of the lines spread into it. Text and images retrieved together blend the same way: an answer seems to glow across both when neither holds it."]
  };
  let seq = 0;
  function svg(cat, big) {
    const m = MAP[cat]; if (!m) return "";
    const uid = "il" + (seq++).toString(36);
    const body = m[0](uid);
    const label = big ? ` role="img" aria-label="${m[1]}"` : ` aria-hidden="true"`;
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"${label}>${body}</svg>`;
  }
  window.ILLUSIONS = { has: c => !!MAP[c], svg, name: c => MAP[c] ? MAP[c][1] : "", caption: c => MAP[c] ? MAP[c][2] : "", list: () => Object.keys(MAP) };
})();
