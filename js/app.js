/* DaVinci Flora & Living: frontend prototype. No backend; the basket and every form are demonstrations. */
(function () {
  const D = window.DV;
  const $ = (s, e) => (e || document).querySelector(s);
  const $$ = (s, e) => Array.from((e || document).querySelectorAll(s));
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const eur = (n) => '€' + Number(n).toLocaleString('en-US');
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const byId = (id) => D.products.find((p) => p.id === id);
  const catName = (shop, c) => (D.shops[shop].cats.find((x) => x[0] === c) || [])[1] || '';
  const ARR = '<svg class="arr" viewBox="0 0 18 10" aria-hidden="true"><path d="M0 5h17M12 1l5 4-5 4"/></svg>';
  const TICK = '<svg class="tick" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8.5l4 4 8-9"/></svg>';
  const ICON_S = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>';
  const ICON_B = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>';
  let intent = 'visit';

  /* ---------- helpers ---------- */
  function sp(html) {
    if (window.__spLog) window.__spLog.push(html);
    if (window.DV_I18N) html = window.DV_I18N.t(html);
    let i = 0;
    return html.split(/(<[^>]+>)/).map((p) => p.charAt(0) === '<' ? p : p.split(/(\s+)/).map((w) => /^\s*$/.test(w) ? w : '<span class="w"><span class="wi" style="--wi:' + i++ + '">' + w + '</span></span>').join('')).join('');
  }
  /* Photo slots: a slot shows its photo once listed in DV_PHOTOS.ready, otherwise a labelled illustration. */
  const PH = window.DV_PHOTOS || { ready: {}, slots: {} };
  const artFor = {};
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const isReady = (key) => !!(key && PH.ready[key]);
  const labelFor = (key) => { const t = ((PH.slots[key] || {}).label || 'Illustration · photo to come').split(' · '); return '<span class="phlabel"><span>' + t[0] + '</span><span class="l2"> · ' + t.slice(1).join(' · ') + '</span></span>'; };
  function pic(key, o) {
    const sl = PH.slots[key] || {};
    const set = (pre, ws) => ws.map((w) => 'img/' + pre + '-' + w + '.webp ' + w + 'w').join(', ');
    const W = sl.hero ? [800, 1600, 2400] : [600, 1200];
    return '<picture>' + (sl.hero ? '<source media="(max-width: 640px)" srcset="' + set(key + '-m', [600, 1200]) + '" sizes="100vw">' : '') +
      '<img src="img/' + key + '-' + (sl.hero ? 1600 : 1200) + '.webp" srcset="' + set(key, W) + '" sizes="' + (o.sizes || (sl.hero ? '100vw' : '(max-width: 640px) 50vw, 33vw')) + '" alt="' + esc(o.alt || sl.alt || '') + '"' +
      (o.eager ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"') + ' decoding="async" data-slot="' + key + '" style="--fx:' + (sl.fx || '50% 50%') + ';--fxm:' + (sl.fxm || sl.fx || '50% 50%') + '"></picture>';
  }
  function slot(spec, cls, o) {
    o = o || {};
    const real = isReady(o.photo);
    if (o.photo) artFor[o.photo] = spec;
    return '<div class="ph ' + (cls || '') + (real ? ' is-photo' : ' is-ill') + (o.reveal ? ' revimg' : '') + '"' + (o.reveal ? ' data-reveal style="--d:' + (o.d || 0) + 's"' : '') + (real ? '' : ' role="img" aria-label="' + esc((o.alt || (PH.slots[o.photo] || {}).alt || 'Illustration') + ' (illustration)') + '"') + '>' +
      '<div class="pi"' + (o.par ? ' data-par="' + o.par + '"' : '') + '><div class="zi">' + (real ? pic(o.photo, o) : window.DV_ART(spec)) + '</div></div>' +
      (real || o.nolabel ? '' : labelFor(o.photo)) + (o.inner || '') + '</div>';
  }
  /* A photo that fails to load falls back to its illustration, never a broken image. */
  document.addEventListener('error', (e) => {
    const img = e.target; if (!img || img.tagName !== 'IMG' || !img.dataset.slot) return;
    const k = img.dataset.slot, pc = img.closest('picture'), ph = img.closest('.ph,.layer,.thumb');
    if (!pc || !artFor[k]) return;
    pc.outerHTML = window.DV_ART(artFor[k]);
    if (ph && !ph.querySelector('.phlabel') && !ph.classList.contains('thumb')) ph.insertAdjacentHTML('beforeend', labelFor(k));
  }, true);
  function hero(key, spec, o) {
    return '<section class="phero ' + (o.side || 'left') + ' ' + (o.size || 'full') + (o.cls ? ' ' + o.cls : '') + '">' +
      slot(spec, 'phero-img', { photo: key, eager: 1, reveal: 1, par: .07, sizes: '100vw' }) + '<div class="phero-shade" aria-hidden="true"></div>' +
      '<div class="wrap phero-in"><div class="phero-copy">' + o.copy + '</div>' + (o.aside || '') + '</div></section>';
  }
  /* ---------- Version 2: shared visual pieces ---------- */
  const MARK = '<svg class="mark" viewBox="0 0 40 48" aria-hidden="true"><path class="mk-a" d="M5 46V21a15 15 0 0130 0v25"/><path class="mk-a" d="M20 41c.2-8.6 2.4-15.4 7.6-21.4"/><path class="mk-l" d="M21.6 31.4c-4.3-.4-7.1-2.8-8-6.7 4.1-.1 7.1 2.2 8 6.7zM23.8 25.4c.3-4 2.8-6.7 6.6-7.5 0 3.9-2.5 6.6-6.6 7.5zM21 37.3c-3.6.8-6.6-.4-8.3-3.3 3.5-.9 6.5.3 8.3 3.3z"/></svg>';
  /* dappled light: blurred leaf shadows that drift slowly over a picture (decorative) */
  function leaves(seed) {
    let a = seed || 7; const r = () => (a = (a * 9301 + 49297) % 233280) / 233280;
    let g = '';
    for (let i = 0; i < 34; i++) { const x = r() * 420 - 10, y = r() * 300 - 20, rot = r() * 180, sc = .6 + r() * .9; g += '<ellipse cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" rx="' + (26 * sc).toFixed(1) + '" ry="' + (7 * sc).toFixed(1) + '" transform="rotate(' + rot.toFixed(0) + ' ' + x.toFixed(0) + ' ' + y.toFixed(0) + ')"/>'; }
    for (let i = 0; i < 5; i++) { const x = r() * 400, y = r() * 200; g += '<path d="M' + x.toFixed(0) + ' ' + y.toFixed(0) + 'q' + (40 + r() * 60).toFixed(0) + ' ' + (30 + r() * 40).toFixed(0) + ' ' + (120 + r() * 80).toFixed(0) + ' ' + (10 + r() * 40).toFixed(0) + '" fill="none" stroke-width="3"/>'; }
    return '<svg class="dapple" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><g class="dp-g" filter="url(#soft)">' + g + '</g></svg>';
  }
  /* a line of arches, drawn like an elevation (decorative) */
  function arcade(n, cls) {
    let d = ''; const w = 100;
    for (let i = 0; i < n; i++) { const x = i * w; d += 'M' + (x + 12) + ' 200V80a38 38 0 0176 0v120'; }
    return '<svg class="arcade ' + (cls || '') + '" viewBox="0 0 ' + (n * w) + ' 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"><path d="' + d + '"/><path d="M0 199.5H' + (n * w) + '"/></svg>';
  }
  /* product labels (Bestseller, One of a kind…): a solid ribbon, coloured per label */
  function badgeTag(t) {
    const k = String(t).toLowerCase().replace(/[^a-z]+/g, '-');
    const ic = k === 'bestseller' ? '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 .8l1.5 3.2 3.5.4-2.6 2.4.7 3.4L6 8.5 2.9 10.2l.7-3.4L1 4.4l3.5-.4z"/></svg>' : '<i aria-hidden="true"></i>';
    return '<span class="tag tag-pro tag-' + k + '">' + ic + t + '</span>';
  }
  function badge(text, id) {
    return '<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false"><defs><path id="' + id + '" d="M60 60m-45 0a45 45 0 1190 0a45 45 0 11-90 0"/></defs><text><textPath href="#' + id + '">' + text + '</textPath></text></svg>';
  }
  /* Flora shop: an olive tree on a stone plinth, drawn with light and shade (illustration, not a 3D model) */
  function sculptTree() {
    let a = 31; const r = () => (a = (a * 9301 + 49297) % 233280) / 233280;
    const G = ['#4f5e2c', '#66753a', '#7d8a4c', '#93a065', '#3e4a22', '#a8b27c'];
    let lv = '';
    for (let i = 0; i < 260; i++) {
      const t = r() * Math.PI * 2, rr = Math.sqrt(r()), cx = 200 + Math.cos(t) * rr * 128 * (1 + (r() - .5) * .2), cy = 158 + Math.sin(t) * rr * 92;
      lv += '<ellipse cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" rx="' + (9 + r() * 6).toFixed(1) + '" ry="' + (2.3 + r() * 1.4).toFixed(1) + '" fill="' + G[Math.floor(r() * G.length)] + '" transform="rotate(' + (r() * 360).toFixed(0) + ' ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ')"/>';
    }
    let fr = '';
    for (let i = 0; i < 7; i++) { const t = r() * Math.PI * 2, rr = .35 + r() * .55; fr += '<ellipse cx="' + (200 + Math.cos(t) * rr * 112).toFixed(1) + '" cy="' + (166 + Math.sin(t) * rr * 76).toFixed(1) + '" rx="3.4" ry="4.6" fill="#3a3d22"/>'; }
    return '<svg class="sculpt" viewBox="0 0 400 520" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="sc-pot" x1="0" x2="1"><stop offset="0" stop-color="#7d3a1e"/><stop offset=".32" stop-color="#c0673d"/><stop offset=".5" stop-color="#d98a5c"/><stop offset=".78" stop-color="#a24f2a"/><stop offset="1" stop-color="#6a3018"/></linearGradient>' +
      '<linearGradient id="sc-rim" x1="0" x2="1"><stop offset="0" stop-color="#8a4221"/><stop offset=".45" stop-color="#e09a6c"/><stop offset="1" stop-color="#7a3a1c"/></linearGradient>' +
      '<linearGradient id="sc-st" x1="0" x2="1"><stop offset="0" stop-color="#b9ab90"/><stop offset=".4" stop-color="#e9e0cc"/><stop offset="1" stop-color="#a99a7e"/></linearGradient>' +
      '<radialGradient id="sc-sh"><stop offset="0" stop-color="#1c140a" stop-opacity=".55"/><stop offset="1" stop-color="#1c140a" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="sc-lt" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff6d8" stop-opacity=".35"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient></defs>' +
      '<ellipse class="sc-shadow" cx="206" cy="504" rx="150" ry="16" fill="url(#sc-sh)"/>' +
      '<g class="sc-base"><path d="M108 420h184v78H108z" fill="url(#sc-st)"/><ellipse cx="200" cy="420" rx="92" ry="12" fill="#efe7d6"/><path d="M108 498h184" stroke="#8d806a" stroke-width="2"/></g>' +
      '<g class="sc-pot"><path d="M138 318h124l-14 104c-1 6-6 10-12 10h-72c-6 0-11-4-12-10z" fill="url(#sc-pot)"/><path d="M130 304h140v18H130z" fill="url(#sc-rim)"/><ellipse cx="200" cy="304" rx="70" ry="8" fill="#5a2c16"/><ellipse cx="200" cy="305" rx="62" ry="5.5" fill="#3a2614"/><path d="M150 338c30 6 70 6 100 0" stroke="#e8a77d" stroke-opacity=".35" fill="none"/></g>' +
      '<g class="sc-trunk" fill="none" stroke-linecap="round"><path d="M198 306c-6-40 6-64-10-104" stroke="#5c4a34" stroke-width="13"/><path d="M200 300c10-34 24-58 18-96" stroke="#6b5840" stroke-width="10"/><path d="M196 252c-26-14-38-34-44-60" stroke="#5c4a34" stroke-width="7"/><path d="M212 236c26-10 40-26 50-50" stroke="#6b5840" stroke-width="6"/></g>' +
      '<g class="sc-leaves">' + lv + fr + '<ellipse cx="200" cy="158" rx="140" ry="100" fill="url(#sc-lt)"/></g></svg>';
  }
  /* Living shop: a fan of colour sample cards, held in perspective */
  function swatchFan() {
    const C = D.colours.slice(0, 7);
    return '<div class="fan">' + C.map((c, i) => '<a class="fan-c" href="#product-paint-samples" style="--i:' + (i - (C.length - 1) / 2) + ';--c:' + c[1] + '" aria-label="' + c[0] + ', example tone: order colour samples"><i></i><span><b>' + c[0] + '</b><small>Example tone</small></span></a>').join('') + '</div>';
  }
  /* pointer depth: elements with data-depth inside [data-scene] drift with the pointer; cards with data-tilt lean toward it */
  const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function scenes(root) {
    if (RM || !FINE) return;
    $$('[data-scene]', root).forEach((sc) => {
      const els = $$('[data-depth]', sc); let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
      const tick = () => { cx += (tx - cx) * .08; cy += (ty - cy) * .08; els.forEach((el) => { const d = parseFloat(el.dataset.depth); el.style.translate = (cx * d * 18).toFixed(2) + 'px ' + (cy * d * 14).toFixed(2) + 'px'; }); raf = Math.abs(tx - cx) + Math.abs(ty - cy) > .002 ? requestAnimationFrame(tick) : 0; };
      sc.addEventListener('pointermove', (e) => { const b = sc.getBoundingClientRect(); tx = (e.clientX - b.left) / b.width - .5; ty = (e.clientY - b.top) / b.height - .5; if (!raf) raf = requestAnimationFrame(tick); });
      sc.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); });
    });
  }
  document.addEventListener('pointermove', (e) => {
    if (RM || !FINE) return;
    const t = e.target.closest && e.target.closest('[data-tilt]'); if (!t) return;
    const b = t.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
    t.style.setProperty('--rx', (-y * 9).toFixed(2) + 'deg'); t.style.setProperty('--ry', (x * 11).toFixed(2) + 'deg');
    t.style.setProperty('--gx', ((x + .5) * 100).toFixed(0) + '%'); t.style.setProperty('--gy', ((y + .5) * 100).toFixed(0) + '%'); t.classList.add('tilting');
  });
  document.addEventListener('pointerout', (e) => { const t = e.target.closest && e.target.closest('[data-tilt]'); if (t && !t.contains(e.relatedTarget)) { t.classList.remove('tilting'); t.style.removeProperty('--rx'); t.style.removeProperty('--ry'); } });

  const unit = (p, sel) => p.price + (p.variants || []).reduce((s, v, i) => s + v.opts[sel[i] || 0][1], 0);
  const fromTag = (p) => ((p.variants || []).some((v) => v.opts.some((o) => o[1] > 0)) ? 'From ' : '');

  /* ---------- Version 3: 3D studio, product renders ---------- */
  /* Every example product has a studio render (img/3d-p-<id>.webp) made by js/studio3d.js.
     A real photo, once listed in DV_PHOTOS.ready, replaces the render automatically. */
  const P3D = {
    'olive-leccino': 1, 'olive-vecchio': 1, 'olive-frantoio': 1, 'lemon-meyer': 1, 'bergamot': 1, 'fig-brown': 1, 'lavender-trio': 1, 'rosemary': 1, 'agave': 1, 'cypress': 1,
    'pot-impruneta': 1, 'pot-cilindro': 1, 'combo-pair': 1, 'combo-terrace': 1, 'paint-calce': 1, 'paint-samples': 1, 'plaster-lime': 1, 'stucco-veneziano': 1,
    'tile-zellige': 1, 'tile-esagono': 1, 'micro-kit': 1, 'tool-trowels': 1, 'tool-kit': 1, 'other-tray': 1
  };
  function prodMedia(p, cls, o) {
    o = o || {};
    if (isReady('p-' + p.id + '-1') || !P3D[p.id]) return slot(p.art, cls, Object.assign({ photo: 'p-' + p.id + '-1', alt: p.name + ', ' + p.sub }, o));
    return '<div class="ph rend ' + (cls || '') + '"><img src="img/3d-p-' + p.id + '.webp" alt="' + esc(p.name) + ', illustrative 3D render" loading="' + (o.eager ? 'eager' : 'lazy') + '" decoding="async">' +
      (o.nolabel ? '' : '<span class="phlabel"><span>3D render</span><span class="l2"> · photo to come</span></span>') + (o.inner || '') + '</div>';
  }
  const rend = (id, cls) => '<img class="' + (cls || '') + '" src="img/3d-p-' + id + '.webp" alt="" aria-hidden="true" loading="lazy" decoding="async">';
  function g3(preset, o) {
    o = o || {};
    return '<div class="g3 ' + (o.cls || '') + '" data-g3="' + preset + '"' + (o.opts ? " data-g3o='" + JSON.stringify(o.opts) + "'" : '') + '>' +
      '<img class="g3-poster" src="img/3d-' + (o.poster || preset) + '.webp" alt="' + (o.alt ? esc(o.alt) : '') + '"' + (o.alt ? '' : ' aria-hidden="true"') + ' loading="' + (o.eager ? 'eager' : 'lazy') + '" decoding="async">' +
      (o.tag === false ? '' : '<span class="g3-tag">Illustrative 3D render</span>') + (o.inner || '') + '</div>';
  }
  let g3mod = null, g3live = [];
  const GL_OK = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })();
  function mount3d(el) {
    if (!GL_OK || el.dataset.mounted) return;
    el.dataset.mounted = '1';
    const opts = Object.assign({}, el.dataset.g3o ? JSON.parse(el.dataset.g3o) : {});
    if (el.classList.contains('h3x-gl')) {
      opts.pointerHost = el.closest('.h3x'); opts.scroll = 1;
      const pins = $$('.pin', el.closest('.h3x'));
      const wide = window.matchMedia('(min-width: 961px)');
      opts.onAnchors = (a) => pins.forEach((p) => { const k = a[p.dataset.k]; if (k && wide.matches) { p.style.left = k[0] + 'px'; p.style.top = k[1] + 'px'; } else { p.style.left = ''; p.style.top = ''; } });
    }
    if (el.dataset.drag) opts.drag = 1;
    (g3mod ? Promise.resolve(g3mod) : import('./studio3d.js')).then((m) => {
      g3mod = m; if (!document.body.contains(el)) return;
      try { g3live.push(m.mount(el, el.dataset.g3, opts)); } catch (err) { el.classList.add('gl-fail'); }
    }).catch(() => el.classList.add('gl-fail'));
  }
  function init3d(root) {
    g3live.forEach((x) => { try { x.destroy(); } catch (e) { /* already gone */ } }); g3live = [];
    $$('[data-g3]:not([data-lazy3d])', root).forEach(mount3d);
  }

  /* ---------- cart ---------- */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('dv-demo-cart') || '[]').filter((i) => byId(i.id)); } catch (e) { cart = []; }
  const saveCart = () => { try { localStorage.setItem('dv-demo-cart', JSON.stringify(cart)); } catch (e) { /* storage unavailable */ } };
  const cartCount = () => cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = () => cart.reduce((s, i) => s + i.qty * i.unit, 0);
  function addToCart(id, sel, qty) {
    const p = byId(id); sel = sel || (p.variants || []).map(() => 0);
    const key = id + '|' + sel.join('.');
    const ex = cart.find((i) => i.key === key);
    if (ex) ex.qty += qty || 1; else cart.push({ key, id, sel, unit: unit(p, sel), qty: qty || 1, fresh: 1 });
    saveCart(); updateCount(true); return key;
  }
  function updateCount(bump) {
    $$('[data-count]').forEach((c) => { c.textContent = cartCount(); if (bump && !RM) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); } });
  }
  const optLabels = (i) => { const p = byId(i.id); return (p.variants || []).map((v, k) => v.opts[i.sel[k] || 0][0]).join(' · '); };

  function drawerHTML() {
    const head = '<div class="dr-head"><h2>Your basket</h2><button class="ibtn" data-close aria-label="Close basket">Close</button></div>';
    if (!cart.length) return head + '<div class="dr-body"><div class="dr-empty"><p>Your basket is empty.</p><div class="row"><a class="btn sm" href="#flora" data-close>Flora ' + ARR + '</a><a class="btn sm clay" href="#living" data-close>Living ' + ARR + '</a></div></div></div>';
    let body = '';
    ['flora', 'living'].forEach((s) => {
      const items = cart.filter((i) => byId(i.id).shop === s);
      if (!items.length) return;
      body += '<div class="grp-t ' + s + '"><span>' + D.shops[s].name + ' webshop</span><span class="tnum">' + eur(items.reduce((a, i) => a + i.qty * i.unit, 0)) + '</span></div>';
      body += items.map((i) => {
        const p = byId(i.id);
        return '<div class="li' + (i.fresh ? ' fresh' : '') + '" data-key="' + i.key + '">' + slot(p.art, 'ar45', { photo: 'p-' + p.id + '-1', nolabel: 1, sizes: '80px', alt: p.name }) +
          '<div><div class="n">' + p.name + '</div><div class="v">' + optLabels(i) + '</div>' +
          '<div class="qty"><button data-cq="-1" data-k="' + i.key + '" aria-label="Fewer">&minus;</button><output class="' + (i.bumped ? 'tick-n' : '') + '">' + i.qty + '</output><button data-cq="1" data-k="' + i.key + '" aria-label="More">+</button></div>' +
          '<button class="rm" data-crm="' + i.key + '">Remove</button></div><div class="price">' + eur(i.qty * i.unit) + '</div></div>';
      }).join('');
    });
    cart.forEach((i) => { i.fresh = 0; i.bumped = 0; });
    return head + '<div class="dr-body">' + body + '</div><div class="dr-foot"><div class="sum"><span>Subtotal</span><span class="tnum">' + eur(cartTotal()) + '</span></div><div class="sum"><span>Delivery</span><span>Calculated at checkout (to be confirmed)</span></div><div class="sum t"><span>Total</span><b class="tnum">' + eur(cartTotal()) + '</b></div><button class="btn full" data-checkout>Checkout (demo) ' + ARR + '</button><p class="note">Prototype basket. Prices and products are placeholders; no order is placed.</p></div>';
  }
  const drawer = () => $('#drawer');
  function renderDrawer() { drawer().innerHTML = drawerHTML(); }
  let lastFocus = null;
  function layer(sel, on) {
    const el = $(sel); el.classList.toggle('on', on);
    $('#scrim').classList.toggle('on', on || $$('.drawer.on,.search.on,.modal.on').length > 0);
    document.body.style.overflow = $$('.drawer.on,.search.on,.modal.on,.menu-open').length ? 'hidden' : '';
    if (on) { lastFocus = document.activeElement; setTimeout(() => { const f = $('[data-close],input', el); if (f) f.focus({ preventScroll: true }); }, 60); }
    else if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function openCart() { renderDrawer(); layer('#drawer', true); }
  function closeAll() {
    ['#drawer', '#search', '#modal'].forEach((s) => $(s).classList.remove('on'));
    $('#scrim').classList.remove('on'); setMenu(false);
    document.body.style.overflow = '';
  }
  function setMenu(on) {
    if (on) { const hb = $('#hdr').getBoundingClientRect().bottom; $('#mmenu').style.paddingTop = Math.round(Math.max(hb, 60) + 32) + 'px'; }
    document.body.classList.toggle('menu-open', on);
    $('#burger').setAttribute('aria-expanded', on);
    document.body.style.overflow = on ? 'hidden' : '';
  }
  let toastT;
  function toast(msg, withCart) {
    const t = $('#toast');
    t.innerHTML = '<span>' + msg + '</span>' + (withCart ? '<button data-open-cart>View basket</button>' : '');
    t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 3600);
  }
  function modal(html, cls) { $('#modal').innerHTML = '<div class="modal-box' + (cls ? ' ' + cls : '') + '" role="dialog" aria-modal="true"><button class="xbtn" data-close aria-label="Close">&times;</button>' + html + '</div>'; layer('#modal', true); }

  /* ---------- chrome ---------- */
  function mountChrome() {
    const mega = (sh) => {
      const S = D.shops[sh], F = sh === 'flora';
      const rep = F ? ['olive-leccino', 'lemon-meyer', 'lavender-trio', 'pot-impruneta', 'combo-pair'] : ['paint-calce', 'plaster-lime', 'tile-zellige', 'tool-trowels', 'other-tray'];
      return '<div class="dd mega ' + sh + '"><div class="mg">' +
        '<div class="mg-intro"><span class="eyebrow">' + (F ? '01' : '02') + ' · ' + S.name + ' webshop</span><p class="mg-t">' + (F ? 'Trees that grow into <em>the place</em>' : 'Surfaces with <em>depth</em>') + '</p><p class="mg-s">' + (F ? 'Olive and citrus trees, Mediterranean plants, terracotta pots and planters.' : 'Mineral paint, lime plaster, tiles, microcement and the tools to apply them.') + '</p><a class="mg-all" href="#' + sh + '">Shop all ' + S.name + ' ' + ARR + '</a></div>' +
        '<ul class="mg-cats">' + S.cats.map((c, i) => '<li><a href="#' + sh + '-' + c[0] + '"><span class="mg-r">' + rend(rep[i]) + '</span><span class="t">' + c[1] + '</span><small>' + items(catCount(sh, c[0])) + '</small></a></li>').join('') + '</ul></div></div>';
    };
    $('#hdr').innerHTML = '<div class="hdr-bar">' +
      '<a class="brand" href="#home" aria-label="DaVinci Flora and Living, home"><span class="key" aria-hidden="true">' + MARK + '</span><span class="bw"><b>DaVinci</b><small>Flora &amp; Living</small></span></a>' +
      '<nav class="nav" aria-label="Main">' +
      '<div class="nav-item"><a class="nl" href="#flora" data-nav="flora">Flora</a>' + mega('flora') + '</div>' +
      '<div class="nav-item"><a class="nl" href="#living" data-nav="living">Living</a>' + mega('living') + '</div>' +
      '<a class="nl" href="#workshops" data-nav="workshops">Workshops</a>' +
      '<a class="nl" href="#projects" data-nav="projects">Projects</a>' +
      '<a class="nl" href="#showroom" data-nav="showroom">Showroom<span class="lg">&nbsp;&amp; contact</span></a></nav>' +
      '<span class="tools">' + '<span class="langsw" role="group" aria-label="Language / Taal" data-noi18n><button type="button" data-lang="en" aria-pressed="' + ((window.DV_I18N && window.DV_I18N.lang === 'nl' ? 'nl' : 'en') === 'en') + '" title="English">EN</button><button type="button" data-lang="nl" aria-pressed="' + ((window.DV_I18N && window.DV_I18N.lang === 'nl' ? 'nl' : 'en') === 'nl') + '" title="Nederlands">NL</button></span>' + '<button class="sbox" data-open-search aria-label="Search both shops">' + ICON_S + '<span class="lg2">Search plants, pots, paint and tiles</span><kbd class="lg2" aria-hidden="true">/</kbd></button><button class="bag" data-open-cart aria-label="Open basket">' + ICON_B + '<span class="lg2">Basket</span><span class="count" data-count>0</span></button></span>' +
      '<div class="mob-r">' + '<span class="langsw" role="group" aria-label="Language / Taal" data-noi18n><button type="button" data-lang="en" aria-pressed="' + ((window.DV_I18N && window.DV_I18N.lang === 'nl' ? 'nl' : 'en') === 'en') + '" title="English">EN</button><button type="button" data-lang="nl" aria-pressed="' + ((window.DV_I18N && window.DV_I18N.lang === 'nl' ? 'nl' : 'en') === 'nl') + '" title="Nederlands">NL</button></span>' + '<button class="ibtn" data-open-search aria-label="Search">' + ICON_S + '</button><button class="ibtn" data-open-cart aria-label="Open basket">' + ICON_B + '<span class="count" data-count>0</span></button>' +
      '<button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="mmenu"><i></i><i></i></button></div></div>';
    $('#mmenu').innerHTML = '<div class="mm-links">' + [['home', 'Home'], ['workshops', 'Workshops'], ['projects', 'Projects'], ['showroom', 'Showroom & contact']].map((l, i) => '<a class="big" style="--i:' + i + '" href="#' + l[0] + '">' + l[1] + '</a>').join('') + '</div>' +
      '<div class="mm-worlds"><a class="mmw flora" href="#flora" style="--i:4">' + rend('olive-leccino', 'mmw-r') + '<small>01 · Webshop</small><b>Flora</b><span>Trees, plants &amp; pots</span></a><a class="mmw living" href="#living" style="--i:5">' + rend('tile-zellige', 'mmw-r') + '<small>02 · Webshop</small><b>Living</b><span>Paint, plaster &amp; tiles</span></a></div>' +
      '<div class="mmenu-foot"><button class="link" data-open-search>Search</button><button class="link" data-open-cart>Basket (<span data-count>0</span>)</button></div>';
    $('#ftr').innerHTML = footerHTML();
    const fw = $('#ftr .fz-word');
    if (fw && 'IntersectionObserver' in window) new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { fw.classList.add('in'); o.disconnect(); } }), { threshold: .25 }).observe(fw); else if (fw) fw.classList.add('in');
    const fp = $('#ftr .fz-photo img');
    if (fp && !matchMedia('(prefers-reduced-motion: reduce)').matches) window.addEventListener('scroll', () => { const r = fp.parentNode.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) fp.style.transform = 'translate3d(0,' + Math.max(-60, Math.min(60, (r.top - innerHeight / 2) * -.08)).toFixed(1) + 'px,0)'; }, { passive: true });
    updateCount();
  }
  function footerHTML() {
    const l = (sh) => D.shops[sh].cats.map((c) => '<li><a href="#' + sh + '-' + c[0] + '"><span>' + c[1] + '</span></a></li>').join('');
    const word = 'DaVinci'.split('').map((ch, i) => '<span style="--i:' + i + '">' + ch + '</span>').join('');
    return '<div class="fz">' +
      /* 1. the threshold: a showroom invitation over the dining-room photograph */
      '<section class="fz-stage"><div class="fz-photo" aria-hidden="true"><img src="img/living-hero-1600.webp" srcset="img/living-hero-800.webp 800w, img/living-hero-1600.webp 1600w, img/living-hero-2400.webp 2400w" sizes="100vw" alt="" loading="lazy" decoding="async"></div>' +
      '<div class="wrap fz-stage-in">' +
      '<h2 class="fz-h">Come and see it <em>in daylight.</em></h2>' +
      '<p class="fz-sub">Touch the plaster, smell the lemon leaves, and hold three whites up to the window. Opening expected December 2026, to be confirmed.</p>' +
      '<a class="fz-pill" href="#showroom" data-intent="visit"><span class="fz-pill-t">Plan a visit to the showroom</span><span class="fz-pill-i">' + ARR + '</span></a>' +
      '<div class="fz-quick"><a href="#flora">Shop Flora ' + ARR + '</a><a href="#living">Shop Living ' + ARR + '</a><a href="#showroom" data-intent="advice">Personal advice ' + ARR + '</a></div></div></section>' +
      /* 2. the sheet: plaster card holding brand, navigation and newsletter */
      '<div class="fz-sheet"><div class="wrap"><div class="fz-grid">' +
      '<div class="fz-brand"><a class="fz-logo" href="#home" aria-label="DaVinci Flora and Living, home">' + MARK + '<span><b>DaVinci</b><small>Flora &amp; Living</small></span></a>' +
      '<p class="fz-line">Trees, plants and wall finishes for rooms with Italian character. Almere.</p>' +
      '<div class="fz-news"><p class="fz-nh">A letter once a month.</p><p>New arrivals, workshop dates and one useful tip. Nothing else.</p><form class="nl-form" data-form="news" novalidate><label class="sr" for="nl-mail">Email address</label><input id="nl-mail" type="email" placeholder="Your email address" autocomplete="email"><button type="submit" aria-label="Sign up">' + ARR + '</button></form><p id="nl-ok" class="tbc" aria-live="polite"></p></div></div>' +
      '<nav class="fz-nav" aria-label="Footer"><div class="fz-col"><h4><i>01</i>Flora</h4><ul>' + l('flora') + '</ul></div><div class="fz-col"><h4><i>02</i>Living</h4><ul>' + l('living') + '</ul></div>' +
      '<div class="fz-col"><h4><i>03</i>DaVinci</h4><ul><li><a href="#workshops"><span>Workshops</span></a></li><li><a href="#projects"><span>Projects</span></a></li><li><a href="#showroom"><span>Showroom &amp; contact</span></a></li><li><a href="#showroom" data-intent="advice"><span>Personal advice</span></a></li></ul></div></nav>' +
      '</div></div>' +
      /* 3. the wordmark, filled with the flower-shelf photograph */
      '<div class="fz-word" aria-hidden="true">' + word + '</div>' +
      '<div class="wrap"><div class="fz-bot"><span>&copy; 2026 DaVinci Flora &amp; Living</span><span class="fz-legal">Delivery, returns, payment and privacy details to be confirmed before launch.</span></div></div></div></div>';
  }

  /* ---------- card ---------- */
  function card(p, i, o) {
    o = o || {};
    return '<article class="pcard ' + p.shop + (o.enter ? ' enter' : '') + '" style="--i:' + i + (o.reveal ? ';--d:' + ((i % 4) * .09) + 's' : '') + '"' + (o.reveal ? ' data-reveal' : '') + '>' +
      '<div class="pc-stage" data-tilt><span class="pc-back" aria-hidden="true"></span>' + prodMedia(p, 'pc-img', { sizes: '(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw', inner: p.badge ? badgeTag(p.badge) : '' }) + '</div>' +
      '<button class="pc-add" data-add="' + p.id + '" aria-label="Add ' + esc(p.name) + ' to basket"><span class="pl" aria-hidden="true">+</span> Add</button>' +
      '<div class="pc-info">' + (o.tag ? '<span class="shoptag ' + p.shop + '">' + D.shops[p.shop].name + ' · ' + catName(p.shop, p.cat) + '</span>' : '') +
      '<h3 class="nm"><a class="stretch" href="#product-' + p.id + '">' + p.name + '</a></h3><p class="sb">' + p.sub + '</p><span class="price">' + fromTag(p) + eur(p.price) + '</span></div></article>';
  }
  /* ---------- pages ---------- */
  const ARR_L = '<svg viewBox="0 0 22 12" aria-hidden="true"><path d="M0 6h21M16 1l5 5-5 5"/></svg>';
  const worldName = (w) => (w === 'both' ? 'Flora + Living' : D.shops[w].name);
  const catCount = (s, c) => D.products.filter((p) => p.shop === s && p.cat === c).length;
  const items = (n) => n + (n === 1 ? ' item' : ' items');
  function homePage() {
    const feat = ['olive-leccino', 'paint-calce', 'lemon-meyer', 'tile-zellige', 'pot-impruneta', 'plaster-lime', 'agave', 'micro-kit'].map(byId);
    const P = D.projects;
    const FREP = { olive: 'olive-leccino', citrus: 'lemon-meyer', mediterranean: 'lavender-trio', pots: 'pot-impruneta', combos: 'combo-pair' };
    const LREP = { paint: 'paint-samples', finishes: 'stucco-veneziano', tiles: 'tile-zellige', tools: 'tool-trowels', other: 'other-tray' };
    const steps = [['visit', '01', 'Visit the showroom', 'See colours, plasters and tiles in daylight. Our Almere showroom opens soon.', '#showroom', 'home-step-visit'], ['advice', '02', 'Ask for advice', 'Not sure which tree, finish or colour? Ask, and get a considered answer.', '#showroom', 'home-step-advice'], ['project', '03', 'Discuss a project', 'Planning a terrace, a room or a renovation? Talk it through with us.', '#showroom', 'home-step-project'], ['', '04', 'Join a workshop', 'Learn plant care, colour and plaster techniques, hands on.', '#workshops', 'home-step-workshop']];
    const pin = (k, n, t, href) => '<a class="pin ' + k + '" data-k="' + k + '" href="' + href + '"><i class="pin-dot" aria-hidden="true"></i><span class="pin-c"><small>' + n + '</small><b>' + t + '</b></span>' + ARR + '</a>';
    return '<section class="h4x">' + slot({ k: 'courtyard', s: 41 }, 'h4x-bg', { photo: 'home-hero2', eager: 1, sizes: '100vw', par: .05 }) + '<div class="h4x-shade" aria-hidden="true"></div>' +
      '<div class="wrap h4x-in"><p class="kicker" data-reveal><span class="kdot" aria-hidden="true"></span>Plants · Wall finishes · Workshops</p>' +
      '<h1 class="h4x-t"><span data-split>' + sp('Bring the Italian') + '</span><span data-split style="--d:.25s">' + sp('light <em>inside.</em>') + '</span></h1>' +
      '<div class="h4x-foot"><div class="h4x-copy"><p class="h4x-sub" data-reveal style="--d:.55s">Exclusive Italian trees and plants, the finishes for your walls, and advice to bring the room together. Visit us in Almere, or start online.</p>' +
      '<div class="hx-cta" data-reveal style="--d:.7s"><a class="btn ivory" href="#projects">See our projects ' + ARR + '</a></div></div>' +
      '<div class="h4x-cards" data-reveal style="--d:.85s"><a class="h4c flora" href="#flora">' + rend('olive-leccino', 'h4c-r') + '<span><small>01 · Flora webshop</small><b>Trees, plants &amp; pots</b></span>' + ARR + '</a>' +
      '<a class="h4c living" href="#living">' + rend('tile-zellige', 'h4c-r') + '<span><small>02 · Living webshop</small><b>Paint, plaster &amp; tiles</b></span>' + ARR + '</a></div></div></div>' +
      '</section>' +
      fx('promoBanner') +

      /* preserved: the two worlds */
      '<section class="worlds" id="worlds" aria-labelledby="worlds-h"><div class="wrap"><div class="worlds-head"><p class="eyebrow" data-reveal>Flora &amp; Living</p><h2 class="h2" id="worlds-h" data-split>' + sp('Two shops. <em>One basket.</em>') + '</h2><p class="lead" data-reveal>Put a tree and a wall finish in the same basket.</p></div>' +
      '<div class="wsplit">' +
      '<div class="wd flora' + (isReady('home-door-flora') ? ' has-ph' : '') + '" data-reveal>' + (isReady('home-door-flora') ? '<span class="wd-ph" aria-hidden="true">' + pic('home-door-flora', { sizes: '(max-width: 960px) 100vw, 50vw', alt: '' }) + '</span>' : '') + '<svg class="wd-branch" viewBox="0 0 600 420" aria-hidden="true" focusable="false"><path class="br" d="M-20 380C120 330 230 290 330 210S500 70 640 40"/><path class="br" d="M250 262c-14-50-6-92 28-128M408 150c40-14 72-8 104 18"/>' +
      [[90, 352, -20], [150, 330, 30], [200, 306, -40], [262, 268, 20], [300, 236, -30], [350, 196, 40], [400, 160, -20], [455, 126, 30], [510, 96, -30], [560, 70, 20], [262, 180, -70], [270, 150, 60], [450, 154, 10], [490, 160, -50]].map((l) => '<ellipse class="lf" cx="' + l[0] + '" cy="' + l[1] + '" rx="26" ry="7" transform="rotate(' + l[2] + ' ' + l[0] + ' ' + l[1] + ')"/>').join('') + '</svg>' +
      '<div class="wd-in"><span class="wd-n">01 · The garden</span><h3><a class="stretch" href="#flora">Flora</a></h3><p>Olive and citrus trees, Mediterranean plants and terracotta, chosen for the sun and built to last.</p><ul class="wd-tags"><li>Olive</li><li>Citrus</li><li>Lavender</li><li>Terracotta</li></ul><span class="go">Enter the garden ' + ARR + '</span></div></div>' +
      '<a class="wd-bridge" href="#workshops" data-reveal style="--d:.3s">' + slot({ k: 'workshop', s: 14 }, 'zoom round', { photo: 'home-bridge', sizes: '170px' }) + '<b>Workshops</b><small>Where they meet</small></a>' +
      '<div class="wd living' + (isReady('home-door-living') ? ' has-ph' : '') + '" data-reveal style="--d:.15s">' + (isReady('home-door-living') ? '<span class="wd-ph" aria-hidden="true">' + pic('home-door-living', { sizes: '(max-width: 960px) 100vw, 50vw', alt: '' }) + '</span>' : '') + '<div class="wd-panels" aria-hidden="true"><i></i><i></i><i></i></div><div class="wd-chips" aria-hidden="true">' + D.colours.slice(0, 6).map((c) => '<i style="--c:' + c[1] + '"></i>').join('') + '</div>' +
      '<div class="wd-in"><span class="wd-n">02 · The rooms</span><h3><a class="stretch" href="#living">Living</a></h3><p>Mineral paint, lime plaster, zellige and microcement, with the tools to apply them. Surfaces with depth.</p><ul class="wd-tags"><li>Paint</li><li>Plaster</li><li>Tiles</li><li>Microcement</li></ul><span class="go">Enter the rooms ' + ARR + '</span></div></div>' +
      '</div></div></section>' +

      /* the house in one photograph: the statement lights up as you scroll over it */
      '<section class="story"><div class="story-pin">' + slot({ k: 'courtyard', s: 41 }, 'story-img', { photo: 'home-hero', sizes: '100vw', par: .05 }) + '<div class="story-shade" aria-hidden="true"></div></div>' +
      '<div class="wrap story-in"><p class="kicker">Why DaVinci</p><p class="big" data-lit>' + (window.DV_I18N ? window.DV_I18N.t : (x) => x)('A tree gives light a shape. A lime wall gives it somewhere soft to land. We sell both, because the rooms people love usually need both.').split(' ').map((w) => '<span class="mw">' + w + '</span>').join(' ') + '</p>' +
      '<dl class="story-facts"><div><dt>Two</dt><dd>webshops, Flora and Living</dd></div><div><dt>One</dt><dd>basket and one checkout</dd></div><div><dt>Almere</dt><dd>showroom, opening expected December 2026 <span class="tbc">(to be confirmed)</span></dd></div></dl></div></section>' +

      /* the garden */
      '<section class="garden"><div class="garden-light" aria-hidden="true">' + leaves(23) + '</div><div class="wrap garden-in">' +
      '<div class="garden-copy"><p class="shopname" data-reveal>01 · Flora</p><h2 class="g-t" data-split>' + sp('Bring a little <em>Italy indoors</em>') + '</h2>' +
      '<p class="lead" data-reveal>An olive tree is slow, silver and forgiving. Give it your brightest window and it settles in for years. Lemon and bergamot bring scent. A fig brings leaves the size of a hand.</p><div data-reveal><a class="btn ivory" href="#flora">Shop Flora ' + ARR + '</a></div></div>' +
      '<div class="feature-media garden-media">' + slot({ k: 'citrus', s: 31, big: 1 }, 'main zoom', { photo: 'home-flora-feature', sizes: '(max-width: 960px) 100vw, 46vw', reveal: 1, par: .05 }) +
      slot({ k: 'olive', s: 12, w: ['#e8dcc0', '#cdb58c'] }, 'detail', { photo: 'home-flora-detail', sizes: '260px', reveal: 1, d: .35, nolabel: 1 }) + '</div></div>' +
      '<div class="wrap"><ul class="tags">' + D.shops.flora.cats.map((c, i) => '<li style="--i:' + i + '" data-reveal><a class="tag-c" href="#flora-' + c[0] + '"><i class="tag-hole" aria-hidden="true"></i><span class="tag-n">0' + (i + 1) + '</span>' + rend(FREP[c[0]], 'tag-r') + '<b>' + c[1] + '</b><span class="tag-d">' + c[2] + '</span><small>' + items(catCount('flora', c[0])) + '</small></a></li>').join('') + '</ul></div></section>' +

      /* the rooms */
      '<section class="rooms3"><div class="wrap rooms3-in">' +
      '<div class="feature-media rooms3-media living-c">' + slot({ k: 'swatch', s: 1 }, 'main zoom', { photo: 'home-living-feature', sizes: '(max-width: 960px) 100vw, 58vw', reveal: 1, par: .04 }) +
      slot({ k: 'plaster', s: 61, col: '#d4bc96' }, 'detail', { photo: 'home-living-detail', sizes: '260px', reveal: 1, d: .35, nolabel: 1 }) + '</div>' +
      '<div class="rooms3-copy"><p class="shopname" data-reveal>02 · Living</p><h2 class="r-t" data-split>' + sp('Walls that move <em>with the light</em>') + '</h2><p class="lead" data-reveal>Lime and mineral finishes are not a flat colour. They have cloud, depth and a soft sheen that changes from morning to evening. Order a sample set first and see it on your own wall.</p><div data-reveal><a class="btn clay" href="#living">Shop Living ' + ARR + '</a></div></div></div>' +
      '<div class="wrap"><div class="boards">' + D.shops.living.cats.map((c, i) => '<a class="bd" href="#living-' + c[0] + '" data-reveal style="--d:' + (i * .07) + 's"><span class="bd-clip" aria-hidden="true"></span><span class="bd-n">0' + (i + 1) + '</span><span class="bd-img">' + rend(LREP[c[0]]) + '</span><b>' + c[1] + '</b><small>' + items(catCount('living', c[0])) + '</small></a>').join('') + '</div></div></section>' +

      /* the collection: a shelf from both shops */
      '<section class="shelf-sec"><div class="wrap"><div class="shelf-head"><div><span class="eyebrow" data-reveal>One basket for both</span><h2 class="s-t" data-split>' + sp('From the garden <em>and</em> the rooms') + '</h2></div>' +
      '<div class="shelf-nav"><button class="snav" data-shelf="-1" aria-label="Previous products">' + ARR + '</button><button class="snav" data-shelf="1" aria-label="Next products">' + ARR + '</button></div></div></div>' +
      '<div class="shelf" id="shelf" tabindex="0" aria-label="Featured products from both shops">' + feat.map((p, i) => card(p, i, { reveal: 1, tag: 1 })).join('') + '</div>' +
      '<div class="wrap shelf-foot"><a class="link" href="#flora">All of Flora</a><a class="link" href="#living">All of Living</a></div></section>' +
      fx('vendingTeaser') +

      /* the studio */
      '<section class="studio"><div class="wrap studio-in"><div class="studio-head"><span class="eyebrow" data-reveal>Workshops</span><h2 class="w-t" data-split>' + sp('Learn it <em>by hand</em>') + '</h2>' +
      '<p class="lead" data-reveal>Small groups, real materials and a skill you keep. Care for an olive tree, plaster a wall or lay microcement, with an instructor beside you.</p><div data-reveal><a class="btn" href="#workshops">All workshops ' + ARR + '</a></div>' +
      '<div class="studio-props" aria-hidden="true">' + rend('tool-trowels', 'sp1') + rend('lavender-trio', 'sp2') + rend('paint-samples', 'sp3') + '</div></div>' +
      '<div class="tickets">' + D.workshops.slice(0, 4).map((w, i) => { const d = w.date.split(' '); return '<a class="tk ' + w.theme + '" href="#workshops" data-reveal style="--d:' + (i * .08) + 's"><span class="tk-stub"><small>' + d[0] + '</small><b>' + d[1] + '</b><span>' + d[2] + ' ' + d[3] + '</span></span><span class="tk-body"><span class="chip ' + w.theme + '">' + worldName(w.theme) + '</span><b>' + w.title + '</b><small>' + w.time + ' · ' + w.dur + ' · ' + eur(w.price) + '</small></span>' + ARR_L + '</a>'; }).join('') +
      '<p class="note">Example dates. The programme is confirmed before launch.</p></div></div></section>' +

      /* projects: one section, four example rooms (feature + list) */
      (() => {
        const PH = { p1: 'home-step-visit', p2: 'home-step-advice', p3: 'home-step-project', p4: 'home-step-workshop' };
        const img = (pj, sizes) => PH[pj.id] && isReady(PH[pj.id]) ? pic(PH[pj.id], { sizes: sizes, alt: '' }) : slot(pj.art, '', { nolabel: 1, sizes: sizes, alt: pj.title });
        const f = P[0], rest = P.slice(1, 4);
        return '<section class="pj4"><div class="wrap">' +
          '<div class="pj4-head"><div><span class="eyebrow" data-reveal>Example rooms</span><h2 class="pj4-t" data-split>' + sp('Four rooms to <em>borrow from</em>') + '</h2></div>' +
          '<div class="pj4-side" data-reveal><p>Each room is built from products in our shops. Take the whole idea, or borrow one piece of it.</p><a class="btn" href="#projects">All projects ' + ARR + '</a></div></div>' +
          '<div class="pj4-grid">' +
          '<a class="pj4-feat" href="#projects" data-pj="' + f.id + '" data-reveal><span class="pj4-img">' + img(f, '(max-width: 960px) 100vw, 56vw') + '</span>' +
          '<span class="pj4-cap"><small>01 · ' + f.type + '</small><b>' + f.title + '</b><span>' + f.text + '</span><em>See the room ' + ARR + '</em></span></a>' +
          '<ol class="pj4-list">' + rest.map((pj, i) => '<li data-reveal style="--d:' + ((i + 1) * .08) + 's"><a href="#projects" data-pj="' + pj.id + '"><span class="pj4-th">' + img(pj, '160px') + '</span>' +
            '<span class="pj4-tx"><small>0' + (i + 2) + ' · ' + pj.type + '</small><b>' + pj.title + '</b><span>' + pj.text + '</span></span><span class="pj4-go" aria-hidden="true">' + ARR + '</span></a></li>').join('') + '</ol>' +
          '</div><p class="pj4-note" data-reveal>Example projects, shown to illustrate the approach. DaVinci\'s own client work follows.</p></div></section>';
      })();
  }
  /* additional features (vending machine, subscriptions, seasonal promotion): see js/features.js */
  const FX = window.DV_FEATURES ? window.DV_FEATURES({ ARR, eur, sp, esc, pic, isReady, modal }) : null;
  const fx = (fn) => (FX ? FX[fn]() : '');
  let shopState = { shop: 'flora', cat: 'all', q: '' };
  function shopList() {
    const q = shopState.q.trim().toLowerCase();
    return D.products.filter((p) => p.shop === shopState.shop && (shopState.cat === 'all' || p.cat === shopState.cat) &&
      (!q || (p.name + ' ' + p.sub + ' ' + catName(p.shop, p.cat)).toLowerCase().includes(q)));
  }
  /* Shop categories. Flora: arched glasshouse windows. Living: sample boards on a rail. */
  function shopIndex(shop) {
    const S = D.shops[shop], F = shop === 'flora';
    const total = D.products.filter((p) => p.shop === shop).length;
    const REP = F ? { olive: 'olive-vecchio', citrus: 'lemon-meyer', mediterranean: 'lavender-trio', pots: 'pot-impruneta', combos: 'combo-pair' } : { paint: 'paint-calce', finishes: 'plaster-lime', tiles: 'tile-zellige', tools: 'tool-trowels', other: 'other-tray' };
    const head = '<div class="ci-head"><span class="eyebrow" data-reveal>Shop by category</span><h2 class="ci-t" data-split>' + sp(F ? 'Start with <em>your window</em>' : 'Walls <em>with depth</em>') + '</h2>' +
      '<p class="lead" data-reveal>' + (F ? 'Olives and agave want the brightest spot you have. Citrus likes light and a regular drink. Rosemary and lavender are happiest on a sunny sill. Tell us how much light the spot gets and we will point you to the right tree.' : 'Lime plaster, Venetian stucco and mineral paint, plus tiles, microcement and the tools to apply them. Finishes that change with the light.') + '</p></div>';
    const tiles = S.cats.map((c, i) => '<a class="ci" href="#' + shop + '-' + c[0] + '" data-reveal style="--d:' + (i * .06) + 's"><span class="ci-win">' + rend(REP[c[0]]) + '</span><span class="ci-n">0' + (i + 1) + '</span><b>' + c[1] + '</b><span class="ci-d">' + c[2] + '</span><small>' + items(catCount(shop, c[0])) + '</small></a>').join('') +
      '<a class="ci ci-all" href="#' + shop + '" data-scroll="#toolbar" data-reveal style="--d:.3s"><span class="ci-win"><span class="ci-num">' + total + '</span></span><span class="ci-n">All</span><b>All of ' + S.name + '</b><span class="ci-d">' + (F ? 'Every tree, plant and pot in one view.' : 'Every paint, finish, tile and tool in one view.') + '</span><small>' + items(total) + '</small></a>';
    return '<section class="cidx ' + shop + '"><div class="wrap">' + head + '<div class="ci-row">' + tiles + '</div></div></section>';
  }
  /* a slow ribbon of words; it speeds up briefly while the page scrolls */
  function marquee(words) {
    const run = '<span>' + words.map((w) => w + '<i aria-hidden="true"></i>').join('') + '</span>';
    return '<div class="marquee" aria-hidden="true"><div class="mq-track">' + run + run + '</div></div>';
  }
  function shopPage(shop, cat) {
    shopState = { shop, cat, q: '' };
    const S = D.shops[shop], isF = shop === 'flora';
    const band = isF
      ? '<section class="care3"><div class="garden-light" aria-hidden="true">' + leaves(41) + '</div><div class="wrap care3-in"><div class="care3-head"><span class="eyebrow" data-reveal>Seasonal care</span><h2 class="g-t" data-split>' + sp('Winter care for <em>olive and citrus</em>') + '</h2>' +
        '<div class="ch-actions" data-reveal><a class="btn ivory" href="#workshops">Join the care workshop ' + ARR + '</a><a class="link" href="#showroom" data-intent="advice">Ask for plant advice</a></div></div>' +
        '<ol class="care3-list">' + [['Olive', 'Most olives cope with light frost in a sheltered spot.', 'olive-frantoio'], ['Citrus', 'Citrus prefer a bright, cool and frost-free room.', 'bergamot'], ['Until spring', 'Water sparingly, and keep pots off cold stone.', 'pot-impruneta']].map((x, i) => '<li data-reveal style="--d:' + (i * .1) + 's">' + rend(x[2], 'care3-r') + '<span class="n">0' + (i + 1) + '</span><b>' + x[0] + '</b><p>' + x[1] + '</p></li>').join('') + '</ol></div></section>'
      : '<section class="lib3"><div class="wrap"><div class="lib3-head"><div><span class="eyebrow" data-reveal>Colour library</span><h2 class="r-t" data-split>' + sp('Eight earth tones') + '</h2></div><div class="lib3-side"><p class="lead" data-reveal>Colour changes with your light. North light cools it and south light warms it, so test on your own wall, in the morning and again in the evening.</p><div data-reveal><a class="btn clay" href="#product-paint-samples">Order colour samples ' + ARR + '</a></div></div></div>' +
        '<div class="strips">' + D.colours.map((c, i) => '<a class="strip" href="#product-paint-samples" data-reveal style="--d:' + (i * .05) + 's;--c:' + c[1] + '"><i></i><span><b>' + c[0] + '</b><small>Example tone</small></span></a>').join('') + '</div></div></section>';
    const fp = byId(isF ? 'olive-leccino' : 'stucco-veneziano'), total = D.products.filter((x) => x.shop === shop).length;
    const sx = '<section class="sx sx-' + shop + '" data-scene>' +
      slot(isF ? { k: 'grove', s: 17 } : { k: 'plasterroom', s: 23 }, 'sx-bg', { photo: shop + '-hero', eager: 1, sizes: '100vw', par: .06 }) + '<div class="sx-shade" aria-hidden="true"></div>' + (isF ? leaves(5) : '<div class="sx-rake" aria-hidden="true"></div>') +
      '<div class="wrap sx-top"><p class="crumb"><a href="#home">Home</a><span>/</span><span>' + S.name + ' webshop</span></p><span class="sx-k">' + (isF ? '01 · Flora' : '02 · Living') + '</span></div>' +
      '<h1 class="sx-word" data-depth="-.25" data-split>' + sp(S.name) + '</h1>' +
      '<a class="sx-chip c1" href="#product-' + fp.id + '" data-depth="1.1"><small>Featured · example</small><b>' + fp.name + '</b><span class="price">' + fromTag(fp) + eur(fp.price) + '</span></a>' +
      '<button class="sx-chip c2" data-scroll="#toolbar" data-depth="1.4"><small>' + (isF ? 'Trees, plants, pots' : 'Paint, plaster, tiles, tools') + '</small><b>' + total + ' products</b><span>See the range</span></button>' +
      '<div class="wrap sx-copy"><p class="hero-sub" data-reveal style="--d:.4s">' + (isF ? 'Olive, lemon and fig, for the rooms you live in. Trees and plants chosen to live indoors, with pots to match.' : 'Walls with depth. Finishes that change with the light, and the tools to apply them.') + '</p>' +
      '<div class="phero-cta" data-reveal style="--d:.55s">' + (isF ? '<a class="btn ivory" href="#flora-olive">Shop olive trees ' + ARR + '</a>' : '<a class="btn ivory" href="#product-paint-samples">Order colour samples ' + ARR + '</a>') + '<button class="btn light" data-scroll="#toolbar">See the full range</button></div>' +
      '</div></section>';
    return '<div class="shop-' + shop + '">' + sx +
      shopIndex(shop) +
      '<div class="toolbar" id="toolbar"><div class="wrap toolbar-in"><div class="pills" id="pills" role="navigation" aria-label="Categories">' + pills() + '</div>' +
      '<label class="field">' + ICON_S + '<span class="sr">Search ' + S.name + '</span><input id="shopq" type="search" placeholder="Search ' + S.name + '" autocomplete="off"></label></div></div>' +
      '<div class="wrap shopgrid"><p id="shopcount" class="shopcount" aria-live="polite"></p><div class="pgrid" id="sgrid"></div><p class="note" style="margin-top:48px">Prototype products and placeholder prices. Product images are illustrative 3D renders; the real assortment, photography, stock and delivery details are confirmed before launch.</p></div>' +
      (isF ? fx('subsTeaser') : '') + band + '</div>';
  }
  function pills() {
    const S = D.shops[shopState.shop];
    return [['all', 'All ' + S.name]].concat(S.cats.map((c) => [c[0], c[1]])).map((c) => '<a class="pill" href="#' + shopState.shop + (c[0] === 'all' ? '' : '-' + c[0]) + '"' + (shopState.cat === c[0] ? ' aria-current="true"' : '') + '>' + c[1] + '</a>').join('');
  }
  function fillGrid(animate) {
    const list = shopList();
    $('#sgrid').innerHTML = list.length ? list.map((p, i) => card(p, i, { enter: animate })).join('') : '<p class="empty">Nothing matches that search yet.</p>';
    $('#shopcount').textContent = list.length + (list.length === 1 ? ' product' : ' products') + (shopState.cat !== 'all' ? ' in ' + catName(shopState.shop, shopState.cat) : '');
  }

  const pdp = { id: '', sel: [], qty: 1, view: 0 };
  const VIEWS = [['1', '50% 50%'], ['2', '50% 18%'], ['2', '50% 88%']];
  function productPage(id) {
    const p = byId(id); if (!p) return homePage();
    Object.assign(pdp, { id, sel: (p.variants || []).map(() => 0), qty: 1, view: 0 });
    const S = D.shops[p.shop];
    /* Gallery: real photos when listed as ready (packshot, detail, in place); otherwise the studio render, with a live 3D view on request. */
    const SHOTS = ['', 'detail', 'in place'];
    const real = [1, 2, 3].map((n) => 'p-' + p.id + '-' + n).filter(isReady);
    real.forEach((k) => { artFor[k] = p.art; });
    let views;
    if (real.length) views = real.map((k, i) => ({ html: '<div class="zl">' + pic(k, { alt: p.name + (SHOTS[i] ? ', ' + SHOTS[i] : ''), sizes: '(max-width: 960px) 100vw, 55vw' }) + '</div>', th: '<div class="zl">' + pic(k, { alt: '', sizes: '90px' }) + '</div>' }));
    else if (P3D[p.id]) views = [{ html: '<div class="zl"><img class="pd-rend" src="img/3d-p-' + p.id + '.webp" alt="' + esc(p.name) + ', illustrative 3D render"></div><span class="phlabel"><span>3D render</span><span class="l2"> · photo to come</span></span>', th: '<div class="zl"><img class="pd-rend" src="img/3d-p-' + p.id + '.webp" alt=""></div>' }];
    else views = VIEWS.map((v) => ({ html: '<div class="zl" style="--s:' + v[0] + ';--o:' + v[1] + '">' + window.DV_ART(p.art) + '</div>' + labelFor('p-' + p.id + '-1'), th: '<div class="zl" style="--s:' + v[0] + ';--o:' + v[1] + '">' + window.DV_ART(p.art) + '</div>' }));
    const has3d = false; /* live 3D viewer switched off on product pages (Nov 2026); was: GL_OK && P3D[p.id] */
    const layers = views.map((x, i) => '<div class="layer' + (i === 0 ? ' on' : '') + '" data-layer="' + i + '">' + x.html + '</div>').join('');
    const thumbs = views.length > 1 ? views.map((x, i) => '<button class="thumb" data-view="' + i + '" aria-label="Image ' + (i + 1) + ' of ' + views.length + '"' + (i === 0 ? ' aria-current="true"' : '') + '>' + x.th + '</button>').join('') : '';
    const related = D.products.filter((x) => x.shop === p.shop && x.id !== p.id).slice(0, 6);
    return '<div class="pd-page ' + p.shop + '"><div class="wrap"><p class="crumb"><a href="#home">Home</a><span>/</span><a href="#' + p.shop + '">' + S.name + '</a><span>/</span><a href="#' + p.shop + '-' + p.cat + '">' + catName(p.shop, p.cat) + '</a></p>' +
      '<div class="pdp pd"><div class="pd-media" data-reveal>' +
      '<div class="stage pd-stage" id="stage" data-zoom><span class="pd-back" aria-hidden="true"></span>' + layers + '</div>' +
      (has3d ? '<div class="g3 pd-gl" id="pd3d" data-g3="product" data-lazy3d data-drag="1" data-g3o=\'' + JSON.stringify({ id: p.id, aspect: .8, shadow: .26, pad: 1.5 }) + '\' hidden><span class="g3-hint">Drag to turn · illustrative 3D render</span></div>' : '') +
      '<div class="pd-bar">' + (thumbs ? '<div class="thumbs">' + thumbs + '</div>' : '<span></span>') + (has3d ? '<button class="pd-3d" data-3d aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg><span>View in 3D</span></button>' : '') + '</div></div>' +
      '<div class="pinfo pd-info" data-reveal style="--d:.15s"><div><span class="shoptag ' + p.shop + '">' + S.name + ' webshop' + '</span>' + (p.badge ? badgeTag(p.badge) : '') + '<h1>' + p.name + '</h1><p class="sub">' + p.sub + '</p></div>' +
      '<div class="pd-pricebar"><div class="big-price" id="pprice">' + eur(unit(p, pdp.sel)) + '</div><span class="pd-vat">Placeholder price</span></div><p class="pd-desc">' + p.desc + '</p>' +
      (p.variants || []).map((v, gi) => '<div class="vgrp"><div class="lbl">' + v.label + '<span id="vsel' + gi + '">' + v.opts[0][0] + '</span></div><div class="opts" role="radiogroup" aria-label="' + v.label + '">' + v.opts.map((o, oi) => '<button class="opt" role="radio" aria-checked="' + (oi === 0) + '" data-opt="' + gi + ':' + oi + '">' + o[0] + (o[1] ? ' <span class="opt-x">+' + eur(o[1]) + '</span>' : '') + '</button>').join('') + '</div></div>').join('') +
      '<div class="qtyrow"><div class="qty"><button data-pq="-1" aria-label="Fewer">&minus;</button><output id="pqty" aria-live="polite">1</output><button data-pq="1" aria-label="More">+</button></div><button class="btn full" id="padd" data-pdp-add>Add to basket</button></div>' +
      '<ul class="pd-assure"><li>One basket for Flora and Living</li><li>Advice in the showroom or online</li><li>Delivery details confirmed before launch</li></ul>' +
      '<p class="note">Prototype product with a placeholder price. Availability is confirmed before launch.</p>' +
      '<div class="acc"><details open><summary>Details</summary><div class="body">' + p.desc + '</div></details><details><summary>Delivery and returns</summary><div class="body">Delivery options, costs and the returns policy will be confirmed before launch.</div></details><details><summary>' + (p.shop === 'flora' ? 'Care' : 'Application') + '</summary><div class="body">' + (p.shop === 'flora' ? 'Care guidance for this plant is added once the assortment is confirmed. Join a workshop for hands-on advice.' : 'Application guidance for this product is added once the assortment is confirmed. Our workshops cover technique step by step.') + '</div></details></div></div></div></div>' +
      '<section class="pd-more"><div class="wrap shelf-head"><div><span class="eyebrow">More from ' + S.name + '</span><h2 class="s-t" data-split>' + sp(p.shop === 'flora' ? 'From the <em>same garden</em>' : 'From the <em>same rooms</em>') + '</h2></div><a class="link" href="#' + p.shop + '">Shop all</a></div>' +
      '<div class="shelf">' + related.map((r, i) => card(r, i, { reveal: 1 })).join('') + '</div></section></div>';
  }
  let wsFilter = 'all';
  function workshopsPage() {
    const W = D.workshops;
    const board = W.slice(0, 3).map((w, i) => { const d = w.date.split(' '); return '<a class="pn ' + w.theme + '" href="#wsf" data-scroll="#ws-' + w.id + '" style="--r:' + [-3, 2, -1.5][i] + 'deg"><span class="pn-pin" aria-hidden="true"></span><small>' + d[0] + ' ' + d[1] + ' ' + d[2] + '</small><b>' + w.title + '</b><span>' + w.dur + ' · ' + eur(w.price) + '</span></a>'; }).join('');
    return '<div class="ws-page"><section class="wsx" data-scene>' +
      '<div class="wrap wsx-in"><div class="wsx-copy"><p class="crumb"><a href="#home">Home</a><span>/</span><span>Workshops</span></p>' +
      '<h1 class="wsx-t" data-split>' + sp('Learn it <em>by hand</em>') + '</h1>' +
      '<p class="hero-sub" data-reveal style="--d:.4s">Small groups, real materials and a skill you keep. You will leave knowing how to do it yourself.</p>' +
      '<div class="phero-cta" data-reveal style="--d:.55s"><button class="btn" data-scroll="#wsf">See the dates ' + ARR + '</button><a class="btn ghost" href="#showroom" data-intent="question">Ask a question</a></div>' +
      '<dl class="wsx-facts" data-reveal style="--d:.7s"><div><dt>' + W.length + '</dt><dd>example workshops</dd></div><div><dt>6 to 12</dt><dd>places per group</dd></div><div><dt>2 to 7 h</dt><dd>per session</dd></div></dl></div>' +
      '<div class="wsx-stage"><div class="wsx-arch" data-depth="-.25">' + slot({ k: 'worktable', s: 29 }, '', { photo: 'workshops-hero', eager: 1, reveal: 1, sizes: '(max-width: 960px) 90vw, 40vw' }) + '</div>' +
      '<div class="wsx-board" data-depth=".7"><span class="eyebrow">Next on the table</span>' + board + '</div>' +
      rend('tool-trowels', 'wsx-p p1') + rend('lavender-trio', 'wsx-p p2') + rend('paint-samples', 'wsx-p p3') + '</div></div></section>' +
      '<section class="wsl"><div class="wrap"><div class="ws-bar" id="wsf"><div><span class="eyebrow">The programme</span><h2 class="s-t">Choose a <em>workshop</em></h2></div><div class="seg2" role="group" aria-label="Filter workshops">' + [['all', 'All'], ['flora', 'Flora'], ['living', 'Living'], ['both', 'Flora + Living']].map((f) => '<button class="pill" data-wsf="' + f[0] + '" aria-pressed="' + (wsFilter === f[0]) + '">' + f[1] + ' <span class="pc">' + (f[0] === 'all' ? W.length : W.filter((w) => w.theme === f[0]).length) + '</span></button>').join('') + '</div></div>' +
      '<div class="wlist" id="wslist">' + wsRows() + '</div>' +
      '<p class="note" style="margin-top:36px">Example workshops. Dates, duration, pricing and booking details are updated as the programme develops.</p></div></section></div>';
  }
  function wsRows() {
    const list = D.workshops.filter((w) => wsFilter === 'all' || w.theme === wsFilter);
    const label = (t) => (t === 'both' ? 'Flora + Living' : D.shops[t].name);
    return list.map((w, i) => { const d = w.date.split(' ');
      return '<article class="wt ' + w.theme + '" id="ws-' + w.id + '" style="--i:' + i + '">' +
        '<div class="wt-stub"><small>' + d[0] + '</small><b>' + d[1] + '</b><span>' + d[2] + ' ' + d[3] + '</span><i class="wt-time">' + w.time + '</i></div>' +
        '<div class="wt-body"><div class="wtop"><span class="wnum">0' + (i + 1) + '</span><span class="chip ' + w.theme + '">' + label(w.theme) + '</span></div><h3>' + w.title + '</h3><p class="wblurb">' + w.blurb + '</p>' +
        '<dl class="wmeta"><div><dt>Date</dt><dd>' + w.date + '</dd></div><div><dt>Duration</dt><dd>' + w.dur + '</dd></div><div><dt>Group</dt><dd>' + w.spots + ' places</dd></div></dl></div>' +
        slot(w.art, 'wt-img zoom', { photo: 'workshop-' + w.id, sizes: '(max-width: 960px) 100vw, 26vw' }) +
        '<div class="wt-buy"><span class="price">' + eur(w.price) + '</span><small>per person</small><button class="btn" data-book="' + w.id + '">Book a place ' + ARR + '</button></div></article>'; }).join('');
  }
  function projectsPage() {
    const P = D.projects;
    const mats = (p) => '<div class="ch-items spec"><span class="eyebrow">Plants and materials</span>' + p.items.map((it) => { const x = byId(it[1]); return '<a href="#product-' + it[1] + '">' + (x && P3D[x.id] ? rend(x.id, 'spec-r') : '') + '<b>' + it[0] + '</b><span>' + (x ? D.shops[x.shop].name : '') + '</span>' + ARR_L + '</a>'; }).join('') + '</div>';
    const meta = (p) => '<div class="meta"><span class="chip ' + p.world + '">' + worldName(p.world) + '</span><span>' + p.type + '</span><span>' + p.place + '</span></div>';
    const cta = '<div class="ch-actions"><a class="btn sm" href="#showroom" data-intent="project">Discuss a project like this ' + ARR + '</a></div>';
    const title = (p, i) => '<header class="sp-head" data-reveal><span class="sp-num">0' + (i + 1) + '</span><div>' + meta(p) + '<h2 class="sp-t">' + p.title + '</h2></div></header>';
    const img = (p, cls, o) => slot(o && o.b ? p.artB : p.art, cls, Object.assign({ photo: 'project-' + p.id + (o && o.b ? '-b' : ''), alt: o && o.b ? (PH.slots['project-' + p.id + '-b'] || {}).alt : p.title }, o || {}));
    const index = '<nav class="pj-index" aria-label="Projects on this page" data-reveal style="--d:.6s">' +
      P.map((p, i) => '<a href="#projects" data-scroll="#pj-' + p.id + '"><span>0' + (i + 1) + '</span><b>' + p.title + '</b><small>' + worldName(p.world) + '</small></a>').join('') + '</nav>';
    const [a, b, c, d] = P;
    return '<section class="pjx"><div class="pjx-img">' + slot({ k: 'loggia', s: 53 }, '', { photo: 'projects-hero', eager: 1, reveal: 1, sizes: '100vw', par: .06 }) + '<div class="pjx-shade" aria-hidden="true"></div></div>' +
      '<div class="wrap pjx-in"><p class="crumb"><a href="#home">Home</a><span>/</span><span>Projects</span></p>' +
      '<h1 class="pjx-t" data-split>' + sp('Four rooms<br> to <em>borrow from</em>') + '</h1>' +
      '<p class="hero-sub" data-reveal style="--d:.5s">Each room is built from products in our shops. Take the whole idea, or borrow one piece of it.</p>' + index + '</div></section>' +

      '<section class="pj-intro3"><div class="wrap"><p class="statement" data-reveal>Plants and materials, designed together: the olive chosen for the plaster behind it, the tile for the pot that stands on it.</p>' +
      '<div class="side" data-reveal style="--d:.15s"><p class="lead">Each project lists the plants and materials it uses, linked to the shop, so you can start from the result you like.</p><div class="legend"><span class="chip flora">Flora</span><span class="chip living">Living</span><span class="chip both">Flora + Living</span></div></div></div></section>' +

      '<section class="spread sp-a chapter ch-a" id="pj-' + a.id + '"><div class="wrap">' + title(a, 0) +
      '<div class="sp-a-grid"><div class="sp-a-media">' + img(a, 'sp-wide zoom', { sizes: '(max-width: 960px) 100vw, 64vw', reveal: 1, par: .05 }) + img(a, 'sp-detail', { b: 1, sizes: '22vw', reveal: 1, d: .2, nolabel: 1 }) + '</div>' +
      '<div class="sp-side" data-reveal style="--d:.1s"><p class="lead">' + a.long + '</p>' + mats(a) + cta + '</div></div></div></section>' +

      '<section class="spread sp-b chapter ch-b" id="pj-' + b.id + '"><div class="wrap">' + title(b, 1) +
      '<div class="ch-grid2"><div class="media">' + img(b, 'm1 zoom', { sizes: '(max-width: 960px) 100vw, 55vw', reveal: 1, par: .05 }) + img(b, 'm2', { b: 1, sizes: '22vw', reveal: 1, d: .3, nolabel: 1 }) + '</div>' +
      '<div class="right"><div class="ch-copy" data-reveal><p class="lead">' + b.long + '</p>' + mats(b) + cta + '</div></div></div></div></section>' +

      '<section class="spread sp-c chapter ch-c" id="pj-' + c.id + '"><div class="wrap">' + title(c, 2) +
      '<div class="ch-grid"><div class="ch-copy" data-reveal><p class="lead">' + c.long + '</p>' + mats(c) + cta + '</div>' +
      '<div class="media">' + img(c, 'm1 zoom', { sizes: '(max-width: 960px) 100vw, 55vw', reveal: 1, par: .05 }) + img(c, 'm2', { b: 1, sizes: '22vw', reveal: 1, d: .25, nolabel: 1 }) + '</div></div></div></section>' +

      '<section class="spread sp-d chapter ch-d" id="pj-' + d.id + '"><div class="wrap">' + title(d, 3) +
      '<div class="full">' + img(d, 'zoom', { sizes: '100vw', reveal: 1, par: .05 }) + '<div class="shade"></div><div class="card-over" data-reveal><p class="lead">' + d.long + '</p>' + mats(d) + cta + '</div></div></div></section>' +

      '<section class="sec tone-olive arcade-top"><div class="wrap"><div class="sechead"><div><span class="eyebrow">How a project comes together</span><h2 class="h2" data-split style="margin-top:14px">' + sp('From first idea to finished space') + '</h2></div></div>' +
      '<ol class="process">' + [['01', 'Talk it through', 'In the showroom or online: the space, the light, how you live in it, and what it should feel like.'], ['02', 'Choose together', 'Trees chosen in person, materials tested as samples, colours seen in your own daylight.'], ['03', 'Bring it home', 'Delivery planned around the work, with application advice or a workshop where a technique is new to you.']].map((s, i) => '<li data-reveal style="--d:' + (i * .1) + 's"><span class="n">' + s[0] + '</span><h3>' + s[1] + '</h3><p>' + s[2] + '</p></li>').join('') + '</ol>' +
      '<p class="note" style="margin-top:28px;color:var(--on-dark-muted);border-color:var(--on-dark-muted)">Services and delivery options are confirmed before launch.</p></div></section>' +

      '<section class="sec tone-ivory"><div class="wrap"><div class="pj-cta" data-reveal>' + slot({ k: 'olive', s: 120, big: 1, w: ['#e5d2ad', '#c4a274'], pot: '#94573a' }, 'zoom', { photo: 'projects-cta', sizes: '(max-width: 960px) 100vw, 40vw' }) +
      '<div class="inner"><span class="eyebrow">Start a project</span><h2 class="h2">Planning something similar?</h2><p style="color:#ecd9c6;max-width:44ch">Tell us about your room and we will tell you honestly what it needs.</p>' +
      '<div class="opts4">' + [['project', 'Discuss a similar project', 'Share the space and your plans'], ['advice', 'Request personal advice', 'Plants, materials or colour'], ['question', 'Contact DaVinci', 'A general question'], ['visit', 'Visit the showroom', 'See it all in person, in Almere']].map((o) => '<a href="#showroom" data-intent="' + o[0] + '"><b>' + o[1] + ARR_L + '</b><span>' + o[2] + '</span></a>').join('') + '</div></div></div></div></section>';
  }
  /* ---------- showroom / contact ---------- */
  const INTENTS = [['visit', 'Book a showroom visit', 'See plants and materials in person.'], ['advice', 'Request personal advice', 'Plants, materials, colour or finishes.'], ['project', 'Discuss an interior project', 'A room, a terrace or a renovation.'], ['question', 'Ask a general question', 'Orders, delivery or anything else.']];
  const TOPICS = [['plants', 'Plant selection'], ['materials', 'Interior materials'], ['colour', 'Colour advice'], ['finishes', 'Decorative finishes'], ['projects', 'Project discussion']];
  let askTopic = '', jumpToForm = false, jumpToProject = '';
  const fld = (id, label, input, req) => '<div class="fld"><label for="' + id + '">' + label + (req ? '' : ' <span class="opt-t">(optional)</span>') + '</label>' + input + '<p class="err" id="' + id + '-err"></p></div>';
  function formHTML(kind) {
    const today = new Date().toISOString().slice(0, 10);
    return '<form class="form" id="cform" data-form="contact" novalidate>' +
      '<fieldset class="fieldset"><legend class="flabel">What would you like to do?</legend><div class="choice-grid">' +
      INTENTS.map((x) => '<label class="choice"><input type="radio" name="intent" value="' + x[0] + '"' + (x[0] === kind ? ' checked' : '') + '><span class="dot" aria-hidden="true"></span><span><b>' + x[1] + '</b><small>' + x[2] + '</small></span></label>').join('') + '</div></fieldset>' +
      '<div class="twocol">' + fld('c-name', 'Name', '<input id="c-name" autocomplete="name" data-req="Please enter your name." aria-describedby="c-name-err">', 1) +
      fld('c-mail', 'Email', '<input id="c-mail" type="email" autocomplete="email" data-req="Please enter your email address." aria-describedby="c-mail-err">', 1) + '</div>' +
      '<div class="cond" data-for="visit"><div class="twocol">' + fld('c-date', 'Preferred day', '<input id="c-date" type="date" min="' + today + '" aria-describedby="c-date-err">', 0) +
      '<div class="fld"><span class="flabel" id="c-part-l">Part of the day</span><div class="seg" role="radiogroup" aria-labelledby="c-part-l">' + ['Morning', 'Afternoon', 'No preference'].map((v, i) => '<label><input type="radio" name="part" value="' + v + '"' + (i === 2 ? ' checked' : '') + '><span>' + v + '</span></label>').join('') + '</div></div></div></div>' +
      '<div class="cond" data-for="advice">' + fld('c-topic', 'Topic', '<select id="c-topic">' + TOPICS.slice(0, 4).map((t) => '<option value="' + t[0] + '">' + t[1] + '</option>').join('') + '</select>', 1) + '</div>' +
      '<div class="cond" data-for="project"><div class="twocol">' + fld('c-ptype', 'Type of project', '<select id="c-ptype"><option>Interior room</option><option>Garden, courtyard or terrace</option><option>Both inside and out</option></select>', 1) +
      fld('c-when', 'When', '<select id="c-when"><option>Within 3 months</option><option>In 3 to 6 months</option><option>Later, just exploring</option></select>', 1) + '</div></div>' +
      '<div class="twocol">' + fld('c-phone', 'Phone', '<input id="c-phone" type="tel" autocomplete="tel">', 0) + '<div></div></div>' +
      fld('c-msg', 'Message', '<textarea id="c-msg" placeholder="Tell us about your space, plants or colours" aria-describedby="c-msg-err"></textarea>', 1) +
      '<div class="fld"><label class="check"><input type="checkbox" id="c-ok" data-req="Please agree so we can reply to you." aria-describedby="c-ok-err"><span>I agree that DaVinci may use these details to answer my enquiry. Privacy policy to follow before launch.</span></label><p class="err" id="c-ok-err"></p></div>' +
      '<div class="form-foot"><p class="note">Demonstration form. Nothing is sent until it is connected to DaVinci\'s business systems.</p><button class="btn" type="submit">Send enquiry ' + ARR + '</button></div></form>' +
      '<div id="c-done" hidden></div>';
  }
  function showroomPage() {
    const k = intent; intent = 'visit';
    const info = '<aside class="info-card" aria-label="Showroom details" data-reveal style="--d:.6s"><span class="eyebrow">Showroom</span><h2>DaVinci, Almere</h2><dl class="facts"><div><dt>Opening</dt><dd>Expected December 2026 <span class="tbc">(to be confirmed)</span></dd></div><div><dt>Address</dt><dd><span class="tbc">To be confirmed</span></dd></div><div><dt>Hours</dt><dd><span class="tbc">To be confirmed</span></dd></div></dl></aside>';
    return '<section class="sx2" data-scene><div class="wrap sx2-head"><p class="crumb"><a href="#home">Home</a><span>/</span><span>Showroom &amp; contact</span></p>' +
      '<h1 class="sx2-t" data-split>' + sp('Come and see it in <em>daylight</em>') + '</h1></div>' +
      '<div class="sx2-arc"><div class="sx2-img" data-depth="-.2">' + slot({ k: 'showroomwide', s: 61 }, '', { photo: 'showroom-hero', eager: 1, reveal: 1, sizes: '100vw', par: .05 }) + '</div>' + arcade(3, 'sx2-lines') + '</div>' +
      '<div class="wrap sx2-foot"><div class="sx2-copy"><p class="hero-sub" data-reveal style="--d:.5s">Touch the plaster, smell the lemon leaves, and hold three whites up to the window before you choose one.</p>' +
      '<div class="phero-cta" data-reveal style="--d:.65s"><a class="btn" href="#showroom" data-ask="visit">Plan a visit ' + ARR + '</a><a class="btn ghost" href="#showroom" data-ask="advice">Ask for advice</a></div></div>' + info + '</div></section>' +

      '<section class="sec tone-ivory"><div class="wrap sr-intro"><div class="copy"><span class="eyebrow" data-reveal>The showroom</span><h2 class="h2" data-split>' + sp('A place to touch and compare') + '</h2>' +
      '<p class="lead" data-reveal>Walls you can run a hand over, trees you can smell, and finishes you can carry to the window. A photograph cannot do that.</p>' +
      '<div class="sr-list" data-reveal>' + [['Flora corner', 'Olive, citrus and Mediterranean plants, to choose tree by tree.'], ['Material wall', 'Plasters, paints, tiles and microcement as large samples in daylight.'], ['The long table', 'Where we sit down to plan a project, and where workshops can take place.']].map((x, i) => '<div><span class="n">0' + (i + 1) + '</span><div><h3>' + x[0] + '</h3><p>' + x[1] + '</p></div></div>').join('') + '</div>' +
      '<p class="note" data-reveal>Showroom layout shown as planned. Details follow before opening.</p></div>' +
      '<div class="mosaic">' + slot({ k: 'olive', s: 140, big: 1, w: ['#e9dcc0', '#cfb58a'] }, 'zoom archtop', { photo: 'showroom-flora', sizes: '(max-width: 960px) 55vw, 32vw', reveal: 1 }) + slot({ k: 'swatch', cols: ['#d8c19c', '#b9a98f', '#4f7a6a', '#b4562f', '#efe6d4', '#8f5a3c'] }, 'zoom', { photo: 'showroom-living', sizes: '(max-width: 960px) 45vw, 24vw', reveal: 1, d: .15 }) + slot({ k: 'workshop', s: 77 }, 'zoom', { photo: 'showroom-table', sizes: '(max-width: 960px) 45vw, 24vw', reveal: 1, d: .3 }) + '</div></div></section>' +

      '<section class="sec tone-linen"><div class="wrap"><div class="sechead"><div><span class="eyebrow">Personal advice</span><h2 class="h2" data-split style="margin-top:14px">' + sp('Ask before you choose') + '</h2></div><p class="lead" data-reveal style="max-width:42ch">Bring a photo of your room, or your floor plan. We will tell you what suits it, and what does not.</p></div>' +
      '<div class="advice-grid">' + D.advice.map((a, i) => '<article class="adv" data-reveal style="--d:' + (i * .07) + 's">' + slot(a.art, 'zoom', { photo: 'advice-' + a.id, sizes: '(max-width: 640px) 50vw, 20vw' }) + '<div class="txt"><h3>' + a.title + '</h3><p>' + a.text + '</p></div><button class="link" data-ask="' + a.id + '">Ask about this</button></article>').join('') + '</div></div></section>' +

      '<section class="sec tone-ivory" id="enquire"><div class="wrap contact"><div class="contact-aside" data-reveal><span class="eyebrow">Contact</span><h2 class="h2">How can we help?</h2><p class="lead">Choose what you would like to do. We will take it from there.</p>' +
      '<dl class="facts"><div><dt>Showroom</dt><dd>Almere, the Netherlands</dd></div><div><dt>Email</dt><dd><span class="tbc">To be confirmed</span></dd></div><div><dt>Phone</dt><dd><span class="tbc">To be confirmed</span></dd></div><div><dt>Reply time</dt><dd><span class="tbc">To be confirmed</span></dd></div></dl></div>' +
      '<div data-reveal style="--d:.12s">' + formHTML(k) + '</div></div></section>';
  }
  function updateCond() {
    const f = $('#cform'); if (!f) return;
    const v = (f.querySelector('input[name=intent]:checked') || {}).value || 'visit';
    $$('.cond', f).forEach((c) => { c.hidden = c.dataset.for !== v; });
    const msg = $('#c-msg'), lab = msg.closest('.fld').querySelector('label');
    if (v === 'question') { msg.dataset.req = 'Please write your question.'; lab.innerHTML = 'Message'; } else { delete msg.dataset.req; lab.innerHTML = 'Message <span class="opt-t">(optional)</span>'; }
    msg.placeholder = (window.DV_I18N ? window.DV_I18N.t : (x) => x)({ visit: 'Anything we should prepare for your visit?', advice: 'Tell us about the space, the light and what you have in mind', project: 'Tell us about the space and what you would like to achieve', question: 'Your question' }[v]);
  }
  function applyIntent(kind, topic) {
    const f = $('#cform'); if (!f) { intent = kind; askTopic = topic || ''; return; }
    if ($('#c-done') && !$('#c-done').hidden) { $('#c-done').hidden = true; f.hidden = false; }
    const r = f.querySelector('input[name=intent][value="' + kind + '"]'); if (r) r.checked = true;
    if (topic && $('#c-topic')) $('#c-topic').value = topic;
    updateCond();
  }
  function scrollToForm() { const el = $('#enquire'); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: RM ? 'auto' : 'smooth' }); }
  function initContact() {
    const f = $('#cform'); if (!f) return;
    $$('input[name=intent]', f).forEach((i) => i.addEventListener('change', updateCond));
    $$('[data-req]', f).forEach((el) => el.addEventListener(el.type === 'checkbox' ? 'change' : 'blur', () => { if (el.closest('.fld').classList.contains('bad')) check(el); }));
    if (askTopic && $('#c-topic')) $('#c-topic').value = askTopic;
    askTopic = ''; updateCond();
  }
  /* inline validation: one clear message under each field */
  function check(el) {
    const box = el.closest('.fld'), hidden = el.closest('[hidden]');
    const val = el.type === 'checkbox' ? el.checked : el.value.trim();
    let msg = '';
    if (!hidden && el.dataset.req && !val) msg = el.dataset.req;
    else if (!hidden && el.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) msg = 'Enter an email address like name@example.com.';
    box.classList.toggle('bad', !!msg); el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    const er = box.querySelector('.err'); if (er) er.textContent = msg;
    return !msg;
  }
  function validate(f) {
    let first = null;
    $$('[data-req], input[type=email]', f).forEach((el) => { if (!check(el) && !first) first = el; });
    if (first) first.focus();
    return !first;
  }
  /* ---------- router ---------- */
  function parse() {
    const h = (location.hash || '#home').slice(1);
    if (h.indexOf('product-') === 0) return { p: 'product', id: h.slice(8), key: h };
    const m = h.match(/^(flora|living)(?:-(\w+))?$/);
    if (m) return { p: 'shop', shop: m[1], cat: m[2] || 'all', key: m[1] };
    if (['workshops', 'projects', 'showroom'].indexOf(h) > -1 || (FX && ['vending', 'subscriptions'].indexOf(h) > -1)) return { p: h, key: h };
    return { p: 'home', key: 'home' };
  }
  const TITLES = { home: 'DaVinci Flora & Living', workshops: 'Workshops', projects: 'Projects', showroom: 'Showroom / Contact', vending: 'Flower vending machine', subscriptions: 'Flower subscription' };
  let cur = null, navToken = 0, firstLoad = true;
  function render(r) {
    const main = $('#main');
    if (r.p === 'home') main.innerHTML = homePage();
    else if (r.p === 'shop') { main.innerHTML = shopPage(r.shop, r.cat); fillGrid(false); }
    else if (r.p === 'product') main.innerHTML = productPage(r.id);
    else if (r.p === 'workshops') main.innerHTML = workshopsPage();
    else if (r.p === 'projects') main.innerHTML = projectsPage();
    else if (r.p === 'showroom') main.innerHTML = showroomPage();
    else if (r.p === 'vending') main.innerHTML = FX.vendingPage();
    else if (r.p === 'subscriptions') main.innerHTML = FX.subsPage();
    const prod = r.p === 'product' ? byId(r.id) : null;
    document.title = (window.DV_I18N ? window.DV_I18N.t : (x) => x)(r.p === 'shop' ? D.shops[r.shop].name + ' webshop' : prod ? prod.name : TITLES[r.p]) + (r.p === 'home' ? '' : ' | DaVinci Flora & Living');
    const navKey = r.p === 'product' ? (prod ? prod.shop : 'home') : r.key.split('-')[0];
    $$('[data-nav]').forEach((a) => a.toggleAttribute('aria-current', a.dataset.nav === navKey) && a.setAttribute('aria-current', 'page'));
    $$('[data-nav]').forEach((a) => { if (a.dataset.nav !== navKey) a.removeAttribute('aria-current'); });
    document.body.dataset.world = r.p === 'shop' ? r.shop : (prod ? prod.shop : (r.p === 'vending' || r.p === 'subscriptions') ? 'flora' : r.p);
    if (window.DV_I18N) window.DV_I18N.apply(main);
    cur = r; setMenu(false); motion(main); startMarquees(main); par(); lit(); initContact(); scenes(main); init3d(main); if (FX) FX.mount(main, r);
  }
  async function route() {
    const r = parse(), tok = ++navToken;
    if (cur && cur.p === 'shop' && r.p === 'shop' && cur.shop === r.shop) {
      shopState.cat = r.cat; cur = r; $('#pills').innerHTML = pills(); fillGrid(true);
      const tb = $('#toolbar'); if (tb && tb.getBoundingClientRect().top > innerHeight * .5) window.scrollTo({ top: tb.getBoundingClientRect().top + window.scrollY - 70, behavior: RM ? 'auto' : 'smooth' });
      return;
    }
    closeAll();
    const hd = $('#hdr'); hd.classList.add('navlock'); if (document.activeElement && hd.contains(document.activeElement)) document.activeElement.blur();
    const land = () => {
      window.scrollTo(0, 0);
      if (r.p === 'showroom' && jumpToForm) setTimeout(scrollToForm, 80);
      if (r.p === 'projects' && jumpToProject) { const el = $('#pj-' + jumpToProject); if (el) setTimeout(() => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: 'auto' }), 80); }
      jumpToForm = false; jumpToProject = '';
    };
    if (firstLoad || RM) { firstLoad = false; render(r); land(); return; }
    const c = $('#curtain');
    c.className = 'curtain cover'; await wait(520); if (tok !== navToken) return;
    render(r); land();
    c.className = 'curtain leave'; await wait(640); if (tok === navToken) c.className = 'curtain';
  }

  /* ---------- motion ---------- */
  let io;
  function motion(root) {
    if (io) io.disconnect();
    if (RM || !('IntersectionObserver' in window)) return;
    const els = $$('[data-reveal],[data-split]', root);
    els.forEach((el) => el.classList.add('rv'));
    /* a clipped image reports no intersection, so clipped reveals are observed through their parent */
    const map = new Map();
    els.forEach((el) => { const tgt = el.classList.contains('revimg') ? el.parentElement : el; if (!map.has(tgt)) map.set(tgt, []); map.get(tgt).push(el); });
    io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { (map.get(e.target) || []).forEach((el) => { el.classList.remove('rv'); $$('[data-count-to]', el).forEach(countUp); }); io.unobserve(e.target); } }), { threshold: 0.05, rootMargin: '0px 0px -5% 0px' });
    requestAnimationFrame(() => map.forEach((_, tgt) => io.observe(tgt)));
  }
  function countUp(el) {
    const to = +el.dataset.countTo, t0 = performance.now(), dur = 1400;
    const step = (t) => { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    el.textContent = '0'; requestAnimationFrame(step);
  }
  let mqAnims = [], mqRate = 1, mqLoop = 0;
  function startMarquees(root) {
    mqAnims = [];
    if (RM) return;
    $$('.mq-track', root).forEach((t) => { if (t.animate) mqAnims.push(t.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 48000, iterations: Infinity })); });
  }
  function nudgeMarquees(dy) {
    if (!mqAnims.length) return;
    mqRate = Math.min(5, Math.max(mqRate, 1 + Math.abs(dy) / 6));
    if (!mqLoop) mqLoop = requestAnimationFrame(function ease() {
      mqRate += (1 - mqRate) * .06; mqAnims.forEach((a) => { a.playbackRate = mqRate; });
      mqLoop = Math.abs(mqRate - 1) > .01 ? requestAnimationFrame(ease) : 0;
    });
  }
  let ticking = false, lastY = 0;
  function par() {
    if (RM) return;
    const vh = innerHeight;
    $$('[data-par]').forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      el.style.transform = 'translate3d(0,' + (((r.top + r.height / 2) - vh / 2) * -parseFloat(el.dataset.par)).toFixed(1) + 'px,0)';
    });
  }
  function lit() {
    const b = $('[data-lit]'); if (!b) return;
    const ws = $$('.mw', b), r = b.getBoundingClientRect(), vh = innerHeight;
    const prog = RM ? 1 : Math.min(1, Math.max(0, (vh * .85 - r.top) / (vh * .55 + r.height * .3)));
    const n = Math.round(prog * ws.length);
    ws.forEach((w, i) => w.classList.toggle('on', i < n));
  }
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY, h = $('#hdr');
      h.classList.toggle('scrolled', y > 8);
      h.classList.remove('hide');
      nudgeMarquees(y - lastY); lastY = y; par(); lit(); ticking = false;
    });
  }
  /* ---------- search ---------- */
  function runSearch(q) {
    q = q.trim().toLowerCase();
    const list = q ? D.products.filter((p) => (p.name + ' ' + p.sub + ' ' + catName(p.shop, p.cat) + ' ' + p.shop).toLowerCase().includes(q)) : D.products.slice(0, 4);
    $('#sres').innerHTML = (q ? '' : '') + (list.length ? list.map((p, i) => card(p, i, { enter: 1, tag: 1 })).join('') : '<p class="empty">Nothing matches &ldquo;' + q.replace(/[<>&]/g, '') + '&rdquo; yet. Try olive, lime, tile or pot.</p>');
  }

  /* ---------- events ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-3d],[data-shelf],[data-ask],[data-again],[data-scroll],[data-add],[data-pdp-add],[data-opt],[data-pq],[data-view],[data-zoom],[data-open-cart],[data-close],[data-open-search],[data-cq],[data-crm],[data-checkout],[data-book],[data-intent],[data-wsf],#burger,#scrim,a[href^="#"]');
    if (!t) return;
    if (t.hasAttribute('data-3d')) {
      const on = t.getAttribute('aria-pressed') !== 'true', gl = $('#pd3d'), st = $('#stage');
      t.setAttribute('aria-pressed', on); t.querySelector('span').textContent = on ? 'Back to image' : 'View in 3D';
      gl.hidden = !on; st.hidden = on; if (on) mount3d(gl); return;
    }
    if (t.dataset.shelf) { const sh = t.closest('section').querySelector('.shelf'); if (sh) sh.scrollBy({ left: Number(t.dataset.shelf) * sh.clientWidth * .8, behavior: RM ? 'auto' : 'smooth' }); return; }
    if (t.dataset.add) {
      const id = t.dataset.add; addToCart(id); t.classList.add('done'); const old = t.innerHTML; t.innerHTML = TICK + ' Added';
      setTimeout(() => { t.classList.remove('done'); t.innerHTML = old; }, 1800); toast(byId(id).name + ' added', true); e.preventDefault(); return;
    }
    if (t.hasAttribute('data-pdp-add')) {
      const p = byId(pdp.id); addToCart(pdp.id, pdp.sel.slice(), pdp.qty);
      t.classList.add('done'); const old = t.innerHTML; t.innerHTML = TICK + ' Added'; setTimeout(() => { t.classList.remove('done'); t.innerHTML = old; }, 1800);
      setTimeout(openCart, 450); return;
    }
    if (t.dataset.opt) {
      const [g, o] = t.dataset.opt.split(':').map(Number), p = byId(pdp.id);
      pdp.sel[g] = o; $$('[data-opt^="' + g + ':"]').forEach((b) => b.setAttribute('aria-checked', b === t));
      $('#vsel' + g).textContent = p.variants[g].opts[o][0];
      const pr = $('#pprice'); pr.textContent = eur(unit(p, pdp.sel)); pr.classList.remove('tick-n'); void pr.offsetWidth; pr.classList.add('tick-n'); return;
    }
    if (t.dataset.pq) { pdp.qty = Math.max(1, Math.min(20, pdp.qty + Number(t.dataset.pq))); const o = $('#pqty'); o.textContent = pdp.qty; o.classList.remove('tick-n'); void o.offsetWidth; o.classList.add('tick-n'); return; }
    if (t.dataset.view !== undefined) { const v = Number(t.dataset.view); $$('[data-layer]').forEach((l) => l.classList.toggle('on', Number(l.dataset.layer) === v)); $$('[data-view]').forEach((b) => b.setAttribute('aria-current', Number(b.dataset.view) === v)); return; }
    if (t.dataset.scroll) { e.preventDefault(); const el = $(t.dataset.scroll); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: RM ? 'auto' : 'smooth' }); return; }
    if (t.dataset.ask) {
      e.preventDefault(); const a = t.dataset.ask;
      if (a === 'projects' || a === 'project') applyIntent('project'); else if (['plants', 'materials', 'colour', 'finishes'].indexOf(a) > -1) applyIntent('advice', a); else applyIntent(a);
      scrollToForm(); return;
    }
    if (t.hasAttribute('data-again')) { const f = $('#cform'); f.reset(); $$('.fld.bad', f).forEach((x) => x.classList.remove('bad')); $('#c-done').hidden = true; f.hidden = false; updateCond(); scrollToForm(); return; }

    if (t.hasAttribute('data-zoom')) { t.classList.toggle('zoomed'); return; }
    if (t.hasAttribute('data-open-cart')) { closeAll(); openCart(); return; }
    if (t.hasAttribute('data-open-search')) { setMenu(false); layer('#search', true); runSearch($('#sq').value); return; }
    if (t.dataset.cq) { const i = cart.find((x) => x.key === t.dataset.k); if (i) { i.qty = Math.max(1, i.qty + Number(t.dataset.cq)); i.bumped = 1; saveCart(); updateCount(true); renderDrawer(); } return; }
    if (t.dataset.crm) { const el = $('.li[data-key="' + t.dataset.crm + '"]'); const done = () => { cart = cart.filter((x) => x.key !== t.dataset.crm); saveCart(); updateCount(); renderDrawer(); }; if (el && !RM) { el.classList.add('out'); setTimeout(done, 450); } else done(); return; }
    if (t.hasAttribute('data-checkout')) {
      modal('<h2>Checkout</h2><p style="color:var(--muted);margin-bottom:20px">This is a demonstration. Payments, delivery options and order confirmations are connected before launch.</p>' + cart.map((i) => '<div class="sum" style="padding:6px 0"><span>' + i.qty + ' &times; ' + byId(i.id).name + '</span><span class="tnum">' + eur(i.qty * i.unit) + '</span></div>').join('') + '<div class="sum t" style="margin:16px 0 24px;border-top:1px solid var(--line);padding-top:14px"><span>Total</span><b class="tnum">' + eur(cartTotal()) + '</b></div><button class="btn full" data-close>Back to the shop</button>');
      return;
    }
    if (t.dataset.book) {
      const w = D.workshops.find((x) => x.id === t.dataset.book);
      modal('<h2>Book a place</h2><p style="margin-bottom:6px"><b>' + w.title + '</b></p><p style="color:var(--muted);margin-bottom:22px">' + w.date + ', ' + w.time + ' · ' + eur(w.price) + ' per person</p><form class="form" data-form="book" novalidate>' + fld('b-name', 'Name', '<input id="b-name" autocomplete="name" data-req="Please enter your name." aria-describedby="b-name-err">', 1) + fld('b-mail', 'Email', '<input id="b-mail" type="email" autocomplete="email" data-req="Please enter your email address." aria-describedby="b-mail-err">', 1) + fld('b-n', 'Places', '<select id="b-n"><option>1</option><option>2</option><option>3</option><option>4</option></select>', 1) + '<button class="btn" type="submit">Reserve (demo)</button><p class="note">Demonstration only. Booking is connected before launch.</p><div id="b-ok" aria-live="polite"></div></form>');
      return;
    }
    if (t.dataset.wsf) { wsFilter = t.dataset.wsf; $$('[data-wsf]').forEach((x) => x.setAttribute('aria-pressed', x === t)); $('#wslist').innerHTML = wsRows(); $$('#wslist .wt').forEach((x, i) => { x.style.animationDelay = (i * 70) + 'ms'; x.classList.add('enter'); }); return; }
    if (t.dataset.intent) {
      if (cur && cur.p === 'showroom' && t.getAttribute('href') === '#showroom') { e.preventDefault(); closeAll(); applyIntent(t.dataset.intent); scrollToForm(); return; }
      intent = t.dataset.intent; jumpToForm = true;
    }
    if (t.dataset.pj) jumpToProject = t.dataset.pj;
    if (t.id === 'burger') { setMenu(!document.body.classList.contains('menu-open')); return; }
    if (t.hasAttribute('data-close') || t.id === 'scrim') {
      closeAll(); if (t.tagName === 'A' && t.getAttribute('href') === location.hash) e.preventDefault(); return;
    }
    if (t.tagName === 'A') {
      closeAll();
      if (t.getAttribute('href') === (location.hash || '#home')) { e.preventDefault(); window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); }
    }
  });
  document.addEventListener('submit', (e) => {
    const f = e.target.closest('form[data-form]'); if (!f) return; e.preventDefault();
    if (f.dataset.form === 'news') {
      const v = $('#nl-mail').value.trim();
      $('#nl-ok').textContent = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? 'Thank you. This is a demo, so nothing was subscribed.' : 'Enter an email address like name@example.com.';
      return;
    }
    if (!validate(f)) return;
    if (f.dataset.form === 'book') { const el = $('#b-ok'); if (el) el.innerHTML = '<div class="okmsg">Reserved in the demo. No booking was made and no payment was taken.</div>'; return; }
    if (f.dataset.form === 'contact') {
      const btn = f.querySelector('[type=submit]'); btn.setAttribute('aria-busy', 'true'); btn.firstChild.textContent = 'Sending ';
      const kind = f.querySelector('input[name=intent]:checked').value, name = $('#c-name').value.trim().split(' ')[0];
      const rows = [['Request', INTENTS.find((x) => x[0] === kind)[1]], ['Name', $('#c-name').value.trim()], ['Email', $('#c-mail').value.trim()]];
      if (kind === 'visit') rows.push(['Visit', ($('#c-date').value || 'Any day') + ', ' + f.querySelector('input[name=part]:checked').value.toLowerCase()]);
      if (kind === 'advice') rows.push(['Topic', $('#c-topic').selectedOptions[0].textContent]);
      if (kind === 'project') rows.push(['Project', $('#c-ptype').value + ', ' + $('#c-when').value.toLowerCase()]);
      setTimeout(() => {
        btn.removeAttribute('aria-busy'); btn.firstChild.textContent = 'Send enquiry ';
        const done = $('#c-done');
        done.innerHTML = '<div class="confirm" role="status"><span class="tickbig">' + TICK + '</span><h3 tabindex="-1">Thank you, ' + esc(name) + '.</h3><p class="lead">This is a demonstration, so nothing was sent. Once the form is connected, DaVinci replies to this request by email.</p><dl>' + rows.map((x) => '<div><dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd></div>').join('') + '</dl><div><button class="btn ghost sm" data-again>Send another enquiry</button></div></div>';
        f.hidden = true; done.hidden = false; done.querySelector('h3').focus();
      }, RM ? 0 : 700);
    }
  });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'shopq') { shopState.q = e.target.value; fillGrid(true); }
    if (e.target.id === 'sq') runSearch(e.target.value);
  });
  /* keyboard: Escape closes; Tab stays inside an open dialog, drawer, search or menu */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeAll(); return; }
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !$('.search.on')) { e.preventDefault(); setMenu(false); layer('#search', true); runSearch($('#sq').value); return; }
    if (e.key !== 'Tab') return;
    const box = $('.modal.on .modal-box') || $('.drawer.on') || $('.search.on');
    const menu = document.body.classList.contains('menu-open');
    if (!box && !menu) return;
    const sel = 'a[href],button:not([disabled]),input:not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])';
    const f = (box ? $$(sel, box) : [$('#burger')].concat($$(sel, $('#mmenu')))).filter((el) => el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    if (!f.length) return;
    const i = f.indexOf(document.activeElement);
    e.preventDefault();
    f[i < 0 ? 0 : (i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
  });

  window.addEventListener('hashchange', route);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { par(); lit(); });

  mountChrome();
  /* after choosing from a menu, keep it closed until the pointer leaves that menu item */
  $('#hdr').addEventListener('pointerover', (e) => { if (!e.target.closest('.nav-item')) $('#hdr').classList.remove('navlock'); });
  $('#hdr').addEventListener('pointerleave', () => $('#hdr').classList.remove('navlock'));
  $('#hdr').addEventListener('keydown', () => $('#hdr').classList.remove('navlock'));
  route();
})();
