/* DaVinci Flora & Living: the 3D studio.
   Real-time WebGL still lifes built from geometry and procedural, physically based materials
   (terracotta, limestone, zellige glaze, lime plaster, microcement, bark, olive leaves).
   These are illustrative renders of product types, not scans or models of actual products.
   Loaded only on pages that show one; if WebGL is unavailable the page keeps its fallback image. */
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- seeded noise ---------- */
function rng(seed) { let a = seed >>> 0 || 1; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; }
function makeNoise(seed) {
  const r = rng(seed), P = new Uint8Array(512), p = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) P[i] = p[i & 255];
  const G = [];
  for (let i = 0; i < 256; i++) { const a = r() * Math.PI * 2; G.push([Math.cos(a), Math.sin(a)]); }
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const dot = (h, x, y) => { const g = G[h]; return g[0] * x + g[1] * y; };
  return (x, y) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = fade(xf), v = fade(yf);
    const aa = P[P[X] + Y], ab = P[P[X] + Y + 1], ba = P[P[X + 1] + Y], bb = P[P[X + 1] + Y + 1];
    const x1 = dot(aa, xf, yf) + u * (dot(ba, xf - 1, yf) - dot(aa, xf, yf));
    const x2 = dot(ab, xf, yf - 1) + u * (dot(bb, xf - 1, yf - 1) - dot(ab, xf, yf - 1));
    return x1 + v * (x2 - x1); /* about -0.7..0.7 */
  };
}
function fbm(n, x, y, oct) { let s = 0, a = .5, f = 1; for (let i = 0; i < oct; i++) { s += a * n(x * f, y * f); f *= 2.03; a *= .5; } return s; }
const hexRGB = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

/* Paint a colour map and a matching height map (used as bump) in one pass.
   f(u, v) returns [r, g, b, height 0..1]; u, v in 0..1 */
