// Theme menu: a dropdown (swatch + name per theme) plus the «خصّص» customiser panel.
// The theme list, the custom-vars maths and "apply before first paint" live in the inline <head> snippet
// (tools/theme_init.html, synced into every page by tools/bump_version.py); this file only builds the UI.
// Every theme change fires `anas:theme` on document (detail = {id}) so pages can animate (the hub medallion does).
(function () {
  var L = window.ANAS_THEMES, set = window.ANAS_SET_THEME, applyT = window.ANAS_APPLY_THEME, cur = window.ANAS_CURRENT;
  if (!L || !set || !cur) return;
  var d = document, KC = 'anas_theme_custom';
  var DEF = { base: 'light', accent: '#d9b766', tone: '#f3efe6', fs: 1, rad: 1 };
  var TONES = {
    light: [['#f3efe6', 'ورقي'], ['#fbfaf6', 'أبيض'], ['#ecdcbc', 'رملي'], ['#e7ecf1', 'ضبابي'], ['#e4ebe2', 'مريمي']],
    dark: [['#0e0d0b', 'حبري'], ['#0a1230', 'كحلي'], ['#05241d', 'زمردي'], ['#1a0f22', 'بنفسجي'], ['#1a130d', 'بنّي']]
  };
  var ACCENTS = [['#d9b766', 'ذهبي'], ['#c4692e', 'طيني'], ['#e05a7a', 'وردي'], ['#7a5cff', 'بنفسجي'], ['#19a7c9', 'فيروزي'], ['#2e9e6b', 'زمردي'], ['#111111', 'أسود']];
  var FS = [[0.9, 'أصغر'], [1, 'عادي'], [1.1, 'أكبر'], [1.2, 'كبير']];
  var RAD = [[0.3, 'حاد'], [1, 'عادي'], [1.6, 'دائري']];

  function fire(id) { try { d.dispatchEvent(new CustomEvent('anas:theme', { detail: { id: id } })); } catch (e) {} }
  function el(tag, cls, txt) { var e = d.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function copy(o) { return JSON.parse(JSON.stringify(o)); }
  function getC() { return window.ANAS_GET_CUSTOM ? window.ANAS_GET_CUSTOM() : null; }
  function saveC(c) { try { localStorage.setItem(KC, JSON.stringify(c)); return true; } catch (e) { return false; } }
  function clearC() { try { localStorage.removeItem(KC); } catch (e) {} }
  function savedId() { try { return localStorage.getItem('anas_theme') || pageId; } catch (e) { return pageId; } }
  function valid(c) {
    var hx = /^#[0-9a-f]{6}$/i;
    return !!c && (c.base === 'light' || c.base === 'dark') && hx.test(c.accent) && hx.test(c.tone) &&
      +c.fs >= 0.8 && +c.fs <= 1.3 && +c.rad >= 0 && +c.rad <= 2;
  }
  function swOf(c) { return 'linear-gradient(135deg,' + c.tone + ' 50%,' + c.accent + ' 50%)'; }
  var pageId = cur(), syncers = [];
  function syncAll() { syncers.forEach(function (f) { f(); }); }

  // ---------- dropdown ----------
  function mount(box) {
    box.classList.add('tm');
    box.removeAttribute('role');
    var btn = el('button', 'tm-btn'), sw = el('span', 'tm-sw'), nm = el('span', 'tm-nm'), chev = el('span', 'tm-chev');
    btn.type = 'button';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    chev.setAttribute('aria-hidden', 'true');
    btn.append(sw, nm, chev);
    var menu = el('div', 'tm-menu'), list = el('ul', 'tm-list');
    var lid = 'tm-' + Math.random().toString(36).slice(2, 7);
    list.id = lid;
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'المظهر');
    list.tabIndex = -1;
    btn.setAttribute('aria-controls', lid);
    menu.hidden = true;
    var opts = [], custOpt = null, active = -1;
    function addOpt(id, name, swatch) {
      var li = el('li', 'tm-opt'), s = el('span', 'tm-sw'), n = el('span', 'tm-on', name), ck = el('span', 'tm-ck');
      li.id = lid + '-' + id;
      li.setAttribute('role', 'option');
      li.dataset.t = id;
      s.style.background = swatch;
      ck.setAttribute('aria-hidden', 'true');
      li.append(s, n, ck);
      li.addEventListener('click', function () { pick(id); close(true); });
      li.addEventListener('mousemove', function () { if (active !== opts.indexOf(li)) focusOpt(opts.indexOf(li)); });
      list.appendChild(li);
      opts.push(li);
      return li;
    }
    L.forEach(function (t) { addOpt(t[0], t[1], t[5]); });
    function refreshCustomOpt() {
      var c = getC();
      if (c && !custOpt) custOpt = addOpt('custom', 'مخصّص', '');
      if (!custOpt) return;
      if (!c) { list.removeChild(custOpt); opts.splice(opts.indexOf(custOpt), 1); custOpt = null; return; }
      custOpt.firstChild.style.background = swOf(c);
    }
    refreshCustomOpt();
    var cz = el('button', 'tm-cz', 'خصّص');
    cz.type = 'button';
    cz.insertAdjacentHTML('afterbegin', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>');
    cz.addEventListener('click', function () { close(false); openPanel(btn); });
    menu.append(list, cz);
    box.append(btn, menu);

    function sync() {
      var c = cur(), t = L.filter(function (x) { return x[0] === c; })[0], cc = getC();
      nm.textContent = t ? t[1] : 'مخصّص';
      sw.style.background = t ? t[5] : (cc ? swOf(cc) : '');
      btn.setAttribute('aria-label', 'المظهر: ' + nm.textContent);
      opts.forEach(function (o) { o.setAttribute('aria-selected', o.dataset.t === c ? 'true' : 'false'); });
    }
    function focusOpt(i) {
      if (i < 0 || i >= opts.length) return;
      active = i;
      opts.forEach(function (o, k) { o.classList.toggle('act', k === i); });
      list.setAttribute('aria-activedescendant', opts[i].id);
      var o = opts[i], top = o.offsetTop, bot = top + o.offsetHeight;
      if (top < list.scrollTop) list.scrollTop = top - 4;
      else if (bot > list.scrollTop + list.clientHeight) list.scrollTop = bot - list.clientHeight + 4;
    }
    function open() {
      refreshCustomOpt(); sync();
      menu.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      box.classList.add('open');
      var c = cur(), ci = 0;
      opts.forEach(function (o, k) { if (o.dataset.t === c) ci = k; });
      focusOpt(ci);
      list.focus({ preventScroll: true });
      d.addEventListener('pointerdown', outside, true);
    }
    function close(refocus) {
      if (menu.hidden) return;
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      box.classList.remove('open');
      d.removeEventListener('pointerdown', outside, true);
      if (refocus) btn.focus({ preventScroll: true });
    }
    function outside(e) { if (!box.contains(e.target)) close(false); }
    function pick(id) { var got = set(id); syncAll(); fire(got); }
    btn.addEventListener('click', function () { if (menu.hidden) open(); else close(true); });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); }
    });
    list.addEventListener('keydown', function (e) {
      var n = opts.length;
      if (e.key === 'ArrowDown') focusOpt((active + 1) % n);
      else if (e.key === 'ArrowUp') focusOpt((active - 1 + n) % n);
      else if (e.key === 'Home') focusOpt(0);
      else if (e.key === 'End') focusOpt(n - 1);
      else if (e.key === 'Enter' || e.key === ' ') { pick(opts[active].dataset.t); close(true); }
      else if (e.key === 'Escape') close(true);
      else if (e.key === 'Tab' && !e.shiftKey) cz.focus();
      else if (e.key === 'Tab') close(true);
      else return;
      e.preventDefault();
    });
    cz.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); close(true); } });
    menu.addEventListener('focusout', function (e) { if (!menu.hidden && e.relatedTarget && !box.contains(e.relatedTarget)) close(false); });
    syncers.push(function () { refreshCustomOpt(); sync(); });
    sync();
  }

  // ---------- customiser ----------
  var panel = null, draft = null, opener = null, rows = {}, picker, codeBox, msg;
  function openPanel(from) {
    opener = from;
    var saved = getC();
    draft = valid(saved) ? copy(saved) : copy(DEF);
    if (!panel) build();
    msg.textContent = '';
    render(); preview();
    panel.hidden = false;
    d.body.classList.add('tc-open');
    panel.querySelector('.tc-x').focus({ preventScroll: true });
  }
  function closePanel(keep) {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    d.body.classList.remove('tc-open');
    if (!keep) { applyT(savedId()); syncAll(); fire(cur()); }
    if (opener) opener.focus({ preventScroll: true });
  }
  function preview() { applyT('custom', draft); fire('custom'); }
  function chipRow(name, key, isColor) {
    var row = el('div', 'tc-row'), lab = el('div', 'tc-lab', name), wrap = el('div', 'tc-chips');
    wrap.setAttribute('role', 'radiogroup');
    wrap.setAttribute('aria-label', name);
    row.append(lab, wrap);
    row._wrap = wrap;
    row._fill = function (items) {
      wrap.textContent = '';
      items.forEach(function (it) {
        var v = it[0], b = el('button', isColor ? 'tc-c' : 'tc-t', isColor ? '' : it[1]);
        b.type = 'button';
        b.setAttribute('role', 'radio');
        if (isColor) { b.style.background = v; b.setAttribute('aria-label', it[1]); b.title = it[1]; }
        b.dataset.v = v;
        b.addEventListener('click', function () { draft[key] = v; render(); preview(); });
        b.addEventListener('keydown', function (e) {
          var bs = [].slice.call(wrap.querySelectorAll('button')), i = bs.indexOf(b), j;
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') j = i + 1; else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') j = i - 1; else return;
          e.preventDefault(); j = (j + bs.length) % bs.length; bs[j].click(); bs[j].focus();
        });
        wrap.appendChild(b);
      });
    };
    row._sync = function () {
      var any = false;
      [].forEach.call(wrap.querySelectorAll('button'), function (b) {
        var on = String(b.dataset.v).toLowerCase() === String(draft[key]).toLowerCase();
        any = any || on;
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      });
      var f = wrap.querySelector('button');
      if (!any && f) f.tabIndex = 0;
    };
    return row;
  }
  function build() {
    panel = el('div', 'tc');
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'tc-h');
    var card = el('div', 'tc-card glass'), head = el('div', 'tc-head'), h = el('h2', '', 'خصّص المظهر'), x = el('button', 'tc-x');
    h.id = 'tc-h';
    x.type = 'button';
    x.setAttribute('aria-label', 'إغلاق');
    x.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    x.addEventListener('click', function () { closePanel(false); });
    head.append(h, x);
    var pv = el('div', 'tc-pv');
    pv.setAttribute('aria-hidden', 'true');
    pv.innerHTML = '<b>معاينة مباشرة</b><span>هكذا يظهر النص والبطاقات</span><span class="tc-pv-row"><i>رابط ملوّن</i><em>زر</em></span>';
    rows.base = chipRow('الأساس', 'base'); rows.base._fill([['light', 'فاتح'], ['dark', 'داكن']]);
    rows.accent = chipRow('اللون المميّز', 'accent', true); rows.accent._fill(ACCENTS);
    picker = el('input', 'tc-pick');
    picker.type = 'color';
    picker.setAttribute('aria-label', 'اختر أي لون');
    picker.title = 'اختر أي لون';
    picker.addEventListener('input', function () { draft.accent = picker.value; render(); preview(); });
    rows.accent._wrap.appendChild(picker);
    rows.tone = chipRow('درجة الخلفية', 'tone', true);
    rows.fs = chipRow('حجم الخط', 'fs'); rows.fs._fill(FS);
    rows.rad = chipRow('استدارة الزوايا', 'rad'); rows.rad._fill(RAD);
    var acts = el('div', 'tc-acts'), sv = el('button', 'btn', 'احفظ'), rs = el('button', 'btn ghost', 'إعادة ضبط'), cp = el('button', 'btn ghost', 'انسخ كود الثيم');
    [sv, rs, cp].forEach(function (b) { b.type = 'button'; });
    sv.addEventListener('click', function () {
      var ok = saveC(draft);
      if (ok) set('custom'); else applyT('custom', draft);
      syncAll(); fire('custom');
      closePanel(true);
    });
    rs.addEventListener('click', function () {
      clearC();
      draft = copy(DEF);
      set('paper'); syncAll(); fire('paper');
      closePanel(true);
    });
    cp.addEventListener('click', function () {
      var txt = JSON.stringify(draft);
      codeBox.value = txt;
      function done() { msg.textContent = 'تم نسخ الكود'; }
      function fallback() { codeBox.focus(); codeBox.select(); try { if (d.execCommand('copy')) done(); else throw 0; } catch (e) { msg.textContent = 'انسخ الكود من المربع'; } }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, fallback); else fallback();
    });
    acts.append(sv, rs, cp);
    codeBox = el('textarea', 'tc-code');
    codeBox.rows = 2;
    codeBox.dir = 'ltr';
    codeBox.spellcheck = false;
    codeBox.setAttribute('aria-label', 'كود الثيم، الصق كودًا لتطبيقه');
    codeBox.addEventListener('input', function () {
      try { var c = JSON.parse(codeBox.value); if (valid(c)) { draft = c; render(); preview(); msg.textContent = 'تم تحميل الكود، اضغط احفظ'; } } catch (e) {}
    });
    msg = el('p', 'tc-msg');
    msg.setAttribute('role', 'status');
    card.append(head, pv, rows.base, rows.accent, rows.tone, rows.fs, rows.rad, acts, codeBox, msg);
    panel.appendChild(card);
    panel.addEventListener('click', function (e) { if (e.target === panel) closePanel(false); });
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closePanel(false); return; }
      if (e.key !== 'Tab') return;
      var f = [].filter.call(card.querySelectorAll('button,input,textarea'), function (b) { return b.tabIndex !== -1 && b.offsetParent; });
      if (!f.length) return;
      if (e.shiftKey && d.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && d.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    d.body.appendChild(panel);
  }
  function render() {
    var tones = TONES[draft.base];
    if (!tones.some(function (t) { return t[0] === draft.tone; })) draft.tone = tones[0][0];
    rows.tone._fill(tones);
    picker.value = draft.accent;
    if (d.activeElement !== codeBox) codeBox.value = JSON.stringify(draft);
    for (var k in rows) rows[k]._sync();
  }

  Array.prototype.forEach.call(d.querySelectorAll('[data-tp]'), mount);
  // another tab changed the theme
  window.addEventListener('storage', function (e) {
    if (e.key === 'anas_theme' || e.key === 'anas_theme_custom') { applyT(savedId()); syncAll(); fire(cur()); }
  });
})();
