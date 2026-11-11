/* =====================================================================
   DaVinci Flora & Living: language switch (English / Nederlands)
   ---------------------------------------------------------------------
   The site is written in English. When Dutch is chosen, every page is
   translated in the browser right after it renders, using the word list
   in js/i18n-nl.js (English text -> Dutch text). Nothing else changes.
   - The choice is kept in this browser (localStorage 'dv-lang').
   - Switching reloads the page in the other language.
   - To fix or add a translation, edit js/i18n-nl.js only.
   In WordPress this becomes a translation plugin (WPML, Polylang or TranslatePress).
   ===================================================================== */
(function () {
  let lang = 'en';
  try { lang = localStorage.getItem('dv-lang') === 'nl' ? 'nl' : 'en'; } catch (e) { /* storage unavailable */ }
  const NL = window.DV_NL || { text: {}, rules: [] };
  const norm = (s) => String(s).replace(/\s+/g, ' ').trim();
  const SKIP = { SCRIPT: 1, STYLE: 1, SVG: 1, NOSCRIPT: 1, CANVAS: 1, TEXTAREA: 1, INPUT: 1, SELECT: 1, IMG: 1, PICTURE: 1, VIDEO: 1 };
  const INLINE = { EM: 1, I: 1, B: 1, STRONG: 1, BR: 1, SMALL: 1, SUP: 1, SUB: 1, SPAN: 1, ABBR: 1, U: 1 };
  const ATTRS = ['placeholder', 'aria-label', 'alt', 'title'];

  function lookup(s) {
    const k = norm(s);
    if (!k) return null;
    if (Object.prototype.hasOwnProperty.call(NL.text, k)) return NL.text[k];
    if (k.indexOf('<') !== -1) return null; /* markup only matches exact entries; otherwise its text parts are translated one by one */
    for (const r of NL.rules) { const m = k.match(r[0]); if (m) { const v = r[1](m); if (v !== k) return v; } }
    return null;
  }
  const t = (s) => (lang === 'nl' ? (lookup(s) ?? s) : s);
  const hasLetters = (s) => /[A-Za-z]/.test(s);
  /* an element whose children are only inline formatting (em, b, span…) is handled as one phrase */
  function inlineOnly(el) {
    if (!el.firstElementChild) return false;
    for (const c of el.querySelectorAll('*')) { if (!INLINE[c.tagName]) return false; if (c.hasAttribute('data-split')) return false; }
    return true;
  }
  function walk(root, onPhrase, onText, onAttr) {
    if (root.nodeType === 3) { if (hasLetters(root.nodeValue)) onText(root); return; }
    if (root.nodeType !== 1 || SKIP[root.tagName] || root.closest('[data-split],[data-noi18n],svg')) {
      if (root.nodeType === 1 && root.tagName === 'IMG') onAttr(root);
      return;
    }
    const stack = [root];
    while (stack.length) {
      const el = stack.pop();
      if (el.nodeType === 3) { if (hasLetters(el.nodeValue)) onText(el); continue; }
      if (el.nodeType !== 1) continue;
      onAttr(el);
      if (SKIP[el.tagName] || el.hasAttribute('data-split') || el.hasAttribute('data-noi18n')) continue;
      if (inlineOnly(el) && hasLetters(el.textContent) && onPhrase(el)) continue;
      for (let c = el.lastChild; c; c = c.previousSibling) stack.push(c);
    }
  }
  function apply(root) {
    if (lang !== 'nl' || !root) return;
    walk(root,
      (el) => { const v = lookup(el.innerHTML); if (v == null) return false; el.innerHTML = v; return true; },
      (tn) => { const v = lookup(tn.nodeValue); if (v == null) return; const m = tn.nodeValue.match(/^(\s*)[\s\S]*?(\s*)$/); tn.nodeValue = m[1] + v + m[2]; },
      (el) => { for (const a of ATTRS) { if (el.hasAttribute(a)) { const v = lookup(el.getAttribute(a)); if (v != null) el.setAttribute(a, v); } } });
  }
  /* used once to build the word list: every phrase, text and attribute the site shows */
  function collect(root) {
    const out = new Set();
    walk(root || document.body, (el) => { out.add(norm(el.innerHTML)); return false; }, (tn) => out.add(norm(tn.nodeValue)),
      (el) => { for (const a of ATTRS) { const v = el.getAttribute(a); if (v && hasLetters(v)) out.add(norm(v)); } });
    return Array.from(out);
  }
  function set(l) {
    try { localStorage.setItem('dv-lang', l); } catch (e) { /* storage unavailable */ }
    location.reload();
  }
  document.documentElement.lang = lang;
  window.DV_I18N = { lang, t, apply, collect, set, norm };

  /* translate anything added later (basket, popups, messages) */
  if (lang === 'nl') {
    const start = () => {
      apply(document.body);
      new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) apply(n); }).observe(document.body, { childList: true, subtree: true });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  }
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-lang]'); if (b && b.dataset.lang !== lang) { e.preventDefault(); set(b.dataset.lang); } });
})();