const texCache = new Map();
function paint(key, W, H, f, opts) {
  if (texCache.has(key)) return texCache.get(key);
  opts = opts || {};
  const c = document.createElement('canvas'), h = document.createElement('canvas');
  c.width = h.width = W; c.height = h.height = H;
  const cx = c.getContext('2d'), hx = h.getContext('2d');
  const ci = cx.createImageData(W, H), hi = hx.createImageData(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const o = (y * W + x) * 4, px = f(x / W, y / H);
    ci.data[o] = px[0]; ci.data[o + 1] = px[1]; ci.data[o + 2] = px[2]; ci.data[o + 3] = 255;
    const hv = Math.max(0, Math.min(255, px[3] * 255));
    hi.data[o] = hi.data[o + 1] = hi.data[o + 2] = hv; hi.data[o + 3] = 255;
  }
  cx.putImageData(ci, 0, 0); hx.putImageData(hi, 0, 0);
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
  const bump = new THREE.CanvasTexture(h);
  [map, bump].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (opts.repeat) t.repeat.set(opts.repeat[0], opts.repeat[1]); });
  const out = { map, bump };
  texCache.set(key, out);
  return out;
}
const clamp = (v) => Math.max(0, Math.min(255, v));
const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/* ---------- materials ---------- */
function terracotta(tone) {
  const base = hexRGB(tone || '#a8634a'), n = makeNoise(7), n2 = makeNoise(19);
  const t = paint('tc' + tone, 512, 512, (u, v) => {
    const m = fbm(n, u * 6, v * 6, 5), s = fbm(n2, u * 60, v * 60, 2), ring = Math.sin(v * 180 + fbm(n, u * 3, v * 2, 2) * 6) * .5 + .5;
    const k = 1 + m * .34 + (s > .3 ? -.14 : 0) + ring * .035;
    const salt = m > .18 ? (m - .18) * 1.3 : 0; /* pale efflorescence where the clay is thin */
    const c = mixc(base.map((x) => x * k), [226, 205, 178], Math.min(.45, salt));
    return [clamp(c[0]), clamp(c[1]), clamp(c[2]), .5 + m * .5 + s * .2 + ring * .05];
  });
  return new THREE.MeshStandardMaterial({ map: t.map, bumpMap: t.bump, bumpScale: 1.6, roughness: .93, metalness: 0 });
}
function limestone(tint) {
  const n = makeNoise(31), n2 = makeNoise(5), pr = rng(77), pores = [];
  for (let i = 0; i < 90; i++) pores.push([pr(), pr(), .003 + pr() * .008, .12 + pr() * .2]);
  const base = hexRGB(tint || '#e4d9c3');
  const t = paint('ls' + tint, 512, 512, (u, v) => {
    const vein = fbm(n, u * 1.2, v * 14, 4), cloud = fbm(n2, u * 4, v * 4, 4);
    const band = Math.sin(v * 38 + vein * 9) * .5 + .5;
    let k = 1 + vein * .2 + cloud * .1 - band * .035, h = .6 + vein * .25;
    for (let i = 0; i < pores.length; i++) { const p = pores[i], dx = (u - p[0]) / p[3], dy = (v - p[1]) * 3; const dd = dx * dx + dy * dy, rr2 = p[2] * p[2] * 9; if (dd < rr2) { const q = 1 - dd / rr2; k -= .09 * q; h = .6 - .45 * q; break; } }
    return [clamp(base[0] * k), clamp(base[1] * k * .995), clamp(base[2] * k * .98), h];
  });
  return new THREE.MeshStandardMaterial({ map: t.map, bumpMap: t.bump, bumpScale: 1.1, roughness: .78 });
}
function zellige(glaze) {
  const g = hexRGB(glaze || '#3f7464'), n = makeNoise(13), r = rng(3), cells = [];
  for (let i = 0; i < 64; i++) cells.push([.82 + r() * .32, r() * 6.28, r()]);
  const t = paint('zl' + glaze, 512, 512, (u, v) => {
    const cu = u * 4, cv = v * 4, ix = Math.floor(cu), iy = Math.floor(cv), fx = cu - ix, fy = cv - iy;
    const cell = cells[(iy * 4 + ix) % 64], edge = Math.min(fx, fy, 1 - fx, 1 - fy);
    if (edge < .028) return [182, 170, 150, .05]; /* grout */
    const pool = fbm(n, u * 10 + cell[1], v * 10, 3), rim = edge < .09 ? (.09 - edge) * 6 : 0;
    const k = cell[0] * (1 + pool * .3) - rim * .35;
    return [clamp(g[0] * k), clamp(g[1] * k), clamp(g[2] * k), .7 + pool * .4 - rim * .6];
  });
  return new THREE.MeshPhysicalMaterial({ map: t.map, bumpMap: t.bump, bumpScale: 2.2, roughness: .32, clearcoat: 1, clearcoatRoughness: .12, metalness: 0 });
}
function hexTiles() {
  const n = makeNoise(41), r = rng(9);
  const t = paint('hex', 512, 512, (u, v) => {
    const s = 7, x = u * s, y = v * s * 1.1547;
    const q = (2 / 3 * x), rr = (-1 / 3 * x + .57735 * y);
    let rx = Math.round(q), rz = Math.round(rr), ry = Math.round(-q - rr);
    const dx = Math.abs(rx - q), dz = Math.abs(rz - rr), dy = Math.abs(ry - (-q - rr));
    if (dx > dy && dx > dz) rx = -ry - rz; else if (dy <= dz) rz = -rx - ry;
    const cxp = rx * 1.5, cyp = (rz + rx / 2) * 1.7320508;
    const d = Math.max(Math.abs(x - cxp) * .866 + Math.abs((y - cyp) / 1.7320508 * 1.5) * .5, Math.abs((y - cyp) / 1.7320508 * 1.5));
    if (d > .9) return [170, 150, 128, .05];
    const shade = .85 + ((rx * 7 + rz * 13) % 5) * .05, m = fbm(n, u * 12, v * 12, 3);
    return [clamp(170 * shade * (1 + m * .3)), clamp(104 * shade * (1 + m * .3)), clamp(76 * shade * (1 + m * .3)), .6 + m * .3];
  });
  return new THREE.MeshStandardMaterial({ map: t.map, bumpMap: t.bump, bumpScale: 1.4, roughness: .85 });
}
function plaster(col, seed) {
  const b = hexRGB(col || '#d6c3a1'), n = makeNoise(seed || 23), n2 = makeNoise((seed || 23) + 9);
  const t = paint('pl' + col + seed, 512, 512, (u, v) => {
    const cloud = fbm(n, u * 3, v * 3, 5);
    const strokes = fbm(n2, (u + v * .6) * 2.2, (v - u * .4) * 9, 3); /* trowel sweeps */
    const k = 1 + cloud * .22 + strokes * .1;
    return [clamp(b[0] * k), clamp(b[1] * k), clamp(b[2] * k), .5 + strokes * .5 + cloud * .2];
  });
  return new THREE.MeshPhysicalMaterial({ map: t.map, bumpMap: t.bump, bumpScale: .8, roughness: .5, clearcoat: .35, clearcoatRoughness: .45 });
}
function microcement(col) {
  const b = hexRGB(col || '#aea79a'), n = makeNoise(61), n2 = makeNoise(62);
  const t = paint('mc' + col, 512, 512, (u, v) => {
    const cloud = fbm(n, u * 5, v * 5, 5), arc = fbm(n2, Math.hypot(u - .2, v - 1.1) * 14, Math.atan2(v - 1.1, u - .2) * 3, 2);
    const k = 1 + cloud * .2 + arc * .07;
    return [clamp(b[0] * k), clamp(b[1] * k), clamp(b[2] * k), .5 + cloud * .4 + arc * .2];
  });
  return new THREE.MeshPhysicalMaterial({ map: t.map, bumpMap: t.bump, bumpScale: .6, roughness: .42, clearcoat: .55, clearcoatRoughness: .3 });
}
function bark() {
  const n = makeNoise(88);
  const t = paint('bark', 256, 512, (u, v) => {
    const s = fbm(n, u * 18, v * 3, 5), k = .75 + s * .6;
    return [clamp(108 * k), clamp(96 * k), clamp(80 * k), .5 + s];
  });
  return new THREE.MeshStandardMaterial({ map: t.map, bumpMap: t.bump, bumpScale: 3, roughness: .95 });
}
function soil() {
  const n = makeNoise(5);
  const t = paint('soil', 256, 256, (u, v) => { const s = fbm(n, u * 40, v * 40, 3); const k = .55 + s * .5; return [clamp(86 * k), clamp(64 * k), clamp(44 * k), .5 + s]; });
  return new THREE.MeshStandardMaterial({ map: t.map, bumpMap: t.bump, bumpScale: 3, roughness: 1 });
}
function paintSample(col) { return new THREE.MeshStandardMaterial({ color: col, roughness: .92 }); }

