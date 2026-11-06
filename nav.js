// nav.js: the ONE header, footer and icon set of anas.ai.ar (veles98.github.io/arcade). Every page loads this file,
// so no page carries its own copy of the header/footer HTML and the pages cannot drift apart again.
//
// Normal page (loads tokens.css + theme.css + theme.js for colours, scales and the theme picker):
//   <a class="skip-link" href="#main">تخطَّ إلى المحتوى</a>
//   <div data-site="header"></div><script src="/arcade/nav.js?v=STAMP"></script>   <- right after the placeholder,
//   <main id="main">...page...</main>                                               so the header is drawn before first paint
//   <div data-site="footer"></div>                                                   <- filled once the page has loaded
// Full-screen canvas game (no theme.css): <div data-site="game"></div> + the same script tag.
//   It draws a small «كل الألعاب» chip that fades out while you play and comes back when you stop.
//
// Icons: one inline SVG sprite (Lucide, ISC licence; see README_SITE.md), 24px grid, stroke from --icon-stroke.
//   HTML:  <svg class="i" aria-hidden="true"><use href="#i-download"/></svg>      JS: ANAS_ICON('download', 'i-sm')
// The header sticks to the top and turns compact once you scroll (class .is-stuck); pages with their own sticky bar
// (the skills library search dock) opt out with <body data-header="static">.
// The ?v= stamp is rewritten by tools/bump_version.py; run it after editing this file.
(function () {
  'use strict';
  var d = document, R = '/arcade/';
  var here = location.pathname.replace(/index\.html$/, '');
  var IG = 'https://www.instagram.com/anas.ai.ar/';

  // ---------- icons (Lucide paths, ISC) ----------
  var ICONS = {
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    copy: '<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'arrow-up-left': '<path d="M7 17V7h10"/><path d="M17 17 7 7"/>',
    'arrow-down-left': '<path d="M17 7 7 17"/><path d="M17 17H7V7"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4z"/><path d="M17.5 6.5h.01"/>',
    youtube: '<path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
    gamepad: '<path d="M6 11h4M8 9v4M15 12h.01M18 10h.01"/><path d="M17.3 5H6.7a4 4 0 0 0-4 3.6C2.6 9.4 2 14.5 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.4-1.4a2 2 0 0 1 1.4-.6h4.4a2 2 0 0 1 1.4.6L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.5-.6-6.6-.7-7.3A4 4 0 0 0 17.3 5z"/>',
    play: '<path d="M6 3.5v17a.5.5 0 0 0 .8.4l13-8.5a.5.5 0 0 0 0-.8l-13-8.5a.5.5 0 0 0-.8.4z"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    video: '<path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    code: '<path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8M10 9H8"/>',
    sliders: '<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
    'volume-on': '<path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z"/><path d="M16 9a5 5 0 0 1 0 6M19.4 18.4a9 9 0 0 0 0-12.8"/>',
    'volume-off': '<path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z"/><path d="m22 9-6 6M16 9l6 6"/>',
    external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'
  };
  function icon(name, cls) {
    // presentation attributes = a sane default where theme.css is not loaded (the games); .i in theme.css overrides them
    return '<svg class="i' + (cls ? ' ' + cls : '') + '" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-' + name + '"/></svg>';
  }
  window.ANAS_ICON = icon;
  function sprite() {
    if (d.getElementById('anas-icons') || !d.body) return;
    var s = '<svg id="anas-icons" xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false">';
    for (var k in ICONS) s += '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + ICONS[k] + '</symbol>';
    d.body.insertAdjacentHTML('afterbegin', s + '</svg>');
  }

  var MARK = '<svg class="site-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">' +
    '<path d="M20 3 37 12v16L20 37 3 28V12L20 3Z" stroke="currentColor" stroke-width="1.75"/>' +
    '<path d="m12 25 8-15 8 15M15 20h10M20 25v5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  // header links (the brand itself is the way home = the skills library)
  var NAV = [['games.html', 'الألعاب'], ['p/', 'البرومبتات']];
  // footer: every section of the site
  var ALL = [['', 'مكتبة السكيلات'], ['p/', 'البرومبتات'], ['exam/', 'اختبرني'], ['games.html', 'الألعاب'], ['learn/day-1/', 'رحلة التعلّم']];

  var CSS = [
    /* header: sticky, compact once scrolled. Reads tokens.css (fallbacks for pages without it) */
    '.site-header{position:sticky;top:0;z-index:var(--z-header,45);display:flex;align-items:center;gap:var(--s-2,8px);max-width:1360px;margin:0 auto;',
    'padding:calc(var(--s-3,12px) + env(safe-area-inset-top)) var(--gutter,16px) var(--s-3,12px);color:var(--hdr-fg,var(--fg));font-family:var(--font-text,"IBM Plex Sans Arabic",sans-serif);',
    'line-height:1.5;zoom:var(--fs,1);view-transition-name:site-header;',
    'transition:padding var(--dur-2,180ms) var(--ease-std,ease)}',
    '.site-header::before{content:"";position:absolute;inset:0 calc(50% - 50vw);z-index:-1;background:var(--bg);',
    'box-shadow:0 8px 24px -18px rgba(0,0,0,.6);',
    'border-bottom:1px solid var(--edge);opacity:0;transition:opacity var(--dur-2,180ms) var(--ease-std,ease)}',
    '.site-header.is-stuck{padding-top:calc(var(--s-1,4px) + env(safe-area-inset-top));padding-bottom:var(--s-1,4px)}',
    '.site-header.is-stuck::before{opacity:1}',
    ':where(body[data-header="static"]) .site-header{position:relative}',
    '.site-header *,.site-footer *{box-sizing:border-box}',
    /* reset whatever generic nav/a/ul rules a page has, so the chrome looks the same on every page */
    '.site-header nav,.site-footer nav{margin:0;padding:0;border:0;background:none;flex-wrap:nowrap}',
    '.site-header nav a,.site-footer nav a{border:0;background:none;font-family:inherit}',
    '.site-header a,.site-footer a{color:inherit;text-decoration:none;-webkit-tap-highlight-color:transparent}',
    '.site-brand{display:flex;align-items:center;gap:var(--s-2,8px);min-height:44px;min-width:44px;flex-shrink:0;border-radius:var(--r-sm,8px)}',
    '.site-header .site-mark{width:32px;height:32px;color:var(--hdr-accent,var(--gold-text))}',
    '.site-name{font-weight:600;font-size:var(--t-sm,.875rem);letter-spacing:-.01em}',
    '.site-header .site-actions{display:flex;align-items:center;gap:var(--s-1,4px);margin-inline-start:auto}',
    '.site-header .site-link,.site-header .site-follow{display:flex;align-items:center;gap:6px;min-height:44px;padding:0 var(--s-3,12px);border-radius:var(--r-pill,999px);',
    'font-size:var(--t-sm,.875rem);font-weight:600;white-space:nowrap;transition:background-color var(--dur-1,120ms),color var(--dur-1,120ms)}',
    '.site-header .site-link{color:var(--hdr-mute,var(--mute))}',
    '.site-header .site-link:hover{color:var(--hdr-fg,var(--fg));background:var(--surface-2,rgba(255,255,255,.06))}',
    '.site-header .site-link[aria-current]{color:var(--hdr-fg,var(--fg));background:var(--surface-2,rgba(255,255,255,.06));box-shadow:inset 0 0 0 1px var(--hdr-accent,var(--gold-text))}',
    '.site-header .site-follow{color:var(--hdr-accent,var(--gold-text))}',
    '.site-header .site-follow:hover{background:var(--surface-2,rgba(255,255,255,.06))}',
    '.site-header .i,.site-footer .i,.site-chip .i{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:var(--icon-stroke,1.75);stroke-linecap:round;stroke-linejoin:round;flex:none}',
    '.site-header .tm{margin-inline-start:var(--s-1,4px)}',
    '.site-header .tm-btn{color:var(--hdr-fg,var(--fg));border-color:var(--hdr-edge,var(--edge));background:var(--hdr-btn,var(--surface-1))}',
    '.site-header .tm-nm{display:none}',
    '.site-header .tm-menu{color:var(--fg)}',
    '.site-header :focus-visible,.site-footer :focus-visible{outline:2px solid var(--focus,var(--gold-text));outline-offset:2px}',
    /* footer */
    '.site-footer{max-width:1240px;margin:0 auto;padding:var(--s-12,48px) var(--gutter,16px) calc(var(--s-6,24px) + env(safe-area-inset-bottom));color:var(--fg);',
    'font-family:var(--font-text,"IBM Plex Sans Arabic",sans-serif);line-height:1.6;zoom:var(--fs,1)}',
    '.site-invite{margin:0 0 var(--s-6,24px);font:400 var(--t-2xl,2rem)/var(--lh-display,1.25) var(--font-display,Lalezar,sans-serif);text-wrap:balance}',
    '.site-footer .site-invite a{display:inline-flex;align-items:center;gap:var(--s-2,8px);min-height:44px;color:var(--gold-text);text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:.3em}',
    '.site-footer .site-invite .i{width:.8em;height:.8em;stroke-width:2.25}',
    '.site-footer .site-links{display:grid;grid-template-columns:1fr 1fr;gap:0 var(--s-6,24px);padding-bottom:var(--s-6,24px)}',
    '.site-footer .site-links a{display:flex;align-items:center;justify-content:space-between;min-height:52px;border-bottom:1px solid var(--edge);font-size:var(--t-sm,.875rem)}',
    '.site-footer .site-links .i{color:var(--gold-text)}',
    '.site-footer .site-links a[aria-current]{color:var(--gold-text);font-weight:600}',
    '.site-bottom{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--s-1,4px) var(--s-4,16px);padding-top:var(--s-4,16px);',
    'border-top:1px solid var(--edge);font-size:var(--t-xs,.8125rem);color:var(--mute)}',
    '.site-footer .site-bottom a{display:inline-flex;align-items:center;gap:var(--s-2,8px);min-height:44px;padding:0 var(--s-2,8px);color:var(--fg)}',
    '.site-bottom .site-mark{width:22px;height:22px;color:var(--gold-text)}',
    '.site-more{display:flex;gap:var(--s-2,8px)}',
    '@media(hover:hover){.site-footer .site-links a:hover,.site-footer .site-bottom a:hover{color:var(--gold-text)}}',
    '@media(min-width:760px){.site-header{padding-inline:var(--s-10,40px)}.site-header .tm-nm{display:inline}',
    '.site-footer{padding:var(--s-16,64px) var(--s-10,40px) var(--s-6,24px)}.site-footer .site-links{grid-template-columns:repeat(4,1fr);gap:var(--s-8,32px)}}',
    /* phones: the mark alone is the home link; the theme button is a 44px square */
    '@media(max-width:430px){.site-header .site-name{display:none}.site-header .tm-chev{display:none}.site-header .tm-btn{padding:0}',
    '.site-header .site-link,.site-header .site-follow{padding:0 10px}}',
    '@media(max-width:359px){.site-header{padding-inline:var(--s-3,12px)}.site-follow span{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.site-header .site-link{padding:0 8px}}',
    /* full-screen games: one small chip, own colours (game pages do not load theme.css) */
    '.site-chip{position:fixed;z-index:2147483000;top:calc(10px + env(safe-area-inset-top));right:calc(10px + env(safe-area-inset-right));',
    'display:flex;align-items:center;gap:7px;min-height:44px;padding:0 14px 0 10px;border-radius:8px;border:1px solid #424a3d;',
    'background:rgba(12,16,12,.82);color:#f1f4ec;font:600 14px/1 "IBM Plex Sans Arabic",system-ui,sans-serif;text-decoration:none;',
    '-webkit-tap-highlight-color:transparent;transition:opacity .3s}',
    '.site-chip .site-mark{width:22px;height:22px;color:#d5ff63}',
    '.site-chip.off{opacity:0;pointer-events:none}',
    '.site-chip:focus-visible{outline:2px solid #d5ff63;outline-offset:3px}',
    '@media(prefers-reduced-motion:reduce){.site-header,.site-header::before,.site-chip{transition:none}}'
  ].join('');

  function cur(p) { return here === R + p || (p === '' && here === R + 's/'); }
  function ac(p) { return cur(p) ? ' aria-current="page"' : ''; }

  function header() {
    return '<header class="site-header">' +
      '<a class="site-brand" href="' + R + '" aria-label="أنس: الرئيسية، مكتبة السكيلات"' + ac('') + '>' + MARK +
      '<span class="site-name" dir="ltr">anas.ai.ar</span></a>' +
      '<nav class="site-actions" aria-label="أقسام الموقع">' +
      NAV.map(function (l) { return '<a class="site-link" href="' + R + l[0] + '"' + ac(l[0]) + '>' + l[1] + '</a>'; }).join('') +
      '<a class="site-follow" href="' + IG + '" rel="noopener" aria-label="تابعني في إنستقرام">' + icon('instagram') + '<span>تابعني</span></a>' +
      '<div class="tp" data-tp></div></nav></header>';
  }

  function footer() {
    return '<footer class="site-footer">' +
      '<p class="site-invite">تبي سكيل أو لعبة لشي معيّن؟<br><a href="' + IG + '" rel="noopener">اكتب لي في إنستقرام' + icon('arrow-up-left') + '</a></p>' +
      '<nav class="site-links" aria-label="كل أقسام الموقع">' +
      ALL.map(function (l) { return '<a href="' + R + l[0] + '"' + ac(l[0]) + '>' + l[1] + icon('arrow-left', 'i-sm') + '</a>'; }).join('') +
      '</nav><div class="site-bottom">' +
      '<a href="' + IG + '" dir="ltr" rel="noopener">' + MARK + 'anas.ai.ar</a>' +
      '<span class="site-more"><a href="https://www.youtube.com/@anas_ai_ar" rel="noopener">' + icon('youtube', 'i-sm') + 'يوتيوب</a>' +
      '<a href="https://anas-ai-ar.itch.io" dir="ltr" rel="noopener">' + icon('gamepad', 'i-sm') + 'itch.io</a></span>' +
      '<span>مهارات جاهزة. شغل على كيفك.</span></div></footer>';
  }

  function chip(box) {
    box.outerHTML = '<a class="site-chip" href="' + R + 'games.html" aria-label="كل ألعاب أنس">' + MARK + '<span>كل الألعاب</span></a>';
    var c = d.querySelector('.site-chip'), t = 0;
    // playing = tapping, dragging or pressing keys: hide the chip; 4 s without input: show it again
    function play(e) {
      if (e.target && e.target.closest && e.target.closest('.site-chip')) return;
      if (e.type === 'pointermove' && !e.buttons && e.pointerType === 'mouse') return;
      c.classList.add('off');
      clearTimeout(t);
      t = setTimeout(function () { c.classList.remove('off'); }, 4000);
    }
    ['pointerdown', 'pointermove', 'keydown', 'touchstart'].forEach(function (ev) {
      window.addEventListener(ev, play, { capture: true, passive: true });
    });
  }

  function fill(kind, html) {
    Array.prototype.forEach.call(d.querySelectorAll('[data-site="' + kind + '"]'), function (box) { box.outerHTML = html; });
  }

  // sticky header: compact + solid once the page scrolls; publishes its height as --hdr-h for scroll-padding
  function stick() {
    var h = d.querySelector('.site-header');
    if (!h || h.dataset.stick) return;
    h.dataset.stick = '1';
    if (d.body && d.body.dataset.header === 'static') return;
    var on = false, raf = 0;
    function upd() {
      raf = 0;
      var s = (window.scrollY || 0) > 8;
      if (s !== on) { on = s; h.classList.toggle('is-stuck', s); }
    }
    window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    upd();
    function size() { d.documentElement.style.setProperty('--hdr-h', Math.ceil(h.getBoundingClientRect().height) + 'px'); }
    size();
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(h, { box: 'border-box' });
    h.addEventListener('transitionend', size);
  }

  if (!d.getElementById('site-chrome-css')) {
    var st = d.createElement('style');
    st.id = 'site-chrome-css';
    st.textContent = CSS;
    (d.head || d.documentElement).appendChild(st);
  }
  // one favicon for every page (the «أ» mark), so no page asks for a missing /favicon.ico
  if (d.head && !d.querySelector('link[rel~="icon"]')) {
    var fi = d.createElement('link');
    fi.rel = 'icon';
    fi.href = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="9" fill="#0b0e0c"/><path d="M20 5 34 12.5v15L20 35 6 27.5v-15Z" fill="none" stroke="#d5ff63" stroke-width="2"/><path d="m13 25 7-13 7 13M15.6 20.5h8.8M20 25v4" fill="none" stroke="#d5ff63" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    d.head.appendChild(fi);
  }
  sprite();
  fill('header', header());
  var g = d.querySelector('[data-site="game"]');
  if (g) chip(g);
  stick();
  function late() { sprite(); fill('header', header()); fill('footer', footer()); stick(); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', late); else late();
})();
