/* =====================================================================
   DaVinci Flora & Living: additional features (November 2026)
   1. Flower vending machine  (homepage section + #vending page, demo journey)
   2. Monthly flower subscription (homepage section + #subscriptions page)
   3. Seasonal promotion (homepage banner + popup, configured in js/promo-config.js)

   Everything here is self-contained. app.js only calls:
     FX.promoBanner(), FX.vendingTeaser(), FX.subsTeaser()   inside the homepage
     FX.vendingPage(), FX.subsPage()                          for the two new routes
     FX.mount(main, route)                                    after each page render
   Remove this file and those calls and the site is exactly as before.

   DEMO ONLY: no payment, stock, machine connection, collection code or recurring
   billing is real. The places where a real service plugs in are marked "INTEGRATION".
   ===================================================================== */
window.DV_FEATURES = function (api) {
  const $ = (s, e) => (e || document).querySelector(s);
  const $$ = (s, e) => Array.from((e || document).querySelectorAll(s));
  const ARR = api.ARR, eur = api.eur;

  /* ---------- content (sample data; replace with the real assortment and plans) ---------- */
  /* INTEGRATION: in WordPress these become WooCommerce products in a "Vending machine" category,
     with stock synced from the machine supplier's system. */
  const VEND = [
    { id: 'carnation', name: 'Red carnations', note: 'Deep red, full heads', price: 12 },
    { id: 'ranunculus', name: 'Orange ranunculus', note: 'Warm, layered petals', price: 14 },
    { id: 'pinkcarn', name: 'Blush carnations', note: 'Soft pink, ruffled', price: 12 },
    { id: 'magenta', name: 'Magenta dianthus', note: 'Bright and long-lasting', price: 11 },
    { id: 'daisy', name: 'White daisies', note: 'Light and fresh', price: 9 },
    { id: 'cornflower', name: 'Blue cornflowers', note: 'Wild-meadow blue', price: 10 },
    { id: 'whitebunch', name: 'White star flowers', note: 'Small blooms, glossy leaves', price: 10 },
    { id: 'jasmine', name: 'White gardenia-style bunch', note: 'Creamy white, dark green', price: 13 },
    { id: 'topiary', name: 'Purple topiary ball', note: 'A small sculpted globe', price: 16 },
    { id: 'globe', name: 'Purple globe arrangement', note: 'Dense violet heads', price: 15 }
  ];
  const VEND_MAX = 5; // example limit per flower (one compartment each)

  /* INTEGRATION: in WordPress these become subscription products (e.g. WooCommerce Subscriptions). */
  const PLANS = [
    { id: 'tavolo', n: '01', name: 'Tavolo', where: 'The table or the desk', tone: 'sand', imgs: ['daisy'],
      desc: 'Enough to change how a room feels.',
      qty: '[e.g. one small bunch, around 8 stems]', freq: 'Once a month', how: '[Delivery or vending-machine collection, to be confirmed]',
      perks: ['Flowers chosen by season', '[Benefit to be confirmed]'] },
    { id: 'salotto', n: '02', name: 'Salotto', where: 'The living room', tone: 'olive', imgs: ['pinkcarn', 'ranunculus'],
      desc: 'Big enough to hold its own on a coffee table or sideboard.',
      qty: '[e.g. one hand-tied bouquet, around 15 stems]', freq: 'Once a month', how: '[Delivery or vending-machine collection, to be confirmed]',
      perks: ['Flowers chosen by season', 'Care card with every delivery', '[Benefit to be confirmed]'] },
    { id: 'ingresso', n: '03', name: 'Ingresso', where: 'The hall, dining table or reception desk', tone: 'clay', imgs: ['jasmine', 'carnation', 'cornflower'],
      desc: 'The first thing anyone sees when they walk in.',
      qty: '[e.g. two arrangements, around 25 stems in total]', freq: '[Once or twice a month, to be confirmed]', how: '[Delivery or vending-machine collection, to be confirmed]',
      perks: ['Flowers chosen by season', 'Care card with every delivery', '[Benefit to be confirmed]'] }
  ];

  /* ---------- small helpers ---------- */
  function photo(key, sizes, alt) {
    if (api.isReady(key)) return api.pic(key, { sizes: sizes, alt: alt });
    return '<span class="fx-ph" role="img" aria-label="' + api.esc(alt || 'Photo to come') + '"><span>Photo to come</span></span>';
  }
  const vimg = (id, sizes) => photo('vend-' + id, sizes || '(max-width: 640px) 50vw, 240px', (VEND.find((v) => v.id === id) || {}).name || '');
  const ph = (t) => '<span class="fx-tbc">' + t + '</span>';
  const mark = (s) => String(s).replace(/\[([^\]]+)\]/g, (m, x) => ph(x)); // [placeholder] -> highlighted

  /* the machine: a drawn cabinet holding the real flower photographs; replaced by a real photo
     of the machine as soon as the slot 'vending-machine' has files in img/ */
  function machine(cls) {
    if (api.isReady('vending-machine')) return '<div class="vm-photo ' + (cls || '') + '">' + api.pic('vending-machine', { sizes: '(max-width: 960px) 90vw, 40vw' }) + '</div>';
    const cells = ['carnation', 'ranunculus', 'cornflower', 'daisy', 'pinkcarn', 'magenta', 'whitebunch', 'topiary', 'jasmine'];
    return '<figure class="vm2 ' + (cls || '') + '"><div class="vm2-stage" aria-hidden="true"><span class="vm2-arch"></span><span class="vm2-floor"></span></div>' +
      '<div class="vm2-unit" role="img" aria-label="Illustration of the DaVinci flower vending machine: nine glass compartments with flowers and a touch screen">' +
      '<div class="vm2-canopy"><b>DaVinci</b><small>Fresh flowers</small></div>' +
      '<div class="vm2-front"><div class="vm2-doors">' + cells.map((c, i) => '<span class="vm2-door" style="--i:' + i + '"><span class="vm2-win"><img src="img/vend-' + c + '-600.webp" alt="" loading="lazy" decoding="async"></span><span class="vm2-plate"><i>' + 'ABC'[Math.floor(i / 3)] + (i % 3 + 1) + '</i><em></em></span></span>').join('') + '</div>' +
      '<div class="vm2-console"><span class="vm2-screen"><b>DaVinci</b><small>Enter your code</small><span class="vm2-dots"><i></i><i></i><i></i><i></i></span><span class="vm2-ok">OK</span></span>' +
      '<span class="vm2-reader"><i></i></span><span class="vm2-badge">Choose · Pay · Collect</span></div></div>' +
      '<div class="vm2-lower"><span class="vm2-hatch"><i></i></span><span class="vm2-brand">Choose · Pay · Collect</span></div><div class="vm2-plinth"><i></i><i></i></div></div>' +
      '<figcaption class="vm2-tag">Illustration · photo of the machine to come</figcaption></figure>';
  }


  /* =====================================================================
     1. SEASONAL PROMOTION (banner + popup)
     ===================================================================== */
  const P = window.DV_PROMO;
  function promoOn() {
    if (!P || !P.active) return false;
    const today = new Date().toISOString().slice(0, 10);
    if (P.start && today < P.start) return false;
    if (P.end && today > P.end) return false;
    return true;
  }
  const SPRIG = '<svg class="promo-sprig" viewBox="0 0 220 120" aria-hidden="true" focusable="false"><path class="st" d="M8 100C60 86 112 64 212 18"/>' +
    [[30, 93, -38, 1], [44, 88, 38, 0], [62, 81, -40, 1], [78, 75, 42, 0], [96, 67, -42, 1], [112, 60, 40, 0], [130, 52, -44, 1], [146, 45, 40, 0], [164, 37, -44, 1], [180, 30, 38, 0], [198, 24, -30, 1]]
      .map((l) => '<ellipse class="lf' + (l[3] ? '' : ' b') + '" cx="' + l[0] + '" cy="' + (l[1] - (l[3] ? 9 : -9)) + '" rx="13" ry="4.4" transform="rotate(' + l[2] + ' ' + l[0] + ' ' + (l[1] - (l[3] ? 9 : -9)) + ')"/>').join('') +
    '<circle class="bry" cx="70" cy="90" r="5"/><circle class="bry" cx="81" cy="94" r="4"/><circle class="bry" cx="138" cy="66" r="4.5"/><circle class="bry" cx="148" cy="71" r="3.6"/></svg>';
  const WREATH = '<svg class="promo-wreath" viewBox="0 0 300 300" aria-hidden="true" focusable="false"><circle class="ring" cx="150" cy="150" r="96"/>' +
    Array.from({ length: 34 }, (_, i) => { const a = i / 34 * Math.PI * 2, r = 96 + (i % 2 ? 9 : -9), x = 150 + Math.cos(a) * r, y = 150 + Math.sin(a) * r, d = a * 180 / Math.PI + (i % 2 ? 60 : -60); return '<ellipse class="lf' + (i % 3 ? '' : ' b') + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="17" ry="6" transform="rotate(' + d.toFixed(1) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>'; }).join('') +
    Array.from({ length: 9 }, (_, i) => { const a = i / 9 * Math.PI * 2 + .3, x = 150 + Math.cos(a) * 100, y = 150 + Math.sin(a) * 100; return '<circle class="bry" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (i % 2 ? 5 : 6.5) + '"/>'; }).join('') +
    '<path class="bow" d="M150 238c-16-14-34-16-40-6s10 18 40 6zM150 238c16-14 34-16 40-6s-10 18-40 6zM146 240l-12 34M154 240l12 34"/></svg>';

  function promoBanner() {
    if (!promoOn()) return '';
    const b = P.banner;
    return '<section class="promo promo--' + P.theme + '" aria-label="' + api.esc(b.eyebrow) + '"><div class="wrap">' +
      '<button class="promo-bar" type="button" data-fx-promo aria-haspopup="dialog"><span class="promo-art">' + SPRIG + '</span>' +
      '<span class="promo-copy"><small>' + b.eyebrow + '</small><span>' + mark(b.text) + '</span>' + (b.note ? '<span class="promo-note">' + mark(b.note) + '</span>' : '') + '</span>' +
      '<span class="promo-go">' + b.button + ' ' + ARR + '</span></button></div></section>';
  }
  function openPromo() {
    if (!promoOn()) return;
    const c = P.popup;
    const vis = c.image && api.isReady(c.image) ? '<div class="pp-photo">' + api.pic(c.image, { sizes: '(max-width: 760px) 100vw, 420px' }) + '</div>' : '<div class="pp-art">' + WREATH + '<span class="pp-art-note">Illustration · Christmas photo to come</span></div>';
    api.modal('<div class="pp promo--' + P.theme + '">' + vis + '<div class="pp-copy"><p class="eyebrow">' + c.eyebrow + '</p><h2 id="pp-h">' + c.title + '</h2>' +
      '<p class="pp-msg">' + mark(c.message) + '</p><div class="pp-offer"><b>' + mark(c.offer) + '</b><span>' + mark(c.offerNote) + '</span></div>' +
      '<p class="pp-dates">' + mark(c.dates) + '</p><a class="btn clay" href="' + c.cta.href + '" data-close>' + c.cta.label + ' ' + ARR + '</a><p class="pp-terms">' + c.terms + '</p></div></div>', 'promo-box');
    try { localStorage.setItem('dv-promo-seen-' + P.id, String(Date.now())); } catch (e) { /* storage unavailable */ }
  }
  let autoTimer = 0;
  function autoPromo() {
    clearTimeout(autoTimer);
    if (!promoOn() || !P.autoOpen) return;
    let last = 0; try { last = Number(localStorage.getItem('dv-promo-seen-' + P.id)) || 0; } catch (e) { /* storage unavailable */ }
    if (Date.now() - last < (P.frequencyDays || 7) * 864e5) return;
    autoTimer = setTimeout(() => { if ((location.hash || '#home') === '#home' && !document.querySelector('.modal.on,.drawer.on,.search.on')) openPromo(); }, P.autoOpenDelay || 6000);
  }

  /* =====================================================================
     2. HOMEPAGE SECTIONS
     ===================================================================== */
  function vendingTeaser() {
    const steps = [['01', 'Choose', 'Pick a bouquet from what is in the machine right now.'], ['02', 'Pay', 'Pay online. Payment methods ' + ph('to be confirmed') + '.'], ['03', 'Collect', 'Enter your code at the machine. The door opens and the flowers are yours.']];
    return '<section class="fxv-home fxv3" aria-labelledby="fxv-h"><div class="wrap fxv3-in">' +
      '<div class="fxv3-art" data-reveal>' + machine('vm-home') + '</div>' +
      '<div class="fxv3-copy"><p class="eyebrow" data-reveal><span class="fx-new">New</span> The flower machine</p>' +
      '<h2 class="fx-h" id="fxv-h" data-split>' + api.sp('Fresh flowers, <em>at any hour</em>') + '</h2>' +
      '<p class="lead" data-reveal>Choose your bouquet here, pay online, and collect it from our machine at ' + ph('location to be confirmed') + '. No queue, no closing time.</p>' +
      '<ol class="fxv2-steps" data-reveal>' + steps.map((st) => '<li><span class="n">' + st[0] + '</span><div><b>' + st[1] + '</b><span>' + st[2] + '</span></div></li>').join('') + '</ol>' +
      '<div class="fx-cta" data-reveal><a class="btn" href="#vending">Choose your flowers ' + ARR + '</a><p class="note">Location and opening date ' + ph('to be confirmed') + '</p></div></div>' +
      '</div></section>';
  }
  function subsTeaser() {
    const pts = [['Tavolo', 'A hand-tied bunch for the table or the desk.'], ['Salotto', 'A fuller bouquet for the living room.'], ['Ingresso', 'A statement arrangement for the hall or reception.']];
    return '<section class="fxs-home" aria-labelledby="fxs-h"><div class="wrap fxs-home-in">' +
      '<div class="fxs-home-copy"><p class="eyebrow" data-reveal>The monthly bouquet</p>' +
      '<h2 class="fx-h" id="fxs-h" data-split>' + api.sp('Flowers on the table, <em>every month</em>') + '</h2>' +
      '<p class="lead" data-reveal>Choose a size and we choose the flowers. A fresh seasonal bouquet once a month, so the house never looks tired.</p>' +
      '<ul class="fxs-pts" data-reveal>' + pts.map((p) => '<li><b>' + p[0] + '</b><span>' + p[1] + '</span></li>').join('') + '</ul>' +
      '<div class="fx-cta" data-reveal><a class="btn clay" href="#subscriptions">See the three plans ' + ARR + '</a></div></div>' +
      '<div class="fxs-home-art" data-reveal><span class="fxs-arch">' + photo('subs-feature', '(max-width: 960px) 80vw, 34vw', 'Pink and white orchids in glass pots on a wooden table') + '</span>' +
      '<span class="fxs-small">' + vimg('ranunculus', '200px') + '</span><span class="fxs-stamp" aria-hidden="true"><small>Fresh</small><b>monthly</b></span></div></div></section>';
  }

  /* =====================================================================
     3. VENDING MACHINE PAGE (#vending): choose -> review -> pay (demo) -> collect
     ===================================================================== */
  const vs = { step: 'choose', qty: {}, name: '', email: '' };
  const vLines = () => VEND.filter((v) => vs.qty[v.id]).map((v) => ({ v: v, q: vs.qty[v.id], t: vs.qty[v.id] * v.price }));
  const vTotal = () => vLines().reduce((s, l) => s + l.t, 0);
  const vCount = () => vLines().reduce((s, l) => s + l.q, 0);
  const STEPS = [['choose', 'Choose'], ['pay', 'Pay'], ['collect', 'Collect']];

  function vendingPage() {
    return '<section class="fxv-head"><div class="wrap fxv-head-in"><div class="fxv-head-copy">' +
      '<p class="crumb eyebrow"><a href="#home">Home</a> / <a href="#flora">Flora</a> / The flower machine</p>' +
      '<h1 class="fx-h1" data-split>' + api.sp('Choose online. <em>Collect</em> at the machine.') + '</h1>' +
      '<p class="lead" data-reveal>Choose your bouquet here, pay online, and collect it from our machine with a code. No queue, no closing time.</p>' +
      '<p class="fx-demo" data-reveal><b>Demo.</b> Sample flowers and example prices. No payment is taken, stock is not live and the machine is not connected yet.</p></div>' +
      '<div class="fxv-head-art" data-reveal>' + machine('vm-page') + '</div></div></section>' +
      '<section class="fxv-app-sec"><div class="wrap"><ol class="fx-stepper" id="vx-steps" aria-label="Progress"></ol><div id="vx-app" class="fxv-app"></div></div></section>';
  }
  function stepper() {
    const at = STEPS.findIndex((s) => s[0] === vs.step);
    return STEPS.map((s, i) => '<li class="' + (i < at ? 'done' : i === at ? 'now' : '') + '"' + (i === at ? ' aria-current="step"' : '') + '><span>' + (i + 1) + '</span>' + s[1] + '</li>').join('');
  }
  function summary(final) {
    const L = vLines();
    return '<div class="fxv-sum" aria-live="polite"><p class="fxv-sum-h">Your selection <span>' + vCount() + (vCount() === 1 ? ' bunch' : ' bunches') + '</span></p>' +
      (L.length ? '<ul>' + L.map((l) => '<li><span class="t">' + vimg(l.v.id, '56px') + '</span><span><b>' + l.v.name + '</b><small>' + l.q + ' × ' + eur(l.v.price) + '</small></span><b class="tnum">' + eur(l.t) + '</b></li>').join('') + '</ul>'
        : '<p class="fxv-empty">Nothing chosen yet. Tap <b>+</b> on a flower to add it.</p>') +
      '<div class="fxv-tot"><span>Total</span><b class="tnum">' + eur(vTotal()) + '</b></div>' +
      (final ? '' : '<button class="btn full" type="button" data-vx="pay"' + (L.length ? '' : ' disabled') + '>Continue to payment ' + ARR + '</button>') +
      '<p class="note">Example prices. Collection only, from the vending machine.</p></div>';
  }
  /* phones and tablets: a sticky bar keeps the total in view while choosing */
  const mbar = () => '<span><small>' + vCount() + (vCount() === 1 ? ' bunch' : ' bunches') + '</small><b class="tnum">' + eur(vTotal()) + '</b></span><button class="btn sm" type="button" data-vx="pay" tabindex="-1"' + (vCount() ? '' : ' disabled') + '>Continue ' + ARR + '</button>';
  function chooseView() {
    return '<div class="fxv-grid-wrap"><div class="fxv-grid">' + VEND.map((v) => {
      const q = vs.qty[v.id] || 0;
      return '<article class="fxv-card' + (q ? ' on' : '') + '" data-vid="' + v.id + '"><span class="fxv-img">' + vimg(v.id) + '<span class="fxv-badge">Sample</span></span>' +
        '<div class="fxv-info"><h3>' + v.name + '</h3><p>' + v.note + '</p><p class="fxv-price tnum">' + eur(v.price) + ' <small>example price</small></p></div>' +
        '<div class="fxv-qty" role="group" aria-label="Quantity of ' + v.name + '"><button type="button" data-vx="dec" data-id="' + v.id + '" aria-label="One less"' + (q ? '' : ' disabled') + '>&minus;</button><output class="tnum" aria-live="polite">' + q + '</output><button type="button" data-vx="inc" data-id="' + v.id + '" aria-label="One more"' + (q >= VEND_MAX ? ' disabled' : '') + '>+</button></div></article>';
    }).join('') + '</div></div><aside class="fxv-aside">' + summary() + '</aside><div class="fxv-mbar" aria-hidden="true">' + mbar() + '</div>';
  }
  function payView() {
    /* INTEGRATION: replace this form with the payment provider's checkout (e.g. Mollie for iDEAL and cards,
       through WooCommerce). On success the provider calls back, the machine system reserves compartments
       and returns a collection code, which the collect step then shows. */
    return '<div class="fxv-pay"><form class="fxv-form" data-fx-form="vend" novalidate><h2 class="fx-h3">Your details</h2>' +
      '<div class="fld"><label for="vx-name">Name</label><input id="vx-name" autocomplete="name" value="' + api.esc(vs.name) + '"><p class="err" id="vx-name-err"></p></div>' +
      '<div class="fld"><label for="vx-mail">Email address</label><input id="vx-mail" type="email" autocomplete="email" value="' + api.esc(vs.email) + '"><p class="err" id="vx-mail-err"></p><p class="hint">Collection instructions are sent here once real payments are connected.</p></div>' +
      '<fieldset class="fxv-methods"><legend class="flabel">Payment method</legend><label><input type="radio" name="vx-pm" value="ideal" checked><span>iDEAL</span></label><label><input type="radio" name="vx-pm" value="card"><span>Card</span></label><p class="note">Payment options are placeholders and are confirmed with the payment provider before launch.</p></fieldset>' +
      '<div class="fxv-pay-act"><button class="btn clay" type="submit">Pay ' + eur(vTotal()) + ' (demo) ' + ARR + '</button><button class="link" type="button" data-vx="back">Change selection</button></div>' +
      '<p class="fx-demo"><b>Demo.</b> No payment is taken and nothing is reserved in the machine.</p></form><aside class="fxv-aside">' + summary(true) + '</aside></div>';
  }
  function collectView() {
    /* INTEGRATION: the location, the code and the collection window come from the machine supplier's
       system after a successful payment. Nothing here is generated. */
    return '<div class="fxv-done"><div class="fxv-done-main"><p class="eyebrow">Demo complete</p><h2 class="fx-h2">How you will collect your flowers</h2>' +
      '<p class="lead">This was a demonstration, so no payment was taken and no compartment was reserved. After a real payment, this screen shows your collection code and the steps below.</p>' +
      '<ol class="fxv-collect"><li><span class="n">1</span><div><b>Go to the DaVinci flower vending machine</b><p>Location: ' + ph('to be confirmed') + '</p></div></li>' +
      '<li><span class="n">2</span><div><b>Enter your collection code on the machine screen</b><p>Your code: <span class="fxv-code" aria-label="Collection code not available in the demo">&middot; &middot; &middot; &middot; &middot; &middot;</span> <small>Shown here after a real payment, and sent by email.</small></p></div></li>' +
      '<li><span class="n">3</span><div><b>Your compartment opens</b><p>Take your flowers and close the door. Collect within ' + ph('collection window to be confirmed') + '.</p></div></li></ol>' +
      '<div class="fx-cta"><button class="btn" type="button" data-vx="again">Start a new selection ' + ARR + '</button><a class="link" href="#subscriptions">Or get flowers every month</a></div></div>' +
      '<aside class="fxv-aside">' + summary(true) + '</aside></div>';
  }
  function drawVend(scroll) {
    const app = $('#vx-app'); if (!app) return;
    $('#vx-steps').innerHTML = stepper();
    app.innerHTML = vs.step === 'pay' ? payView() : vs.step === 'collect' ? collectView() : chooseView();
    app.dataset.step = vs.step;
    if (scroll) window.scrollTo({ top: $('#vx-steps').getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
  }
  function bumpVend(id, d) {
    vs.qty[id] = Math.max(0, Math.min(VEND_MAX, (vs.qty[id] || 0) + d));
    if (!vs.qty[id]) delete vs.qty[id];
    const card = $('.fxv-card[data-vid="' + id + '"]'); const q = vs.qty[id] || 0;
    if (card) {
      card.classList.toggle('on', !!q); card.querySelector('output').textContent = q;
      card.querySelector('[data-vx="dec"]').disabled = !q; card.querySelector('[data-vx="inc"]').disabled = q >= VEND_MAX;
    }
    const a = $('.fxv-aside'); if (a) a.innerHTML = summary();
    const m = $('.fxv-mbar'); if (m) { m.innerHTML = mbar(); m.classList.toggle('on', vCount() > 0); }
  }

  /* =====================================================================
     4. SUBSCRIPTIONS PAGE (#subscriptions)
     ===================================================================== */
  let chosen = '';
  function subsPage() {
    const how = [['01', 'Choose your plan', 'Pick the size that suits the spot.'], ['02', 'Tell us your palette and delivery week', 'Two quick choices.'], ['03', 'Flowers arrive each month', 'Change, skip or stop whenever you like ' + ph('to be confirmed') + '.']];
    return '<section class="fxs-head"><div class="wrap"><p class="crumb eyebrow"><a href="#home">Home</a> / <a href="#flora">Flora</a> / The monthly bouquet</p>' +
      '<h1 class="fx-h1" data-split>' + api.sp('Flowers that arrive without you having to <em>think about it</em>') + '</h1>' +
      '<p class="lead" data-reveal>Choose where in the house you want flowers. We choose the flowers, wrap them and send them every month.</p>' +
      '<p class="fx-demo" data-reveal><b>Placeholder.</b> Prices, quantities and delivery are confirmed before launch. Subscriptions cannot be paid yet.</p></div></section>' +
      '<section class="fxs-plans-sec"><div class="wrap"><div class="fxs-plans">' + PLANS.map((p, i) =>
        '<article class="fxs-plan tone-' + p.tone + '" data-plan="' + p.id + '" data-reveal style="--d:' + (i * .1) + 's">' +
        '<div class="fxs-plan-art n' + p.imgs.length + '">' + p.imgs.map((im, k) => '<span style="--k:' + k + '">' + vimg(im, '220px') + '</span>').join('') + '</div>' +
        '<div class="fxs-plan-body"><p class="fxs-n">' + p.n + ' <span>' + p.where + '</span></p><h2>' + p.name + '</h2><p class="fxs-desc">' + p.desc + '</p>' +
        '<p class="fxs-price">' + ph('Price to be confirmed') + '<small>per month</small></p>' +
        '<dl class="fxs-dl"><div><dt>Flowers</dt><dd>' + mark(p.qty) + '</dd></div><div><dt>How often</dt><dd>' + mark(p.freq) + '</dd></div><div><dt>Delivery</dt><dd>' + mark(p.how) + '</dd></div></dl>' +
        '<ul class="fxs-perks">' + p.perks.map((x) => '<li>' + mark(x) + '</li>').join('') + '</ul>' +
        '<button class="btn full' + (p.tone === 'olive' ? ' ivory' : '') + '" type="button" data-sx="' + p.id + '" aria-pressed="false">Choose ' + p.name + ' ' + ARR + '</button></div></article>').join('') + '</div>' +
      '<div class="fxs-chosen" id="sx-chosen" hidden></div></div></section>' +
      '<section class="fxs-how"><div class="wrap"><p class="eyebrow">How it works</p><ol class="fx-steps big">' + how.map((s) => '<li><span class="n">' + s[0] + '</span><b>' + s[1] + '</b><span>' + s[2] + '</span></li>').join('') + '</ol>' +
      '<p class="note">Pausing, changing or cancelling a plan will be possible from a customer account once subscriptions open ' + ph('details to be confirmed') + '.</p></div></section>';
  }
  function choosePlan(id, quiet) {
    chosen = id; const p = PLANS.find((x) => x.id === id);
    $$('.fxs-plan').forEach((c) => c.classList.toggle('picked', c.dataset.plan === id));
    $$('[data-sx]').forEach((b) => { const on = b.dataset.sx === id; b.setAttribute('aria-pressed', on); b.innerHTML = (on ? 'Chosen' : 'Choose ' + PLANS.find((x) => x.id === b.dataset.sx).name) + ' ' + ARR; });
    /* INTEGRATION: send the chosen plan to the subscription checkout (recurring payment) instead of this form. */
    const box = $('#sx-chosen'); box.hidden = false;
    box.innerHTML = '<div class="fxs-chosen-in"><div><p class="eyebrow">Your choice</p><h3>' + p.name + ' <span>' + ph('price to be confirmed') + ' per month</span></h3><p>Subscriptions are not open yet and recurring payments are not connected. Leave your email and we can tell you when ' + p.name + ' is available.</p></div>' +
      '<form class="fxs-form" data-fx-form="subs" novalidate><div class="fld"><label for="sx-mail">Email address</label><input id="sx-mail" type="email" autocomplete="email"><p class="err" id="sx-mail-err"></p></div><button class="btn clay" type="submit">Let me know ' + ARR + '</button></form><p class="fxs-ok" aria-live="polite"></p></div>';
    if (!quiet) box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ---------- events (only for elements this file creates) ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-fx-promo],[data-vx],[data-sx]'); if (!t) return;
    if (t.hasAttribute('data-fx-promo')) { openPromo(); return; }
    if (t.dataset.sx) { choosePlan(t.dataset.sx); return; }
    const a = t.dataset.vx;
    if (a === 'inc' || a === 'dec') { bumpVend(t.dataset.id, a === 'inc' ? 1 : -1); return; }
    if (a === 'pay' && vCount()) { vs.step = 'pay'; drawVend(true); return; }
    if (a === 'back') { vs.step = 'choose'; drawVend(true); return; }
    if (a === 'again') { vs.step = 'choose'; vs.qty = {}; drawVend(true); }
  });
  const mailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  function setErr(id, msg) { const i = $('#' + id); i.closest('.fld').classList.toggle('bad', !!msg); $('#' + id + '-err').textContent = msg || ''; return !msg; }
  document.addEventListener('submit', (e) => {
    const f = e.target.closest('form[data-fx-form]'); if (!f) return; e.preventDefault();
    if (f.dataset.fxForm === 'vend') {
      vs.name = $('#vx-name').value.trim(); vs.email = $('#vx-mail').value.trim();
      const ok = setErr('vx-name', vs.name ? '' : 'Please enter your name.') & setErr('vx-mail', mailOk(vs.email) ? '' : 'Please enter a valid email address.');
      if (!ok) { const b = f.querySelector('.bad input'); if (b) b.focus(); return; }
      const btn = f.querySelector('[type=submit]'); btn.setAttribute('aria-busy', 'true'); btn.textContent = 'Processing (demo)…';
      setTimeout(() => { vs.step = 'collect'; drawVend(true); }, 700);
    }
    if (f.dataset.fxForm === 'subs') {
      if (!setErr('sx-mail', mailOk($('#sx-mail').value.trim()) ? '' : 'Please enter a valid email address.')) return;
      f.hidden = true; $('.fxs-ok').textContent = 'Thank you. This is a demo, so nothing was saved yet.';
    }
  });

  /* ---------- called by app.js after every page render ---------- */
  function mount(main, r) {
    if (r.p === 'vending') drawVend(false);
    if (r.p === 'subscriptions' && chosen) choosePlan(chosen, true);
    if (r.p === 'home') autoPromo(); else clearTimeout(autoTimer);
  }

  return { promoBanner, vendingTeaser, subsTeaser, vendingPage, subsPage, mount, openPromo, promoOn };
};