/* ---------- objects ---------- */
function pot(o) {
  o = o || {};
  const H = o.h || .46, R = o.r || .25, g = new THREE.Group(), pts = [];
  /* profile of a hand-thrown Impruneta-style pot: foot, swelling body, rolled rim */
  const prof = o.shape === 'cyl'
    ? [[0, 0], [R * .86, 0], [R * .9, .01], [R * .92, H * .9], [R * .98, H * .92], [R * .98, H], [R * .88, H], [R * .86, H * .1], [0, H * .1]]
    : [[0, 0], [R * .62, 0], [R * .66, .012], [R * .74, H * .3], [R * .86, H * .66], [R * .9, H * .82], [R * .93, H * .85], [R * 1.02, H * .87], [R * 1.04, H * .95], [R * 1.0, H], [R * .9, H * .99], [R * .86, H * .9], [R * .8, H * .6], [R * .6, H * .1], [0, H * .1]];
  prof.forEach((p) => pts.push(new THREE.Vector2(p[0], p[1])));
  const geo = new THREE.LatheGeometry(pts, 96);
  const m = new THREE.Mesh(geo, o.mat || terracotta(o.tone));
  m.castShadow = m.receiveShadow = true; g.add(m);
  if (o.soil !== false) {
    const s = new THREE.Mesh(new THREE.CircleGeometry(R * (o.shape === 'cyl' ? .87 : .87), 64), soil());
    s.rotation.x = -Math.PI / 2; s.position.y = H * .9; s.receiveShadow = true; g.add(s);
  }
  g.userData.top = H * .9;
  return g;
}
function plinth(w, h, d, mat) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, .012), mat || limestone());
  m.position.y = h / 2; m.castShadow = m.receiveShadow = true; return m;
}
function board(w, h, mat, t) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, t || .022, 3, .006), mat);
  m.castShadow = m.receiveShadow = true; return m;
}
/* olive tree: a twisted trunk that forks into branches, ending in sprays of silver-backed leaves */
function oliveTree(o) {
  o = o || {};
  const r = rng(o.seed || 21), g = new THREE.Group(), barkM = bark();
  const tips = [];
  function branch(start, dir, len, rad, depth) {
    const pts = [start.clone()], steps = 5, p = start.clone(), d = dir.clone();
    for (let i = 1; i <= steps; i++) {
      d.add(new THREE.Vector3((r() - .5) * .35, (r() - .2) * .12, (r() - .5) * .35)).normalize();
      p.add(d.clone().multiplyScalar(len / steps)); pts.push(p.clone());
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.TubeGeometry(curve, 16, rad, 10, false);
    /* taper the tube along its length */
    const pos = tube.attributes.position, ctr = new THREE.Vector3(), seg = 16;
    for (let i = 0; i <= seg; i++) {
      const tt = i / seg, k = 1 - tt * .45; curve.getPointAt(tt, ctr);
      for (let j = 0; j <= 10; j++) { const idx = i * 11 + j, vx = pos.getX(idx) - ctr.x, vy = pos.getY(idx) - ctr.y, vz = pos.getZ(idx) - ctr.z; pos.setXYZ(idx, ctr.x + vx * k, ctr.y + vy * k, ctr.z + vz * k); }
    }
    tube.computeVertexNormals();
    const m = new THREE.Mesh(tube, barkM); m.castShadow = true; g.add(m);
    if (depth >= (o.depth || 3)) { tips.push({ p: p.clone(), d: d.clone() }); return; }
    const kids = depth === 0 ? 3 : 2 + (r() > .55 ? 1 : 0);
    for (let k = 0; k < kids; k++) {
      const a = (k / kids) * Math.PI * 2 + r() * 1.2, spread = depth === 0 ? .75 : .6;
      const nd = new THREE.Vector3(Math.cos(a) * spread, 1, Math.sin(a) * spread).add(d.clone().multiplyScalar(.6)).normalize();
      branch(p, nd, len * (.62 + r() * .18), rad * .62, depth + 1);
    }
    if (depth >= 1) tips.push({ p: p.clone(), d: d.clone(), small: 1 });
  }
  branch(new THREE.Vector3(0, 0, 0), new THREE.Vector3(.05, 1, .02).normalize(), (o.trunk || .5), o.rad || .034, 0);
  /* leaves: a narrow lanceolate blade, slightly folded */
  const shape = new THREE.Shape(); const L = o.leafL || .075, Wd = o.leafW || .011;
  shape.moveTo(0, 0); shape.quadraticCurveTo(L * .35, Wd, L, 0); shape.quadraticCurveTo(L * .35, -Wd, 0, 0);
  const lg = new THREE.ShapeGeometry(shape, 6);
  const lp = lg.attributes.position; for (let i = 0; i < lp.count; i++) { const x = lp.getX(i), y = lp.getY(i); lp.setZ(i, Math.abs(y) * .9 - x * x * 1.2); }
  lg.computeVertexNormals();
  const leafM = new THREE.MeshStandardMaterial({ roughness: o.gloss ? .38 : .62, metalness: 0, side: THREE.DoubleSide, vertexColors: false });
  const count = o.leaves || 2400, inst = new THREE.InstancedMesh(lg, leafM, count);
  inst.castShadow = true; inst.receiveShadow = true;
  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), pos2 = new THREE.Vector3();
  const LC = o.leafCols || ['#4d5c31', '#6d7a4a', '#a3ad8c'];
  const top = new THREE.Color(LC[0]), mid = new THREE.Color(LC[1]), under = new THREE.Color(LC[2]), col = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const t = tips[Math.floor(r() * tips.length)], rad = (t.small ? .1 : .17) * (o.crown || 1) * Math.cbrt(r());
    const th = r() * Math.PI * 2, ph = Math.acos(2 * r() - 1);
    pos2.set(t.p.x + rad * Math.sin(ph) * Math.cos(th) * 1.25, t.p.y + rad * Math.cos(ph) * .75 - .02, t.p.z + rad * Math.sin(ph) * Math.sin(th) * 1.25);
    e.set(r() * Math.PI * 2, r() * Math.PI * 2, r() * Math.PI * 2); q.setFromEuler(e);
    const s = .75 + r() * .5; sc.set(s, s, s);
    M.compose(pos2, q, sc); inst.setMatrixAt(i, M);
    const k = r(); col.copy(k < .55 ? top : k < .82 ? mid : under).offsetHSL(0, (r() - .5) * .04, (r() - .5) * .05);
    inst.setColorAt(i, col);
  }
  g.add(inst);
  if (o.fruit) {
    const fm = new THREE.MeshPhysicalMaterial({ color: o.fruitCol || '#2c2a1c', roughness: o.fruitCol ? .55 : .25, clearcoat: o.fruitCol ? .2 : .8 });
    const fr = o.fruitR || .009, fg = new THREE.SphereGeometry(fr, 18, 14); fg.scale(1, o.fruitCol ? 1.15 : 1.3, 1);
    for (let i = 0; i < (o.fruitN || 26); i++) { const t = tips[Math.floor(r() * tips.length)], f = new THREE.Mesh(fg, fm); f.position.set(t.p.x + (r() - .5) * .2, t.p.y + (r() - .6) * .14, t.p.z + (r() - .5) * .2); f.castShadow = true; g.add(f); }
  }
  g.userData.leaves = inst;
  return g;
}

function cypress() {
  const g = new THREE.Group(), r = rng(9), tr = new THREE.Mesh(new THREE.CylinderGeometry(.012, .02, .3, 10), bark()); tr.position.y = .15; tr.castShadow = true; g.add(tr);
  const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.quadraticCurveTo(.012, .006, .03, 0); shape.quadraticCurveTo(.012, -.006, 0, 0);
  const lg = new THREE.ShapeGeometry(shape, 3), n = 5200, inst = new THREE.InstancedMesh(lg, new THREE.MeshStandardMaterial({ roughness: .7, side: THREE.DoubleSide }), n);
  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3(1, 1, 1), c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const y = r(), h = .12 + y * 1.25, rad = .17 * Math.sin(Math.PI * Math.pow(y, .75)) * Math.sqrt(r()) + .01, a = r() * 6.283;
    p.set(Math.cos(a) * rad, h, Math.sin(a) * rad); e.set(r() * 6, r() * 6, r() * 6); q.setFromEuler(e); M.compose(p, q, sc); inst.setMatrixAt(i, M);
    c.set(r() < .7 ? '#2f3f22' : '#46572f').offsetHSL(0, 0, (r() - .5) * .05); inst.setColorAt(i, c);
  }
  inst.castShadow = true; g.add(inst); return g;
}
function spikes(o) {
  /* lavender or rosemary: a mound of stems, each carrying a flower spike or needles */
  const g = new THREE.Group(), r = rng(o.seed || 4), stemM = new THREE.MeshStandardMaterial({ color: o.stem || '#7c8a5c', roughness: .8 });
  const spikeM = new THREE.MeshStandardMaterial({ color: o.col || '#6a5a9c', roughness: .85 });
  const sg = new THREE.CapsuleGeometry(o.sr || .007, o.sl || .05, 3, 8), stg = new THREE.CylinderGeometry(.0018, .0026, 1, 5);
  for (let i = 0; i < (o.n || 90); i++) {
    const a = r() * 6.283, lean = .25 + r() * .55, len = (o.h || .26) * (.7 + r() * .45), d = new THREE.Vector3(Math.cos(a) * lean, 1, Math.sin(a) * lean).normalize();
    const base = new THREE.Vector3(Math.cos(a) * r() * .05, 0, Math.sin(a) * r() * .05);
    const st = new THREE.Mesh(stg, stemM); st.scale.y = len; st.position.copy(base).addScaledVector(d, len / 2); st.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); g.add(st);
    const sp = new THREE.Mesh(sg, spikeM); sp.position.copy(base).addScaledVector(d, len + (o.sl || .05) / 2); sp.quaternion.copy(st.quaternion); sp.castShadow = true; g.add(sp);
  }
  return g;
}
function agave() {
  const g = new THREE.Group(), r = rng(12), m = new THREE.MeshPhysicalMaterial({ color: '#7f9a92', roughness: .55, clearcoat: .3, side: THREE.DoubleSide });
  for (let i = 0; i < 26; i++) {
    const L = .2 + r() * .14, sh = new THREE.Shape(); sh.moveTo(-.032, 0); sh.quadraticCurveTo(-.042, L * .45, 0, L); sh.quadraticCurveTo(.042, L * .45, .032, 0); sh.lineTo(-.032, 0);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: .012, bevelEnabled: true, bevelThickness: .004, bevelSize: .003, bevelSegments: 2, curveSegments: 10 }), pos = geo.attributes.position;
    for (let k = 0; k < pos.count; k++) { const y = pos.getY(k), x = pos.getX(k); pos.setZ(k, pos.getZ(k) + Math.abs(x) * 1.2 - y * y * .9); }
    geo.computeVertexNormals();
    const leaf = new THREE.Mesh(geo, m), a = (i / 26) * 6.283 * 2.618, tilt = .25 + (i / 26) * 1.0;
    leaf.rotation.set(0, a, 0); leaf.rotateX(-tilt); leaf.castShadow = true; g.add(leaf);
  }
  return g;
}
function tin(col, h, rr, lidCol) {
  const g = new THREE.Group(); h = h || .19; rr = rr || .085;
  const metal = new THREE.MeshStandardMaterial({ color: '#cfcac1', metalness: .85, roughness: .32 });
  const label = new THREE.MeshStandardMaterial({ color: '#efe7d6', roughness: .85 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, h, 64, 1, true), metal); body.position.y = h / 2; g.add(body);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(rr + .0008, rr + .0008, h * .56, 64, 1, true), label); band.position.y = h * .46; g.add(band);
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(rr + .0012, rr + .0012, h * .12, 64, 1, true), new THREE.MeshStandardMaterial({ color: col, roughness: .6 })); stripe.position.y = h * .38; g.add(stripe);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(rr * 1.01, rr * 1.01, .012, 64), lidCol ? new THREE.MeshStandardMaterial({ color: lidCol, roughness: .5 }) : metal); lid.position.y = h + .006; g.add(lid);
  const bot = new THREE.Mesh(new THREE.CircleGeometry(rr, 48), metal); bot.rotation.x = Math.PI / 2; g.add(bot);
  g.traverse((x) => { if (x.isMesh) { x.castShadow = true; x.receiveShadow = true; } });
  return g;
}
function jar(col) {
  const g = new THREE.Group(), glass = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .08, transmission: .9, thickness: .01, ior: 1.45 });
  const paintM = new THREE.MeshStandardMaterial({ color: col, roughness: .9 });
  const p = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .055, 40), paintM); p.position.y = .028; g.add(p);
  const j = new THREE.Mesh(new THREE.CylinderGeometry(.032, .032, .065, 40, 1, true), glass); j.position.y = .033; g.add(j);
  const lid = new THREE.Mesh(new RoundedBoxGeometry(.068, .022, .068, 3, .008), new THREE.MeshStandardMaterial({ color: col, roughness: .45 })); lid.position.y = .075; lid.scale.set(1, 1, 1); g.add(lid);
  g.traverse((x) => { if (x.isMesh) x.castShadow = true; });
  return g;
}
function trowel(w) {
  const g = new THREE.Group(); w = w || .28;
  const steel = new THREE.MeshStandardMaterial({ color: '#d7d7d4', metalness: 1, roughness: .22 });
  const plate = new THREE.Mesh(new RoundedBoxGeometry(w, .003, w * .4, 2, .0015), steel); g.add(plate);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .05, 12), steel); post.position.set(0, .026, 0); g.add(post);
  const handle = new THREE.Mesh(new THREE.CapsuleGeometry(.016, w * .45, 6, 16), new THREE.MeshStandardMaterial({ color: '#8a5a36', roughness: .55 })); handle.rotation.z = Math.PI / 2; handle.position.y = .058; g.add(handle);
  g.traverse((x) => { if (x.isMesh) x.castShadow = true; });
  return g;
}
/* each example product as a studio object (illustrative; real product photos replace these later) */
const TREES = {
  olive: { seed: 21, trunk: .3, fruit: 1, leaves: 3000 },
  olive2: { seed: 55, trunk: .2, rad: .055, fruit: 1, leaves: 3400, crown: 1.25 },
  olive3: { seed: 77, trunk: .4, fruit: 1, leaves: 2600, crown: .85 },
  lemon: { seed: 31, trunk: .3, leaves: 1500, leafL: .085, leafW: .028, gloss: 1, leafCols: ['#2f4a1f', '#3f5f27', '#5b7a35'], fruit: 1, fruitCol: '#e6c22e', fruitR: .024, fruitN: 18 },
  bergamot: { seed: 62, trunk: .32, leaves: 1500, leafL: .085, leafW: .03, gloss: 1, leafCols: ['#2f4a1f', '#3f5f27', '#5b7a35'], fruit: 1, fruitCol: '#cfc53c', fruitR: .027, fruitN: 12 },
  fig: { seed: 43, trunk: .28, leaves: 380, leafL: .12, leafW: .065, leafCols: ['#3b5222', '#4a632a', '#66803a'], crown: 1.1 },
  rosemary: { seed: 27, trunk: .32, leaves: 2600, leafL: .03, leafW: .004, leafCols: ['#33452a', '#46593a', '#7f8f6e'] }
};
function product(S, o) {
  const id = o.id, F = (x) => { S.add(x); return x; };
  const potted = (cfg, tone, h, r) => { const tp = F(pot({ h: h || .4, r: r || .22, tone })); const t = oliveTree(cfg); t.position.y = tp.userData.top - .02; F(t); S.userData.sway = t; };
  const map = {
    'olive-leccino': () => potted(TREES.olive), 'olive-vecchio': () => potted(TREES.olive2, '#9c5c40', .48, .3), 'olive-frantoio': () => potted(TREES.olive3, '#94573a'),
    'lemon-meyer': () => potted(TREES.lemon), 'bergamot': () => potted(TREES.bergamot, '#a5502c'), 'fig-brown': () => potted(TREES.fig, '#9a5a3c'),
    'rosemary': () => potted(TREES.rosemary, '#a8634a', .34, .19),
    'lavender-trio': () => { [-.24, 0, .24].forEach((x, i) => { const p2 = F(pot({ h: .2, r: .11 })); p2.position.x = x; const l = spikes({ seed: 4 + i, h: .24, n: 70 }); l.position.set(x, p2.userData.top, 0); F(l); }); },
    'agave': () => { const b = F(pot({ h: .16, r: .26, shape: 'cyl', tone: '#c9b79a', mat: limestone('#cbbca2') })); const a = agave(); a.position.y = b.userData.top; F(a); },
    'cypress': () => { const tp = F(pot({ h: .36, r: .2, tone: '#9a4a2a' })); const c = cypress(); c.position.y = tp.userData.top - .02; F(c); },
    'pot-impruneta': () => { const pp = F(pot({ h: .44, r: .25, soil: false })); S.userData.spin = pp; },
    'pot-cilindro': () => { const pp = F(pot({ h: .5, r: .2, shape: 'cyl', soil: false, mat: plaster('#cbb999', 8) })); S.userData.spin = pp; },
    'combo-pair': () => { const a = new THREE.Group(), b = new THREE.Group(); S.add(a); S.add(b); a.position.x = -.27; b.position.x = .27;
      const p1 = pot({ h: .38, r: .21 }); a.add(p1); const t1 = oliveTree(TREES.olive); t1.position.y = p1.userData.top - .02; a.add(t1);
      const p2 = pot({ h: .38, r: .21, tone: '#a5502c' }); b.add(p2); const t2 = oliveTree(TREES.lemon); t2.position.y = p2.userData.top - .02; b.add(t2); },
    'combo-terrace': () => { const p1 = F(pot({ h: .2, r: .12 })); p1.position.x = -.3; const l = spikes({ seed: 8, h: .24, n: 70 }); l.position.set(-.3, p1.userData.top, 0); F(l);
      const p2 = F(pot({ h: .22, r: .13, tone: '#9a4a2a' })); const rr = spikes({ seed: 9, h: .26, n: 120, col: '#3f5532', sr: .0035, sl: .07 }); rr.position.y = p2.userData.top; F(rr);
      const p3 = F(pot({ h: .12, r: .19, shape: 'cyl', mat: limestone('#cbbca2') })); p3.position.x = .34; const ag = agave(); ag.scale.setScalar(.75); ag.position.set(.34, p3.userData.top, 0); F(ag); },
    'paint-calce': () => { const a = F(tin('#d9a441')); a.position.x = -.1; const b = F(tin('#d9a441', .14, .065)); b.position.set(.11, 0, .06); },
    'paint-samples': () => { ['#e9dcc0', '#d9a441', '#8d9a6a', '#b4562f', '#c9b79a', '#6b4f3a'].forEach((c, i) => { const j = F(tin(c, .075, .036, c)); j.position.set((i % 3 - 1) * .095, 0, Math.floor(i / 3) * .1 - .05); }); },
    'plaster-lime': () => { const b = F(board(.4, .52, plaster('#d9c3a0', 4))); b.position.y = .26; b.rotation.x = -.12; S.userData.spin = b; },
    'stucco-veneziano': () => { const b = F(board(.4, .52, plaster('#b9a98f', 14))); b.position.y = .26; b.rotation.x = -.12; S.userData.spin = b; },
    'tile-zellige': () => { const b = F(board(.42, .42, zellige('#3f7464'), .02)); b.position.y = .21; b.rotation.x = -.18; S.userData.spin = b; },
    'tile-esagono': () => { const b = F(board(.42, .42, hexTiles(), .02)); b.position.y = .21; b.rotation.x = -.18; S.userData.spin = b; },
    'micro-kit': () => { const b = F(board(.4, .52, microcement('#b9b2a4'))); b.position.set(-.05, .26, -.05); b.rotation.x = -.12; const t = F(tin('#b9b2a4', .15, .07)); t.position.set(.24, 0, .12); },
    'tool-trowels': () => { [[.3, -.04, .0], [.24, .02, .1], [.18, .07, .19]].forEach((c, i) => { const t = F(trowel(c[0])); t.position.set(c[1] * 2, .0015 + i * .0, c[2] - .1); t.rotation.y = .4 - i * .25; }); },
    'tool-kit': () => { const t = F(trowel(.26)); t.position.set(-.08, .0015, 0); t.rotation.y = .5; const j = F(tin('#c9b79a', .075, .036, '#c9b79a')); j.position.set(.16, 0, .05); const tp = F(tin('#efe6d4', .12, .06)); tp.position.set(.2, 0, -.12); },
    'other-tray': () => { const b = F(new THREE.Mesh(new RoundedBoxGeometry(.46, .045, .3, 4, .012), limestone('#e2d5bd'))); b.position.y = .0225; b.castShadow = b.receiveShadow = true; S.userData.spin = b; }
  };
  (map[id] || map['pot-impruneta'])();
  S.userData.fit = 1;
}

/* ---------- scene presets ---------- */
const PRESETS = {
  /* home: the garden and the rooms on one limestone stage */
  still(S) {
    const L = new THREE.Group(); S.add(L);
    const p1 = plinth(.62, .42, .62); p1.position.set(-.55, .21, 0); L.add(p1);
    const tp = pot({ h: .44, r: .25 }); tp.position.set(-.55, .42, 0); L.add(tp);
    const tree = oliveTree({ seed: 21, trunk: .3, fruit: 1, leaves: 3000 }); tree.position.set(-.55, .42 + tp.userData.top - .02, 0); L.add(tree);
    const p2 = plinth(.9, .22, .55, limestone('#d9cdb4')); p2.position.set(.5, .11, .02); L.add(p2);
    const z = board(.34, .44, zellige('#3f7464')); z.position.set(.36, .22 + .22, -.12); z.rotation.set(-.14, .18, 0); L.add(z);
    const pl = board(.34, .44, plaster('#d4bf9b', 23)); pl.position.set(.62, .22 + .22, -.08); pl.rotation.set(-.12, -.12, 0); L.add(pl);
    const mc = board(.3, .38, microcement('#aaa396')); mc.position.set(.52, .22 + .19, .08); mc.rotation.set(-.1, .05, .02); L.add(mc);
    const hx = board(.22, .22, hexTiles(), .018); hx.rotation.set(-Math.PI / 2, 0, .3); hx.position.set(.78, .22 + .01, .16); L.add(hx);
    const sp = pot({ h: .12, r: .06, tone: '#a95a35', soil: false }); sp.position.set(.2, .22, .16); L.add(sp);
    S.userData.anchors = { flora: new THREE.Vector3(-.84, .72, 0), living: new THREE.Vector3(.98, .58, 0) };
    S.userData.cam = { pos: [0, 1.05, 3.35], look: [0, .74, 0], fov: 30 };
    S.userData.sway = tree;
  },
  /* Flora shop: one olive on a plinth (replaces the drawn tree; same place in the composition) */
  olive(S) {
    const p = plinth(.6, .42, .6); S.add(p);
    const tp = pot({ h: .5, r: .27 }); tp.position.y = .42; S.add(tp);
    const tree = oliveTree({ seed: 33, trunk: .34, fruit: 1, leaves: 3200 }); tree.position.y = .42 + tp.userData.top - .02; S.add(tree);
    S.userData.cam = { pos: [0, 1.1, 3.0], look: [0, .95, 0], fov: 30 };
    S.userData.sway = tree;
  },
  /* Living shop: material boards on a travertine block (replaces the colour-card fan) */
  materials(S) {
    const p = plinth(1.0, .26, .56, limestone('#ddd1b8')); S.add(p);
    const y = .26;
    const a = board(.3, .44, plaster('#d4bf9b', 23)); a.position.set(-.3, y + .22, 0); a.rotation.set(-.08, .55, 0); S.add(a);
    const b = board(.32, .5, zellige('#3f7464')); b.position.set(.02, y + .25, -.12); b.rotation.set(-.1, .12, 0); S.add(b);
    const c = board(.3, .44, microcement('#aaa396')); c.position.set(.33, y + .22, -.02); c.rotation.set(-.08, -.5, 0); S.add(c);
    const d = board(.24, .24, hexTiles(), .018); d.rotation.set(-Math.PI / 2, 0, .45); d.position.set(.1, y + .01, .17); S.add(d);
    const e = board(.16, .22, plaster('#a9674c', 51), .016); e.position.set(-.12, y + .1, .15); e.rotation.set(-.32, .25, 0); S.add(e);
    S.userData.cam = { pos: [.25, .9, 2.25], look: [0, .44, 0], fov: 30 };
  },
  product,
  pot(S, o) { const p = pot({ h: .5, r: .28, tone: o.tone, shape: o.shape, soil: true }); S.add(p); S.userData.cam = { pos: [0, .55, 1.6], look: [0, .24, 0], fov: 30 }; S.userData.spin = p; },
  tree(S, o) { const tp = pot({ h: .44, r: .24 }); S.add(tp); const t = oliveTree({ seed: o.seed || 21, trunk: .44, fruit: 1 }); t.position.y = tp.userData.top - .02; S.add(t); S.userData.cam = { pos: [0, .75, 2.5], look: [0, .65, 0], fov: 30 }; S.userData.spin = null; S.userData.sway = t; },
  tile(S, o) { const b = board(.42, .42, o.hex ? hexTiles() : zellige(o.col), .02); b.position.y = .21; b.rotation.x = -.18; S.add(b); S.userData.cam = { pos: [0, .3, 1.1], look: [0, .2, 0], fov: 30 }; S.userData.spin = b; },
  plasterboard(S, o) { const b = board(.4, .52, plaster(o.col, o.seed)); b.position.y = .26; b.rotation.x = -.12; S.add(b); S.userData.cam = { pos: [0, .32, 1.25], look: [0, .25, 0], fov: 30 }; S.userData.spin = b; },
  micro(S, o) { const b = board(.4, .52, microcement(o.col)); b.position.y = .26; b.rotation.x = -.12; S.add(b); S.userData.cam = { pos: [0, .32, 1.25], look: [0, .25, 0], fov: 30 }; S.userData.spin = b; },
  stone(S) { const b = new THREE.Mesh(new RoundedBoxGeometry(.46, .05, .3, 4, .01), limestone('#e2d5bd')); b.position.y = .025; b.castShadow = b.receiveShadow = true; S.add(b); S.userData.cam = { pos: [0, .45, .9], look: [0, .03, 0], fov: 30 }; S.userData.spin = b; }
};

/* ---------- stage ---------- */
let envTex = null;
export function supported() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}
export function mount(el, preset, opts) {
  opts = opts || {};
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.capture });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, opts.dpr || 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.domElement.className = 'gl'; renderer.domElement.setAttribute('aria-hidden', 'true');
  el.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  if (!envTex) { const pm = new THREE.PMREMGenerator(renderer); envTex = pm.fromScene(new RoomEnvironment(), .04).texture; }
  scene.environment = envTex; scene.environmentIntensity = .55;
  const stage = new THREE.Group(); scene.add(stage);
  PRESETS[preset](stage, opts);
  /* afternoon sun from the upper left, warm; a cool fill from the sky */
  const sun = new THREE.DirectionalLight('#ffe6c4', 2.6); sun.position.set(-2.2, 3.4, 2.4); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 9; sun.shadow.blurSamples = 20; sun.shadow.bias = -.0004; sun.shadow.normalBias = .01;
  const sc = sun.shadow.camera; sc.left = -2; sc.right = 2; sc.top = 2.2; sc.bottom = -1; sc.near = .5; sc.far = 9;
  scene.add(sun);
  scene.add(new THREE.HemisphereLight('#f3ecdf', '#8a7558', .55));
  /* the floor is invisible but catches the shadow, so the objects sit on the page itself */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: opts.shadow || .3 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  let C = stage.userData.cam;
  if (stage.userData.fit) {
    const box = new THREE.Box3().setFromObject(stage), sz = box.getSize(new THREE.Vector3()), ct = box.getCenter(new THREE.Vector3());
    const aspect = opts.aspect || .8, fov = 26, vf = Math.max(sz.y, sz.x / aspect, sz.z * .6) * (opts.pad || 1.16);
    const dist = vf / 2 / Math.tan(fov * Math.PI / 360) + sz.z / 2;
    const flat = sz.y < Math.max(sz.x, sz.z) * .45, ev = flat ? .62 : .2;
    C = { pos: [ct.x, ct.y + dist * ev, ct.z + dist * (flat ? .8 : .98)], look: [ct.x, ct.y - sz.y * .03, ct.z], fov };
  }
  const cam = new THREE.PerspectiveCamera(C.fov, 1, .05, 30);
  const look = new THREE.Vector3(...C.look), base = new THREE.Vector3(...C.pos);
  const radius = base.clone().sub(look).length(), baseAz = Math.atan2(base.x - look.x, base.z - look.z), baseEl = Math.asin((base.y - look.y) / radius);
  let w = 1, h = 1;
  function size() {
    const r = el.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setSize(w, h, false); cam.aspect = w / h;
    /* keep the whole composition in frame on narrow screens */
    cam.fov = C.fov * (cam.aspect < .9 ? Math.min(1.7, .95 / cam.aspect) : 1);
    cam.updateProjectionMatrix();
  }
  size();
  let tx = 0, ty = 0, cx = 0, cy = 0, drag = 0, dragX = 0, spinV = 0, spinA = 0;
  const onMove = (e) => { const r = el.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - .5) * 2; ty = ((e.clientY - r.top) / r.height - .5) * 2; if (drag) { spinV += (e.clientX - dragX) * .004; dragX = e.clientX; } };
  const host = opts.pointerHost || el;
  if (FINE && !RM) { host.addEventListener('pointermove', onMove); host.addEventListener('pointerleave', () => { tx = 0; ty = 0; }); }
  if (opts.drag) {
    el.style.touchAction = 'pan-y';
    el.addEventListener('pointerdown', (e) => { drag = 1; dragX = e.clientX; el.setPointerCapture(e.pointerId); el.classList.add('dragging'); });
    el.addEventListener('pointermove', (e) => { if (drag && !FINE) { spinV += (e.clientX - dragX) * .006; dragX = e.clientX; } });
    const up = () => { drag = 0; el.classList.remove('dragging'); };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }
  const anchors = stage.userData.anchors, v = new THREE.Vector3();
  let visible = true, raf = 0, t0 = performance.now(), scrollK = 0;
  function frame(now) {
    const t = (now - t0) / 1000;
    cx += (tx - cx) * .05; cy += (ty - cy) * .05;
    const az = baseAz + cx * .22 + (RM ? 0 : Math.sin(t * .18) * .06) + scrollK * .25, el2 = baseEl + cy * .06;
    cam.position.set(look.x + radius * Math.cos(el2) * Math.sin(az), look.y + radius * Math.sin(el2), look.z + radius * Math.cos(el2) * Math.cos(az));
    cam.lookAt(look);
    if (stage.userData.sway && !RM) { const s = stage.userData.sway; s.rotation.z = Math.sin(t * .9) * .012; s.rotation.x = Math.sin(t * .7 + 1) * .008; }
    if (stage.userData.spin && opts.drag) { spinV *= .93; spinA += spinV + (RM || drag ? 0 : .0025); stage.userData.spin.rotation.y = spinA; }
    renderer.render(scene, cam);
    if (anchors && opts.onAnchors) { const out = {}; for (const k in anchors) { v.copy(anchors[k]).project(cam); out[k] = [(v.x * .5 + .5) * w, (-v.y * .5 + .5) * h]; } opts.onAnchors(out); }
    raf = (visible && !RM && !opts.capture) ? requestAnimationFrame(frame) : 0;
    if (opts.capture) el.dataset.rendered = '1';
  }
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }, { rootMargin: '120px' });
  io.observe(el);
  const ro = new ResizeObserver(() => { size(); if (!raf) raf = requestAnimationFrame(frame); }); ro.observe(el);
  const onScroll = () => { const r = el.getBoundingClientRect(); scrollK = Math.max(-1, Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / innerHeight)); if (RM && !raf) raf = requestAnimationFrame(frame); };
  if (opts.scroll) addEventListener('scroll', onScroll, { passive: true });
  raf = requestAnimationFrame(frame);
  el.classList.add('gl-on');
  return {
    destroy() { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); removeEventListener('scroll', onScroll); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); },
    canvas: renderer.domElement
  };
}
